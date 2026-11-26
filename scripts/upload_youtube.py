"""
Upload automático para o YouTube (YouTube Data API v3).

Pré-requisitos (instalar 1 vez):
  pip install google-api-python-client google-auth-oauthlib google-auth-httplib2

Configuração (1 vez no Google Cloud Console):
  1. Crie um projeto em https://console.cloud.google.com/
  2. Ative a "YouTube Data API v3"
  3. Crie uma credencial "ID do cliente OAuth" (tipo: App para computador / Desktop)
  4. Baixe o JSON e salve na raiz deste projeto como `client_secret.json`

Exemplo de uso:
  python scripts/upload_youtube.py ^
    --video output/short_01_caramelo_poxarique.mp4 ^
    --title "E Se o Cachorro CARAMELO Virasse Dono do Roblox? 😱 #shorts" ^
    --description "Comenta CARAMELO se você jogaria nesse servidor! Criado por PoxaRique!" ^
    --tags "roblox,caramelo,animacao,brasil,shorts,poxarique" ^
    --privacy private
"""

import argparse
import os
import sys
from pathlib import Path

SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]


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
            if not client_secret_path.exists():
                print(f"ERRO: Arquivo '{client_secret_path}' não encontrado.")
                print("Baixe sua credencial OAuth Desktop no Google Cloud Console e salve como client_secret.json.")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(client_secret_path), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json(), encoding="utf-8")

    return build("youtube", "v3", credentials=creds)


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload de vídeo para o YouTube (PoxaRique!)")
    parser.add_argument("--video", required=True, help="Caminho do arquivo .mp4")
    parser.add_argument("--title", required=True, help="Título do vídeo (até 100 caracteres)")
    parser.add_argument("--description", default="Criado por PoxaRique!", help="Descrição do vídeo")
    parser.add_argument("--tags", default="roblox,animacao,brasil,poxarique", help="Tags separadas por vírgula")
    parser.add_argument(
        "--privacy",
        choices=["private", "unlisted", "public"],
        default="private",
        help="Privacidade inicial (padrão: private para revisão segura)",
    )
    parser.add_argument("--category", default="20", help="ID da categoria YouTube (20 = Gaming, 24 = Entertainment)")
    parser.add_argument("--thumbnail", default=None, help="Caminho opcional da thumbnail (.png/.jpg)")
    parser.add_argument(
        "--publish-at",
        default=None,
        help="Horário agendado ISO 8601 (ex: 2026-11-27T12:00:00-03:00). Quando usado, o YouTube agenda a estreia automaticamente.",
    )
    args = parser.parse_args()

    from googleapiclient.http import MediaFileUpload

    video_path = Path(args.video)
    if not video_path.exists():
        print(f"ERRO: Vídeo não encontrado em {video_path}")
        sys.exit(1)

    youtube = get_authenticated_service(Path("client_secret.json"), Path("token.json"))

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

    print(f"Enviando '{video_path.name}' para o YouTube como [{args.privacy}]...")
    media = MediaFileUpload(str(video_path), chunksize=1024 * 1024 * 4, resumable=True, mimetype="video/mp4")
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Progresso: {int(status.progress() * 100)}%")

    video_id = response["id"]
    print(f"Upload concluído! Link: https://youtu.be/{video_id}")

    if args.thumbnail:
        thumb_path = Path(args.thumbnail)
        if thumb_path.exists():
            print(f"Enviando thumbnail '{thumb_path.name}'...")
            try:
                youtube.thumbnails().set(
                    videoId=video_id,
                    media_body=MediaFileUpload(str(thumb_path)),
                ).execute()
                print("Thumbnail aplicada com sucesso!")
            except Exception as exc:
                print(f"AVISO: Não foi possível definir thumbnail via API (verifique telefone no YouTube Studio): {exc}")
        else:
            print(f"AVISO: Thumbnail '{thumb_path}' não encontrada.")


if __name__ == "__main__":
    main()
