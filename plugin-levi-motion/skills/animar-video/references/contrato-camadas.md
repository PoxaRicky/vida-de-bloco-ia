# Contrato de Camadas e Arquivos — Levi Motion

Este contrato define a propriedade exclusiva de cada arquivo dentro de um projeto de animação (`<PROJETO>/`), permitindo que os 6 agentes da fase paralela trabalhem ao mesmo tempo sem conflitos de edição.

## 1. Regras Globais de Determinismo e Layout

- **Formato:** `1080x1920`, `60 fps`, render final com `--scale=2`, H.264 `CRF 12`.
- **Zero aleatoriedade:** nunca usar `Math.random()`. Qualquer variação visual (oscilação, grão, direção) deve vir de funções determinísticas (`Math.sin`, `seed` fixo, índices de cena).
- **Arredondamento:** todos os valores numéricos aplicados a CSS `transform` (`translateX`, `translateY`, `scale`, `rotate`) devem passar por `round2(n)` (`Math.round(n * 100) / 100`).
- **Zona segura vertical:** manter títulos, personagens e peças dentro de `x: 90..990` e `y: 160..1700` para evitar cortes nas bordas de Reels/Shorts/TikTok.

---

## 2. Mapa de Propriedade de Arquivos

| Arquivo | Dono exclusivo | Modo |
| --- | --- | --- |
| `plano.md` | Coordenador (`animar-video`) | Remotion e HyperFrames |
| `dados/voz.json` | `voz-01` | Ambos |
| `dados/cenas.json` | `cenas-01` | Ambos |
| `dados/personagens.json` + `src/camadas/PersonagensCamada.tsx` (ou `camadas/personagens.js`) | `personagens-01` | Ambos |
| `dados/texto.json` + `src/camadas/TextoCamada.tsx` (ou `camadas/texto.js`) | `texto-01` | Ambos |
| `dados/pecas.json` + `src/camadas/PecasCamada.tsx` (ou `camadas/pecas.js`) | `pecas-01` | Ambos |
| `dados/movimento.json` + `src/camadas/movimento.ts` (ou `camadas/movimento.js`) | `movimento-01` | Ambos |
| `dados/cor.json` + `src/camadas/CorFundoCamada.tsx` (ou `camadas/cor.css`) | `cor-01` | Ambos |
| `dados/som.json` + `src/camadas/SomCamada.tsx` (ou `camadas/som.js`) | `som-01` | Ambos |
| `src/Root.tsx`, `src/VideoPrincipal.tsx`, `src/CenaItem.tsx` (ou `index.html`, `main.js`) | `codigo-01` | Ambos |
| `revisao/cena-XX.png`, `revisao/relatorio.md` | `revisao-01` | Ambos |

---

## 3. Esquemas JSON Compartilhados

### `dados/voz.json` (`voz-01`)

```json
{
  "audioArquivo": "public/narracao.wav",
  "idioma": "pt",
  "duracaoTotal": 34.82,
  "textoCompleto": "Texto completo transcrito...",
  "palavras": [
    { "id": 1, "palavra": "Você", "inicio": 0.12, "fim": 0.34 }
  ],
  "frases": [
    {
      "id": 1,
      "texto": "Você ainda perde horas anotando gastos?",
      "inicio": 0.12,
      "fim": 2.65,
      "pausaDepois": 0.48,
      "palavras": [
        { "id": 1, "palavra": "Você", "inicio": 0.12, "fim": 0.34 }
      ]
    }
  ]
}
```

### `dados/cenas.json` (`cenas-01`)

```json
{
  "fps": 60,
  "largura": 1080,
  "altura": 1920,
  "totalQuadros": 2100,
  "cenas": [
    {
      "id": 1,
      "fraseId": 1,
      "tipoMomento": "normal",
      "fraseNarracao": "Você ainda perde horas anotando gastos?",
      "entradaSeg": 0.0,
      "saidaSeg": 2.9,
      "entradaQuadro": 0,
      "saidaQuadro": 174,
      "duracaoQuadros": 174,
      "transicaoSaida": {
        "tipo": "whip",
        "duracaoQuadros": 10,
        "direcao": "esquerda"
      }
    }
  ]
}
```

