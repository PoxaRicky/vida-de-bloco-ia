#!/usr/bin/env python3
"""
Token-Saver para Análise de Vídeos e Revisão de Cenas (Levi Motion / Antigravity).
Baseado no padrão de mosaico + resumo local de 1 página:
- Em vez de abrir dezenas de frames individuais (~1.500 tokens cada),
  gera no máximo 2 imagens mosaico (mosaico-1.png, mosaico-2.png) e 1 resumo (resumo-local.md).
- O agente lê apenas o resumo + os 2 mosaicos e só abre o frame original onde houver anomalia.
"""

import argparse
import glob
import json
import math
import os
import subprocess
import sys
from pathlib import Path


def run_cmd(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def probe_video(video_path: Path) -> dict:
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", "-show_streams", str(video_path)
    ]
    res = run_cmd(cmd)
    if res.returncode != 0:
        return {}
    try:
        return json.loads(res.stdout)
    except json.JSONDecodeError:
        return {}


def detect_audio_volume(video_path: Path) -> str:
    cmd = [
        "ffmpeg", "-i", str(video_path), "-af", "volumedetect",
        "-vn", "-sn", "-dn", "-f", "null", "NUL" if os.name == "nt" else "/dev/null"
    ]
    res = run_cmd(cmd)
    lines = []
    for line in res.stderr.splitlines():
        if "mean_volume:" in line or "max_volume:" in line:
            lines.append(line.strip().split("]")[-1].strip())
    return " | ".join(lines) if lines else "Sem faixa de áudio ou não detectado"


def build_mosaic_from_video(video_path: Path, out_dir: Path, fps: float = 1.0, thumb_w: int = 360):
    out_dir.mkdir(parents=True, exist_ok=True)
    frames_dir = out_dir / "_tmp_frames"
    frames_dir.mkdir(exist_ok=True)

    # Limpa frames temporários anteriores
    for f in frames_dir.glob("frame_*.png"):
        f.unlink()

    # Extrai frames com timestamp queimado no canto superior esquerdo
    vf = (
        f"fps={fps},scale={thumb_w}:-1,"
        "drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=20:fontcolor=white:"
        "box=1:boxcolor=black@0.7:boxborderw=4"
    )
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", vf,
        str(frames_dir / "frame_%04d.png")
    ]
    res = run_cmd(cmd)
    if res.returncode != 0:
        print("Erro ao extrair frames:", res.stderr, file=sys.stderr)
        sys.exit(1)

    frames = sorted(frames_dir.glob("frame_*.png"))
    if not frames:
        print("Nenhum frame extraído.", file=sys.stderr)
        sys.exit(1)

    mosaics = pack_into_mosaics(frames, out_dir, cols=5)

    # Limpa temporários
    for f in frames:
        f.unlink()
    try:
        frames_dir.rmdir()
    except OSError:
        pass

    # Gera resumo local de 1 página
    info = probe_video(video_path)
    fmt = info.get("format", {})
    duration = float(fmt.get("duration", 0))
    size_mb = int(fmt.get("size", 0)) / (1024 * 1024)
    v_stream = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), {})
    a_stream = next((s for s in info.get("streams", []) if s.get("codec_type") == "audio"), {})
    vol = detect_audio_volume(video_path)

    tokens_antes = len(frames) * 1500
    tokens_depois = len(mosaics) * 1500 + 400
    economia = (1 - tokens_depois / max(tokens_antes, 1)) * 100

    resumo = [
        f"# Resumo Local (Token-Saver) — `{video_path.name}`",
        "",
        f"- **Duração:** {duration:.2f}s | **Tamanho:** {size_mb:.2f} MB",
        f"- **Vídeo:** {v_stream.get('width', '?')}x{v_stream.get('height', '?')} ({v_stream.get('r_frame_rate', '?')} fps, {v_stream.get('codec_name', '?')})",
        f"- **Áudio:** {a_stream.get('codec_name', 'nenhum')} | {vol}",
        f"- **Frames extraídos ({fps} fps):** {len(frames)} frames → condensados em **{len(mosaics)} mosaico(s)**",
        f"- **Economia estimada:** ~{tokens_antes:,} tokens → ~{tokens_depois:,} tokens (**-{economia:.0f}%**)",
        "",
        "## Mosaicos Gerados",
    ]
    for m in mosaics:
        resumo.append(f"- `{m}`")
    resumo.append("")
    resumo.append("> **Instrução:** Inspecione os mosaicos acima. Só extraia/abra um frame em resolução total se notar corte, texto cortado, sobreposição ou erro visual em algum timestamp específico.")

    resumo_path = out_dir / "resumo-local.md"
    resumo_path.write_text("\n".join(resumo), encoding="utf-8")
    print(f"OK: {len(frames)} frames -> {len(mosaics)} mosaico(s) em {out_dir}")
    print(f"Resumo: {resumo_path}")


