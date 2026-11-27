---
name: vida-de-bloco
description: >-
  Produz vídeos completos para o canal Vida de Bloco (@VidadeBlocoBR) no estilo cartoon
  2D/2.5D em blocos (Shorts 9:16 e Vídeos Longos 16:9): cria roteiros originais "E se...?",
  desenha personagens e cenários exclusivos, sincroniza narração multi-voz + legenda palavra
  por palavra (WordBoundary), gera thumbnails 1280x720 e 1080x1920, audita visualmente todos
  os quadros com revisao-01 e publica no YouTube somente após aprovação do usuário.
  Use sempre que o usuário pedir vídeos para o Vida de Bloco, histórias "E se...?" de Roblox,
  novos lotes de Shorts/vídeos longos, thumbnails ou publicação no canal @VidadeBlocoBR.
---

# Skill Oficial — Agente Vida de Bloco (`@VidadeBlocoBR`)

Este fluxo automatiza de ponta a ponta a criação de vídeos originais de alta retenção para o canal **Vida de Bloco (`@VidadeBlocoBR`)**, mantendo 100% de fidelidade entre roteiro, vozes, personagens, cenários, HUDs e legendas.

## 1. Localização do Projeto & Git Sync
- Repositório: `c:\Users\henri\Documents\POXARIQUE\vida-de-bloco-ia`
- **Ao começar:** `git pull origin main`
- **Ao concluir alterações de código/roteiros:** `git add assets/ scripts/ .agents/ GEMINI.md && git commit -m "..." && git push origin main` (jamais commite `client_secret.json`, `token.json`, `.env` ou `output/`).

## 2. Padrão de Criação Original (Proibido Reciclar Cenários Desconexos!)
1. **Roteiro JSON (`scripts/<slug>.json`):**
   - Formato `"short"` (`1080x1920`, 5–6 cenas rápidas, ~20–26s) ou `"long"` (`1920x1080`, capítulos com `"hud_dias"`).
   - Sempre incluir `"marca_dagua": "PoxaRique!"` (ou `"Vida de Bloco"` se solicitado) e `"arquivo_saida": "<slug>_poxarique.mp4"`.
   - Alternar `"voz"` de acordo com quem fala em tela:
     - `"menino"` (`pt-BR-AntonioNeural`, jovem ágil)
     - `"mae"` (`pt-BR-FranciscaNeural`)
     - `"vo"` (`pt-BR-ThalitaMultilingualNeural`, grave acolhedora)
     - `"diretora"` (`pt-BR-FranciscaNeural`, firme)
     - `"narrador"` (`pt-BR-AntonioNeural`)

2. **Rigs de Personagens (`assets/characters/cartoon_rig.js`):**
   - Reutilize `VB.drawBoy`, `VB.drawMom`, `VB.drawCaramelo`, `VB.drawVovo`, `VB.drawDiretora`, `VB.drawPadeiro` — e **sempre crie novos rigs `VB.draw<Personagem>`** quando o roteiro trouxer um personagem inédito!
   - **Proporção obrigatória:** cabeça `VB.celBox(ctx, -102, -88, 204, 186, 44, "#FAD4B0", 6, 0.24)` em `translate(0, -106)`, tronco `156x164`, contorno `#1A1423` (`6px`), sombra lateral `0.24`.
   - **Regra anti-óculos duplicados:** passe SEMPRE `isMom = false` em `drawFace(ctx, expr, false, t)` para qualquer personagem que não seja a Mãe!

