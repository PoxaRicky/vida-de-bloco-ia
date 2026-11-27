"""Transcreve uma narração com timestamps por palavra e agrupa em frases (dados/voz.json)."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from faster_whisper import WhisperModel


def carregar_modelo(nome_modelo: str) -> WhisperModel:
    candidatos = [nome_modelo]
    if nome_modelo != "small":
        candidatos.append("small")

    ultimo_erro: Exception | None = None
    for candidato in candidatos:
        try:
            return WhisperModel(candidato, device="cpu", compute_type="int8")
        except Exception as exc:  # pragma: no cover - fallback defensivo
            ultimo_erro = exc

    raise RuntimeError(f"Falha ao carregar modelo Whisper: {ultimo_erro}")


def agrupar_frases(palavras: list[dict[str, Any]], pausa_corte: float = 0.45) -> list[dict[str, Any]]:
    if not palavras:
        return []

    frases: list[dict[str, Any]] = []
    atual: list[dict[str, Any]] = []

    for idx, item in enumerate(palavras):
        atual.append(item)
        texto_p = item["palavra"].strip()
        terminou_pontuacao = texto_p.endswith((".", "!", "?"))

        proxima_pausa = 0.0
        if idx + 1 < len(palavras):
            proxima_pausa = round(palavras[idx + 1]["inicio"] - item["fim"], 3)

        deve_fechar = terminou_pontuacao or proxima_pausa >= pausa_corte or idx == len(palavras) - 1
        if deve_fechar and atual:
            texto_frase = " ".join(p["palavra"].strip() for p in atual).strip()
            frases.append(
                {
                    "id": len(frases) + 1,
                    "texto": texto_frase,
                    "inicio": round(atual[0]["inicio"], 3),
                    "fim": round(atual[-1]["fim"], 3),
                    "pausaDepois": max(0.0, proxima_pausa) if idx + 1 < len(palavras) else 0.0,
                    "palavras": list(atual),
                }
            )
            atual = []

    return frases


def transcrever(audio_path: Path, out_path: Path, model_name: str, language: str, pausa_corte: float) -> dict[str, Any]:
    if not audio_path.is_file():
        raise FileNotFoundError(f"Arquivo de áudio não encontrado: {audio_path}")

    modelo = carregar_modelo(model_name)
    segmentos, info = modelo.transcribe(
        str(audio_path),
        language=language,
        word_timestamps=True,
        vad_filter=True,
        condition_on_previous_text=False,
    )

    palavras: list[dict[str, Any]] = []
    textos_segmentos: list[str] = []
    for seg in segmentos:
        if seg.text:
            textos_segmentos.append(seg.text.strip())
        for w in getattr(seg, "words", None) or []:
            palavra_limpa = (w.word or "").strip()
            if not palavra_limpa:
                continue
            palavras.append(
                {
                    "id": len(palavras) + 1,
                    "palavra": palavra_limpa,
                    "inicio": round(float(w.start), 3),
                    "fim": round(float(w.end), 3),
                }
            )

    frases = agrupar_frases(palavras, pausa_corte=pausa_corte)
    duracao_total = round(float(getattr(info, "duration", 0.0) or (palavras[-1]["fim"] if palavras else 0.0)), 3)

    resultado: dict[str, Any] = {
        "audioArquivo": audio_path.name,
        "idioma": getattr(info, "language", language) or language,
        "duracaoTotal": duracao_total,
        "textoCompleto": " ".join(textos_segmentos).strip(),
        "palavras": palavras,
        "frases": frases,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(resultado, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return resultado


def main() -> None:
    parser = argparse.ArgumentParser(description="Transcreve narracao.wav com timestamps por palavra para dados/voz.json.")
    parser.add_argument("--audio", required=True, help="Caminho para o arquivo narracao.wav")
    parser.add_argument("--out", required=True, help="Caminho de saída para dados/voz.json")
    parser.add_argument("--model", default="large-v3-turbo", help="Modelo faster-whisper (padrão: large-v3-turbo)")
    parser.add_argument("--language", default="pt", help="Código do idioma (padrão: pt)")
    parser.add_argument("--pausa-corte", type=float, default=0.45, help="Pausa em segundos para quebrar frase")
    args = parser.parse_args()

    res = transcrever(
        audio_path=Path(args.audio).resolve(),
        out_path=Path(args.out).resolve(),
        model_name=args.model,
        language=args.language,
        pausa_corte=args.pausa_corte,
    )
    print(f"OK voz.json: {res['duracaoTotal']}s, {len(res['frases'])} frases, {len(res['palavras'])} palavras -> {args.out}")


if __name__ == "__main__":
    main()
