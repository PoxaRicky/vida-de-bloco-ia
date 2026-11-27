---
name: animar-video
description: >-
  Orquestra uma equipe de 10 subagentes especializados (voz-01, cenas-01, personagens-01,
  texto-01, pecas-01, movimento-01, cor-01, som-01, codigo-01 e revisao-01) para criar e
  ajustar animações verticais (1080x1920, 60 fps) em Remotion (padrão) ou HyperFrames.
  Use quando o usuário pedir para animar um vídeo com agentes, colar o prompt do Levi Lab,
  criar motion graphics de app a partir de narracao.wav ou pedir ajustes direcionados a
  CENAS, PERSONAGENS, TEXTO, PEÇAS, MOVIMENTO, COR, SOM ou REVISÃO.
---

# Orquestrador Levi Motion (10 Subagentes no Antigravity)

Você coordena a equipe de 10 subagentes deste plugin para montar animações verticais (`1080x1920`, `60 fps`), mantendo cada agente focado nos seus próprios arquivos de camada conforme [contrato-camadas.md](./references/contrato-camadas.md).

---

## 1. Trava de Entrada (Antes de Começar)

1. **Verifique colchetes `[ ]`:** se o pedido ainda contiver qualquer campo entre colchetes não preenchido (`[NOME DO APP]`, `[A DOR]`, `[SUA FONTE]`, `[SUA COR]`) ou faltar alguma dessas 4 informações essenciais, **PARE e pergunte ao usuário** o que colocar antes de criar o projeto ou chamar agentes.
2. **Verifique os materiais na pasta do vídeo:**
   - Confirme a existência do arquivo de narração (`narracao.wav` ou outro `.wav`/`.mp3` informado). Se não existir, pare e pergunte onde está o áudio.
   - Confirme a pasta `personagens/` com imagens PNG transparentes. Se não existir ou estiver vazia, avise o usuário e pergunte se deseja informar a pasta ou seguir apenas com peças de interface (ou gerar os personagens antes).
   - Sobre `efeitos/`: se o usuário tiver uma pasta própria de SFX, use-a; caso contrário, o script inicializador já copia automaticamente os SFX locais (`pop`, `whoosh`, `whoosh-short`, `notification`, `key-press`, `click`, `click-soft`, `chime`).
3. **Escolha do motor:**
   - **Padrão:** **Remotion** (`1080x1920`, `60 fps`, `--scale=2`, H.264 `CRF 12`).
   - **HyperFrames:** use apenas se o usuário pedir explicitamente para fazer em HyperFrames (neste caso, leia também a skill `hyperframes` instalada no ambiente antes de montar os arquivos).

---

## 2. Preparação do Projeto (Você Mesmo Faz)

Antes de acionar os subagentes:

1. No modo **Remotion**, crie/prepare a pasta do projeto com:
   ```powershell
   python "C:\Users\henri\.gemini\config\plugins\levi-motion\skills\animar-video\scripts\iniciar_projeto_remotion.py" --dir "<PROJETO>" --narracao "<CAMINHO_NARRACAO_WAV>" --personagens "<PASTA_PERSONAGENS>" --instalar
   ```
   *(Adicione `--efeitos "<PASTA_EFEITOS>"` se o usuário forneceu uma pasta própria de SFX.)*
2. Leia [contrato-camadas.md](./references/contrato-camadas.md) para ter certeza de que os caminhos e contratos estão alinhados.

---

## 3. Ordem Obrigatória de Execução dos Subagentes

Sempre passe nos prompts dos subagentes: o caminho absoluto de `<PROJETO>`, o motor escolhido (`remotion` ou `hyperframes`) e o lembrete para respeitar seus arquivos exclusivos em [contrato-camadas.md](./references/contrato-camadas.md). Use `Workspace: "inherit"` ao chamar `invoke_subagent`.

1. **Etapa 1 — `voz-01` (sequencial):**
   - Invoque `voz-01` para transcrever `public/narracao.wav` e gerar `dados/voz.json`.
   - Ao receber o retorno, avise o usuário em **1 linha** o que `voz-01` fez.
2. **Plano (`plano.md` — você mesmo escreve):**
   - Leia `dados/voz.json` e escreva `<PROJETO>/plano.md` definindo:
     - Motor (`remotion` ou `hyperframes`), dimensões (`1080x1920`), `fps: 60`, `renderScale: 2`;
     - Nome do app, dor resolvida, fonte dos títulos (`[SUA FONTE]`), cor de destaque (`[SUA COR]`);
     - Roteiro curto com **uma cena por frase** da narração, indicando quais cenas são momentos fortes (`logo`, `tres_palavras`, `app_demo`, `fim`).
   - Todos os agentes leem `<PROJETO>/plano.md`.
