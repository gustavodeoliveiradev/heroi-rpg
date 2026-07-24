# ✨⚔️🛡️ Herói RPG

> Sistema de combate estilo **Pedra, Papel e Tesoura** com acumulação de XP e classificação de níveis.  
> Projeto baseado no desafio DIO — *Classificador de Nível de Herói*.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

---

## 🎮 Sobre o Jogo

| Item | Emoji | Vence |
|------|-------|-------|
| Varinha Mágica | ✨ | Escudo 🛡️ |
| Espada | ⚔️ | Varinha Mágica ✨ |
| Escudo | 🛡️ | Espada ⚔️ |

A cada vitória, seu herói ganha **500 XP**. A cada empate, **100 XP**.  
Conforme o XP acumula, o herói sobe de nível:

| XP | Nível |
|----|-------|
| 0 – 1.000 | 🟤 Ferro |
| 1.001 – 2.000 | 🟡 Bronze |
| 2.001 – 5.000 | ⚪ Prata |
| 5.001 – 7.000 | 🟡 Ouro |
| 7.001 – 8.000 | 💎 Platina |
| 8.001 – 9.000 | ⭐ Ascendente |
| 9.001 – 10.000 | 👑 Imortal |
| 10.001+ | 🔥 Radiante |

---

## 🌐 Jogue Agora!

👉 **[Clique aqui para jogar!](https://gustavodeoliveiradev.github.io/heroi-rpg/)**

Ou acesse: `https://gustavodeoliveiradev.github.io/heroi-rpg/`

### ✨ Features da versão web:
- 🎨 **Tema RPG Medieval** — Dark theme com dourado e fonte Cinzel
- ⚔️ **Combate animado** — Flip de cartas, ataques, glows coloridos
- 📊 **Painel de status em tempo real** — XP, nível, vitórias/derrotas/empates
- 🔥 **Sistema de Streak** — 3+ vitórias = bônus 25% XP, 5+ = 50%, 10+ = DOBRO!
- 🎭 **Inimigos com nomes aleatórios** — 20 nomes diferentes
- 💬 **Mensagens imersivas** — Cada combate tem frases únicas
- ⭐ **Level Up animado** — Notificação épica ao subir de nível
- 📱 **Responsivo** — Funciona no celular
- 📊 **Modal de status completo** — Taxa de vitória, streak, progresso de XP

---

## 🖥️ Versão Terminal (Node.js)

Prefere jogar no terminal? Sem problemas!

```bash
# Clone o repositório
git clone https://github.com/gustavodeoliveiradev/heroi-rpg.git

# Entre na pasta
cd heroi-rpg

# Instale a dependência
npm install prompt-sync

# Execute o jogo no terminal
node index.js
```

---

## 📁 Estrutura do Projeto

```
heroi-rpg/
├── docs/                 # 🌐 Versão Web (GitHub Pages)
│   ├── index.html        # Página principal
│   ├── css/
│   │   ├── main.css      # Estilos globais e tema
│   │   ├── animacoes.css # Animações de combate
│   │   └── painel.css    # Painel de status e menus
│   └── js/
│       ├── heroi.js      # Classe Heroi
│       ├── jogo.js       # Lógica do combate
│       ├── ui.js         # Manipulação do DOM
│       └── app.js        # Inicialização
│
├── index.js              # 🖥️ Versão Terminal
├── heroi.js              # Sistema de XP e níveis
├── jogo.js               # Lógica do combate (terminal)
└── README.md             # Documentação
```

---

## 🗺️ Roadmap

- [x] Sistema de XP e níveis
- [x] Combate contra computador (terminal)
- [x] **Versão Web com interface visual**
- [x] Sistema de streak com bônus de XP
- [x] Inimigos com nomes aleatórios
- [x] **Hospedagem no GitHub Pages**
- [ ] 💾 Salvamento de progresso (localStorage)
- [ ] 🏆 Sistema de conquistas/badges
- [ ] 🎯 Chefões especiais
- [ ] 📈 Ranking de heróis
- [ ] 🎵 Efeitos sonoros

---

## 📝 Licença

Projeto educacional desenvolvido em aulas da [DIO](https://www.dio.me/).

---

<p align="center">
  <sub>Feito com ⚔️ por <a href="https://github.com/gustavodeoliveiradev">gustavodeoliveiradev</a> com ajuda do Mestre Kimi 🤖</sub>
</p>
