"""
Analisa o desempenho real de todos os vídeos do canal Vida de Bloco (@VidadeBlocoBR) via YouTube Data API v3,
ordenando pelos vídeos com maior velocidade de views/engajamento para guiar os próximos roteiros.
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


def main() -> None:
    token_path = Path("token.json")
    creds = Credentials.from_authorized_user_file(str(token_path))
    yt = build("youtube", "v3", credentials=creds)

    ch = yt.channels().list(part="snippet,statistics,contentDetails", mine=True).execute()["items"][0]
    stats = ch["statistics"]
    print("=== CANAL VIDA DE BLOCO ===")
    print(
        f"Canal: {ch['snippet']['title']} | Inscritos: {stats.get('subscriberCount', 0)} "
        f"| Views totais: {stats.get('viewCount', 0)} | Vídeos: {stats.get('videoCount', 0)}"
    )

    uploads_id = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    pl = yt.playlistItems().list(part="contentDetails", playlistId=uploads_id, maxResults=50).execute()
    vid_ids = [it["contentDetails"]["videoId"] for it in pl.get("items", [])]

    if not vid_ids:
        print("Nenhum vídeo publicado encontrado.")
        return

    vres = yt.videos().list(part="snippet,statistics,contentDetails,status", id=",".join(vid_ids)).execute()
    now = datetime.now(timezone.utc)
    rows = []
    for v in vres.get("items", []):
        st = v.get("statistics", {})
        views = int(st.get("viewCount", 0))
        likes = int(st.get("likeCount", 0))
        comments = int(st.get("commentCount", 0))
        pub_str = v["snippet"]["publishedAt"]
        pub_dt = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
        hours_live = max(0.05, (now - pub_dt).total_seconds() / 3600.0)
        vph = views / hours_live
        rows.append({
            "id": v["id"],
            "privacy": v["status"]["privacyStatus"],
            "publishAt": v["status"].get("publishAt", ""),
            "views": views,
            "likes": likes,
            "comments": comments,
            "hours_live": round(hours_live, 2),
            "vph": round(vph, 1),
            "title": v["snippet"]["title"],
            "publishedAt": pub_str,
        })

    rows.sort(key=lambda r: (r["views"], r["vph"], r["likes"]), reverse=True)
    print("\n=== RANKING DE DESEMPENHO DOS VÍDEOS ===")
    for idx, r in enumerate(rows, 1):
        sched = f" (Agendado: {r['publishAt']})" if r["publishAt"] else ""
        print(
            f"#{idx} | https://youtu.be/{r['id']} | [{r['privacy']}{sched}] | "
            f"Views: {r['views']} ({r['vph']}/h em {r['hours_live']}h) | "
            f"Likes: {r['likes']} | Comentários: {r['comments']} | {r['title']}"
        )

    out_dir = Path("output")
    out_dir.mkdir(exist_ok=True)
    (out_dir / "analytics_latest.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
