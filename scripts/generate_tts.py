import asyncio
import json
import os
import re
import sys
from pathlib import Path

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()

VOICE_CONFIG_EDGE = {
    "menino":    {"voice": "pt-BR-AntonioNeural",             "rate": "+16%", "pitch": "+4Hz"},
    "narrador":  {"voice": "pt-BR-AntonioNeural",             "rate": "+14%", "pitch": "-2Hz"},
    "amigo":     {"voice": "pt-BR-AntonioNeural",             "rate": "+18%", "pitch": "+7Hz"},
    "npc":       {"voice": "pt-BR-AntonioNeural",             "rate": "+12%", "pitch": "+0Hz"},
    "professor": {"voice": "pt-BR-AntonioNeural",             "rate": "+8%",  "pitch": "-6Hz"},
    "padeiro":   {"voice": "pt-BR-AntonioNeural",             "rate": "+10%", "pitch": "-4Hz"},
    "motorista": {"voice": "pt-BR-AntonioNeural",             "rate": "+9%",  "pitch": "-5Hz"},
    "caixa":     {"voice": "pt-BR-FranciscaNeural",           "rate": "+18%", "pitch": "+2Hz"},
    "mae":       {"voice": "pt-BR-FranciscaNeural",           "rate": "+12%", "pitch": "+0Hz"},
    "vo":        {"voice": "pt-BR-ThalitaMultilingualNeural", "rate": "+4%",  "pitch": "-7Hz"},
    "vovo":      {"voice": "pt-BR-ThalitaMultilingualNeural", "rate": "+4%",  "pitch": "-7Hz"},
    "diretora":  {"voice": "pt-BR-FranciscaNeural",           "rate": "+8%",  "pitch": "-5Hz"},
    "sindica":   {"voice": "pt-BR-FranciscaNeural",           "rate": "+10%", "pitch": "-4Hz"},
}

EMOTION_MODIFIERS = {
    "gancho":      {"rate_delta": 5,  "pitch_delta": 3},
    "animado":     {"rate_delta": 6,  "pitch_delta": 4},
    "choque":      {"rate_delta": 8,  "pitch_delta": 6},
    "panico":      {"rate_delta": 10, "pitch_delta": 7},
    "dramatico":   {"rate_delta": -6, "pitch_delta": -4},
    "acolhedor":   {"rate_delta": -4, "pitch_delta": -2},
    "bravo":       {"rate_delta": 5,  "pitch_delta": -3},
    "comemorando": {"rate_delta": 7,  "pitch_delta": 5},
    "neutro":      {"rate_delta": 0,  "pitch_delta": 0},
}

VOICE_MAP_ELEVEN = {
    "menino": "pNInz6obpgDQGcFmaJgB",
    "narrador": "pNInz6obpgDQGcFmaJgB",
    "amigo": "pNInz6obpgDQGcFmaJgB",
    "professor": "pNInz6obpgDQGcFmaJgB",
    "padeiro": "pNInz6obpgDQGcFmaJgB",
    "mae": "EXAVITQu4vr4xnSDxMaL",
    "vo": "EXAVITQu4vr4xnSDxMaL",
    "vovo": "EXAVITQu4vr4xnSDxMaL",
    "diretora": "EXAVITQu4vr4xnSDxMaL",
    "sindica": "EXAVITQu4vr4xnSDxMaL",
}


def _replace_brl(match: re.Match) -> str:
    raw_int = match.group(1).replace(".", "")
    cents = match.group(2)
    suffix = (match.group(3) or "").strip().lower()
    try:
        val = int(raw_int)
    except ValueError:
        return match.group(0)

    if suffix in ("mil", "milhão", "milhões", "bilhão", "bilhões"):
        unit = "reais"
        return f"{val} {suffix} de {unit}" if "lh" in suffix else f"{val} {suffix} {unit}"

    reais_word = "real" if val == 1 else "reais"
    if cents and int(cents) > 0:
        c_val = int(cents)
        cent_word = "centavo" if c_val == 1 else "centavos"
        if val == 0:
            return f"{c_val} {cent_word}"
        return f"{val} {reais_word} e {c_val} {cent_word}"
    return f"{val} {reais_word}"


