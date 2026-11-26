# Vida de Bloco IA — Gerador de Vídeos 3D (Three.js + TTS)

Projeto para replicar a arquitetura de canal automatizado 3D (Shorts e Vídeos Longos) usando **Skills do Antigravity**, **Three.js** para animação programática de personagens em bloco, **ElevenLabs** (ou Edge-TTS) para narração/vozes e renderização local no PC.

## Estrutura do Projeto

```text
vida-de-bloco-ia/
├── .agents/
│   └── skills/
│       └── vida-de-bloco/
│           └── SKILL.md      # Skill com o formato "E se...?" e regras de retenção
├── assets/
│   ├── characters/           # Modelos/componentes reutilizáveis de personagens em bloco
│   └── scenes/               # Cenários reutilizáveis (casa, escola, rua, etc.)
├── scripts/
│   ├── generate_tts.py       # Geração de áudio/vozes (ElevenLabs / Edge-TTS)
│   └── render_video.js       # Renderizador Three.js -> frames/vídeo local
├── output/                   # Vídeos finais renderizados (Shorts e Longos)
├── GEMINI.md                 # Regras gerais do projeto para o Antigravity
└── .gitignore
```

## Como usar no Antigravity

1. Abra esta pasta como **Workspace** no Antigravity.
2. Peça ao agente algo como:
   - *"Crie um Short no formato 'E se...' sobre: E se sua avó virasse gamer profissional?"*
   - *"Crie um vídeo longo (8 min) sobre: E se o Brasil virasse um servidor de blocos?"*
3. O agente vai ler automaticamente a Skill em `.agents/skills/vida-de-bloco/SKILL.md`, gerar o roteiro, reutilizar os componentes 3D e preparar a renderização local.
