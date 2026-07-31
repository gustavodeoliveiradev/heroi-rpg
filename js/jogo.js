/**
 * Sistema de combate: Orbe Místico, Espada, Escudo
 * v1.3 - Chefões Especiais & Dificuldade Progressiva
 */

const ITENS = {
  1: { nome: "Orbe Místico", emoji: "🔮", vence: "Escudo", cor: "#9b59b6" },
  2: { nome: "Espada", emoji: "⚔️", vence: "Orbe Místico", cor: "#e74c3c" },
  3: { nome: "Escudo", emoji: "🛡️", vence: "Espada", cor: "#3498db" }
};

const XP_POR_VITORIA = 500;
const XP_POR_EMPATE = 100;
const XP_CHEFAO_BONUS = 1000;  // XP extra ao derrotar chefão

// Inimigos normais
const NOMES_INIMIGOS = [
  "Goblin Sombrio", "Esqueleto Guerreiro", "Lobo das Trevas",
  "Mago das Sombras", "Cavaleiro de Aço", "Dragão Jovem",
  "Troll da Montanha", "Espectro do Pântano", "Bandido Orc",
  "Feiticeiro Corrupto", "Gárgula de Pedra", "Serpente Venenosa",
  "Ciclope Furioso", "Vampiro Ancião", "Demônio Menor",
  "Elemental de Fogo", "Necromante", "Berserker", "Assassino Sombrio",
  "Guardião do Abismo"
];

// Chefões especiais
const CHEFOES = [
  { nome: "Rei dos Goblins", emoji: "👑", titulo: "O Ameaçador" },
  { nome: "Dragão Ancião", emoji: "🐉", titulo: "O Imortal" },
  { nome: "Lich Supremo", emoji: "💀", titulo: "O Eterno" },
  { nome: "Titã de Pedra", emoji: "🗿", titulo: "O Inabalável" },
  { nome: "Fênix Sombria", emoji: "🔥", titulo: "A Renascida" },
  { nome: "Kraken das Profundezas", emoji: "🦑", titulo: "O Abissal" },
  { nome: "Behemoth", emoji: "🦖", titulo: "O Colossal" },
  { nome: "Arcanjo Caído", emoji: "😈", titulo: "O Corrompido" },
  { nome: "Senhor das Sombras", emoji: "🌑", titulo: "O Invisível" },
  { nome: "Deus da Guerra", emoji: "⚔️", titulo: "O Invencível" }
];

function getNomeInimigoAleatorio() {
  return NOMES_INIMIGOS[Math.floor(Math.random() * NOMES_INIMIGOS.length)];
}

function getChefeAleatorio() {
  return CHEFOES[Math.floor(Math.random() * CHEFOES.length)];
}

// ========== SISTEMA DE DIFICULDADE ==========
function calcularDificuldade(nivelHeroi, vitoriasTotais) {
  // Dificuldade base: 0-100
  let dificuldade = 0;

  // Aumenta conforme nível do herói
  const niveis = ["Ferro", "Bronze", "Prata", "Ouro", "Platina", "Ascendente", "Imortal", "Radiante"];
  const indiceNivel = niveis.indexOf(nivelHeroi);
  dificuldade += indiceNivel * 10;

  // Aumenta conforme vitórias totais (cada 10 vitórias = +5 dificuldade)
  dificuldade += Math.floor(vitoriasTotais / 10) * 5;

  return Math.min(100, dificuldade);
}

function escolhaComputador(dificuldade = 0) {
  const chave = Math.floor(Math.random() * 3) + 1;
  return { chave, ...ITENS[chave] };
}

// ========== CHEFÃO: IA mais inteligente ==========
function escolhaChefe(escolhaJogadorAnterior, vitoriasConsecutivas) {
  // Chefão tem chance de "prever" a jogada do jogador
  const chancePrever = Math.min(0.7, 0.3 + (vitoriasConsecutivas * 0.05));

  if (Math.random() < chancePrever && escolhaJogadorAnterior) {
    // O chefão escolhe o item que vence o que o jogador usou antes
    const itemJogador = ITENS[escolhaJogadorAnterior];
    for (const [key, item] of Object.entries(ITENS)) {
      if (item.vence === itemJogador.nome) {
        return { chave: Number(key), ...item };
      }
    }
  }

  // Caso contrário, escolha aleatória
  return escolhaComputador();
}

