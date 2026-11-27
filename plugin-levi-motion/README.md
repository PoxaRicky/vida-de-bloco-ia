# Levi Motion — Agentes de Animação no Antigravity

Plugin global inspirado no guia *"Os agentes que animam o seu vídeo"* (Levi Lab / Marcos Levi), adaptado nativamente para rodar localmente no **Antigravity** usando **Remotion** por padrão (ou **HyperFrames** quando você pedir).

---

## O que vem neste plugin

- **Skill orquestradora (`animar-video`)**: lê sua pasta de projeto, garante que os campos obrigatórios e arquivos existam, cria o plano (`plano.md`), coordena a equipe na ordem correta e abre o estúdio antes do render final.
- **10 subagentes especializados (`agents/*.md`)**:

| Subagente | Responsabilidade | Arquivos exclusivos no projeto |
| --- | --- | --- |
| `voz-01` | Transcreve `narracao.wav` palavra por palavra (`faster-whisper`) | `dados/voz.json` |
| `cenas-01` | Divide a narração em cenas (`60 fps`, `1080x1920`) e marca transições `whip` | `dados/cenas.json` |
| `personagens-01` | Escolhe 1 personagem 3D por cena, estilo de entrada e sombra | `dados/personagens.json`, `src/camadas/PersonagensCamada.tsx` |
| `texto-01` | Cria títulos curtos e grossos com palavra-chave presa no tempo da fala | `dados/texto.json`, `src/camadas/TextoCamada.tsx` |
| `pecas-01` | Monta elementos de interface por cena e o celular com a tela do app | `dados/pecas.json`, `src/camadas/PecasCamada.tsx` |
| `movimento-01` | Define curvas determinísticas (quique, aperto de câmera, `whip`), sem `Math.random` | `dados/movimento.json`, `src/camadas/movimento.ts` |
| `cor-01` | Define paleta, fundos claros com grão e blocos chapados nos momentos fortes | `dados/cor.json`, `src/camadas/CorFundoCamada.tsx` |
| `som-01` | Monta narração + efeitos sonoros curtos sincronizados (sem música) | `dados/som.json`, `src/camadas/SomCamada.tsx` |
| `codigo-01` | Une todas as camadas na composição Remotion (ou HyperFrames) e valida build | `src/Root.tsx`, `src/VideoPrincipal.tsx`, `src/CenaItem.tsx` |
| `revisao-01` | Gera quadros de cada cena, inspeciona visualmente e verifica som/cortes | `revisao/cena-XX.png`, `revisao/relatorio.md` |

---

## O que preparar na pasta do vídeo

1. **`narracao.wav`** — sua narração gravada ou gerada.
2. **`personagens/`** — imagens PNG com fundo transparente para os exemplos/dores.
3. **`efeitos/`** *(opcional)* — arquivos curtos (`.mp3`/`.wav`). Se você não tiver uma pasta própria, o script de inicialização copia automaticamente efeitos prontos (`pop`, `whoosh`, `notification`, `key-press`, `click`, `chime`) da biblioteca local do `media-use`.

---

## Prompt pronto para colar no Antigravity

> Preencha os campos entre colchetes `[ ]` (se esquecer algum, a skill para e pergunta antes de começar):

```text
Quero uma animação vertical de uns 35 segundos de um app feita pela equipe de agentes.

O APP
- Nome: [NOME DO APP]. O que ele resolve: [A DOR].
- O roteiro está na narração (narracao.wav).

PREFERÊNCIAS VISUAIS
- Fonte dos títulos: [SUA FONTE]
- Cor de destaque: [SUA COR]

REGRAS
- Use o fluxo completo dos 10 agentes (voz -> cenas -> paralelo -> código -> revisão).
- Não renderize o final sem eu ver: abra o Remotion Studio e me chame.
- Depois do meu ok, render final em H.264 (CRF 12, --scale=2).
```

*(Quer gerar no **HyperFrames** em vez de Remotion? Basta acrescentar `"usando HyperFrames"` no pedido.)*

---

## Como pedir ajustes (um pedido por vez)

Diga qual agente deve mexer e o que mudar em uma frase:

- **CENAS**: `a cena 4 tá rápida demais, deixa ela um pouco mais longa`
- **PERSONAGENS**: `troca o personagem da cena 2 por um menor, ele tá escondendo o título`
- **TEXTO**: `o título da cena 5 tá comprido, deixa só duas linhas`
- **PEÇAS**: `aumenta o número que rola na cena 3 e destaca o botão do app`
- **MOVIMENTO**: `a entrada dos personagens tá exagerada, deixa o quique mais sutil`
- **COR**: `troca a cor de destaque pra azul, mas o bloco do fim continua em outra cor`
- **SOM**: `os efeitos tão altos, abaixa. e tira o whoosh da cena 3`
- **REVISÃO**: `confere a animação inteira de novo e me mostra um quadro de cada cena`
