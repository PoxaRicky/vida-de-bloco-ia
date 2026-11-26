---
name: vida-de-bloco
description: >-
  Cria roteiros, cenas 3D em Three.js, narração TTS e vídeos completos (Shorts e Longos)
  no formato "E se...?" com personagens em bloco. Use quando o usuário pedir para criar
  um vídeo, Short, roteiro ou animação para o canal.
---

# Skill: Vida de Bloco (Formato "E se...?")

## 1. Estrutura Obrigatória do Roteiro

Todo vídeo (Short ou Longo) segue o molde **Outlier "E se...?"**:
1. **Gancho (0–3s):** Ler a pergunta *"E se...?"* em voz alta imediatamente.
2. **Escalada Progressiva:** Dividir em etapas crescentes de absurdo (`Dia 1`, `Dia 2`, `Dia 3`... ou fases).
3. **Virada (Plot Twist):** Uma reviravolta inesperada perto do final.
4. **CTA de 1 Palavra:** Fechar pedindo um comentário de **uma única palavra** (ex.: *"Comenta 'BLOCO' se você sobreviveria"*).

## 2. Regras de Retenção

### Para Shorts (Vertical 9:16, até 60s)
- **Frame 1:** Close-up direto no rosto do personagem principal.
- **Ritmo visual:** Mudança de câmera, expressão, objeto ou cenário a **cada menos de 1 segundo**.
- **Temas:** Priorizar cotidiano próximo do público (família, escola, casa da vó, Brasil, cidade).

### Para Vídeos Longos (Horizontal 16:9, 8–9 minutos)
- Usar o **mesmo formato "E se...?"**, expandindo cada fase (`Dia 1` a `Dia 10+`) com diálogos, sub-conflitos e escalada contínua para manter retenção acima de 2–3 minutos por visualização.

## 3. Pipeline Técnico Local
1. **Roteiro estruturado (JSON):** Definir falas, personagens, emoções, posições de câmera e timestamps.
2. **Áudio (TTS):** Gerar falas via `scripts/generate_tts.py` (ElevenLabs ou fallback Edge-TTS).
3. **Cena 3D (Three.js):** Reutilizar blocos/personagens de `assets/characters/` e cenários de `assets/scenes/`.
4. **Renderização Local:** Gerar o MP4 final em `output/` para revisão humana antes do upload.
