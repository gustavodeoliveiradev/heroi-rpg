/**
 * HERÓI RPG — Engine de Combate (Fase 2)
 * Combate por turnos com HP, Stamina e vantagem elemental.
 * Este arquivo é independente: só calcula, não mexe na tela.
 */

// ===== ATRIBUTOS BASE POR CLASSE =====
const ATRIBUTOS_CLASSE = {
  guerreiro: { hpBase: 120, hpPorNivel: 9,   ataqueBase: 11, ataquePorNivel: 2,   defesaBase: 9, defesaPorNivel: 1.2, staminaBase: 5 },
  mago:      { hpBase: 80,  hpPorNivel: 6,   ataqueBase: 16, ataquePorNivel: 2.5, defesaBase: 5, defesaPorNivel: 0.7, staminaBase: 4 },
  arqueiro:  { hpBase: 95,  hpPorNivel: 7,   ataqueBase: 13, ataquePorNivel: 2,   defesaBase: 6, defesaPorNivel: 0.8, staminaBase: 6 },
  assassino: { hpBase: 85,  hpPorNivel: 6.5, ataqueBase: 15, ataquePorNivel: 2.2, defesaBase: 7, defesaPorNivel: 0.9, staminaBase: 5 }
};

// ===== RODA ELEMENTAL =====
// Cada elemento vence o próximo da lista (circular)
const ORDEM_ELEMENTOS = ["fogo", "vento", "terra", "agua"];

function elementoVence(elementoAtacante, elementoAlvo) {
  const i = ORDEM_ELEMENTOS.indexOf(elementoAtacante);
  const proximoDoAtacante = ORDEM_ELEMENTOS[(i + 1) % ORDEM_ELEMENTOS.length];
  return proximoDoAtacante === elementoAlvo;
}

function getMultiplicadorElemental(elementoAtacante, elementoAlvo) {
  if (!elementoAtacante || !elementoAlvo || elementoAtacante === elementoAlvo) return 1;
  if (elementoVence(elementoAtacante, elementoAlvo)) return 2;      // super efetivo
  if (elementoVence(elementoAlvo, elementoAtacante)) return 0.5;    // pouco efetivo
  return 1; // elementos "neutros" entre si na roda de 4
}

// ===== CRIAÇÃO DE COMBATENTES =====
function calcularStatsClasse(classeId, nivel) {
  const a = ATRIBUTOS_CLASSE[classeId] || ATRIBUTOS_CLASSE.guerreiro;
  return {
    hpMax: Math.round(a.hpBase + a.hpPorNivel * (nivel - 1)),
    ataque: Math.round(a.ataqueBase + a.ataquePorNivel * (nivel - 1)),
    defesa: Math.round(a.defesaBase + a.defesaPorNivel * (nivel - 1)),
    staminaMax: a.staminaBase + Math.floor((nivel - 1) / 3)
  };
}

// Cria o "combatente" do herói para essa batalha, a partir dos dados salvos
function criarCombatenteHeroi(heroi) {
  const stats = calcularStatsClasse(heroi.classe, heroi.nivel);
  return {
    tipo: "heroi",
    nome: heroi.nome,
    classe: heroi.classe,
    elemento: heroi.elemento || getClasseInfo(heroi.classe).elemento.toLowerCase(),
    hp: stats.hpMax,
    hpMax: stats.hpMax,
    ataque: stats.ataque,
    defesa: stats.defesa,
    stamina: stats.staminaMax,
    staminaMax: stats.staminaMax
  };
}

