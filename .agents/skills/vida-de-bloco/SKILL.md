---
name: vida-de-bloco
description: >-
  Cria roteiros, cenas 2D/2.5D estilo Vida de Bloco com marca d'água "PoxaRique!",
  narração multi-voz TTS, efeitos sonoros + trilha (SFX/BGM), vídeos Shorts (9:16) e
  Longos (16:9) no formato "E se...?", além de upload via YouTube API.
---

# Skill: Vida de Bloco — PoxaRique! (Formato "E se...?")

## 1. Assinatura & Identidade Visual
- **Marca d'água obrigatória:** Sempre incluir `"marca_dagua": "PoxaRique!"` no JSON do roteiro (`VB.drawWatermark` renderiza a pílula oficial `PoxaRique!` em todos os frames).
- **Traço e Pintura:** Contorno escuro uniforme (`#1A1423`, 5–7px) + **cel-shading de 2 tons** (sombra lateral de 24%) em `assets/characters/cartoon_rig.js`.
- **Personagens Reutilizáveis:**
  - `VB.drawBoy` ("Você"): boné azul para trás, camiseta amarela com coração pixelado, pufe/tablet.
  - `VB.drawMom` ("Mãe"): óculos redondos com reflexo verde, brincos dourados, cardigã verde-água, coroa Admin opcional.
  - `VB.drawCaramelo` ("Caramelo"): vira-lata caramelo brasileiro em bloco com coleira, linguinha animada, óculos escuros e coroa Admin opcional.
- **Formatos Suportados no Mesmo Motor:**
  - `"formato": "short"` → Vertical **1080x1920 (9:16)** com cortes <1s (foco em inscritos).
  - `"formato": "long"` → Horizontal **1920x1080 (16:9)** com HUD `"hud_dias"` no canto superior direito (foco nas 4.000 horas de monetização).

## 2. Áudio Master (Multi-Voz + SFX + Trilha)
- `scripts/generate_tts.py`: Gera vozes alternadas (`menino` / `mae` / `narrador`) via ElevenLabs (se `ELEVENLABS_API_KEY` estiver no `.env`) ou Edge-TTS gratuito.
- `scripts/generate_sfx.py`: Sintetiza efeitos sonoros livres de direitos autorais (`pop.wav`, `whoosh.wav`, `shock.wav`, `lava.wav`, `win.wav` e trilha `bgm_loop.wav`), mixados automaticamente pelo `scripts/render_video.js`.

## 3. Pipeline Completo
1. Criar roteiro JSON em `scripts/<slug>.json`.
2. Gerar falas: `python scripts/generate_tts.py scripts/<slug>.json`
3. Renderizar vídeo + mixagem master: `node scripts/render_video.js scripts/<slug>.json`
4. Inspecionar `output/preview_<slug>_*.jpg` e assistir ao `.mp4` em `output/`.
5. (Opcional) Subir para o YouTube após aprovação humana:
   `python scripts/upload_youtube.py --video output/<arquivo>.mp4 --title "<Título>" --privacy private`
