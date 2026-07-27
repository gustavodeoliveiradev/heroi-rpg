/**
 * HERÓI RPG — Interface do Usuário (UI)
 * Manipulação do DOM, animações, localStorage e feedback visual
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
    this.verificarProgressoSalvo();
  }

  // ========== VERIFICAR PROGRESSO SALVO ==========
  verificarProgressoSalvo() {
    const dadosSalvos = Heroi.carregar();
    if (dadosSalvos) {
      // Pergunta se quer continuar
      const querContinuar = confirm(
        `🎮 Progresso encontrado!\n\n` +
        `Herói: ${dadosSalvos.nome}\n` +
        `Nível: ${getEmojiNivel(classificarNivel(dadosSalvos.xp))} ${classificarNivel(dadosSalvos.xp)}\n` +
        `XP: ${dadosSalvos.xp}\n\n` +
        `Deseja continuar de onde parou?`
      );

      if (querContinuar) {
        this.heroi = new Heroi(null, dadosSalvos);
        this.entrarNoJogo();
      }
    }
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

    // Status, Sair e Reiniciar
    const btnStatus = document.getElementById('btn-status');
    const btnSair = document.getElementById('btn-sair');
    const btnFecharModal = document.getElementById('modal-fechar');
    const btnReiniciar = document.getElementById('btn-reiniciar');

    if (btnStatus) btnStatus.addEventListener('click', () => this.abrirModalStatus());
    if (btnSair) btnSair.addEventListener('click', () => this.sairJogo());
    if (btnFecharModal) btnFecharModal.addEventListener('click', () => this.fecharModalStatus());
    if (btnReiniciar) btnReiniciar.addEventListener('click', () => this.reiniciarProgresso());

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

    // Verifica se já existe progresso com outro nome
    const dadosSalvos = Heroi.carregar();
    if (dadosSalvos && dadosSalvos.nome !== nome) {
      const querSobrescrever = confirm(
        `⚠️ Já existe um progresso salvo com o nome "${dadosSalvos.nome}".\n` +
        `Deseja começar um novo herói chamado "${nome}"?\n` +
        `O progresso anterior será perdido!`
      );
      if (!querSobrescrever) return;
      Heroi.reiniciar();
    }

    this.heroi = new Heroi(nome);
    this.heroi.salvar();
    this.entrarNoJogo();
  }

  entrarNoJogo() {
    this.atualizarPainelStatus();

    document.getElementById('tela-login').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');

    this.mostrarResultado(`✨ Bem-vindo de volta, ${this.heroi.nome}! Escolha seu item para duelar!`);
  }

  // ========== ESCOLHER ITEM ==========
  async escolherItem(itemEscolhido) {
    if (this.processando) return;
    this.processando = true;

    document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = true);

    this.nomeInimigoAtual = getNomeInimigoAleatorio();
    document.getElementById('combatente-nome-inimigo').textContent = this.nomeInimigoAtual;

    const itemJogador = ITENS[itemEscolhido];
    const elItemHeroi = document.getElementById('item-heroi');
    elItemHeroi.textContent = itemJogador.emoji;
    elItemHeroi.classList.add('revelado', 'flip-revelar');

    document.getElementById('cartao-heroi').classList.add('ataque-heroi');

    this.mostrarResultado("⚔️ Duelando...", "processando");

    await this.delay(800);

    const pc = escolhaComputador();
    const elItemInimigo = document.getElementById('item-inimigo');
    elItemInimigo.textContent = pc.emoji;
    elItemInimigo.classList.add('revelado', 'flip-revelar');

    document.getElementById('cartao-inimigo').classList.add('ataque-inimigo');

    await this.delay(600);

    const resultado = resolverCombate(itemEscolhido, pc);
    let xpGanho = 0;
    let bonusXp = 0;
    let nivelSubiu = false;

    if (resultado.resultado === "vitoria") {
      const res = this.heroi.ganharXp(XP_POR_VITORIA);
      xpGanho = res.xpGanho;
      bonusXp = res.bonus;
      nivelSubiu = res.nivelSubiu;

      document.getElementById('cartao-heroi').classList.add('glow-vitoria');
      document.getElementById('cartao-inimigo').classList.add('dano-recebido');
    } else if (resultado.resultado === "empate") {
      this.heroi.empatar();
      const res = this.heroi.ganharXp(XP_POR_EMPATE);
      xpGanho = res.xpGanho;

      document.getElementById('cartao-heroi').classList.add('glow-empate');
      document.getElementById('cartao-inimigo').classList.add('glow-empate');
    } else {
      this.heroi.perder();

      document.getElementById('cartao-heroi').classList.add('glow-derrota', 'dano-recebido');
      document.getElementById('cartao-inimigo').classList.add('glow-vitoria');
    }

    let mensagemFinal = resultado.mensagem;
    if (resultado.resultado === "vitoria") {
      mensagemFinal += ` (+${xpGanho} XP)`;
      if (bonusXp > 0) {
        mensagemFinal += ` [Bônus streak: +${bonusXp}]`;
      }
      const msgStreak = getMensagemStreak(this.heroi.streak);
      if (msgStreak) mensagemFinal = msgStreak + "\n" + mensagemFinal;
    } else if (resultado.resultado === "empate") {
      mensagemFinal += ` (+${xpGanho} XP)`;
    }

    this.mostrarResultado(mensagemFinal, resultado.resultado);
    this.atualizarPainelStatus();

    if (nivelSubiu) {
      await this.delay(500);
      this.mostrarLevelUp(this.heroi.nivel);
    }

    await this.delay(2500);
    this.limparAnimacoes();

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

    const totalPartidas = status.vitorias + status.derrotas + status.empates;
    const taxaVitoria = totalPartidas > 0
      ? Math.round((status.vitorias / totalPartidas) * 100)
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
      <div class="status-linha">
        <span class="status-label">🎮 Partidas Totais</span>
        <span class="status-valor">${totalPartidas}</span>
      </div>
    `;

    modal.classList.add('ativo');
  }

  fecharModalStatus() {
    document.getElementById('modal-status').classList.remove('ativo');
  }

  // ========== REINICIAR PROGRESSO ==========
  reiniciarProgresso() {
    if (!this.heroi) return;

    const confirmar = confirm(
      `⚠️ ATENÇÃO!\n\n` +
      `Você está prestes a APAGAR TODO O PROGRESSO de ${this.heroi.nome}.\n` +
      `Nível: ${getEmojiNivel(this.heroi.nivel)} ${this.heroi.nivel}\n` +
      `XP: ${this.heroi.xp}\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Deseja realmente reiniciar?`
    );

    if (confirmar) {
      Heroi.reiniciar();
      this.heroi = null;
      this.fecharModalStatus();

      // Volta pra tela de login
      document.getElementById('tela-jogo').classList.remove('ativa');
      document.getElementById('tela-login').classList.add('ativa');
      document.getElementById('input-nome').value = '';
      document.getElementById('input-nome').focus();

      alert('✅ Progresso reiniciado com sucesso! Comece uma nova jornada!');
    }
  }

  // ========== SAIR ==========
  sairJogo() {
    if (confirm("Deseja realmente sair? Seu progresso está salvo e você pode voltar a qualquer momento!")) {
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
