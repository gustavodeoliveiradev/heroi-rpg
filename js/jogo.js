/**
 * Sistema de combate: Orbe Místico, Espada, Escudo
 * Regras: Orbe > Escudo | Espada > Orbe | Escudo > Espada
 * Versão Web
 */

const ITENS = {
  1: { nome: "Orbe Místico", emoji: "🔮", vence: "Escudo", cor: "#9b59b6" },
  2: { nome: "Espada", emoji: "⚔️", vence: "Orbe Místico", cor: "#e74c3c" },
  3: { nome: "Escudo", emoji: "🛡️", vence: "Espada", cor: "#3498db" }
};

const XP_POR_VITORIA = 500;
const XP_POR_EMPATE = 100;

// Nomes de inimigos aleatórios
const NOMES_INIMIGOS = [
  "Goblin Sombrio", "Esqueleto Guerreiro", "Lobo das Trevas",
  "Mago das Sombras", "Cavaleiro de Aço", "Dragão Jovem",
  "Troll da Montanha", "Espectro do Pântano", "Bandido Orc",
  "Feiticeiro Corrupto", "Gárgula de Pedra", "Serpente Venenosa",
  "Ciclope Furioso", "Vampiro Ancião", "Demônio Menor",
  "Elemental de Fogo", "Necromante", "Berserker", "Assassino Sombrio",
  "Guardião do Abismo"
];

function getNomeInimigoAleatorio() {
  return NOMES_INIMIGOS[Math.floor(Math.random() * NOMES_INIMIGOS.length)];
}

function escolhaComputador() {
  const chave = Math.floor(Math.random() * 3) + 1;
  return { chave, ...ITENS[chave] };
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

// Exporta
window.ITENS = ITENS;
window.XP_POR_VITORIA = XP_POR_VITORIA;
window.XP_POR_EMPATE = XP_POR_EMPATE;
window.getNomeInimigoAleatorio = getNomeInimigoAleatorio;
window.escolhaComputador = escolhaComputador;
window.resolverCombate = resolverCombate;
window.getMensagemStreak = getMensagemStreak;
