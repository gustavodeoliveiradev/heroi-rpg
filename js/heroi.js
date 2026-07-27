/**
 * Sistema de classificação de nível do herói
 * Baseado no desafio DIO — Classificador de Nível de Herói
 * Versão Web com localStorage
 */

function classificarNivel(xp) {
  if (xp <= 1000) {
    return "Ferro";
  } else if (xp <= 2000) {
    return "Bronze";
  } else if (xp <= 5000) {
    return "Prata";
  } else if (xp <= 7000) {
    return "Ouro";
  } else if (xp <= 8000) {
    return "Platina";
  } else if (xp <= 9000) {
    return "Ascendente";
  } else if (xp <= 10000) {
    return "Imortal";
  } else {
    return "Radiante";
  }
}

function getEmojiNivel(nivel) {
  const emojis = {
    "Ferro": "🟤",
    "Bronze": "🟡",
    "Prata": "⚪",
    "Ouro": "🟡",
    "Platina": "💎",
    "Ascendente": "⭐",
    "Imortal": "👑",
    "Radiante": "🔥"
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
    }
  }

  ganharXp(quantidade) {
    let bonus = 0;
    if (this.streak >= 3) bonus = Math.floor(quantidade * 0.25);
    if (this.streak >= 5) bonus = Math.floor(quantidade * 0.5);
    if (this.streak >= 10) bonus = quantidade;

    const total = quantidade + bonus;
    this.xp += total;
    this.vitorias++;
    this.streak++;
    if (this.streak > this.maiorStreak) this.maiorStreak = this.streak;

    const nivelSubiu = this.atualizarNivel();
    this.salvar();
    return { xpGanho: total, bonus, nivelSubiu };
  }

  perder() {
    this.derrotas++;
    this.streak = 0;
    this.salvar();
  }

  empatar() {
    this.empates++;
    this.salvar();
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
        maiorStreak: this.maiorStreak
      }));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }

  static carregar() {
    try {
      const dados = localStorage.getItem('heroiRpg_dados');
      if (dados) {
        return JSON.parse(dados);
      }
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
      xpDisplay: this.getXpDisplay()
    };
  }
}

// Exporta
window.Heroi = Heroi;
window.classificarNivel = classificarNivel;
window.getEmojiNivel = getEmojiNivel;
