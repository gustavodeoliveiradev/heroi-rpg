/**
 * HERÓI RPG — Sistema de Som (SFX)
 * Efeitos sonoros sintetizados via Web Audio API.
 * Não depende de nenhuma API externa, chave ou arquivo de áudio.
 * Funciona 100% offline, inclusive no GitHub Pages.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.ligado = this._carregarPreferencia();
  }

  // Cria o AudioContext só no primeiro uso (exigência dos navegadores:
  // precisa ser iniciado a partir de uma interação do usuário, tipo clique)
  _getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  _carregarPreferencia() {
    const salvo = localStorage.getItem('heroi-rpg-som');
    return salvo === null ? true : salvo === 'true';
  }

  alternar() {
    this.ligado = !this.ligado;
    localStorage.setItem('heroi-rpg-som', this.ligado);
    return this.ligado;
  }

  // Toca um "beep" simples: frequência, duração, tipo de onda, volume
  _tocarTom(freq, duracao, tipo = 'square', volume = 0.15, delayInicial = 0) {
    if (!this.ligado) return;
    try {
      const ctx = this._getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipo;
      osc.frequency.value = freq;

      const tempoInicio = ctx.currentTime + delayInicial;
      gain.gain.setValueAtTime(volume, tempoInicio);
      gain.gain.exponentialRampToValueAtTime(0.001, tempoInicio + duracao);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(tempoInicio);
      osc.stop(tempoInicio + duracao);
    } catch (e) {
      console.warn('SoundManager: não foi possível tocar o som.', e);
    }
  }

  // Sequência de notas: [[freq, duracao, delay], ...]
  _tocarSequencia(notas, tipo = 'square', volume = 0.15) {
    notas.forEach(([freq, duracao, delay]) => {
      this._tocarTom(freq, duracao, tipo, volume, delay);
    });
  }

  // ===== EFEITOS DO JOGO =====

  clique() {
    this._tocarTom(440, 0.06, 'square', 0.08);
  }

  ataque() {
    this._tocarTom(180, 0.12, 'sawtooth', 0.12);
  }

  vitoria() {
    this._tocarSequencia([
      [523.25, 0.12, 0],     // Dó
      [659.25, 0.12, 0.1],   // Mi
      [783.99, 0.25, 0.2],   // Sol
    ], 'square', 0.14);
  }

  derrota() {
    this._tocarSequencia([
      [300, 0.15, 0],
      [250, 0.15, 0.12],
      [180, 0.35, 0.24],
    ], 'sawtooth', 0.14);
  }

  empate() {
    this._tocarSequencia([
      [400, 0.12, 0],
      [400, 0.12, 0.15],
    ], 'triangle', 0.12);
  }

  levelUp() {
    this._tocarSequencia([
      [523.25, 0.1, 0],
      [659.25, 0.1, 0.1],
      [783.99, 0.1, 0.2],
      [1046.5, 0.35, 0.3],
    ], 'square', 0.16);
  }

  conquista() {
    this._tocarSequencia([
      [880, 0.1, 0],
      [1108.73, 0.25, 0.1],
    ], 'triangle', 0.15);
  }

  chefaoAparece() {
    this._tocarSequencia([
      [110, 0.3, 0],
      [98, 0.3, 0.25],
      [87, 0.5, 0.5],
    ], 'sawtooth', 0.18);
  }
}

// Exporta uma instância única (singleton), pronta pra usar em qualquer arquivo
window.som = new SoundManager();