import asyncio
import json
import os
import sys
from pathlib import Path

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()

VOICE_CONFIG_EDGE = {
    "menino":   {"voice": "pt-BR-AntonioNeural",             "rate": "+16%", "pitch": "+4Hz"},
    "narrador": {"voice": "pt-BR-AntonioNeural",             "rate": "+14%", "pitch": "-2Hz"},
    "mae":      {"voice": "pt-BR-FranciscaNeural",           "rate": "+12%", "pitch": "+0Hz"},
    "vo":       {"voice": "pt-BR-ThalitaMultilingualNeural", "rate": "+4%",  "pitch": "-7Hz"},
    "diretora": {"voice": "pt-BR-FranciscaNeural",           "rate": "+8%",  "pitch": "-5Hz"},
}

VOICE_MAP_ELEVEN = {
    "menino": "pNInz6obpgDQGcFmaJgB",
    "narrador": "pNInz6obpgDQGcFmaJgB",
    "mae": "EXAVITQu4vr4xnSDxMaL",
    "vo": "EXAVITQu4vr4xnSDxMaL",
    "diretora": "EXAVITQu4vr4xnSDxMaL",
}


async def generate_edge_tts_with_words(text: str, out_path: Path, speaker: str = "narrador") -> list[dict]:
    import edge_tts

    cfg = VOICE_CONFIG_EDGE.get(speaker, VOICE_CONFIG_EDGE["narrador"])
    communicate = edge_tts.Communicate(
        text,
        cfg["voice"],
        rate=cfg["rate"],
        pitch=cfg["pitch"],
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


def generate_elevenlabs_tts(text: str, out_path: Path, speaker: str = "narrador") -> list[dict]:
    import urllib.request

    voice_id = VOICE_MAP_ELEVEN.get(speaker, "pNInz6obpgDQGcFmaJgB")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = json.dumps({
        "text": text,
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

    # Pasta isolada por roteiro para NUNCA misturar áudio de um vídeo com outro!
    audio_dir = Path("output/audio") / slug
    audio_dir.mkdir(parents=True, exist_ok=True)

    for old in audio_dir.glob("cena_*.mp3"):
        old.unlink()

    manifest_scenes = []

    for idx, scene in enumerate(data["cenas"]):
        out_file = audio_dir / f"cena_{idx:02d}.mp3"
        text = scene["texto"]
        speaker = scene.get("voz", "narrador")
        if ELEVENLABS_API_KEY:
            print(f"[{slug} | ElevenLabs:{speaker}] Cena {idx}: {text[:50]}...")
            words = generate_elevenlabs_tts(text, out_file, speaker)
        else:
            print(f"[{slug} | Edge-TTS:{speaker}] Cena {idx}: {text[:50]}...")
            words = await generate_edge_tts_with_words(text, out_file, speaker)

        manifest_scenes.append({
            "idx": idx,
            "id": scene.get("id", f"cena_{idx}"),
            "voz": speaker,
            "texto": text,
            "audioFile": str(out_file.as_posix()),
            "words": words,
        })

    manifest_path = audio_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps({"slug": slug, "titulo": data.get("titulo", ""), "cenas": manifest_scenes}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Áudios e timestamps de palavras salvos em {audio_dir}")


if __name__ == "__main__":
    asyncio.run(main())
