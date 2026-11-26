"""
Autentica com escopo completo do YouTube (upload + exclusão) e apaga vídeos indesejados.
Salva o novo token.json já com permissão de upload + gerenciamento.
"""
import os
import subprocess
import sys
from pathlib import Path
from wsgiref.simple_server import WSGIRequestHandler, make_server

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]


def get_creds(client_secret: Path, token_path: Path):
    creds = None
    if token_path.exists():
        try:
            data = token_path.read_text(encoding="utf-8")
            if "youtube.force-ssl" in data or '"https://www.googleapis.com/auth/youtube"' in data:
                creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        except Exception:
            creds = None

    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        token_path.write_text(creds.to_json(), encoding="utf-8")
        return creds

    flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), SCOPES)

    class QuietHandler(WSGIRequestHandler):
        def log_message(self, format, *args):
            pass

    captured = {}

    def wsgi_app(environ, start_response):
        qs = environ.get("QUERY_STRING", "")
        if "code=" in qs or "error=" in qs:
            captured["uri"] = f"http://localhost:8765{environ.get('PATH_INFO', '')}?{qs}"
            start_response("200 OK", [("Content-Type", "text/html; charset=utf-8")])
            return [
                "<html><body style='font-family:sans-serif;text-align:center;padding:40px;background:#111;color:#fff'>"
                "<h2>Autorizado com sucesso! Os videos antigos estao sendo apagados. Pode fechar esta aba.</h2>"
                "</body></html>".encode("utf-8")
            ]
        start_response("204 No Content", [])
        return [b""]

    server = make_server("localhost", 8765, wsgi_app, handler_class=QuietHandler)
    flow.redirect_uri = "http://localhost:8765/"
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")

    print(f"\n=== LINK DE AUTORIZACAO ===\n{auth_url}\n===========================\n", flush=True)
    try:
        os.startfile(auth_url)
    except Exception:
        try:
            subprocess.Popen(["cmd", "/c", "start", "", auth_url])
        except Exception:
            pass

    server.timeout = 300
    for _ in range(15):
        if "uri" in captured:
            break
        server.handle_request()
    server.server_close()

    if "uri" not in captured:
        print("Tempo esgotado aguardando autorizacao.", flush=True)
        sys.exit(1)

    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
    flow.fetch_token(authorization_response=captured["uri"])
    creds = flow.credentials
    token_path.write_text(creds.to_json(), encoding="utf-8")
    print("Novo token.json salvo com permissao completa!", flush=True)
    return creds


def main() -> None:
    video_ids = sys.argv[1:]
    if not video_ids:
        print("Uso: python -u scripts/delete_youtube.py <id1> <id2> ...", flush=True)
        sys.exit(1)

    creds = get_creds(Path("client_secret.json"), Path("token.json"))
    yt = build("youtube", "v3", credentials=creds)
    for vid in video_ids:
        try:
            yt.videos().delete(id=vid).execute()
            print(f"[OK] Video apagado do YouTube: {vid}", flush=True)
        except Exception as exc:
            print(f"[AVISO] Nao foi possivel apagar {vid}: {exc}", flush=True)


if __name__ == "__main__":
    main()