Valores permitidos para `tipoMomento`: `"normal" | "logo" | "tres_palavras" | "app_demo" | "fim"`.

### `dados/personagens.json` (`personagens-01`)

```json
{
  "cenas": [
    {
      "cenaId": 1,
      "arquivo": "personagens/01-cansado.png",
      "entradaEstilo": "quicando",
      "x": 540,
      "y": 1340,
      "larguraMax": 620,
      "alturaMax": 620,
      "escalaBase": 1.0,
      "rotacaoBaseDeg": -2.0,
      "flutuarAmplitudePx": 12,
      "sombraOpacidade": 0.24
    }
  ]
}
```

Valores permitidos para `entradaEstilo`: `"quicando" | "flutuando" | "tremendo"`.

### `dados/texto.json` (`texto-01`)

```json
{
  "fonteFamilia": "Montserrat",
  "pesos": ["700", "800", "900"],
  "cenas": [
    {
      "cenaId": 1,
      "linhas": ["PARE DE PERDER", "TEMPO ANOTANDO"],
      "palavraDestaque": "TEMPO",
      "segundoEntradaDestaque": 1.18,
      "quadroEntradaDestaque": 71,
      "posicaoY": 250,
      "tamanhoFontePx": 86,
      "alinhamento": "center"
    }
  ]
}
```

### `dados/pecas.json` (`pecas-01`)

```json
{
  "appNome": "Pingô",
  "cenas": [
    {
      "cenaId": 1,
      "tipo": "notificacao",
      "titulo": "Alerta de gasto",
      "subtitulo": "R$ 400 em combustível este mês",
      "valorAlvo": 400,
      "prefixo": "R$ ",
      "sufixo": "",
      "mensagens": [],
      "posicao": { "x": 540, "y": 860, "largura": 820 },
      "quadroEntrada": 24
    }
  ]
}
```

Tipos recomendados de peça UI: `"conversa" | "numero_rola" | "notificacao" | "card_gasto" | "celular_app"`.

### `dados/movimento.json` (`movimento-01`)

```json
{
  "entradaRapidaSpring": { "damping": 14, "stiffness": 210, "mass": 0.75 },
  "quiqueSutilSpring": { "damping": 11, "stiffness": 180, "mass": 0.8 },
  "apertoCamera": { "escalaInicial": 1.0, "escalaFinal": 1.04 },
  "whip": { "duracaoQuadros": 10, "deslocamentoPx": 1120, "blurMaxPx": 18 }
}
```

### `dados/cor.json` (`cor-01`)

```json
{
  "corDestaque": "#A3FF12",
  "corDestaqueTexto": "#111315",
  "fundoClaroTop": "#F8FAFC",
  "fundoClaroBottom": "#ECEFF4",
  "textoPrincipalClaro": "#111315",
  "grao": { "baseFrequency": 0.85, "numOctaves": 2, "seed": 42, "opacidade": 0.045 },
  "blocosFortes": {
    "logo": { "fundo": "#111315", "texto": "#FFFFFF", "destaque": "#A3FF12" },
    "tres_palavras": { "fundo": "#A3FF12", "texto": "#111315", "destaque": "#111315" },
    "fim": { "fundo": "#111315", "texto": "#FFFFFF", "destaque": "#A3FF12" }
  }
}
```

### `dados/som.json` (`som-01`)

```json
{
  "narracao": { "arquivo": "narracao.wav", "volume": 1.0 },
  "eventos": [
    {
      "cenaId": 1,
      "arquivo": "efeitos/pop.mp3",
      "quadroInicio": 0,
      "volume": 0.24,
      "motivo": "entrada da cena 1"
    }
  ]
}
```
