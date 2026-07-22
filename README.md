# 🪄⚔️🛡️ Herói RPG

> Sistema de combate estilo **Pedra, Papel e Tesoura** com acumulação de XP e classificação de níveis.  
> Projeto baseado no desafio DIO — *Classificador de Nível de Herói*.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

---

## 🎮 Sobre o Jogo

| Item | Emoji | Vence |
|------|-------|-------|
| Varinha Mágica | 🪄 | Escudo 🛡️ |
| Espada | ⚔️ | Varinha Mágica 🪄 |
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

## 🚀 Como Executar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/heroi-rpg.git

# Entre na pasta
cd heroi-rpg

# Instale a dependência
npm install prompt-sync

# Execute o jogo
node index.js
```

---

## 📁 Estrutura do Projeto

```
heroi-rpg/
├── heroi.js      # Sistema de XP e classificação de nível
├── jogo.js       # Lógica do combate
├── index.js      # Menu principal e fluxo do jogo
└── README.md     # Documentação
```

---

## 🗺️ Roadmap

- [x] Sistema de XP e níveis
- [x] Combate contra computador
- [ ] Sistema de inimigos com nomes e dificuldades
- [ ] Inventário de itens
- [ ] Sistema de conquistas
- [ ] Ranking de heróis
- [ ] Interface web

---

## 📝 Licença

Projeto educacional desenvolvido no módulo de Formação Lógica de Programação da [DIO](https://www.dio.me/).
