"""
Upload automático para o YouTube (YouTube Data API v3) com rotação automática de múltiplas cotas!
Suporta:
  - client_secret.json   -> token.json   (Cota 1: ~6 uploads/dia gratuitos)
  - client_secret_2.json -> token_2.json (Cota 2: +6 uploads/dia = 12/dia)
  - client_secret_3.json -> token_3.json (Cota 3: +6 uploads/dia = 18/dia)
Se uma credencial atingir o limite diário (quotaExceeded), alterna sozinho para a próxima!
"""
import argparse
import sys
from pathlib import Path

SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]


def discover_credential_pairs() -> list[tuple[Path, Path]]:
    pairs = []
    candidates = [
        ("client_secret.json", "token.json"),
        ("client_secret_2.json", "token_2.json"),
        ("client_secret_3.json", "token_3.json"),
        ("client_secret_4.json", "token_4.json"),
    ]
    for cs, tk in candidates:
        cs_p = Path(cs)
        if cs_p.exists():
            pairs.append((cs_p, Path(tk)))
    return pairs


def get_authenticated_service(client_secret_path: Path, token_path: Path):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    creds = None
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(client_secret_path), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json(), encoding="utf-8")

    return build("youtube", "v3", credentials=creds)


def is_quota_error(exc: Exception) -> bool:
    msg = str(exc)
    return "quotaExceeded" in msg or "dailyLimitExceeded" in msg


def upload_with_service(youtube, args, video_path: Path) -> str:
    from googleapiclient.http import MediaFileUpload

    status_body = {
        "privacyStatus": "private" if args.publish_at else args.privacy,
        "selfDeclaredMadeForKids": False,
    }
    if args.publish_at:
        status_body["publishAt"] = args.publish_at

    body = {
        "snippet": {
            "title": args.title[:100],
            "description": args.description,
            "tags": [t.strip() for t in args.tags.split(",") if t.strip()],
            "categoryId": args.category,
            "defaultLanguage": "pt-BR",
            "defaultAudioLanguage": "pt-BR",
        },
        "status": status_body,
    }

    mode_label = f"agendado {args.publish_at}" if args.publish_at else args.privacy
    print(f"Enviando '{video_path.name}' para o YouTube como [{mode_label}]...", flush=True)
    media = MediaFileUpload(str(video_path), chunksize=1024 * 1024 * 4, resumable=True, mimetype="video/mp4")
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Progresso: {int(status.progress() * 100)}%", flush=True)

    video_id = response["id"]
    print(f"Upload concluído! Link: https://youtu.be/{video_id}", flush=True)

    if args.thumbnail:
        thumb_path = Path(args.thumbnail)
        if thumb_path.exists():
            print(f"Enviando thumbnail '{thumb_path.name}'...", flush=True)
            try:
                youtube.thumbnails().set(
                    videoId=video_id,
                    media_body=MediaFileUpload(str(thumb_path)),
                ).execute()
                print("Thumbnail aplicada com sucesso!", flush=True)
            except Exception as exc:
                print(f"AVISO: Não foi possível definir thumbnail via API: {exc}", flush=True)
        else:
            print(f"AVISO: Thumbnail '{thumb_path}' não encontrada.", flush=True)

    return video_id


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload de vídeo para o YouTube (@VidadeBlocoBR)")
    parser.add_argument("--video", required=True, help="Caminho do arquivo .mp4")
    parser.add_argument("--title", required=True, help="Título do vídeo (até 100 caracteres)")
    parser.add_argument("--description", default="Inscreva-se no Vida de Bloco (@VidadeBlocoBR)!", help="Descrição")
    parser.add_argument("--tags", default="vidadebloco,roblox,animacao,brasil", help="Tags separadas por vírgula")
    parser.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private")
    parser.add_argument("--category", default="20", help="ID da categoria YouTube (20 = Gaming)")
    parser.add_argument("--thumbnail", default=None, help="Caminho opcional da thumbnail (.png/.jpg)")
    parser.add_argument("--publish-at", default=None, help="Horário agendado ISO 8601")
    args = parser.parse_args()

    video_path = Path(args.video)
    if not video_path.exists():
        print(f"ERRO: Vídeo não encontrado em {video_path}", flush=True)
        sys.exit(1)

    pairs = discover_credential_pairs()
    if not pairs:
        print("ERRO: Nenhum client_secret*.json encontrado na raiz do projeto.", flush=True)
        sys.exit(1)

    for idx, (cs_path, tk_path) in enumerate(pairs, 1):
        try:
            print(f"[Cota #{idx}: {cs_path.name}] Autenticando...", flush=True)
            youtube = get_authenticated_service(cs_path, tk_path)
            upload_with_service(youtube, args, video_path)
            return
        except Exception as exc:
            if is_quota_error(exc) and idx < len(pairs):
                print(f"[AVISO] Cota esgotada em {cs_path.name}! Alternando automaticamente para a próxima cota...", flush=True)
                continue
            raise


if __name__ == "__main__":
    main()
