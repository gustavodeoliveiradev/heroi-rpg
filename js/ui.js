/**
 * HERÓI RPG — Interface do Usuário (UI) v1.3
 * Manipulação do DOM, animações, localStorage, Conquistas, Chefões
 */

class UI {
  constructor() {
    this.heroi = null;
    this.classeSelecionada = "guerreiro";
    this.nomeInimigoAtual = "";
    this.processando = false;
    this.chefaoAtual = null;
    this.combate = null;
    this.inicializar();
  }

  inicializar() {
    this.criarParticulas();
    this.bindEventos();
    this.verificarProgressoSalvo();
  }

  verificarProgressoSalvo() {
    const dadosSalvos = Heroi.carregar();
    if (dadosSalvos) {
      const querContinuar = confirm(
        `🎮 Progresso encontrado!\n\n` +
        `Herói: ${dadosSalvos.nome}\n` +
        `Nível: ${getEmojiNivel(classificarNivel(dadosSalvos.xp))} ${classificarNivel(dadosSalvos.xp)}\n` +
        `XP: ${dadosSalvos.xp}\n` +
        `Chefões: ${dadosSalvos.chefoesDerrotados || 0}\n` +
        `Conquistas: ${(dadosSalvos.conquistas || []).length}/${Object.keys(CONQUISTAS_DEFINICAO).length}\n\n` +
        `Deseja continuar de onde parou?`
      );

      if (querContinuar) {
        this.heroi = new Heroi(null, dadosSalvos);
        this.entrarNoJogo();
      }
    }
  }

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

