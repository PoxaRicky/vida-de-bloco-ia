# Vida de Bloco IA — PoxaRique!

Motor completo de criação automatizada de vídeos animados 2D/2.5D estilo **Vida de Bloco / Roblox** no formato *outlier* **"E se...?"**, com marca d'água oficial **`PoxaRique!`**, multi-voz TTS, efeitos sonoros + trilha autoral, suporte a **Shorts (9:16)** e **Vídeos Longos (16:9)**, e upload via **YouTube Data API v3**.

## Estrutura do Projeto

```text
vida-de-bloco-ia/
├── .agents/skills/vida-de-bloco/SKILL.md  # Skill automática do Antigravity
├── assets/
│   ├── characters/cartoon_rig.js          # Rigs (Menino, Mãe, Caramelo + Marca d'água PoxaRique!)
│   └── scenes/environments.js             # Cenários completos responsivos (9:16 e 16:9)
├── scripts/
│   ├── generate_tts.py                    # Narração multi-voz (ElevenLabs ou Edge-TTS)
│   ├── generate_sfx.py                    # Gerador procedural de SFX e trilha sem copyright
│   ├── render_video.js                    # Renderizador + Mixador de Áudio Master -> MP4
│   ├── upload_youtube.py                  # Upload oficial para o YouTube (OAuth 2.0)
│   ├── short_01_caramelo.json             # 1º Short autoral: Cachorro Caramelo Dono do Roblox
│   └── demo_long_16x9.json                # Exemplo em modo Vídeo Longo Horizontal (1920x1080)
└── output/                                # Vídeos MP4 e frames de preview
```

## Como Rodar em Qualquer Computador

```powershell
git clone https://github.com/PoxaRicky/vida-de-bloco-ia.git
cd vida-de-bloco-ia
npm install
npx playwright install chromium
pip install edge-tts
```

### Gerar um Vídeo (Short 9:16 ou Longo 16:9)

```powershell
python scripts/generate_tts.py scripts/short_01_caramelo.json
node scripts/render_video.js scripts/short_01_caramelo.json
```

### Configurar Upload Automático no YouTube (Opcional)

1. Instale o cliente Google: `pip install google-api-python-client google-auth-oauthlib google-auth-httplib2`
2. No [Google Cloud Console](https://console.cloud.google.com/), ative a **YouTube Data API v3**, crie uma credencial **OAuth Client ID (Desktop App)** e salve na raiz como `client_secret.json`.
3. Suba um vídeo aprovado como privado para revisão final no YouTube Studio:
   ```powershell
   python scripts/upload_youtube.py --video output/short_01_caramelo_poxarique.mp4 --title "E Se o Cachorro CARAMELO Virasse Dono do Roblox? 😱 #shorts" --privacy private
   ```
