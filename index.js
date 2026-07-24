/**
 * Herói RPG — Versão 1.0
 * Sistema de combate com acumulação de XP e níveis
 */

const prompt = require("prompt-sync")();
const { Heroi } = require("./heroi");
const {
  exibirMenuItens,
  escolhaComputador,
  resolverCombate,
  exibirResultado,
  XP_POR_VITORIA,
  XP_POR_EMPATE
} = require("./jogo");

function exibirTitulo() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║     🪄  ⚔️  🛡️   H E R Ó I   R P G   🛡️  ⚔️  🪄   ║
║                                                  ║
║     Um duelo de varinhas, espadas e escudos      ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);
}

function exibirMenuPrincipal() {
  console.log(`
╔══════════════════════════════════════╗
║         📜 MENU PRINCIPAL            ║
╠══════════════════════════════════════╣
║  [1] ⚔️  Novo Duelo                  ║
║  [2] 📊  Ver Status do Herói         ║
║  [3] 🚪  Sair do Jogo                ║
╚══════════════════════════════════════╝
`);
}

function jogarDuelo(heroi) {
  exibirMenuItens();

  let escolha = prompt("Escolha seu item [1-3]: ").trim();

  if (!["1", "2", "3"].includes(escolha)) {
    console.log("\n❌ Escolha inválida! Tente novamente.\n");
    return;
  }

  const pc = escolhaComputador();
  const resultado = resolverCombate(Number(escolha), pc);

  let xpGanho = 0;

  switch (resultado) {
    case "vitoria":
      xpGanho = XP_POR_VITORIA;
      heroi.ganharXp(xpGanho);
      break;
    case "empate":
      xpGanho = XP_POR_EMPATE;
      heroi.empatar();
      heroi.ganharXp(xpGanho);
      break;
    case "derrota":
      heroi.perder();
      break;
  }

  exibirResultado(resultado, xpGanho);
}

function main() {
  exibirTitulo();

  const nome = prompt("Digite o nome do seu herói: ").trim() || "Herói Sem Nome";
  const heroi = new Heroi(nome);

  console.log(`\n✨ Bem-vindo, ${heroi.nome}! Sua jornada começa agora!\n`);

  let jogando = true;

  while (jogando) {
    exibirMenuPrincipal();
    const opcao = prompt("Escolha uma opção: ").trim();

    switch (opcao) {
      case "1":
        jogarDuelo(heroi);
        break;
      case "2":
        heroi.exibirStatus();
        break;
      case "3":
        console.log(`\n👋 Até logo, ${heroi.nome}! Volte quando quiser!\n`);
        jogando = false;
        break;
      default:
        console.log("\n❌ Opção inválida!\n");
    }
  }
}

main();