  bindEventos() {
    const btnIniciar = document.getElementById('btn-iniciar');
    const inputNome = document.getElementById('input-nome');

    if (btnIniciar) btnIniciar.addEventListener('click', () => this.iniciarJogo());
    if (inputNome) {
      inputNome.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.iniciarJogo();
      });
    }

    document.querySelectorAll('.card-classe').forEach(card => {
      card.addEventListener('click', (e) => {
        som.clique();
        document.querySelectorAll('.card-classe').forEach(c => c.classList.remove('selecionada'));
        e.currentTarget.classList.add('selecionada');
        this.classeSelecionada = e.currentTarget.dataset.classe;
      });
    });

    document.querySelectorAll('.btn-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        som.clique();
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

    this.heroi = new Heroi(nome, null, this.classeSelecionada);
    this.heroi.salvar();
    this.entrarNoJogo();
  }

  entrarNoJogo() {
    this.atualizarPainelStatus();
    this.atualizarBarraChefao();
    document.getElementById('tela-login').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');
    this.mostrarResultado(`✨ Bem-vindo de volta, ${this.heroi.nome}! Escolha seu item para duelar!`);
  }

  // ========== ATUALIZAR BARRA DE CHEFÃO ==========
  atualizarBarraChefao() {
    if (!this.heroi) return;
    const vitorias = this.heroi.vitoriasDesdeUltimoChefe;
    const necessarias = 5;
    const porcentagem = Math.min(100, (vitorias / necessarias) * 100);

    const barra = document.getElementById('barra-chefao');
    const contador = document.getElementById('chefao-contador');
    const container = document.getElementById('barra-chefao-container');

    if (barra) barra.style.width = porcentagem + '%';
    if (contador) contador.textContent = `${vitorias} / ${necessarias} vitórias`;

    if (container) {
      if (vitorias >= necessarias) {
        container.classList.add('chefao-ativo');
      } else {
        container.classList.remove('chefao-ativo');
      }
    }
  }

  // ========== ESCOLHER AÇÃO (1 TURNO) ==========
  async escolherItem(itemEscolhido) {
    if (this.processando) return;
    this.processando = true;
    document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = true);

    // Inicia um novo combate se não houver um em andamento
    if (!this.combate) {
      const isChefao = this.heroi && this.heroi.vitoriasDesdeUltimoChefe >= 5;
      let nomeInimigo, emojiInimigo, chefaoAtual = null;

      if (isChefao) {
        chefaoAtual = getChefeAleatorio();
        nomeInimigo = `${chefaoAtual.titulo} ${chefaoAtual.nome}`;
        emojiInimigo = chefaoAtual.emoji;
      } else {
        nomeInimigo = getNomeInimigoAleatorio();
        emojiInimigo = "👹";
      }

      const combatenteHeroi = criarCombatenteHeroi(this.heroi);
      const combatenteInimigo = criarCombatenteInimigo(nomeInimigo, this.heroi.nivel, isChefao);

      this.combate = { heroi: combatenteHeroi, inimigo: combatenteInimigo, isChefao, chefaoAtual };
      this.nomeInimigoAtual = nomeInimigo;

      document.getElementById('combatente-nome-inimigo').textContent = nomeInimigo;
      document.getElementById('icone-inimigo').textContent = emojiInimigo;
      document.getElementById('vs-texto').textContent = isChefao ? "⚔️" : "VS";
      document.getElementById('elemento-badge-inimigo').textContent = EMOJI_ELEMENTO[combatenteInimigo.elemento] || "";
      this.atualizarBarrasCombate();

      if (isChefao) {
        som.chefaoAparece();
        this.mostrarResultado(getMensagemChefeAparece(chefaoAtual), "processando");
        await this.delay(1500);
      }
    }

    const combate = this.combate;

    // Segurança: se a ação não é permitida pela Stamina atual, força Escudo
    if (!getAcoesDisponiveis(combate.heroi).includes(itemEscolhido)) {
      itemEscolhido = 3;
    }

    const itemJogador = ITENS[itemEscolhido];
    const elItemHeroi = document.getElementById('item-heroi');
    elItemHeroi.textContent = itemJogador.emoji;
    elItemHeroi.classList.add('revelado', 'flip-revelar');

    document.getElementById('cartao-heroi').classList.add('ataque-heroi');
    som.ataque();
    this.mostrarResultado("⚔️ Duelando...", "processando");

    await this.delay(800);

    // IA escolhe a ação do inimigo, respeitando a Stamina dele
    let itemInimigo = combate.isChefao
      ? escolhaChefe(itemEscolhido, this.heroi.streak)
      : escolhaComputador();
    if (!getAcoesDisponiveis(combate.inimigo).includes(itemInimigo)) itemInimigo = 3;

    const elItemInimigo = document.getElementById('item-inimigo');
    elItemInimigo.textContent = ITENS[itemInimigo].emoji;
    elItemInimigo.classList.add('revelado', 'flip-revelar');
    document.getElementById('cartao-inimigo').classList.add('ataque-inimigo');

    await this.delay(600);

    const resultadoTurno = resolverTurno(combate.heroi, itemEscolhido, combate.inimigo, itemInimigo);
    this.atualizarBarrasCombate();

    const evento = resultadoTurno.eventos[0];
    let textoTurno;
    if (evento.tipo === "vitoria_turno" && evento.vencedor === "A") {
      textoTurno = `Seu(a) ${itemJogador.nome} causou ${evento.dano} de dano!`;
      document.getElementById('cartao-inimigo').classList.add('dano-recebido');
    } else if (evento.tipo === "vitoria_turno") {
      textoTurno = `${combate.inimigo.nome} causou ${evento.dano} de dano!`;
      document.getElementById('cartao-heroi').classList.add('dano-recebido');
    } else if (evento.tipo === "empate_troca") {
      textoTurno = `Ambos atacaram e trocaram ${evento.dano} de dano!`;
    } else {
      textoTurno = "Os dois se defenderam neste turno.";
    }
    this.mostrarResultado(textoTurno);

    await this.delay(1200);

    if (!resultadoTurno.combateEncerrado) {
      document.getElementById('item-heroi').classList.remove('revelado', 'flip-revelar');
      document.getElementById('item-inimigo').classList.remove('revelado', 'flip-revelar');
      document.getElementById('item-heroi').textContent = "?";
      document.getElementById('item-inimigo').textContent = "?";
      document.getElementById('cartao-heroi').classList.remove('ataque-heroi', 'dano-recebido');
      document.getElementById('cartao-inimigo').classList.remove('ataque-inimigo', 'dano-recebido');

      this.mostrarResultado("Escolha sua próxima ação!");
      this.atualizarBotoesDisponiveis();
      this.processando = false;
      return;
    }

    await this.finalizarCombate(resultadoTurno);
  }

  // ========== BARRAS DE HP/STAMINA ==========
  atualizarBarrasCombate() {
    if (!this.combate) return;
    this._atualizarBarraDe('heroi', this.combate.heroi);
    this._atualizarBarraDe('inimigo', this.combate.inimigo);
  }

  _atualizarBarraDe(lado, combatente) {
    const pctHp = Math.max(0, Math.round((combatente.hp / combatente.hpMax) * 100));
    const barraHp = document.getElementById(`barra-hp-${lado}`);
    const textoHp = document.getElementById(`hp-texto-${lado}`);
    const barraStamina = document.getElementById(`barra-stamina-${lado}`);

    if (barraHp) {
      barraHp.style.width = pctHp + '%';
      barraHp.classList.remove('hp-medio', 'hp-baixo');
      if (pctHp <= 25) barraHp.classList.add('hp-baixo');
      else if (pctHp <= 50) barraHp.classList.add('hp-medio');
    }
    if (textoHp) textoHp.textContent = `${combatente.hp}/${combatente.hpMax}`;
    if (barraStamina) barraStamina.style.width = Math.round((combatente.stamina / combatente.staminaMax) * 100) + '%';
  }

  // Desabilita botões de ataque quando a Stamina do herói acaba (só sobra Escudo)
  atualizarBotoesDisponiveis() {
    if (!this.combate) {
      document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = false);
      return;
    }
    const acoes = getAcoesDisponiveis(this.combate.heroi);
    document.getElementById('btn-orbe').disabled = !acoes.includes(1);
    document.getElementById('btn-espada').disabled = !acoes.includes(2);
    document.getElementById('btn-escudo').disabled = !acoes.includes(3);
  }

  // ========== FIM DO COMBATE (HP zerou) ==========
  async finalizarCombate(resultadoTurno) {
    const combate = this.combate;
    const ambosCairam = combate.heroi.hp <= 0 && combate.inimigo.hp <= 0;
    const venceuHeroi = !ambosCairam && resultadoTurno.vencedor === "A";

    let xpGanho = 0, bonusXp = 0, nivelSubiu = false, novasConquistas = [];
    let mensagemFinal, tipoResultado;

    if (ambosCairam) {
      const res = this.heroi.empatar();
      xpGanho = XP_POR_EMPATE;
      novasConquistas = res.novasConquistas;
      tipoResultado = "empate";
      mensagemFinal = `Vocês caíram juntos! Duelo empatado. (+${xpGanho} XP)`;

      som.empate();
      document.getElementById('cartao-heroi').classList.add('glow-empate');
      document.getElementById('cartao-inimigo').classList.add('glow-empate');
    } else if (venceuHeroi) {
      const isChefeDerrotado = combate.isChefao;
      const xpBase = isChefeDerrotado ? XP_POR_VITORIA + XP_CHEFAO_BONUS : XP_POR_VITORIA;
      const res = this.heroi.ganharXp(xpBase, isChefeDerrotado);
      xpGanho = res.xpGanho;
      bonusXp = res.bonus;
      nivelSubiu = res.nivelSubiu;
      novasConquistas = res.novasConquistas;
      tipoResultado = "vitoria";

      if (isChefeDerrotado) {
        this.heroi.vitoriasDesdeUltimoChefe = 0;
        this.heroi.salvar();
      }

      mensagemFinal = combate.isChefao
        ? getMensagemChefeDerrotado(combate.chefaoAtual)
        : `Você derrotou ${combate.inimigo.nome}!`;
      mensagemFinal += ` (+${xpGanho} XP)`;
      if (bonusXp > 0) mensagemFinal += ` [Bônus: +${bonusXp}]`;
      const msgStreak = getMensagemStreak(this.heroi.streak);
      if (msgStreak) mensagemFinal = msgStreak + "\n" + mensagemFinal;

      som.vitoria();
      document.getElementById('cartao-heroi').classList.add('glow-vitoria');
      document.getElementById('cartao-inimigo').classList.add('dano-recebido');
    } else {
      const res = this.heroi.perder();
      novasConquistas = res.novasConquistas;
      tipoResultado = "derrota";
      mensagemFinal = `${combate.inimigo.nome} venceu o duelo...`;

      som.derrota();
      document.getElementById('cartao-heroi').classList.add('glow-derrota', 'dano-recebido');
      document.getElementById('cartao-inimigo').classList.add('glow-vitoria');
    }

    this.mostrarResultado(mensagemFinal, tipoResultado);
    this.atualizarPainelStatus();
    this.atualizarBarraChefao();

    if (novasConquistas.length > 0) {
      await this.delay(300);
      for (const conquista of novasConquistas) {
        som.conquista();
        this.mostrarNotificacao("🏆 NOVA CONQUISTA!", `${conquista.emoji} ${conquista.nome}`, conquista.emoji, "#9b59b6");
        await this.delay(2500);
      }
    }

    if (nivelSubiu) {
      await this.delay(500);
      som.levelUp();
      this.mostrarNotificacao("LEVEL UP!", `Você alcançou o nível ${this.heroi.nivel}!`, "⭐", "#c9a227");
    }

    await this.delay(2500);
    this.limparAnimacoes();
    this.combate = null;
    document.getElementById('elemento-badge-inimigo').textContent = "";

    document.querySelectorAll('.btn-item').forEach(btn => btn.disabled = false);
    this.processando = false;
  }

  // ========== NOTIFICAÇÃO GENÉRICA ==========
  mostrarNotificacao(titulo, mensagem, icone, corBorda) {
    const notif = document.getElementById('notificacao-levelup');
    const tituloEl = document.getElementById('notif-titulo');
    const mensagemEl = document.getElementById('notif-mensagem');
    const iconeEl = document.getElementById('notif-icone');

    tituloEl.textContent = titulo;
    mensagemEl.innerHTML = mensagem;
    iconeEl.textContent = icone;

    notif.querySelector('.levelup-texto').style.borderColor = corBorda;

    notif.classList.add('ativo');

    setTimeout(() => {
      notif.classList.remove('ativo');
    }, 3000);
  }

  // ========== ATUALIZAR PAINEL ==========
  atualizarPainelStatus() {
    if (!this.heroi) return;
    const status = this.heroi.getStatus();

    document.getElementById('nome-heroi').textContent = status.nome;
    document.getElementById('avatar-heroi').textContent = status.avatar;
    document.getElementById('icone-heroi').textContent = status.avatar;
    document.getElementById('nivel-badge').textContent = `${status.emojiNivel} ${status.nivel}`;
    document.getElementById('nivel-badge').title = `${status.classe} • ${status.emojiElemento} ${status.elemento}`;
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
    document.getElementById('icone-inimigo').textContent = "👹";
    document.getElementById('vs-texto').textContent = "VS";
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
        <span class="status-label">🐉 Chefões Derrotados</span>
        <span class="status-valor destaque">${status.chefoesDerrotados || 0}</span>
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
      `Chefões: ${this.heroi.chefoesDerrotados}\n` +
      `Conquistas: ${this.heroi.conquistas.length}\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Deseja realmente reiniciar?`
    );

    if (confirmar) {
      Heroi.reiniciar();
      this.heroi = null;
      this.chefaoAtual = null;
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