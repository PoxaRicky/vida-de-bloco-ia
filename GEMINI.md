# Regras do Projeto — Vida de Bloco v2 (@VidadeBlocoBR)

- Nome oficial do canal: **Vida de Bloco** (`@VidadeBlocoBR`, marca d'água: `PoxaRique!`).
- **Regra de Aprovação Obrigatória:** NUNCA publique vídeos no YouTube automaticamente sem antes validar (`node scripts/validate_script.js`), revisar visualmente quadro a quadro com `revisao-01` e enviar ao usuário para aprovação.
- **Motor v2 Obrigatório nos Novos Roteiros:**
  - Use estados dinâmicos (`idle`, `walk`, `run`, `jump`, `fall`, `shock`, `celebrate`, `talk`), trajetórias reais (`fromX/toX/fromY/toY` + `path: "jump_platforms" | "walk" | "run" | "fall"`), acessórios modulares (`accessories`), câmera virtual (`zoomIn`, `zoomOut`, `punchZoom`, `shake`, `followTarget`, `transition`) e SFX por evento (`sfx`).
  - Mantenha hierarquia visual limpa: títulos de gancho apenas nos primeiros `2.5s`, badge único compacto (`hud_badge`) e legendas na zona segura do YouTube Shorts.
  - Use `--preview` (`node scripts/render_video.js scripts/<slug>.json --preview`) para validar ritmo rapidamente antes do render final Full HD.
- Nunca suba chaves de API ou credenciais (`client_secret.json`, `token.json`, `.env`) nem `output/` para o repositório.
- **Sincronização obrigatória com GitHub (incluindo plugins e agentes auxiliares):**
  - Ao iniciar uma sessão em qualquer computador, rode `git pull origin main` (e `.\instalar_agente.ps1` se precisar atualizar os agentes locais).
  - Ao finalizar alterações em scripts, rigs, cenários, roteiros ou agentes (`plugin-vida-de-bloco/` e `plugin-levi-motion/`), faça `git add`, `git commit` e `git push origin main`.
