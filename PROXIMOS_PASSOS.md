# Próximos Passos (Continuação em Outro Computador)

## O que já está pronto no repositório
- Motor visual original (`PoxaRique!`) em `assets/characters/cartoon_rig.js` e `assets/scenes/environments.js` (suporte a **Shorts 9:16** e **Vídeos Longos 16:9**).
- Narração multi-voz (`scripts/generate_tts.py`) + efeitos sonoros e trilha autoral (`scripts/generate_sfx.py`).
- Script de upload oficial para o YouTube (`scripts/upload_youtube.py`).
- Lote de 3 Shorts prontos para renderizar:
  - `scripts/lote_01_escola.json`
  - `scripts/lote_02_pix.json`
  - `scripts/lote_03_vo.json`

## Como continuar no outro PC

1. **Clonar e instalar dependências:**
   ```powershell
   git clone https://github.com/PoxaRicky/vida-de-bloco-ia.git
   cd vida-de-bloco-ia
   npm install
   npx playwright install chromium
   pip install edge-tts google-api-python-client google-auth-oauthlib google-auth-httplib2
   ```

2. **Copiar o `client_secret.json`:**
   - Por segurança, `client_secret.json` e `token.json` não ficam no GitHub. Copie o seu `client_secret.json` deste PC para a raiz da pasta `vida-de-bloco-ia` no outro PC.

3. **Autorizar o YouTube (1ª vez) e testar upload privado:**
   ```powershell
   python scripts/generate_tts.py scripts/short_01_caramelo.json
   node scripts/render_video.js scripts/short_01_caramelo.json
   python scripts/upload_youtube.py --video output/short_01_caramelo_poxarique.mp4 --title "E Se o Cachorro CARAMELO Virasse Dono do Roblox? 😱 #shorts" --privacy private
   ```

4. **Renderizar o lote de 3 Shorts:**
   - Depois de abrir esta pasta como Workspace no Antigravity no outro PC, basta pedir ao agente: *"Renderize os 3 Shorts do lote (`lote_01_escola`, `lote_02_pix`, `lote_03_vo`)"*.