3. **Etapa 2 — `cenas-01` (sequencial):**
   - Invoque `cenas-01` para gerar `dados/cenas.json`.
   - Avise o usuário em **1 linha** quando `cenas-01` concluir.
4. **Etapa 3 — 6 Agentes em Paralelo (`personagens-01`, `texto-01`, `pecas-01`, `movimento-01`, `cor-01`, `som-01`):**
   - Dispare os **6 subagentes ao mesmo tempo** no mesmo turno usando `invoke_subagent` (cada um com seu `TypeName` exato e `Workspace: "inherit"`), ou via `run_workflow` usando `parallel`.
   - Conforme forem retornando, reporte ao usuário em **1 linha por agente** o que cada um fez.
5. **Etapa 4 — `codigo-01` (sequencial após os 6):**
   - Invoque `codigo-01` para integrar todas as camadas em `src/CenaItem.tsx`, `src/VideoPrincipal.tsx` e `src/Root.tsx` (ou arquivos HyperFrames) e validar o build/typecheck.
   - Avise o usuário em **1 linha** o que `codigo-01` concluiu.
6. **Etapa 5 — `revisao-01` (sequencial final):**
   - Invoque `revisao-01` para renderizar `revisao/cena-XX.png`, rodar o **Token-Saver** (`python "C:\Users\henri\.gemini\config\plugins\levi-motion\skills\animar-video\scripts\gerar_mosaico_revisao.py" --cenas "<PROJETO>\revisao"`) para gerar `revisao/resumo-local.md` + no máximo 2 mosaicos (`revisao/mosaico-1.png`, `revisao/mosaico-2.png`), inspecionar os mosaicos com `read_file` (abrindo o `cena-XX.png` original **apenas** nas cenas onde o mosaico mostrar anomalia) e gerar `revisao/relatorio.md`.
   - Avise o usuário em **1 linha** o veredito de `revisao-01`.
   - Se `revisao-01` apontar problemas (`REQUER AJUSTE`), chame **apenas** os agentes responsáveis por cada falha + `codigo-01` (se mudou código/estrutura) + `revisao-01`, repetindo até obter `VEREDITO: APROVADO`.

### Atalho para animações curtas (até 20 segundos) ou sem subagentes
Se o usuário pedir explicitamente `"faça você mesmo, nessa ordem"` (para economizar chamadas em clipes curtos de até 20s), execute você mesmo exatamente as mesmas etapas e arquivos na mesma ordem (`voz -> plano.md -> cenas -> camadas -> código -> revisão`).

---

## 4. Estúdio e Aprovação Antes do Render Final

**Regra de ouro:** NUNCA renderize o MP4 final sem antes mostrar para o usuário aprovar.

1. Inicie o **Remotion Studio** em segundo plano com `run_command` (`IsDaemon: true`, working dir `<PROJETO>`):
   ```powershell
   npx.cmd remotion studio src/index.ts --port 3300
   ```
   *(No HyperFrames, abra o preview/estúdio do projeto pelo CLI dele.)*
2. Mostre ao usuário:
   - O link do estúdio local (`http://localhost:3300`);
   - Os caminhos clicáveis dos quadros gerados em `revisao/cena-XX.png` para revisão rápida;
   - Pergunte se deseja pedir algum ajuste ou aprovar para o render final.

---

## 5. Pedidos de Ajuste (Um Pedido por Vez)

Quando o usuário pedir uma alteração após ver o estúdio (ex.: `TEXTO: o título da cena 5 tá comprido, deixa só duas linhas` ou `SOM: abaixa os efeitos e tira o whoosh da cena 3`):

1. Identifique **qual agente** é o dono do ajuste (`cenas-01`, `personagens-01`, `texto-01`, `pecas-01`, `movimento-01`, `cor-01` ou `som-01`).
2. Invoque **somente** esse subagente com o pedido exato em 1 frase, mantendo todo o resto intacto.
3. Rode `codigo-01` apenas se precisar atualizar duração total no `Root.tsx` ou integração, e rode `revisao-01` na(s) cena(s) afetada(s) para confirmar que o ajuste resolveu sem quebrar o restante.
4. Peça ao usuário para conferir no estúdio antes de aplicar o próximo ajuste (evite empilhar vários pedidos de uma vez se o usuário mandar em bloco sem revisar).

---

## 6. Render Final (Somente Após o "OK" do Usuário)

Quando o usuário confirmar que a animação está aprovada:

- **Remotion:** execute no `<PROJETO>`:
  ```powershell
  npx.cmd remotion render src/index.ts VideoPrincipal out/video-final.mp4 --codec=h264 --crf=12 --scale=2
  ```
- **HyperFrames:** execute o render final de alta qualidade do projeto (`hf render`).
- Informe ao usuário o caminho completo e clicável do arquivo gerado (`out/video-final.mp4`) e as especificações do vídeo exportado.
