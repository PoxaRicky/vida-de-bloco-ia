---
name: vida-de-bloco
description: >-
  Cria roteiros, cenas 2D/2.5D estilo Vida de Bloco (contorno grosso + cel-shading + blocos/studs),
  narração multi-voz TTS e vídeos completos (Shorts e Longos) no formato "E se...?".
  Use quando o usuário pedir para criar um vídeo, Short, roteiro ou animação para o canal.
---

# Skill: Vida de Bloco (Formato "E se...?")

## 1. Identidade Visual Obrigatória (Fiel ao @VidadeBloco)
- **Traço e Pintura:** Contorno escuro uniforme (`#1A1423`, 5–7px) + **cel-shading de 2 tons** (faixa vertical de sombra na direita de 24%) — implementado em `assets/characters/cartoon_rig.js`.
- **Personagens Reutilizáveis:**
  - `VB.drawBoy`: boné azul virado para trás com abertura laranja, tufos de cabelo laranja, camiseta amarela com coração pixelado rosa, expressões (`shocked_extreme`, `side_eye`, `star_eyes`, `happy`) e tablet.
  - `VB.drawMom`: cabelo castanho com franja + rabo de cavalo lateral com elástico amarelo, brincos dourados, óculos redondos verde-água com reflexo de tela, cardigã verde-água sobre blusa rosa, calça roxa e coroa Admin opcional.
- **CenáriosCompletos (`assets/scenes/environments.js`):**
  - Nunca usar fundo vazio! Usar cenários ricos: `hook_sunburst` (com título gigante colorido no topo), `bedroom_duo` (papel de parede listrado roxo, janela, prateleira com troféu, pufe rosa), `obby_lava_fall` (plataforma, placa PULE!, bloco 3D verde, lava com partículas, rastro fantasma e contador `QUEDAS`), `dia_quatro_obby` (chão xadrez verde em perspectiva + explosão vermelha `DIA QUATRO`), `brazil_roblox_street` (rua com *studs*, Padaria, caixas d'água azuis, postes, sol quadrado, nametags e modal `⚙ SISTEMA`).
- **Legendas Karaokê:** Fonte `Fredoka` pesada com contorno preto grosso, 2–3 palavras por vez com efeito *pop* e palavras-chave coloridas (`#FF66B2` rosa, `#5CE65C` verde, `#FFD426` amarelo).

## 2. Estrutura do Roteiro ("E se...?")
1. **Gancho (0–3s):** Pergunta *"E se...?"* lida em voz alta + close-up no frame 1 + título empilhado.
2. **Escalada Progressiva:** Avanço por dias (`Dia 1`, `Dia 4`, `Dia 7`...) aumentando o absurdo.
3. **Virada (Plot Twist):** Reviravolta cômica no clímax.
4. **CTA de 1 Palavra:** Fechar pedindo comentário de uma única palavra.

## 3. Pipeline de Execução Local
1. Salvar o roteiro JSON em `scripts/<nome>.json` definindo `voz` (`menino` ou `mae`), `ambiente` e `destaque`.
2. Gerar vozes: `python scripts/generate_tts.py scripts/<nome>.json`
3. Renderizar vídeo via pipe direto no FFmpeg: `node scripts/render_video.js scripts/<nome>.json`
4. Inspecionar os previews em `output/preview_scene_*.jpg` para garantir qualidade visual antes de entregar o MP4 final.
