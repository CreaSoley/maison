import { bankData } from './data.js';
import { selection, startTraining, toggleFullscreen } from './training.js';
import { saveSelection, loadSelection, loadGoals, saveGoals } from './storage.js';

export function renderBank(containerId) {
  const bank = document.getElementById(containerId);
  bank.innerHTML = '';
  bankData.forEach(u => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${u.uv}</h3>`;
    u.items.forEach(n => {
      div.innerHTML += `<div class="exercise"><span>${n}</span> <button onclick="addExercise('${u.uv}','${n}')">➕</button></div>`;
    });
    bank.appendChild(div);
  });
}

export function renderSelection(containerId) {
  const selEl = document.getElementById(containerId);
  selEl.innerHTML = '';
  if (!selection.length) { selEl.innerHTML = '<em>Aucun exercice sélectionné</em>'; return; }
  selection.forEach((ex, i) => {
    const div = document.createElement('div');
    div.className = 'exercise selected';
    div.innerHTML = `
      ${ex.uv} – ${ex.name}
      <div>
        <input type="range" min="1" max="60" value="${ex.duration}" oninput="updateDuration(${i},this.value)">
        ${ex.duration} min
        <button onclick="moveUp(${i})">⬆️</button>
        <button onclick="moveDown(${i})">⬇️</button>
        <button onclick="removeExercise(${i})">❌</button>
      </div>
    `;
    selEl.appendChild(div);
  });
}

export function renderGoals(containerId) {
  const gEl = document.getElementById(containerId);
  gEl.innerHTML = '';
  const goals = loadGoals();
  selection.forEach(ex => {
    if (!goals[ex.name]) goals[ex.name] = 30;
    const pct = Math.min(100, Math.round((ex.doneMinutes||0) / goals[ex.name] * 100));
    gEl.innerHTML += `<div>
      <strong>${ex.name}</strong><br>
      Objectif <input type="number" value="${goals[ex.name]}" onchange="setGoal('${ex.name}',this.value)"> min
      <progress value="${pct}" max="100"></progress>
      ${pct}%
    </div>`;
  });
  saveGoals(goals);
}