// Cria o combatente inimigo. Elemento é sorteado (mundos futuros = pools diferentes)
function criarCombatenteInimigo(nome, nivelReferencia, isChefao = false) {
  const elementoSorteado = ORDEM_ELEMENTOS[Math.floor(Math.random() * ORDEM_ELEMENTOS.length)];
  const multiplicadorChefao = isChefao ? 1.4 : 1;
  const nivelEfetivo = Math.max(1, nivelReferencia);
  const base = calcularStatsClasse("guerreiro", nivelEfetivo); // guerreiro como "molde" neutro pra inimigos

  return {
    tipo: "inimigo",
    nome,
    elemento: elementoSorteado,
    hp: Math.round(base.hpMax * multiplicadorChefao),
    hpMax: Math.round(base.hpMax * multiplicadorChefao),
    ataque: Math.round(base.ataque * multiplicadorChefao),
    defesa: Math.round(base.defesa * multiplicadorChefao),
    stamina: base.staminaMax,
    staminaMax: base.staminaMax
  };
}

// ===== AÇÕES DISPONÍVEIS NUM TURNO =====
// item: 1 = Orbe Místico, 2 = Espada, 3 = Escudo (mantém os itens que já existem)
function getAcoesDisponiveis(combatente) {
  if (combatente.stamina <= 0) return [3]; // sem stamina, só pode defender
  return [1, 2, 3];
}

// ===== RESOLUÇÃO DE UM TURNO =====
function resolverTurno(combatenteA, itemA, combatenteB, itemB) {
  const eventos = [];

  // Aplica custo/regeneração de stamina
  aplicarCustoStamina(combatenteA, itemA);
  aplicarCustoStamina(combatenteB, itemB);

  const infoA = ITENS[itemA];
  const infoB = ITENS[itemB];

  if (infoA.nome === infoB.nome) {
    // Empate no item: se ambos atacaram, troca dano leve; se ambos defenderam, nada acontece
    if (itemA !== 3) {
      const danoLeve = Math.max(1, Math.round(combatenteA.ataque * 0.25));
      aplicarDano(combatenteB, danoLeve);
      aplicarDano(combatenteA, danoLeve);
      eventos.push({ tipo: "empate_troca", dano: danoLeve });
    } else {
      eventos.push({ tipo: "empate_defesa" });
    }
  } else if (infoA.vence === infoB.nome) {
    const dano = calcularDano(combatenteA, combatenteB, itemB);
    aplicarDano(combatenteB, dano);
    eventos.push({ tipo: "vitoria_turno", vencedor: "A", dano });
  } else {
    const dano = calcularDano(combatenteB, combatenteA, itemA);
    aplicarDano(combatenteA, dano);
    eventos.push({ tipo: "vitoria_turno", vencedor: "B", dano });
  }

  return {
    eventos,
    combateEncerrado: combatenteA.hp <= 0 || combatenteB.hp <= 0,
    vencedor: combatenteA.hp <= 0 ? "B" : (combatenteB.hp <= 0 ? "A" : null)
  };
}

function aplicarCustoStamina(combatente, item) {
  if (item === 3) {
    combatente.stamina = Math.min(combatente.staminaMax, combatente.stamina + 1);
  } else {
    combatente.stamina = Math.max(0, combatente.stamina - 1);
  }
}

function calcularDano(atacante, alvo, itemDoAlvo) {
  const multiplicadorElemento = getMultiplicadorElemental(atacante.elemento, alvo.elemento);
  let dano = Math.max(1, atacante.ataque - alvo.defesa * 0.5);
  dano *= multiplicadorElemento;
  if (itemDoAlvo === 3) dano *= 0.5; // escudo mitiga mesmo perdendo o turno
  return Math.max(1, Math.round(dano));
}

function aplicarDano(combatente, dano) {
  combatente.hp = Math.max(0, combatente.hp - dano);
}

// Exporta
window.ATRIBUTOS_CLASSE = ATRIBUTOS_CLASSE;
window.ORDEM_ELEMENTOS = ORDEM_ELEMENTOS;
window.getMultiplicadorElemental = getMultiplicadorElemental;
window.calcularStatsClasse = calcularStatsClasse;
window.criarCombatenteHeroi = criarCombatenteHeroi;
window.criarCombatenteInimigo = criarCombatenteInimigo;
window.getAcoesDisponiveis = getAcoesDisponiveis;
window.resolverTurno = resolverTurno;
