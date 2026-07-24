/**
 * HERÓI RPG — Interface do Usuário (UI)
 * Manipulação do DOM, animações e feedback visual
 */

class UI {
  constructor() {
    this.heroi = null;
    this.nomeInimigoAtual = "";
    this.processando = false;
    this.inicializar();
  }

  inicializar() {
    this.criarParticulas();
    this.bindEventos();
  }

  // ========== PARTÍCULAS DE FUNDO ==========
  criarParticulas() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (5 + Math.random() * 5) + 's';
      container.appendChild(p);
    }
  }

  // ========== EVENTOS ==========
  bindEventos() {
    // Login
    const btnIniciar = document.getElementById('btn-iniciar');
    const inputNome = document.getElementById('input-nome');

    if (btnIniciar) {
      btnIniciar.addEventListener('click', () => this.iniciarJogo());
    }

    if (inputNome) {
      inputNome.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.iniciarJogo();
      });
    }

    // Botões de item
    document.querySelectorAll('.btn-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.currentTarget.dataset.item;
        this.escolherItem(Number(item));
      });
    });

    // Status e Sair
    const btnStatus = document.getElementById('btn-status');
    const btnSair = document.getElementById('btn-sair');
    const btnFecharModal = document.getElementById('modal-fechar');

    if (btnStatus) btnStatus.addEventListener('click', () => this.abrirModalStatus());
    if (btnSair) btnSair.addEventListener('click', () => this.sairJogo());
    if (btnFecharModal) btnFecharModal.addEventListener('click', () => this.fecharModalStatus());

    // Fechar modal ao clicar fora
    const modalOverlay = document.getElementById('modal-status');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.fecharModalStatus();
      });
    }
  }

  // ========== INICIAR JOGO ==========
  iniciarJogo() {
    const input = document.getElementById('input-nome');
    const nome = input.value.trim() || "Herói Sem Nome";

    this.heroi = new window.Heroi(nome);
    this.atualizarPainelStatus();

    // Transição de tela
    document.getElementById('tela-login').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');

    // Mensagem de boas-vindas
    this.mostrarResultado(`✨ Bem-vindo, ${nome}! Escolha seu item para duelar!`);
  }

  // ========== ESCOLHER ITEM ==========
  async escolherItem(itemEscolhido) {
    if (this.processando) return;
    this.processando = true;

    // Desabilita botões
    document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = true);

    // Gera inimigo
    this.nomeInimigoAtual = window.getNomeInimigoAleatorio();
    document.getElementById('combatente-nome-inimigo').textContent = this.nomeInimigoAtual;

    // Revela escolha do jogador
    const itemJogador = window.ITENS[itemEscolhido];
    const elItemHeroi = document.getElementById('item-heroi');
    elItemHeroi.textContent = itemJogador.emoji;
    elItemHeroi.classList.add('revelado', 'flip-revelar');

    // Animação de ataque do herói
    document.getElementById('cartao-heroi').classList.add('ataque-heroi');

    this.mostrarResultado("⚔️ Duelando...", "processando");

    // Delay dramático
    await this.delay(800);

    // Revela escolha do inimigo
    const pc = window.escolhaComputador();
    const elItemInimigo = document.getElementById('item-inimigo');
    elItemInimigo.textContent = pc.emoji;
    elItemInimigo.classList.add('revelado', 'flip-revelar');

    // Animação de ataque do inimigo
    document.getElementById('cartao-inimigo').classList.add('ataque-inimigo');

    await this.delay(600);

    // Resolve combate
    const resultado = window.resolverCombate(itemEscolhido, pc);
    let xpGanho = 0;
    let bonusXp = 0;
    let nivelSubiu = false;

    // Aplica resultado
    if (resultado.resultado === "vitoria") {
      const res = this.heroi.ganharXp(window.XP_POR_VITORIA);
      xpGanho = res.xpGanho;
      bonusXp = res.bonus;
      nivelSubiu = res.nivelSubiu;

      document.getElementById('cartao-heroi').classList.add('glow-vitoria');
      document.getElementById('cartao-inimigo').classList.add('dano-recebido');
    } else if (resultado.resultado === "empate") {
      this.heroi.empatar();
      this.heroi.ganharXp(window.XP_POR_EMPATE);
      xpGanho = window.XP_POR_EMPATE;

      document.getElementById('cartao-heroi').classList.add('glow-empate');
      document.getElementById('cartao-inimigo').classList.add('glow-empate');
    } else {
      this.heroi.perder();

      document.getElementById('cartao-heroi').classList.add('glow-derrota', 'dano-recebido');
      document.getElementById('cartao-inimigo').classList.add('glow-vitoria');
    }

    // Mostra resultado
    let mensagemFinal = resultado.mensagem;
    if (resultado.resultado === "vitoria") {
      mensagemFinal += ` (+${xpGanho} XP)`;
      if (bonusXp > 0) {
        mensagemFinal += ` [Bônus streak: +${bonusXp}]`;
      }
      const msgStreak = window.getMensagemStreak(this.heroi.streak);
      if (msgStreak) mensagemFinal = msgStreak + "\n" + mensagemFinal;
    } else if (resultado.resultado === "empate") {
      mensagemFinal += ` (+${xpGanho} XP)`;
    }

    this.mostrarResultado(mensagemFinal, resultado.resultado);

    // Atualiza painel
    this.atualizarPainelStatus();

    // Level up?
    if (nivelSubiu) {
      await this.delay(500);
      this.mostrarLevelUp(this.heroi.nivel);
    }

    // Limpa animações após delay
    await this.delay(2500);
    this.limparAnimacoes();

    // Reabilita botões
    document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = false);
    this.processando = false;
  }

  // ========== ATUALIZAR PAINEL ==========
  atualizarPainelStatus() {
    if (!this.heroi) return;
    const status = this.heroi.getStatus();

    document.getElementById('nome-heroi').textContent = status.nome;
    document.getElementById('nivel-badge').textContent = `${status.emojiNivel} ${status.nivel}`;
    document.getElementById('xp-texto').textContent = status.xpDisplay;
    document.getElementById('barra-xp').style.width = status.progressoXp + '%';
    document.getElementById('stat-vitorias').textContent = status.vitorias;
    document.getElementById('stat-derrotas').textContent = status.derrotas;
    document.getElementById('stat-empates').textContent = status.empates;
  }

  // ========== MOSTRAR RESULTADO ==========
  mostrarResultado(texto, tipo = "") {
    const el = document.getElementById('resultado-texto');
    const elXp = document.getElementById('resultado-xp');

    el.textContent = texto;
    el.className = 'resultado-texto';

    if (tipo === "vitoria") el.style.color = "var(--cor-sucesso)";
    else if (tipo === "derrota") el.style.color = "var(--cor-acento)";
    else if (tipo === "empate") el.style.color = "#6495ed";
    else el.style.color = "var(--cor-texto)";

    if (tipo === "processando") {
      el.classList.add('processando');
    }
  }

  // ========== MOSTRAR LEVEL UP ==========
  mostrarLevelUp(nivel) {
    const notif = document.getElementById('notificacao-levelup');
    const nivelEl = document.getElementById('levelup-nivel');

    nivelEl.textContent = `Você alcançou o nível ${nivel}!`;
    notif.classList.add('ativo');

    // Efeito sonoro visual (pulsar no avatar)
    document.getElementById('avatar-heroi').classList.add('pulso-escala');

    setTimeout(() => {
      notif.classList.remove('ativo');
      document.getElementById('avatar-heroi').classList.remove('pulso-escala');
    }, 3200);
  }

  // ========== LIMPAR ANIMAÇÕES ==========
  limparAnimacoes() {
    const elementos = [
      'cartao-heroi', 'cartao-inimigo', 
      'item-heroi', 'item-inimigo',
      'avatar-heroi'
    ];

    elementos.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove(
          'glow-vitoria', 'glow-derrota', 'glow-empate',
          'flip-revelar', 'ataque-heroi', 'ataque-inimigo',
          'dano-recebido', 'pulso-escala', 'revelado'
        );
      }
    });

    // Reseta itens
    document.getElementById('item-heroi').textContent = "?";
    document.getElementById('item-inimigo').textContent = "?";
    document.getElementById('combatente-nome-inimigo').textContent = "Computador";
  }

  // ========== MODAL STATUS ==========
  abrirModalStatus() {
    if (!this.heroi) return;
    const status = this.heroi.getStatus();
    const modal = document.getElementById('modal-status');
    const corpo = document.getElementById('modal-corpo');

    const taxaVitoria = status.vitorias + status.derrotas + status.empates > 0
      ? Math.round((status.vitorias / (status.vitorias + status.derrotas + status.empates)) * 100)
      : 0;

    corpo.innerHTML = `
      <div class="status-linha">
        <span class="status-label">👤 Nome</span>
        <span class="status-valor">${status.nome}</span>
      </div>
      <div class="status-linha">
        <span class="status-label">⭐ Nível</span>
        <span class="status-valor destaque">${status.emojiNivel} ${status.nivel}</span>
      </div>
      <div class="status-linha">
        <span class="status-label">✨ XP Total</span>
        <span class="status-valor">${status.xp}</span>
      </div>
      <div class="status-progresso">
        <div class="status-progresso-label">
          <span>Progresso para próximo nível</span>
          <span>${status.progressoXp}%</span>
        </div>
        <div class="status-progresso-barra">
          <div class="status-progresso-preenchimento" style="width: ${status.progressoXp}%"></div>
        </div>
      </div>
      <div class="status-linha">
        <span class="status-label">🏆 Vitórias</span>
        <span class="status-valor destaque">${status.vitorias}</span>
      </div>
      <div class="status-linha">
        <span class="status-label">💀 Derrotas</span>
        <span class="status-valor negativo">${status.derrotas}</span>
      </div>
      <div class="status-linha">
        <span class="status-label">🤝 Empates</span>
        <span class="status-valor">${status.empates}</span>
      </div>
      <div class="status-linha">
        <span class="status-label">📊 Taxa de Vitória</span>
        <span class="status-valor ${taxaVitoria >= 50 ? 'destaque' : ''}">${taxaVitoria}%</span>
      </div>
      <div class="status-linha">
        <span class="status-label">🔥 Streak Atual</span>
        <span class="status-valor ${status.streak >= 3 ? 'destaque' : ''}">${status.streak}</span>
      </div>
      <div class="status-linha">
        <span class="status-label">🏅 Maior Streak</span>
        <span class="status-valor destaque">${status.maiorStreak}</span>
      </div>
    `;

    modal.classList.add('ativo');
  }

  fecharModalStatus() {
    document.getElementById('modal-status').classList.remove('ativo');
  }

  // ========== SAIR ==========
  sairJogo() {
    if (confirm("Deseja realmente sair? Seu progresso será perdido!")) {
      location.reload();
    }
  }

  // ========== UTILIDADES ==========
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exporta
window.UI = UI;
