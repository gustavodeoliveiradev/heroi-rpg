/**
 * Sistema de classificação de nível do herói + Conquistas + Chefões
 * Baseado no desafio DIO — Classificador de Nível de Herói
 * Versão Web v1.3
 */

function classificarNivel(xp) {
  if (xp <= 1000) return "Ferro";
  else if (xp <= 2000) return "Bronze";
  else if (xp <= 5000) return "Prata";
  else if (xp <= 7000) return "Ouro";
  else if (xp <= 8000) return "Platina";
  else if (xp <= 9000) return "Ascendente";
  else if (xp <= 10000) return "Imortal";
  else return "Radiante";
}

function getEmojiNivel(nivel) {
  const emojis = {
    "Ferro": "🟤", "Bronze": "🟡", "Prata": "⚪",
    "Ouro": "🟡", "Platina": "💎", "Ascendente": "⭐",
    "Imortal": "👑", "Radiante": "🔥"
  };
  return emojis[nivel] || "❓";
}

function getXpProximoNivel(xpAtual) {
  const niveis = [1000, 2000, 5000, 7000, 8000, 9000, 10000, Infinity];
  for (let limite of niveis) {
    if (xpAtual <= limite) return limite;
  }
  return Infinity;
}

function getXpNivelAtual(xpAtual) {
  const niveis = [0, 1000, 2000, 5000, 7000, 8000, 9000, 10000];
  for (let i = niveis.length - 1; i >= 0; i--) {
    if (xpAtual >= niveis[i]) return niveis[i];
  }
  return 0;
}

// ========== SISTEMA DE CONQUISTAS ==========
const CONQUISTAS_DEFINICAO = {
  primeira_vitoria: {
    id: "primeira_vitoria",
    nome: "Primeira Vitória",
    descricao: "Vença seu primeiro duelo",
    emoji: "🥇",
    raridade: "comum",
    condicao: (h) => h.vitorias >= 1
  },
  vitorioso: {
    id: "vitorioso",
    nome: "Vitorioso",
    descricao: "Vença 10 duelos",
    emoji: "🏆",
    raridade: "comum",
    condicao: (h) => h.vitorias >= 10
  },
  lendario: {
    id: "lendario",
    nome: "Lendário",
    descricao: "Vença 50 duelos",
    emoji: "👑",
    raridade: "rara",
    condicao: (h) => h.vitorias >= 50
  },
  nivel_bronze: {
    id: "nivel_bronze",
    nome: "Forja Iniciada",
    descricao: "Alcance o nível Bronze",
    emoji: "🟡",
    raridade: "comum",
    condicao: (h) => ["Bronze", "Prata", "Ouro", "Platina", "Ascendente", "Imortal", "Radiante"].includes(h.nivel)
  },
  nivel_prata: {
    id: "nivel_prata",
    nome: "Brilho da Prata",
    descricao: "Alcance o nível Prata",
    emoji: "⚪",
    raridade: "comum",
    condicao: (h) => ["Prata", "Ouro", "Platina", "Ascendente", "Imortal", "Radiante"].includes(h.nivel)
  },
  nivel_ouro: {
    id: "nivel_ouro",
    nome: "Coração de Ouro",
    descricao: "Alcance o nível Ouro",
    emoji: "🟡",
    raridade: "rara",
    condicao: (h) => ["Ouro", "Platina", "Ascendente", "Imortal", "Radiante"].includes(h.nivel)
  },
  nivel_platina: {
    id: "nivel_platina",
    nome: "Platina Brilhante",
    descricao: "Alcance o nível Platina",
    emoji: "💎",
    raridade: "epica",
    condicao: (h) => ["Platina", "Ascendente", "Imortal", "Radiante"].includes(h.nivel)
  },
  nivel_radiante: {
    id: "nivel_radiante",
    nome: "Radiante Supremo",
    descricao: "Alcance o nível Radiante",
    emoji: "🔥",
    raridade: "lendario",
    condicao: (h) => h.nivel === "Radiante"
  },
  streak_3: {
    id: "streak_3",
    nome: "Fogo no Coração",
    descricao: "Conquiste 3 vitórias seguidas",
    emoji: "🔥",
    raridade: "comum",
    condicao: (h) => h.maiorStreak >= 3
  },
  streak_5: {
    id: "streak_5",
    nome: "Imparável",
    descricao: "Conquiste 5 vitórias seguidas",
    emoji: "⚡",
    raridade: "rara",
    condicao: (h) => h.maiorStreak >= 5
  },
  streak_10: {
    id: "streak_10",
    nome: "Deus da Guerra",
    descricao: "Conquiste 10 vitórias seguidas",
    emoji: "👹",
    raridade: "epica",
    condicao: (h) => h.maiorStreak >= 10
  },
  primeiro_empate: {
    id: "primeiro_empate",
    nome: "Paz Temporária",
    descricao: "Empate seu primeiro duelo",
    emoji: "🤝",
    raridade: "comum",
    condicao: (h) => h.empates >= 1
  },
  primeiro_derrota: {
    id: "primeiro_derrota",
    nome: "Levanta a Cabeça",
    descricao: "Sofra sua primeira derrota",
    emoji: "💀",
    raridade: "comum",
    condicao: (h) => h.derrotas >= 1
  },
  guerreiro: {
    id: "guerreiro",
    nome: "Guerreiro Nato",
    descricao: "Complete 25 partidas",
    emoji: "⚔️",
    raridade: "comum",
    condicao: (h) => (h.vitorias + h.derrotas + h.empates) >= 25
  },
  veterano: {
    id: "veterano",
    nome: "Veterano de Batalha",
    descricao: "Complete 100 partidas",
    emoji: "🛡️",
    raridade: "rara",
    condicao: (h) => (h.vitorias + h.derrotas + h.empates) >= 100
  },
  // NOVAS CONQUISTAS v1.3 - CHEFOES
  primeiro_chefao: {
    id: "primeiro_chefao",
    nome: "Caçador de Chefões",
    descricao: "Derrote seu primeiro chefão",
    emoji: "🐉",
    raridade: "rara",
    condicao: (h) => h.chefoesDerrotados >= 1
  },
  cacador_chefoes: {
    id: "cacador_chefoes",
    nome: "Exterminador",
    descricao: "Derrote 5 chefões",
    emoji: "🏹",
    raridade: "epica",
    condicao: (h) => h.chefoesDerrotados >= 5
  },
  lendario_cacador: {
    id: "lendario_cacador",
    nome: "Lendário Caçador",
    descricao: "Derrote 10 chefões",
    emoji: "⚔️",
    raridade: "lendario",
    condicao: (h) => h.chefoesDerrotados >= 10
  }
};

