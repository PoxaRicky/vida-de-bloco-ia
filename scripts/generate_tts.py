import asyncio
import json
import os
import sys
from pathlib import Path

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()

VOICE_MAP_EDGE = {
    "menino": "pt-BR-AntonioNeural",
    "narrador": "pt-BR-AntonioNeural",
    "mae": "pt-BR-FranciscaNeural",
}

VOICE_MAP_ELEVEN = {
    "menino": "pNInz6obpgDQGcFmaJgB",
    "narrador": "pNInz6obpgDQGcFmaJgB",
    "mae": "EXAVITQu4vr4xnSDxMaL",
}


async def generate_edge_tts(text: str, out_path: Path, speaker: str = "narrador") -> None:
    import edge_tts

    voice = VOICE_MAP_EDGE.get(speaker, "pt-BR-AntonioNeural")
    rate = "+16%" if speaker != "mae" else "+12%"
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(out_path))


def generate_elevenlabs_tts(text: str, out_path: Path, speaker: str = "narrador") -> None:
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


async def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python scripts/generate_tts.py <caminho_roteiro.json>")
        sys.exit(1)

    script_path = Path(sys.argv[1])
    data = json.loads(script_path.read_text(encoding="utf-8"))

    audio_dir = Path("output/audio")
    audio_dir.mkdir(parents=True, exist_ok=True)

    for old in audio_dir.glob("cena_*.mp3"):
        old.unlink()

    for idx, scene in enumerate(data["cenas"]):
        out_file = audio_dir / f"cena_{idx:02d}.mp3"
        text = scene["texto"]
        speaker = scene.get("voz", "narrador")
        if ELEVENLABS_API_KEY:
            print(f"[ElevenLabs:{speaker}] Cena {idx}: {text[:45]}...")
            generate_elevenlabs_tts(text, out_file, speaker)
        else:
            print(f"[Edge-TTS:{speaker}] Cena {idx}: {text[:45]}...")
            await generate_edge_tts(text, out_file, speaker)

    print(f"Áudios gerados em {audio_dir}")


if __name__ == "__main__":
    asyncio.run(main())
