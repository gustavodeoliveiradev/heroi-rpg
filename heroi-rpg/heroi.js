/**
 * Sistema de classificação de nível do herói
 * Baseado no desafio DIO — Classificador de Nível de Herói
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

class Heroi {
  constructor(nome) {
    this.nome = nome;
    this.xp = 0;
    this.vitorias = 0;
    this.derrotas = 0;
    this.empates = 0;
    this.nivel = classificarNivel(this.xp);
  }

  ganharXp(quantidade) {
    this.xp += quantidade;
    this.vitorias++;
    this.atualizarNivel();
  }

  perder() {
    this.derrotas++;
  }

  empatar() {
    this.empates++;
  }

  atualizarNivel() {
    const nivelAnterior = this.nivel;
    this.nivel = classificarNivel(this.xp);

    if (this.nivel !== nivelAnterior) {
      console.log(`\n⭐ LEVEL UP! ${this.nome} alcançou o nível ${this.nivel}!\n`);
    }
  }

  getStatus() {
    return {
      nome: this.nome,
      xp: this.xp,
      nivel: this.nivel,
      vitorias: this.vitorias,
      derrotas: this.derrotas,
      empates: this.empates
    };
  }

  exibirStatus() {
    console.log(`
╔══════════════════════════════════════╗
║         ⚔️  STATUS DO HERÓI          ║
╠══════════════════════════════════════╣
║  Nome:      ${this.nome.padEnd(24)}║
║  XP:        ${String(this.xp).padEnd(24)}║
║  Nível:     ${this.nivel.padEnd(24)}║
║  Vitórias:  ${String(this.vitorias).padEnd(24)}║
║  Derrotas:  ${String(this.derrotas).padEnd(24)}║
║  Empates:   ${String(this.empates).padEnd(24)}║
╚══════════════════════════════════════╝
`);
  }
}

module.exports = { Heroi, classificarNivel };
