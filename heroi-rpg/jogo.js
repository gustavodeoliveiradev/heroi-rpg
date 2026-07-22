/**
 * Sistema de combate: Varinha Mágica, Espada, Escudo
 * Regras: Varinha > Escudo | Espada > Varinha | Escudo > Espada
 */

const ITENS = {
  1: { nome: "Varinha Mágica", emoji: "🪄", vence: "Escudo" },
  2: { nome: "Espada", emoji: "⚔️", vence: "Varinha Mágica" },
  3: { nome: "Escudo", emoji: "🛡️", vence: "Espada" }
};

const XP_POR_VITORIA = 500;
const XP_POR_EMPATE = 100;

function exibirMenuItens() {
  console.log(`
╔══════════════════════════════════════╗
║         🎮 ESCOLHA SEU ITEM          ║
╠══════════════════════════════════════╣
║  [1] 🪄  Varinha Mágica              ║
║  [2] ⚔️  Espada                      ║
║  [3] 🛡️  Escudo                      ║
╚══════════════════════════════════════╝
`);
}

function escolhaComputador() {
  const chave = Math.floor(Math.random() * 3) + 1;
  return { chave, ...ITENS[chave] };
}

function resolverCombate(escolhaJogador, escolhaComputador) {
  const itemJogador = ITENS[escolhaJogador];
  const itemPC = ITENS[escolhaComputador.chave];

  console.log(`\n🧙‍♂️  Você escolheu: ${itemJogador.emoji} ${itemJogador.nome}`);
  console.log(`🤖 Computador escolheu: ${itemPC.emoji} ${itemPC.nome}\n`);

  if (itemJogador.nome === itemPC.nome) {
    return "empate";
  }

  if (itemJogador.vence === itemPC.nome) {
    return "vitoria";
  }

  return "derrota";
}

function exibirResultado(resultado, xpGanho = 0) {
  const mensagens = {
    vitoria: `🏆  VITÓRIA! +${xpGanho} XP`,
    derrota: "💀  DERROTA... Tente novamente!",
    empate: `🤝  EMPATE! +${xpGanho} XP`
  };

  console.log(`\n${"═".repeat(40)}`);
  console.log(mensagens[resultado]);
  console.log(`${"═".repeat(40)}\n`);
}

module.exports = {
  ITENS,
  XP_POR_VITORIA,
  XP_POR_EMPATE,
  exibirMenuItens,
  escolhaComputador,
  resolverCombate,
  exibirResultado
};