function resolverCombate(escolhaJogador, escolhaComputador) {
  const itemJogador = ITENS[escolhaJogador];
  const itemPC = ITENS[escolhaComputador.chave];

  if (itemJogador.nome === itemPC.nome) {
    return {
      resultado: "empate",
      mensagem: `Empate! Ambos usaram ${itemJogador.emoji} ${itemJogador.nome}`,
      itemJogador,
      itemPC
    };
  }

  if (itemJogador.vence === itemPC.nome) {
    const mensagensVitoria = [
      `Seu ${itemJogador.nome} dissolve o ${itemPC.nome} do inimigo!`,
      `Seu ataque com ${itemJogador.nome} foi imparável!`,
      `Você defendeu e contra-atacou com ${itemJogador.nome}!`,
      `${itemJogador.nome} brilha e vence ${itemPC.nome}!`,
      `${itemJogador.nome} destrói ${itemPC.nome} em chamas!`
    ];
    return {
      resultado: "vitoria",
      mensagem: mensagensVitoria[Math.floor(Math.random() * mensagensVitoria.length)],
      itemJogador,
      itemPC
    };
  }

  const mensagensDerrota = [
    `O ${itemPC.nome} do inimigo superou seu ${itemJogador.nome}!`,
    `Seu ${itemJogador.nome} não resistiu ao ${itemPC.nome}!`,
    `O inimigo aniquilou seu ${itemJogador.nome} com ${itemPC.nome}!`,
    `${itemPC.nome} do inimigo foi implacável contra ${itemJogador.nome}!`
  ];
  return {
    resultado: "derrota",
    mensagem: mensagensDerrota[Math.floor(Math.random() * mensagensDerrota.length)],
    itemJogador,
    itemPC
  };
}

function getMensagemStreak(streak) {
  if (streak >= 10) return "🔥🔥🔥 LENDÁRIO! 10 vitórias consecutivas! XP DOBRADO!";
  if (streak >= 5) return "🔥🔥 INCRÍVEL! 5 vitórias seguidas! Bônus de 50% XP!";
  if (streak >= 3) return "🔥 Impressionante! 3 vitórias seguidas! Bônus de 25% XP!";
  return null;
}

function getMensagemChefeDerrotado(chefe) {
  const mensagens = [
    `🎉 ${chefe.titulo} ${chefe.nome} foi DERROTADO!`,
    `🏆 Você triunfou sobre ${chefe.nome}!`,
    `⚔️ ${chefe.nome} caiu diante do seu poder!`,
    `👑 A glória é sua! ${chefe.nome} foi destruído!`
  ];
  return mensagens[Math.floor(Math.random() * mensagens.length)];
}

function getMensagemChefeAparece(chefe) {
  return `🐉 CHEFÃO APARECEU! ${chefe.emoji} ${chefe.titulo} ${chefe.nome}!`;
}

// Exporta
window.ITENS = ITENS;
window.XP_POR_VITORIA = XP_POR_VITORIA;
window.XP_POR_EMPATE = XP_POR_EMPATE;
window.XP_CHEFAO_BONUS = XP_CHEFAO_BONUS;
window.NOMES_INIMIGOS = NOMES_INIMIGOS;
window.CHEFOES = CHEFOES;
window.getNomeInimigoAleatorio = getNomeInimigoAleatorio;
window.getChefeAleatorio = getChefeAleatorio;
window.calcularDificuldade = calcularDificuldade;
window.escolhaComputador = escolhaComputador;
window.escolhaChefe = escolhaChefe;
window.resolverCombate = resolverCombate;
window.getMensagemStreak = getMensagemStreak;
window.getMensagemChefeDerrotado = getMensagemChefeDerrotado;
window.getMensagemChefeAparece = getMensagemChefeAparece;