def build_mosaic_from_scenes(scenes_dir: Path, out_dir: Path, thumb_w: int = 360):
    out_dir.mkdir(parents=True, exist_ok=True)
    frames = sorted(scenes_dir.glob("cena-*.png"))
    if not frames:
        frames = sorted(scenes_dir.glob("*.png"))
        frames = [f for f in frames if not f.name.startswith("mosaico-")]

    if not frames:
        print(f"Nenhuma imagem encontrada em {scenes_dir}", file=sys.stderr)
        sys.exit(1)

    mosaics = pack_into_mosaics(frames, out_dir, cols=4)

    tokens_antes = len(frames) * 1500
    tokens_depois = len(mosaics) * 1500 + 300
    economia = (1 - tokens_depois / max(tokens_antes, 1)) * 100

    resumo = [
        f"# Resumo Local de Revisão (Token-Saver) — `{scenes_dir.name}`",
        "",
        f"- **Total de cenas/frames:** {len(frames)} → condensados em **{len(mosaics)} mosaico(s)**",
        f"- **Economia estimada:** ~{tokens_antes:,} tokens → ~{tokens_depois:,} tokens (**-{economia:.0f}%**)",
        "",
        "## Mosaicos Gerados",
    ]
    for m in mosaics:
        resumo.append(f"- `{m}`")

    resumo.append("")
    resumo.append("## Índice de Arquivos Originais")
    for idx, f in enumerate(frames, 1):
        kb = f.stat().st_size / 1024
        resumo.append(f"- #{idx:02d}: `{f.name}` ({kb:.1f} KB)")

    resumo.append("")
    resumo.append("> **Instrução para `revisao-01`:** Leia este resumo e os mosaicos acima primeiro. Só abra o `cena-XX.png` original com `read_file` se o mosaico mostrar algum problema naquela cena.")

    resumo_path = out_dir / "resumo-local.md"
    resumo_path.write_text("\n".join(resumo), encoding="utf-8")
    print(f"OK: {len(frames)} cenas -> {len(mosaics)} mosaico(s) em {out_dir}")
    print(f"Resumo: {resumo_path}")


def pack_into_mosaics(frames: list[Path], out_dir: Path, cols: int = 5) -> list[Path]:
    """Empacota uma lista de imagens em no máximo 2 mosaicos PNG."""
    total = len(frames)
    num_mosaics = 1 if total <= 25 else 2
    chunk_size = math.ceil(total / num_mosaics)
    mosaics = []

    for m_idx in range(num_mosaics):
        chunk = frames[m_idx * chunk_size:(m_idx + 1) * chunk_size]
        if not chunk:
            continue
        rows = math.ceil(len(chunk) / cols)
        out_file = out_dir / f"mosaico-{m_idx + 1}.png"

        # Cria arquivo concat temporário para o ffmpeg ler a lista exata
        list_file = out_dir / f"_concat_{m_idx + 1}.txt"
        list_lines = [f"file '{str(p.resolve()).replace(chr(92), '/')}'" for p in chunk]
        list_file.write_text("\n".join(list_lines), encoding="utf-8")

        cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
            "-vf", f"scale=360:-1,tile={cols}x{rows}:padding=6:color=0x111111",
            str(out_file)
        ]
        res = run_cmd(cmd)
        list_file.unlink(missing_ok=True)
        if res.returncode != 0:
            print(f"Erro ao gerar {out_file.name}:", res.stderr, file=sys.stderr)
            sys.exit(1)
        mosaics.append(out_file)

    return mosaics


def main():
    parser = argparse.ArgumentParser(description="Token-Saver: gera mosaicos + resumo local para análise de vídeo/cenas.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--video", type=Path, help="Caminho de um arquivo de vídeo (.mp4, .mov, etc.)")
    group.add_argument("--cenas", type=Path, help="Pasta contendo cena-*.png (ex: revisao/)")
    parser.add_argument("--out", type=Path, default=None, help="Pasta de saída (padrão: mesma pasta das cenas ou <video>_analise)")
    parser.add_argument("--fps", type=float, default=1.0, help="Frames por segundo para extrair do vídeo (padrão: 1.0)")

    args = parser.parse_args()
    if args.video:
        out_dir = args.out or args.video.parent / f"{args.video.stem}_analise"
        build_mosaic_from_video(args.video, out_dir, fps=args.fps)
    else:
        out_dir = args.out or args.cenas
        build_mosaic_from_scenes(args.cenas, out_dir)


if __name__ == "__main__":
    main()