function getRaridadeCor(raridade) {
  const cores = {
    comum: "#a0a0a0",
    rara: "#3498db",
    epica: "#9b59b6",
    lendario: "#f39c12"
  };
  return cores[raridade] || "#a0a0a0";
}

function getRaridadeLabel(raridade) {
  const labels = {
    comum: "Comum",
    rara: "Rara",
    epica: "Épica",
    lendario: "Lendária"
  };
  return labels[raridade] || "Comum";
}

class Heroi {
  constructor(nome, dadosSalvos = null) {
    if (dadosSalvos) {
      this.nome = dadosSalvos.nome;
      this.xp = dadosSalvos.xp;
      this.vitorias = dadosSalvos.vitorias;
      this.derrotas = dadosSalvos.derrotas;
      this.empates = dadosSalvos.empates;
      this.streak = dadosSalvos.streak;
      this.maiorStreak = dadosSalvos.maiorStreak;
      this.conquistas = dadosSalvos.conquistas || [];
      this.chefoesDerrotados = dadosSalvos.chefoesDerrotados || 0;
      this.vitoriasDesdeUltimoChefe = dadosSalvos.vitoriasDesdeUltimoChefe || 0;
      this.ultimaEscolha = dadosSalvos.ultimaEscolha || null;
      this.nivel = classificarNivel(this.xp);
    } else {
      this.nome = nome;
      this.xp = 0;
      this.vitorias = 0;
      this.derrotas = 0;
      this.empates = 0;
      this.nivel = classificarNivel(this.xp);
      this.streak = 0;
      this.maiorStreak = 0;
      this.conquistas = [];
      this.chefoesDerrotados = 0;
      this.vitoriasDesdeUltimoChefe = 0;
      this.ultimaEscolha = null;
    }
  }