def sanitize_ptbr_tts(text: str) -> str:
    """Normaliza valores monetários, porcentagens, abreviações e remove ruídos de final de frase."""
    s = text.strip()

    # Remove emojis visuais para o sintetizador não engasgar
    s = re.sub(r"[\U00010000-\U0010ffff\u2600-\u27bf]", " ", s)

    # Valores monetários: R$ 1, R$ 50,00, R$ 1.500, R$ 10 mil
    s = re.sub(
        r"R\$\s*(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?(?:\s*(mil|milh[õo]es|milh[ãa]o|bilh[õo]es|bilh[ãa]o))?",
        _replace_brl,
        s,
        flags=re.IGNORECASE,
    )

    # Porcentagens: 99% -> 99 por cento | 1,5% -> 1 vírgula 5 por cento
    s = re.sub(r"(\d+),(\d+)\s*%", r"\1 vírgula \2 por cento", s)
    s = re.sub(r"(\d+)\s*%", r"\1 por cento", s)

    # Ordinais simples: 1º -> primeiro, 2º -> segundo, 3º -> terceiro
    ord_map = {"1º": "primeiro", "2º": "segundo", "3º": "terceiro", "1ª": "primeira"}
    for k, v in ord_map.items():
        s = s.replace(k, v)

    # Abreviações comuns do português / games
    abbrev = {
        r"\bvc\b": "você",
        r"\bvcs\b": "vocês",
        r"\bpq\b": "por que",
        r"\btbm?\b": "também",
        r"\bqnd\b": "quando",
        r"\bHP\b": "agá pê",
        r"\bXP\b": "xis pê",
        r"\bNPC\b": "ene pê cê",
    }
    for pat, repl in abbrev.items():
        s = re.sub(pat, repl, s, flags=re.IGNORECASE if pat.startswith(r"\bv") or pat.startswith(r"\bp") or pat.startswith(r"\bt") or pat.startswith(r"\bq") else 0)

    # Remove aspas decorativas que às vezes mudam a entonação final
    s = s.replace('"', "").replace("“", "").replace("”", "")

    # Remove onomatopeias/resquícios soltos no final da frase (ex.: "he", "eh", "kk", "rs")
    s = re.sub(r"[\s,;:-]+\b(he|eh|hm|uh|kk+|rs+|hahaha|haha)\b\s*[.!?…]*$", "!", s, flags=re.IGNORECASE)

    # Normaliza pontuação repetida ("?!" -> "!", "..." -> ".")
    s = re.sub(r"\?!+", "?", s)
    s = re.sub(r"!{2,}", "!", s)
    s = re.sub(r"\?{2,}", "?", s)
    s = re.sub(r"\s+", " ", s).strip()

    # Garante pontuação firme no encerramento para evitar sopro residual no TTS
    if s and s[-1] not in ".!?":
        s += "."

    return s


def resolve_prosody(speaker: str, scene: dict, idx: int, total_scenes: int) -> tuple[str, str, str]:
    base = VOICE_CONFIG_EDGE.get(speaker, VOICE_CONFIG_EDGE["narrador"])
    base_rate = int(base["rate"].replace("%", "").replace("+", ""))
    base_pitch = int(base["pitch"].replace("Hz", "").replace("+", ""))

    default_emo = "gancho" if idx == 0 else ("comemorando" if idx == total_scenes - 1 else "neutro")
    emo_key = str(scene.get("emocao", default_emo)).lower().strip()
    mod = EMOTION_MODIFIERS.get(emo_key, EMOTION_MODIFIERS["neutro"])

    final_rate_val = max(-25, min(40, base_rate + mod["rate_delta"]))
    final_pitch_val = max(-20, min(20, base_pitch + mod["pitch_delta"]))

    rate_str = str(scene.get("rate") or f"{final_rate_val:+d}%")
    pitch_str = str(scene.get("pitch") or f"{final_pitch_val:+d}Hz")
    return base["voice"], rate_str, pitch_str


