# 🗺️ Cronograma de Evolução — Herói RPG

Cada fase é independente e não quebra a anterior. A ideia é sempre manter o
jogo **jogável** entre uma fase e outra — nunca ficamos com o jogo "pela metade".

---

## ✅ Fase 0 — Efeitos Sonoros (HOJE)
**Status: pronta, só falta você integrar**

- Arquivo novo: `js/sound.js` (síntese via Web Audio API, sem APIs externas)
- Mudança em: `index.html` (1 linha) e `js/ui.js` (8 chamadas de som)
- Por quê primeiro: é a mudança mais isolada e segura — não mexe na lógica
  do jogo, só "escuta" o que já acontece e toca um som. Bom aquecimento.

---

## ✅ Fase 1 — Personalização do Herói
**O que entra:**
- Tela de criação: escolher um **avatar** (emoji/ícone) entre opções
- Escolher uma **classe inicial** (ex: Guerreiro, Mago, Arqueiro) —
  cada uma com uma característica visual diferente (cor de destaque, ícone)
- Esses dados passam a ser salvos junto no `localStorage` (já existe a base
  disso em `Heroi.salvar()` no `js/heroi.js`)

**Arquivos que vamos tocar:**
- `js/heroi.js` → adicionar campos `classe` e `avatar` na classe `Heroi`
- `index.html` → nova seção na tela de login (seletor de classe)
- `css/main.css` → estilo dos cards de seleção

**Conceito que você aprende aqui:** como estruturar "dados de configuração"
(um objeto `CLASSES = {...}`) separado da lógica, pra facilitar adicionar
novas classes no futuro sem reescrever código.

---

## ⚔️ Fase 2 — Fundação do Combate RPG (Pokémon-style)
**O que entra:**
- Herói e inimigo passam a ter **HP** (pontos de vida), não é mais
  "ganha ou perde na hora"
- Atributos base por classe: Ataque, Defesa, Velocidade
- Combate vira **por turnos**: escolher ação → resolve → repete até HP zerar
- Ainda mantemos o "pedra-papel-tesoura" como base de tipos de ataque
  (isso não se perde, só ganha uma camada de profundidade)

**Arquivos novos:**
- `js/combate.js` → nova engine de turnos (substitui gradualmente a lógica
  simples de `js/jogo.js`, mas sem apagar nada até você validar)

**Conceito que você aprende aqui:** máquina de estados simples (turno do
jogador → turno do inimigo → checagem de vitória) — a base de praticamente
todo RPG.

---

## ✨ Fase 3 — Habilidades e Estratégia
**O que entra:**
- Cada classe ganha 2–3 habilidades especiais (ex: cura, ataque forte com
  "recarga", esquiva)
- Sistema de "custo" pra usar habilidade (mana, cooldown, ou nº de usos)
- IA do inimigo fica mais esperta (já existe uma base disso nos chefões
  em `escolhaChefe()` no `js/jogo.js` — vamos expandir esse conceito)

**Conceito que você aprende aqui:** balanceamento simples de jogo (custo x
benefício de cada habilidade) e como escalar uma IA de decisão.

---

## 🏆 Fase 4 — Polimento e Progressão
**O que entra:**
- Ranking local (comparar heróis salvos)
- Novos chefões e conquistas ligados às novas mecânicas
- Ajuste fino de balanceamento (XP, dificuldade)

---

## 📌 Regras que vamos seguir em todas as fases
1. **Modularidade**: cada sistema novo vive no seu próprio arquivo
   (`sound.js`, `combate.js`, etc.) — nunca tudo misturado num arquivo só.
2. **Não quebrar o que funciona**: só trocamos uma peça antiga depois que a
   nova estiver testada.
3. **Eu explico antes de gerar código**: pra cada fase, primeiro te mostro
   o "desenho" (o que vai mudar e por quê), você aprova, aí eu gero os
   arquivos.
4. **Um passo de cada vez**: fechamos e testamos uma fase antes de abrir a
   próxima — assim fica fácil achar bug se algo der errado.
