# Vida de Bloco IA v2 — PoxaRique! (`@VidadeBlocoBR`)

Motor programático completo de animação 2D/2.5D em blocos estilo **Roblox / Vida de Bloco** no formato viral **"E se...?"**, com física de estados, trajetórias reais, câmera dinâmica, sanitização inteligente de TTS PT-BR, biblioteca procedural de SFX com *audio ducking*, modo `--preview` ultra-rápido e upload via **YouTube Data API v3**.

## Estrutura do Projeto

```text
vida-de-bloco-ia/
├── .agents/skills/vida-de-bloco/SKILL.md  # Skill oficial v2 do projeto
├── plugin-vida-de-bloco/                  # Plugin/Agente oficial Vida de Bloco
├── plugin-levi-motion/                    # Equipe de 10 subagentes auxiliares (revisao-01, personagens-01, etc.)
├── instalar_agente.ps1                    # Instala todos os plugins/agentes deste repo no Antigravity
├── assets/
│   ├── characters/cartoon_rig.js          # Rigs modulares + máquina de estados físicos + lip-sync WordBoundary
│   └── scenes/environments.js             # Cenários interativos + trajetórias reais + zonas seguras Shorts
├── scripts/
│   ├── validate_script.js                 # Validador estrutural e de retenção de roteiros JSON
│   ├── generate_tts.py                    # Sanitizador PT-BR (R$, %, emoções, rate/pitch) + Edge-TTS / ElevenLabs
│   ├── generate_sfx.py                    # Gerador procedural de 14 SFX + trilha sem copyright
│   ├── render_video.js                    # Câmera virtual + Ducking de áudio + Render Full HD ou --preview
│   ├── upload_youtube.py                  # Upload oficial para o YouTube (OAuth 2.0)
│   ├── short_01_caramelo.json             # Roteiro v1 (100% retrocompatível)
│   ├── short_02_escola_parkour_v2.json    # Roteiro v2 completo (parkour, câmera, Pix ao vivo, SFX por evento)
│   └── demo_long_16x9.json                # Exemplo Vídeo Longo Horizontal (1920x1080)
└── output/                                # Vídeos MP4, áudios isolados e frames de revisão
```

## Instalação Rápida em Qualquer PC

```powershell
git clone https://github.com/PoxaRicky/vida-de-bloco-ia.git
cd vida-de-bloco-ia
npm install
npx playwright install chromium
pip install edge-tts
.\instalar_agente.ps1
```

## Comandos Principais (Pipeline v2)

### 1. Validar Roteiro JSON
```powershell
node scripts/validate_script.js scripts/short_02_escola_parkour_v2.json
```

### 2. Gerar SFX Procedurais e Narração TTS Sanitizada (Opcional — `render_video.js` já sincroniza automaticamente)
```powershell
python scripts/generate_sfx.py
python scripts/generate_tts.py scripts/short_02_escola_parkour_v2.json
```

### 3. Modo Preview Rápido (`540x960 @ 15fps` — valida ritmo e câmera em segundos)
```powershell
node scripts/render_video.js scripts/short_02_escola_parkour_v2.json --preview
```

### 4. Renderização Final Full HD (`1080x1920` ou `1920x1080 @ 30fps`)
```powershell
node scripts/render_video.js scripts/short_02_escola_parkour_v2.json
```

### 5. Upload no YouTube (Somente Após Revisão e Aprovação)
```powershell
python scripts/upload_youtube.py --video output/short_02_escola_parkour_v2_poxarique.mp4 --title "E Se a Escola Virasse um Parkour Valendo Pix no Roblox? 😱 #shorts" --privacy private
```
