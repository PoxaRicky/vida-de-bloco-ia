# Regras do Projeto — E Se? com PoxaRique

- Nome oficial do canal: **E Se? com PoxaRique** (marca d'água: `PoxaRique!`).
- Sempre reutilize componentes de personagens e cenários em `assets/` antes de criar novos do zero.
- Siga estritamente o formato **"E se...?"** e as regras de retenção definidas em `.agents/skills/vida-de-bloco/SKILL.md`.
- Nunca suba chaves de API ou credenciais (`client_secret.json`, `token.json`, `.env`) para o repositório.
- **Sincronização obrigatória com GitHub:**
  - Ao iniciar uma sessão em qualquer computador, rode `git pull origin main` para garantir que está com a versão mais recente.
  - Sempre que finalizar alterações em scripts, personagens, cenários, roteiros ou regras, faça `git add .`, `git commit -m "..."` e `git push origin main` automaticamente para manter todos os computadores sincronizados.