def build_subtitle_blocks(words: list[dict], chunk_size: int = 3) -> list[dict]:
    blocks: list[dict] = []
    for i in range(0, len(words), chunk_size):
        grp = words[i : i + chunk_size]
        if not grp:
            continue
        blocks.append({
            "text": " ".join(w["text"] for w in grp),
            "startSec": grp[0]["startSec"],
            "endSec": grp[-1]["endSec"],
            "words": grp,
        })
    return blocks


async def generate_edge_tts_with_words(
    text_tts: str, out_path: Path, voice: str, rate: str, pitch: str
) -> list[dict]:
    import edge_tts

    communicate = edge_tts.Communicate(
        text_tts,
        voice,
        rate=rate,
        pitch=pitch,
        boundary="WordBoundary",
    )

    words: list[dict] = []
    audio_chunks: list[bytes] = []

    async for chunk in communicate.stream():
        ctype = chunk.get("type")
        if ctype == "audio":
            audio_chunks.append(chunk["data"])
        elif ctype == "WordBoundary":
            start_sec = round(chunk["offset"] / 10_000_000, 4)
            dur_sec = round(chunk["duration"] / 10_000_000, 4)
            words.append({
                "text": chunk["text"],
                "startSec": start_sec,
                "endSec": round(start_sec + dur_sec, 4),
            })

    out_path.write_bytes(b"".join(audio_chunks))
    return words


def generate_elevenlabs_tts(text_tts: str, out_path: Path, speaker: str = "narrador") -> list[dict]:
    import urllib.request

    voice_id = VOICE_MAP_ELEVEN.get(speaker, "pNInz6obpgDQGcFmaJgB")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = json.dumps({
        "text": text_tts,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.42, "similarity_boost": 0.78},
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        out_path.write_bytes(resp.read())
    return []


async def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python scripts/generate_tts.py <caminho_roteiro.json>")
        sys.exit(1)

    script_path = Path(sys.argv[1])
    slug = script_path.stem
    data = json.loads(script_path.read_text(encoding="utf-8"))
    is_long = str(data.get("formato", "short")).lower() == "long"

    audio_dir = Path("output/audio") / slug
    audio_dir.mkdir(parents=True, exist_ok=True)

    for old in audio_dir.glob("cena_*.mp3"):
        old.unlink()

    cenas = data["cenas"]
    manifest_scenes = []

    for idx, scene in enumerate(cenas):
        out_file = audio_dir / f"cena_{idx:02d}.mp3"
        raw_text = scene["texto"]
        text_tts = sanitize_ptbr_tts(raw_text)
        speaker = scene.get("voz", "narrador")
        voice_name, rate_str, pitch_str = resolve_prosody(speaker, scene, idx, len(cenas))

        if ELEVENLABS_API_KEY:
            print(f"[{slug} | ElevenLabs:{speaker}] Cena {idx}: {text_tts[:60]}...")
            words = generate_elevenlabs_tts(text_tts, out_file, speaker)
        else:
            print(f"[{slug} | Edge-TTS:{speaker} ({rate_str}, {pitch_str})] Cena {idx}: {text_tts[:60]}...")
            words = await generate_edge_tts_with_words(text_tts, out_file, voice_name, rate_str, pitch_str)

        blocks = build_subtitle_blocks(words, chunk_size=4 if is_long else 3)
        speech_env = {
            "firstWordSec": words[0]["startSec"] if words else 0.0,
            "lastWordSec": words[-1]["endSec"] if words else 0.0,
        }

        manifest_scenes.append({
            "idx": idx,
            "id": scene.get("id", f"cena_{idx}"),
            "voz": speaker,
            "emocao": scene.get("emocao", ""),
            "rate": rate_str,
            "pitch": pitch_str,
            "texto": raw_text,
            "texto_tts": text_tts,
            "audioFile": str(out_file.as_posix()),
            "speechEnvelope": speech_env,
            "words": words,
            "blocks": blocks,
        })

    manifest_path = audio_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps({"slug": slug, "titulo": data.get("titulo", ""), "cenas": manifest_scenes}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Áudios sanitizados e timestamps de palavras/blocos salvos em {audio_dir}")


if __name__ == "__main__":
    asyncio.run(main())