3. **Cenários Exclusivos e Zonas Seguras (`assets/scenes/environments.js`):**
   - Cada cena do JSON deve ter seu próprio `envName` retratando fielmente o ambiente, os props e a piada visual narrada.
   - **Mapa de Zonas Seguras (9:16 — `1080x1920`):**
     - `Y = 54` (esquerda): Pílula da marca d'água (`VB.drawWatermark`).
     - `Y = 180..300`: Cards de HUD estilo Roblox (`⚙ SISTEMA`, barra de HP, notificações Pix, missões). Mantenha sol, nuvens, janelas e lousas em `Y >= 305`.
     - `Cena 0 (Hook close-up)`: 3 linhas de título em `H * 0.105`, `H * 0.175`, `H * 0.242`; pill opcional em `H * 0.30`; personagem close-up em `y: H * 0.73, scale: ~2.22` (boca livre da legenda!).
     - `Cena Final (CTA)`: Personagens subidos em `y: H * 0.56` (pés acima da legenda!).
     - `Y = H * 0.855` (`~1642px`): Legenda sincronizada palavra por palavra com `maxAllowedW = W - 150` sobre escudo escuro gradual (`Y > 66%`).

4. **Equipe Criativa de Apoio (Opcional):**
   - Consulte `personagens-01`, `pecas-01` e `movimento-01` via `invoke_subagent` (modo somente leitura) para enriquecer props, HUDs e animações determinísticas.

## 3. Pipeline de Renderização + Auditoria Visual (`revisao-01`)
1. Renderizar vídeo + áudio isolado + frames de revisão:
   ```powershell
   node scripts/render_video.js scripts/<slug>.json
   ```
   *(O `Sync-Guard` dentro do `render_video.js` dispara automaticamente `scripts/generate_tts.py` em `output/audio/<slug>/manifest.json` com `WordBoundary` sempre que o texto ou a voz mudar.)*
2. Gerar Thumbnail 16:9 (`1280x720`) em `scripts/render_thumbs_16x9.js` -> `output/<slug>_thumb_16x9.jpg`.
3. **Auditoria Visual Obrigatória:** Invoque `revisao-01` para inspecionar com `read_file` todos os `output/revisao/<slug>_cena_*.jpg` e thumbs. Se houver qualquer colisão ou corte de texto, ajuste as coordenadas, re-renderize e re-verifique até obter **`VEREDITO: APROVADO`**.

## 4. Aprovação do Usuário, Analytics & Escala de 10 Vídeos/Dia
1. **Análise de Vídeos Virais (`check_analytics.py`):** Antes de criar novos lotes, rode `python -u scripts/check_analytics.py` para ver os vídeos com maior velocidade de views/hora (`vph`) e likes no canal `@VidadeBlocoBR`, dobrando a aposta nos temas vencedores.
2. **PARE E MOSTRE AO USUÁRIO PRIMEIRO:** Envie os links clicáveis dos `.mp4`, das thumbnails e os títulos/descrições sugeridos. **Jamais publique sem aprovação explícita!**
3. **Após o "pode publicar" ou "publique os vídeos pendentes" do usuário:**
   - Sempre salve vídeos já aprovados que aguardam janela de upload em `scripts/fila_pendentes.json` (`"status": "pending"`).
   - Quando o usuário disser *"pode publicar"* ou *"publique os vídeos pendentes"*, rode imediatamente `python -u scripts/publish_pending.py` (ele publica cada item pendente com título, descrição, tags e thumbnail, grava o link publicado e pausa com segurança caso o limite de 24h do YouTube ainda esteja ativo).
   - **Publicação avulsa imediata:** `python -u scripts/upload_youtube.py --video output/<slug>_poxarique.mp4 --title "<Título>" --description "<Descrição>" --tags "<tags>" --privacy public --thumbnail output/<slug>_thumb_16x9.jpg`
   - **Escala de 10 vídeos/dia agendados (sem spam):** Salve a fila aprovada em JSON e rode `python -u scripts/schedule_batch_youtube.py --date YYYY-MM-DD --manifest scripts/fila_publicacao.json` (usa `--publish-at` na API do YouTube para soltar automaticamente nos 10 horários de pico entre `08:00` e `20:00` `-03:00`).
4. Se precisar excluir vídeos antigos no YouTube, use `python -u scripts/delete_youtube.py <videoId1> <videoId2>`.
