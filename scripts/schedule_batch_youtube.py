"""
Agenda automaticamente até 10 Shorts aprovados ao longo do dia no YouTube (usando status.publishAt),
espaçando os horários (ex: 08:00, 09:20, 10:40, 12:00, 13:20, 14:40, 16:00, 17:20, 18:40, 20:00 BRT)
para maximizar entrega no feed de Shorts sem disparar trava de spam.

Uso:
  python -u scripts/schedule_batch_youtube.py --date 2026-11-27 --manifest scripts/fila_publicacao.json
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

DEFAULT_SLOTS = [
    "08:00:00",
    "09:20:00",
    "10:40:00",
    "12:00:00",
    "13:20:00",
    "14:40:00",
    "16:00:00",
    "17:20:00",
    "18:40:00",
    "20:00:00",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Agendador de 10 Shorts/dia no YouTube (@VidadeBlocoBR)")
    parser.add_argument("--date", required=True, help="Data alvo no formato YYYY-MM-DD (ex: 2026-11-27)")
    parser.add_argument("--manifest", required=True, help="JSON com lista de vídeos aprovados")
    parser.add_argument("--tz", default="-03:00", help="Fuso horário (padrão: -03:00 Brasília)")
    args = parser.parse_args()

    items = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    for idx, item in enumerate(items):
        slot = item.get("hora") or DEFAULT_SLOTS[idx % len(DEFAULT_SLOTS)]
        publish_at = f"{args.date}T{slot}{args.tz}"
        print(f"\n[{idx + 1}/{len(items)}] Agendando '{item['title']}' para {publish_at}...", flush=True)
        cmd = [
            sys.executable,
            "-u",
            "scripts/upload_youtube.py",
            "--video",
            item["video"],
            "--title",
            item["title"],
            "--description",
            item["description"],
            "--tags",
            item.get("tags", "vidadebloco,roblox,shorts,animacao,brasil"),
            "--publish-at",
            publish_at,
        ]
        if item.get("thumbnail"):
            cmd.extend(["--thumbnail", item["thumbnail"]])
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
