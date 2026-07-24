/**
 * HERÓI RPG — Aplicação Principal
 * Inicialização e ponto de entrada
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🪄⚔️🛡️ Herói RPG v1.0 Web iniciado!');

  // Inicializa a UI
  const ui = new UI();

  // Foco no input de nome
  const inputNome = document.getElementById('input-nome');
  if (inputNome) {
    inputNome.focus();
  }
});
