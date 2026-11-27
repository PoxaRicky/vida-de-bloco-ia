"""
Publicador inteligente da fila de vídeos pendentes (scripts/fila_pendentes.json).
Sempre que o usuário disser "pode publicar" ou "publique os vídeos pendentes":
  python -u scripts/publish_pending.py

- Envia cada item com status == "pending" (título, descrição, tags e thumbnail).
- Salva imediatamente o link publicado e muda status para "published" após cada sucesso.
- Se atingir limite diário do YouTube (uploadLimitExceeded / quotaExceeded), para de forma limpa
  preservando os demais como "pending" para a próxima janela!
"""
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

QUEUE_PATH = Path("scripts/fila_pendentes.json")


def main() -> None:
    if not QUEUE_PATH.exists():
        print("Nenhuma fila encontrada em scripts/fila_pendentes.json", flush=True)
        return

    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    pending = [item for item in queue if item.get("status", "pending") == "pending"]

    if not pending:
        print("Todos os vídeos da fila já foram publicados!", flush=True)
        return

    print(f"Encontrados {len(pending)} vídeo(s) pendente(s) na fila...", flush=True)
    published_count = 0

    for item in queue:
        if item.get("status", "pending") != "pending":
            continue

        print(f"\n>>> Publicando: {item['title']}", flush=True)
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
            item.get("tags", "vidadebloco,roblox,animacao,brasil"),
            "--privacy",
            item.get("privacy", "public"),
        ]
        if item.get("thumbnail"):
            cmd.extend(["--thumbnail", item["thumbnail"]])

        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        out_all = (proc.stdout or "") + "\n" + (proc.stderr or "")
        print(out_all.strip(), flush=True)

        if proc.returncode == 0:
            m = re.search(r"https://youtu\.be/[A-Za-z0-9_-]+", out_all)
            item["status"] = "published"
            item["youtube_url"] = m.group(0) if m else ""
            item["published_at"] = datetime.now(timezone.utc).isoformat()
            QUEUE_PATH.write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding="utf-8")
            published_count += 1
        else:
            if "uploadLimitExceeded" in out_all or "quotaExceeded" in out_all:
                print(
                    "\n[PAUSA SEGURA] Limite diário de envios do YouTube atingido no momento. "
                    "Os vídeos restantes permanecem salvos como 'pending' em scripts/fila_pendentes.json!",
                    flush=True,
                )
                break
            else:
                print(f"\n[ERRO] Falha ao enviar {item['id']}. Mantido como 'pending'.", flush=True)
                break

    restantes = sum(1 for it in queue if it.get("status", "pending") == "pending")
    print(f"\nResumo da execução: {published_count} publicado(s) agora | {restantes} ainda pendente(s).", flush=True)


if __name__ == "__main__":
    main()