  ganharXp(quantidade, isChefe = false) {
    let bonus = 0;
    if (this.streak >= 3) bonus = Math.floor(quantidade * 0.25);
    if (this.streak >= 5) bonus = Math.floor(quantidade * 0.5);
    if (this.streak >= 10) bonus = quantidade;

    const total = quantidade + bonus;
    this.xp += total;
    this.vitorias++;
    this.streak++;
    if (this.streak > this.maiorStreak) this.maiorStreak = this.streak;
    this.vitoriasDesdeUltimoChefe++;

    if (isChefe) {
      this.chefoesDerrotados++;
    }

    const nivelSubiu = this.atualizarNivel();
    const novasConquistas = this.verificarConquistas();
    this.salvar();
    return { xpGanho: total, bonus, nivelSubiu, novasConquistas };
  }

  perder() {
    this.derrotas++;
    this.streak = 0;
    this.vitoriasDesdeUltimoChefe = 0;
    const novasConquistas = this.verificarConquistas();
    this.salvar();
    return { novasConquistas };
  }

  empatar() {
    this.empates++;
    const novasConquistas = this.verificarConquistas();
    this.salvar();
    return { novasConquistas };
  }

  verificarConquistas() {
    const novas = [];
    for (const [key, conquista] of Object.entries(CONQUISTAS_DEFINICAO)) {
      if (!this.conquistas.includes(conquista.id) && conquista.condicao(this)) {
        this.conquistas.push(conquista.id);
        novas.push(conquista);
      }
    }
    return novas;
  }

  getConquistas() {
    const desbloqueadas = this.conquistas.map(id => CONQUISTAS_DEFINICAO[id]).filter(Boolean);
    const bloqueadas = Object.values(CONQUISTAS_DEFINICAO).filter(c => !this.conquistas.includes(c.id));
    return { desbloqueadas, bloqueadas };
  }

  atualizarNivel() {
    const nivelAnterior = this.nivel;
    this.nivel = classificarNivel(this.xp);
    return this.nivel !== nivelAnterior;
  }

  salvar() {
    try {
      localStorage.setItem('heroiRpg_dados', JSON.stringify({
        nome: this.nome,
        xp: this.xp,
        vitorias: this.vitorias,
        derrotas: this.derrotas,
        empates: this.empates,
        streak: this.streak,
        maiorStreak: this.maiorStreak,
        conquistas: this.conquistas,
        chefoesDerrotados: this.chefoesDerrotados,
        vitoriasDesdeUltimoChefe: this.vitoriasDesdeUltimoChefe,
        ultimaEscolha: this.ultimaEscolha
      }));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }

  static carregar() {
    try {
      const dados = localStorage.getItem('heroiRpg_dados');
      if (dados) return JSON.parse(dados);
    } catch (e) {
      console.warn('Não foi possível carregar do localStorage:', e);
    }
    return null;
  }

  static reiniciar() {
    try {
      localStorage.removeItem('heroiRpg_dados');
      return true;
    } catch (e) {
      console.warn('Não foi possível reiniciar:', e);
      return false;
    }
  }

  getProgressoXp() {
    const xpBase = getXpNivelAtual(this.xp);
    const xpProximo = getXpProximoNivel(this.xp);
    if (xpProximo === Infinity) return 100;
    const xpNoNivel = this.xp - xpBase;
    const xpTotalNivel = xpProximo - xpBase;
    return Math.min(100, Math.floor((xpNoNivel / xpTotalNivel) * 100));
  }

  getXpDisplay() {
    const xpProximo = getXpProximoNivel(this.xp);
    if (xpProximo === Infinity) return `${this.xp} / ∞`;
    return `${this.xp} / ${xpProximo}`;
  }

  getStatus() {
    return {
      nome: this.nome,
      xp: this.xp,
      nivel: this.nivel,
      emojiNivel: getEmojiNivel(this.nivel),
      vitorias: this.vitorias,
      derrotas: this.derrotas,
      empates: this.empates,
      streak: this.streak,
      maiorStreak: this.maiorStreak,
      progressoXp: this.getProgressoXp(),
      xpDisplay: this.getXpDisplay(),
      totalConquistas: this.conquistas.length,
      totalConquistasDisponiveis: Object.keys(CONQUISTAS_DEFINICAO).length,
      chefoesDerrotados: this.chefoesDerrotados,
      vitoriasDesdeUltimoChefe: this.vitoriasDesdeUltimoChefe
    };
  }
}

// Exporta
window.Heroi = Heroi;
window.classificarNivel = classificarNivel;
window.getEmojiNivel = getEmojiNivel;
window.CONQUISTAS_DEFINICAO = CONQUISTAS_DEFINICAO;
window.getRaridadeCor = getRaridadeCor;
window.getRaridadeLabel = getRaridadeLabel;
