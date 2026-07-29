/**
 * HERÓI RPG — Interface do Usuário (UI)
 * Manipulação do DOM, animações, localStorage, Conquistas e feedback visual
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
      const querContinuar = confirm(
        `🎮 Progresso encontrado!\n\n` +
        `Herói: ${dadosSalvos.nome}\n` +
        `Nível: ${getEmojiNivel(classificarNivel(dadosSalvos.xp))} ${classificarNivel(dadosSalvos.xp)}\n` +
        `XP: ${dadosSalvos.xp}\n` +
        `Conquistas: ${(dadosSalvos.conquistas || []).length}/${Object.keys(CONQUISTAS_DEFINICAO).length}\n\n` +
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
    const btnIniciar = document.getElementById('btn-iniciar');
    const inputNome = document.getElementById('input-nome');

    if (btnIniciar) btnIniciar.addEventListener('click', () => this.iniciarJogo());
    if (inputNome) {
      inputNome.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.iniciarJogo();
      });
    }

    document.querySelectorAll('.btn-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.currentTarget.dataset.item;
        this.escolherItem(Number(item));
      });
    });

    const btnStatus = document.getElementById('btn-status');
    const btnSair = document.getElementById('btn-sair');
    const btnFecharModal = document.getElementById('modal-fechar');
    const btnReiniciar = document.getElementById('btn-reiniciar');

    if (btnStatus) btnStatus.addEventListener('click', () => this.abrirModalStatus());
    if (btnSair) btnSair.addEventListener('click', () => this.sairJogo());
    if (btnFecharModal) btnFecharModal.addEventListener('click', () => this.fecharModalStatus());
    if (btnReiniciar) btnReiniciar.addEventListener('click', () => this.reiniciarProgresso());

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
    let novasConquistas = [];

    if (resultado.resultado === "vitoria") {
      const res = this.heroi.ganharXp(XP_POR_VITORIA);
      xpGanho = res.xpGanho;
      bonusXp = res.bonus;
      nivelSubiu = res.nivelSubiu;
      novasConquistas = res.novasConquistas;

      document.getElementById('cartao-heroi').classList.add('glow-vitoria');
      document.getElementById('cartao-inimigo').classList.add('dano-recebido');
    } else if (resultado.resultado === "empate") {
      const res = this.heroi.empatar();
      xpGanho = XP_POR_EMPATE;
      // CORREÇÃO: Agora empate NÃO conta como vitória!
      novasConquistas = res.novasConquistas;

      document.getElementById('cartao-heroi').classList.add('glow-empate');
      document.getElementById('cartao-inimigo').classList.add('glow-empate');
    } else {
      const res = this.heroi.perder();
      novasConquistas = res.novasConquistas;

      document.getElementById('cartao-heroi').classList.add('glow-derrota', 'dano-recebido');
      document.getElementById('cartao-inimigo').classList.add('glow-vitoria');
    }

    // Monta mensagem de resultado
    let mensagemFinal = resultado.mensagem;
    if (resultado.resultado === "vitoria") {
      mensagemFinal += ` (+${xpGanho} XP)`;
      if (bonusXp > 0) mensagemFinal += ` [Bônus: +${bonusXp}]`;
      const msgStreak = getMensagemStreak(this.heroi.streak);
      if (msgStreak) mensagemFinal = msgStreak + "\n" + mensagemFinal;
    } else if (resultado.resultado === "empate") {
      mensagemFinal += ` (+${xpGanho} XP)`;
    }

    this.mostrarResultado(mensagemFinal, resultado.resultado);
    this.atualizarPainelStatus();

    // Mostra conquistas desbloqueadas
    if (novasConquistas.length > 0) {
      await this.delay(300);
      for (const conquista of novasConquistas) {
        this.mostrarConquista(conquista);
        await this.delay(2500);
      }
    }

    if (nivelSubiu) {
      await this.delay(500);
      this.mostrarLevelUp(this.heroi.nivel);
    }

    await this.delay(2500);
    this.limparAnimacoes();

    document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = false);
    this.processando = false;
  }

  // ========== MOSTRAR CONQUISTA ==========
  mostrarConquista(conquista) {
    const notif = document.getElementById('notificacao-levelup');
    const nivelEl = document.getElementById('levelup-nivel');
    const tituloEl = notif.querySelector('.levelup-titulo');
    const brilhoEl = notif.querySelector('.levelup-brilho');

    tituloEl.textContent = "🏆 NOVA CONQUISTA!";
    nivelEl.innerHTML = `${conquista.emoji} ${conquista.nome}<br><small style="font-size:0.8rem;color:#a0a0b0">${conquista.descricao}</small>`;
    brilhoEl.textContent = conquista.emoji;

    notif.classList.add('ativo');

    setTimeout(() => {
      notif.classList.remove('ativo');
      // Restaura textos originais
      tituloEl.textContent = "LEVEL UP!";
      brilhoEl.textContent = "⭐";
    }, 3000);
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
    el.textContent = texto;
    el.className = 'resultado-texto';

    if (tipo === "vitoria") el.style.color = "var(--cor-sucesso)";
    else if (tipo === "derrota") el.style.color = "var(--cor-acento)";
    else if (tipo === "empate") el.style.color = "#6495ed";
    else el.style.color = "var(--cor-texto)";

    if (tipo === "processando") el.classList.add('processando');
  }

  // ========== MOSTRAR LEVEL UP ==========
  mostrarLevelUp(nivel) {
    const notif = document.getElementById('notificacao-levelup');
    const nivelEl = document.getElementById('levelup-nivel');
    const tituloEl = notif.querySelector('.levelup-titulo');
    const brilhoEl = notif.querySelector('.levelup-brilho');

    tituloEl.textContent = "LEVEL UP!";
    nivelEl.textContent = `Você alcançou o nível ${nivel}!`;
    brilhoEl.textContent = "⭐";

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

    // Pega conquistas
    const { desbloqueadas, bloqueadas } = this.heroi.getConquistas();

    let conquistasHTML = '';
    if (desbloqueadas.length > 0) {
      conquistasHTML += `
        <div style="margin: 1rem 0 0.5rem; padding-top: 0.8rem; border-top: 1px solid var(--cor-borda);">
          <div style="font-family: var(--fonte-titulo); color: var(--cor-primaria); font-size: 1rem; margin-bottom: 0.8rem; text-align: center;">
            🏆 Conquistas Desbloqueadas (${desbloqueadas.length}/${status.totalConquistasDisponiveis})
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      `;

      desbloqueadas.forEach(c => {
        const cor = getRaridadeCor(c.raridade);
        conquistasHTML += `
          <div style="display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid ${cor}40;">
            <span style="font-size: 1.5rem;">${c.emoji}</span>
            <div style="flex: 1;">
              <div style="font-weight: 700; color: var(--cor-texto); font-size: 0.9rem;">${c.nome}</div>
              <div style="font-size: 0.75rem; color: var(--cor-texto-secundario);">${c.descricao}</div>
            </div>
            <span style="font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 10px; background: ${cor}20; color: ${cor}; border: 1px solid ${cor}40;">${getRaridadeLabel(c.raridade)}</span>
          </div>
        `;
      });

      conquistasHTML += `</div></div>`;
    }

    if (bloqueadas.length > 0) {
      conquistasHTML += `
        <div style="margin: 1rem 0 0.5rem; padding-top: 0.8rem; border-top: 1px solid var(--cor-borda);">
          <div style="font-family: var(--fonte-titulo); color: var(--cor-texto-secundario); font-size: 0.9rem; margin-bottom: 0.8rem; text-align: center;">
            🔒 Conquistas Bloqueadas (${bloqueadas.length})
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      `;

      bloqueadas.forEach(c => {
        conquistasHTML += `
          <div style="display: flex; align-items: center; gap: 0.7rem; padding: 0.5rem 0.8rem; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--cor-borda); opacity: 0.5;">
            <span style="font-size: 1.3rem;">❓</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--cor-texto-secundario); font-size: 0.85rem;">${c.nome}</div>
              <div style="font-size: 0.7rem; color: var(--cor-texto-secundario);">${c.descricao}</div>
            </div>
          </div>
        `;
      });

      conquistasHTML += `</div></div>`;
    }

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
      ${conquistasHTML}
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
      `XP: ${this.heroi.xp}\n` +
      `Conquistas: ${this.heroi.conquistas.length}\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Deseja realmente reiniciar?`
    );

    if (confirmar) {
      Heroi.reiniciar();
      this.heroi = null;
      this.fecharModalStatus();

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
