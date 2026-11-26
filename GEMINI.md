# Regras do Projeto — Vida de Bloco (@VidadeBlocoBR)

- Nome oficial do canal: **Vida de Bloco** (`@VidadeBlocoBR`, marca d'água: `PoxaRique!`).
- **Regra de Aprovação Obrigatória:** NUNCA publique vídeos no YouTube automaticamente sem antes renderizar, revisar visualmente quadro a quadro com `revisao-01` e enviar ao usuário para aprovação.
- Sempre reutilize componentes de personagens e cenários em `assets/` antes de criar novos do zero.
- Siga estritamente o formato **"E se...?"** e as regras de retenção definidas em `.agents/skills/vida-de-bloco/SKILL.md`.
- Nunca suba chaves de API ou credenciais (`client_secret.json`, `token.json`, `.env`) para o repositório.
- **Sincronização obrigatória com GitHub:**
  - Ao iniciar uma sessão em qualquer computador, rode `git pull origin main` para garantir que está com a versão mais recente.
  - Sempre que finalizar alterações em scripts, personagens, cenários, roteiros ou regras, faça `git add .`, `git commit -m "..."` e `git push origin main` automaticamente para manter todos os computadores sincronizados.
