---
name: vida-de-bloco
description: >-
  Produz vídeos completos para o canal Vida de Bloco (@VidadeBlocoBR) no estilo cartoon
  2D/2.5D em blocos v2 (Shorts 9:16 e Vídeos Longos 16:9): física de estados e trajetórias
  reais, câmera virtual dinâmica, cenários interativos, sanitizador TTS PT-BR + SFX por
  evento com audio ducking, modo --preview rápido, thumbnails 16:9, auditoria visual com
  revisao-01 e publicação no YouTube após aprovação do usuário.
---

# Skill Oficial — Agente Vida de Bloco v2 (`@VidadeBlocoBR`)

Este fluxo automatiza de ponta a ponta a criação de vídeos originais de alta retenção para o canal **Vida de Bloco (`@VidadeBlocoBR`)**, combinando física de animação contínua, trajetórias reais, câmera dinâmica e áudio cristalino.

## 1. Localização do Projeto & Git Sync
- Repositório: `c:\Users\henri\Documents\POXARIQUE\vida-de-bloco-ia`
- **Ao começar:** `git pull origin main`
- **Ao concluir alterações de código/roteiros/agentes:** sincronize com GitHub (`git add`, `git commit`, `git push origin main`), nunca subindo `client_secret.json`, `token.json`, `.env` ou `output/`.

## 2. Schema JSON v2 de Alta Retenção (`scripts/<slug>.json`)

### Campos Raiz
- `"titulo"`: Título com gancho forte `"E se...?"`.
- `"formato"`: `"short"` (`1080x1920`, ideal `18s–35s`, 5–6 cenas) ou `"long"` (`1920x1080`).
- `"marca_dagua"`: `"PoxaRique!"` (posicionada de forma limpa fora da UI do Shorts).
- `"arquivo_saida"`: `"<slug>_poxarique.mp4"`.

### Campos por Cena (`cenas[]`)
1. **Voz, Prosódia & Sanitização PT-BR (`scripts/generate_tts.py`):**
   - `"voz"`: `"menino"`, `"mae"`, `"vo"`, `"professor"`, `"diretora"`, `"padeiro"`, `"amigo"`, `"npc"`, `"caixa"`, `"motorista"`, `"sindica"`, `"narrador"`.
   - `"emocao"` *(opcional)*: `"gancho"`, `"animado"`, `"choque"`, `"panico"`, `"dramatico"`, `"acolhedor"`, `"bravo"`, `"comemorando"`.
   - `"rate"` / `"pitch"` *(opcional)*: ex. `"+18%"`, `"+5Hz"`.
   - O sanitizador converte automaticamente `R$ 50`, `99%`, `1º`, `HP`, `XP`, remove ruídos finais (`"he"`, emojis) e salva `words` + `blocks` em `output/audio/<slug>/manifest.json`.

2. **Cenários Interativos (`assets/scenes/environments.js`):**
   - Novos presets interativos v2: `"casa_vo"` (pote de sorvete abrindo), `"escola_parkour"` (plataformas sobre lava borbulhante), `"padaria"` (esteira rolante + salgados), `"rua_cidade"` (parallax + semáforo), `"servidor_admin"` (porta admin abrindo + matriz neon), `"quarto_gamer"` (LED RGB + dual monitor), além dos 60+ presets clássicos retrocompatíveis.
   - Props dinâmicos por cena: `"pix_valor": 500` (contador `R$` subindo em tempo real), `"hud_badge": "FASE 2"` (pílula única limpa), `"titulo_1..3"` (exibidos apenas nos primeiros `2.5s` no vídeo e fixos na thumbnail).

