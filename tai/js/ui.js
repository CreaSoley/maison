import { bankData } from './data.js';
import {
  selection,
  addExercise,
  removeExercise,
  moveUp,
  moveDown,
  updateDuration
} from './training.js';
import { loadGoals, saveGoals } from './storage.js';

/* 🔑 expose les fonctions nécessaires au HTML inline */
window.addExercise = addExercise;
window.removeExercise = removeExercise;
window.moveUp = moveUp;
window.moveDown = moveDown;
window.updateDuration = updateDuration;
window.setGoal = setGoal;

/* =========================
   BANQUE D’EXERCICES
========================= */
export function renderBank(containerId) {
  const bank = document.getElementById(containerId);
  if (!bank) return;

  bank.innerHTML = '';

  bankData.forEach(u => {
    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `<h3>${u.uv}</h3>`;

    u.exercises.forEach(name => {
      const row = document.createElement('div');
      row.className = 'exercise';
      row.innerHTML = `
        <span>${name}</span>
        <button class="btn" onclick="addExercise('${u.uv}','${name}')">➕</button>
      `;
      div.appendChild(row);
    });

    bank.appendChild(div);
  });
}

/* =========================
   SÉLECTION
========================= */
export function renderSelection(containerId) {
  const selEl = document.getElementById(containerId);
  if (!selEl) return;

  selEl.innerHTML = '';

  if (!selection.length) {
    selEl.innerHTML = '<em>Aucun exercice sélectionné</em>';
    return;
  }

  selection.forEach((ex, i) => {
    const div = document.createElement('div');
    div.className = 'exercise selected';

    div.innerHTML = `
      <strong>${ex.uv}</strong> – ${ex.name}
      <div class="btn-row">
        <input type="range" min="1" max="60" value="${ex.duration}"
          oninput="updateDuration(${i}, this.value)">
        ${ex.duration} min
        <button onclick="moveUp(${i})">⬆️</button>
        <button onclick="moveDown(${i})">⬇️</button>
        <button onclick="removeExercise(${i})">❌</button>
      </div>
    `;

    selEl.appendChild(div);
  });
}

/* =========================
   OBJECTIFS
========================= */
export function renderGoals(containerId) {
  const gEl = document.getElementById(containerId);
  if (!gEl) return;

  const goals = loadGoals();
  gEl.innerHTML = '';

  selection.forEach(ex => {
    if (!goals[ex.name]) goals[ex.name] = 30;

    const done = ex.doneMinutes || 0;
    const target = goals[ex.name];
    const pct = Math.min(100, Math.round((done / target) * 100));

    gEl.innerHTML += `
      <div class="card">
        <strong>${ex.name}</strong><br>
        Objectif :
        <input type="number" value="${target}"
          onchange="setGoal('${ex.name}', this.value)"> min
        <progress value="${pct}" max="100"></progress>
        ${pct}%
      </div>
    `;
  });

  saveGoals(goals);
}

/* =========================
   SET GOAL
========================= */
function setGoal(name, value) {
  const goals = loadGoals();
  goals[name] = Number(value);
  saveGoals(goals);
}
