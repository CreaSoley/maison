// ui.js
import { bankData } from './data.js';
import {
  selection,
  addExercise,
  moveUp,
  moveDown,
  removeExercise,
  updateDuration,
  startTraining,
  pauseTraining,
  resumeTraining,
  stopTraining,
  toggleFullscreen
} from './training.js';

export function initUI() {
  renderBank();
  renderSelection();

  document.getElementById('startBtn')?.addEventListener('click', startTraining);
  document.getElementById('pauseBtn')?.addEventListener('click', pauseTraining);
  document.getElementById('resumeBtn')?.addEventListener('click', resumeTraining);
  document.getElementById('stopBtn')?.addEventListener('click', stopTraining);
  document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
}

/* ===== BANQUE ===== */
export function renderBank() {
  const bank = document.getElementById('bank');
  bank.innerHTML = '';

  bankData.forEach(uv => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = uv.uv;
    card.appendChild(title);

    uv.items.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = name;

      btn.addEventListener('click', () => {
        addExercise(uv.uv, name);
        renderSelection();
      });

      card.appendChild(btn);
    });

    bank.appendChild(card);
  });
}

/* ===== SÉLECTION ===== */
export function renderSelection() {
  const sel = document.getElementById('selection');
  sel.innerHTML = '';

  if (!selection.length) {
    sel.innerHTML = '<em>Aucun exercice sélectionné</em>';
    return;
  }

  selection.forEach((ex, i) => {
    const row = document.createElement('div');
    row.className = 'sequence-item';

    row.innerHTML = `
      <strong>${ex.uv}</strong> – ${ex.name}<br>
      <input type="range" min="1" max="60" value="${ex.duration}">
      <span>${ex.duration} min</span>
      <button>⬆️</button>
      <button>⬇️</button>
      <button>❌</button>
    `;

    const [range, , up, down, del] = row.querySelectorAll('input,button');

    range.addEventListener('input', e => {
      updateDuration(i, e.target.value);
      renderSelection();
    });

    up.addEventListener('click', () => {
      moveUp(i);
      renderSelection();
    });

    down.addEventListener('click', () => {
      moveDown(i);
      renderSelection();
    });

    del.addEventListener('click', () => {
      removeExercise(i);
      renderSelection();
    });

    sel.appendChild(row);
  });
}