3. **Elenco, Estados Físicos, Trajetórias & Acessórios (`personagens[]`):**
   - `"tipo"`: `"menino"`, `"mae"`, `"caramelo"`, `"vo"`, `"professor"`, `"diretora"`, `"padeiro"`, `"amigo"`, `"npc"`.
   - `"state"`: `"idle"` (respiração + piscada natural), `"walk"`, `"run"` (inclinação + poeira), `"jump"` (squash/parábola/stretch), `"fall"`, `"shock"` / `"panic"` (tremor + suor + `!`), `"celebrate"` (pulos + confete), `"talk"` (lip-sync pela envoltória da fala ativa).
   - **Trajetória física real:** `"fromX"`, `"toX"`, `"fromY"`, `"toY"` (`0..1` proporcional ou pixels) + `"path": "jump_platforms" | "walk" | "run" | "fall"` (`"hops": 3`).
   - **Acessórios modulares (`"accessories"`):** `hat` (`"cap"|"chef"|"graduation"|"beanie"`), `glasses` (`"round"|"square"|"cool"`), `apron`, `crown`, `backpack`, `megaphone`, `item_in_hand` (`"chinelo"|"tablet"|"clipboard"|"ruler"|"pix_phone"|"coxinha"|"bread_bag"|"wooden_spoon"|"money"`).

4. **Câmera Virtual & Anti-Poluição (`camera`):**
   - `"zoom"`: `"zoomIn"`, `"zoomOut"`, `"punchZoom"` (`"punchAt": 0.2`), `"static"`.
   - `"shake"`: `"none"`, `"leve"`, `"medio"`, `"intenso"` (`"shakeAt"`, `"shakeDur"`).
   - `"followTarget"`: ID ou tipo do personagem em movimento (ex.: `"menino"`).
   - `"transition"`: `"whip"`, `"flash"`, `"slide"`, `"cut"`.
   - Legendas de retenção (`2–4` palavras/bloco com palavra ativa destacada) ficam em `Y = 0.815 * H` e `X = 0.465 * W`, 100% livres dos ícones laterais e inferiores do YouTube Shorts.

5. **SFX Procedurais Sincronizados + Audio Ducking (`sfx`):**
   - Catálogo em `assets/sfx/`: `jump`, `land`, `lava_burn`, `error_buzzer`, `pix_ding`, `cash_register`, `whoosh`, `pop`, `vine_boom_lite`, `powerup`, `alarm`, `shock`, `win`.
   - Formato simples `["whoosh", "pix_ding"]` ou por timestamp `[{"name": "jump", "at": 0.3, "volume": 0.55}]`.
   - A trilha `bgm_loop.wav` sofre *audio ducking* automático (`sidechaincompress`) sempre que há voz ativa.

## 3. Pipeline de Validação, Preview Rápido, Render Final & Revisão
1. **Validar roteiro JSON:**
   ```powershell
   node scripts/validate_script.js scripts/<slug>.json
   ```
2. **Preview Rápido (`540x960 @ 15fps`, ultrafast, poucos segundos):**
   ```powershell
   node scripts/render_video.js scripts/<slug>.json --preview
   ```
3. **Render Final (`1080x1920` ou `1920x1080 @ 30fps`) + Thumbnail 16:9:**
   ```powershell
   node scripts/render_video.js scripts/<slug>.json
   node scripts/render_thumbs_16x9.js
   ```
4. **Auditoria Visual Obrigatória (`revisao-01`):** Invoque `revisao-01` sobre `output/revisao/<slug>_cena_*.jpg` até obter `VEREDITO: APROVADO`.

## 4. Aprovação Humana & Publicação no YouTube
- **PARE E MOSTRE AO USUÁRIO PRIMEIRO:** Envie os links dos `.mp4` e thumbnails. **Jamais publique sem aprovação explícita!**
- Após aprovação: `python -u scripts/upload_youtube.py --video output/<slug>_poxarique.mp4 --title "<Título>" --description "<Descrição>" --tags "<tags>" --privacy public --thumbnail output/<slug>_thumb_16x9.jpg` (ou `publish_pending.py` / `schedule_batch_youtube.py`).
