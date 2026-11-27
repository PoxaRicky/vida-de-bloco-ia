"""Inicializa um projeto Remotion vertical (1080x1920, 60fps) de forma não-interativa."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path

SFX_PADRAO = [
    "pop.mp3",
    "whoosh.mp3",
    "whoosh-short.mp3",
    "notification.mp3",
    "key-press.mp3",
    "click.mp3",
    "click-soft.mp3",
    "chime.mp3",
]

SFX_FALLBACK_DIR = Path.home() / ".gemini" / "config" / "skills" / "media-use" / "audio" / "assets" / "sfx"


def escrever_se_ausente(caminho: Path, conteudo: str) -> None:
    if not caminho.exists():
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(conteudo, encoding="utf-8")


def copiar_arquivos_pasta(origem: Path, destino: Path, extensoes: tuple[str, ...]) -> int:
    destino.mkdir(parents=True, exist_ok=True)
    if not origem.is_dir():
        return 0
    copiados = 0
    for item in origem.iterdir():
        if item.is_file() and item.suffix.lower() in extensoes:
            shutil.copy2(item, destino / item.name)
            copiados += 1
    return copiados


def criar_estrutura_remotion(projeto_dir: Path, nome_pkg: str) -> None:
    for sub in ["dados", "src/camadas", "revisao", "public/personagens", "public/efeitos", "out"]:
        (projeto_dir / sub).mkdir(parents=True, exist_ok=True)

    package_json = {
        "name": nome_pkg,
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "dev": "remotion studio src/index.ts",
            "build": "remotion bundle src/index.ts",
            "render": "remotion render src/index.ts VideoPrincipal out/video-final.mp4 --codec=h264 --crf=12 --scale=2",
        },
        "dependencies": {
            "@remotion/cli": "^4.0.0",
            "@remotion/google-fonts": "^4.0.0",
            "react": "^18.3.1",
            "react-dom": "^18.3.1",
            "remotion": "^4.0.0",
        },
        "devDependencies": {
            "@types/node": "^22.0.0",
            "@types/react": "^18.3.1",
            "@types/react-dom": "^18.3.1",
            "typescript": "^5.6.0",
        },
    }
    escrever_se_ausente(projeto_dir / "package.json", json.dumps(package_json, indent=2, ensure_ascii=False) + "\n")

    tsconfig = {
        "compilerOptions": {
            "target": "ES2022",
            "module": "commonjs",
            "jsx": "react-jsx",
            "strict": True,
            "esModuleInterop": True,
            "skipLibCheck": True,
            "resolveJsonModule": True,
            "forceConsistentCasingInFileNames": True,
        },
        "include": ["src/**/*"],
    }
    escrever_se_ausente(projeto_dir / "tsconfig.json", json.dumps(tsconfig, indent=2) + "\n")

    remotion_cfg = (
        'import { Config } from "@remotion/cli/config";\n\n'
        'Config.setVideoImageFormat("jpeg");\n'
        "Config.setOverwriteOutput(true);\n"
    )
    escrever_se_ausente(projeto_dir / "remotion.config.ts", remotion_cfg)

    index_ts = 'import { registerRoot } from "remotion";\nimport { RemotionRoot } from "./Root";\n\nregisterRoot(RemotionRoot);\n'
    escrever_se_ausente(projeto_dir / "src/index.ts", index_ts)

    video_inicial = (
        'import React from "react";\n'
        'import { AbsoluteFill } from "remotion";\n\n'
        "export const VideoPrincipal: React.FC = () => (\n"
        '  <AbsoluteFill style={{ backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>\n'
        '    <h1 style={{ fontSize: 64, color: "#111315" }}>Projeto Remotion Inicializado</h1>\n'
        "  </AbsoluteFill>\n"
        ");\n"
    )
    escrever_se_ausente(projeto_dir / "src/VideoPrincipal.tsx", video_inicial)

    root_inicial = (
        'import React from "react";\n'
        'import { Composition } from "remotion";\n'
        'import { VideoPrincipal } from "./VideoPrincipal";\n\n'
        "export const RemotionRoot: React.FC = () => (\n"
        "  <>\n"
        "    <Composition\n"
        '      id="VideoPrincipal"\n'
        "      component={VideoPrincipal}\n"
        "      durationInFrames={2100}\n"
        "      fps={60}\n"
        "      width={1080}\n"
        "      height={1920}\n"
        "    />\n"
        "  </>\n"
        ");\n"
    )
    escrever_se_ausente(projeto_dir / "src/Root.tsx", root_inicial)


def main() -> None:
    parser = argparse.ArgumentParser(description="Inicializa projeto Remotion 1080x1920 @ 60fps para Levi Motion.")
    parser.add_argument("--dir", required=True, help="Diretório destino do projeto")
    parser.add_argument("--narracao", required=False, help="Caminho para narracao.wav")
    parser.add_argument("--personagens", required=False, help="Pasta com PNGs transparentes de personagens")
    parser.add_argument("--efeitos", required=False, help="Pasta com efeitos sonoros (.mp3/.wav)")
    parser.add_argument("--instalar", action="store_true", help="Executa npm.cmd install após criar o projeto")
    args = parser.parse_args()

    projeto_dir = Path(args.dir).resolve()
    projeto_dir.mkdir(parents=True, exist_ok=True)
    nome_pkg = "".join(c if c.isalnum() or c == "-" else "-" for c in projeto_dir.name.lower()).strip("-") or "levi-motion-video"
    criar_estrutura_remotion(projeto_dir, nome_pkg)

    narracao_ok = False
    if args.narracao:
        src_wav = Path(args.narracao).resolve()
        if not src_wav.is_file():
            raise FileNotFoundError(f"Arquivo de narração não encontrado: {src_wav}")
        shutil.copy2(src_wav, projeto_dir / "public" / "narracao.wav")
        narracao_ok = True

    pers_count = 0
    if args.personagens:
        pers_count = copiar_arquivos_pasta(Path(args.personagens).resolve(), projeto_dir / "public" / "personagens", (".png", ".webp", ".svg"))

    sfx_count = 0
    if args.efeitos:
        sfx_count = copiar_arquivos_pasta(Path(args.efeitos).resolve(), projeto_dir / "public" / "efeitos", (".mp3", ".wav", ".ogg", ".m4a"))

    if sfx_count == 0 and SFX_FALLBACK_DIR.is_dir():
        destino_sfx = projeto_dir / "public" / "efeitos"
        for nome in SFX_PADRAO:
            arq = SFX_FALLBACK_DIR / nome
            if arq.is_file():
                shutil.copy2(arq, destino_sfx / nome)
                sfx_count += 1

    if args.instalar:
        subprocess.run(["npm.cmd", "install", "--no-audit", "--no-fund"], cwd=str(projeto_dir), check=True)

    print(
        f"Projeto inicializado em {projeto_dir} | narracao={narracao_ok} | personagens={pers_count} | efeitos={sfx_count}"
    )


if __name__ == "__main__":
    main()
