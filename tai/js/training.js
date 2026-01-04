// training.js
import { saveSession } from './storage.js';

export let selection = [];

let index = 0;
let timer = null;
let remaining = 0;
let paused = false;
let fullscreen = false;

/* ===== AUDIO ===== */
const beep = new Audio('beep.mp3');
const ding = new Audio('ding.mp3');

function speak(text, cb) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.onend = cb;
  speechSynthesis.speak(u);
}

/* ===== SÉLECTION ===== */
export function addExercise(uv, name) {
  selection.push({ uv, name, duration: 5, done: 0 });
}

export function updateDuration(i, v) {
  selection[i].duration = parseInt(v, 10);
}

export function moveUp(i) {
  if (i > 0) [selection[i - 1], selection[i]] = [selection[i], selection[i - 1]];
}

export function moveDown(i) {
  if (i < selection.length - 1)
    [selection[i + 1], selection[i]] = [selection[i], selection[i + 1]];
}

export function removeExercise(i) {
  selection.splice(i, 1);
}

/* ===== ENTRAÎNEMENT ===== */
export function startTraining() {
  if (!selection.length) return alert('Aucun exercice');

  index = 0;
  speak("Commençons l'entraînement", () => {
    setTimeout(nextExercise, 1000);
  });
}

function nextExercise() {
  if (index >= selection.length) {
    speak("Entraînement terminé, à bientôt !");
    saveSession(selection);
    exitFullscreen();
    return;
  }

  const ex = selection[index];
  remaining = ex.duration * 60;

  document.getElementById('currentExercise').textContent = ex.name;
  document.getElementById('exerciseTime').textContent = format(remaining);

  if (fullscreen) enterFullscreen();

  speak(`Exercice ${index + 1} : ${ex.name}`, () => {
    setTimeout(() => {
      beep.play();
      startTimer();
    }, 2000);
  });
}

function startTimer() {
  clearInterval(timer);
  paused = false;

  timer = setInterval(() => {
    if (paused) return;

    remaining--;
    document.getElementById('exerciseTime').textContent = format(remaining);

    const progress =
      ((index + 1) - remaining / (selection[index].duration * 60)) /
      selection.length;
    document.getElementById('sessionProgress').value = progress * 100;

    if (remaining <= 0) {
      clearInterval(timer);
      ding.play();
      selection[index].done = selection[index].duration;

      speak("Fin de l'exercice", () => {
        index++;
        nextExercise();
      });
    }
  }, 1000);
}

/* ===== CONTROLES ===== */
export function pauseTraining() {
  paused = true;
}

export function resumeTraining() {
  paused = false;
}

export function stopTraining() {
  clearInterval(timer);
  speechSynthesis.cancel();
  exitFullscreen();
}

/* ===== FULLSCREEN ===== */
export function toggleFullscreen() {
  fullscreen = !fullscreen;
}

function enterFullscreen() {
  document.getElementById('trainingOverlay').style.display = 'flex';
}

function exitFullscreen() {
  document.getElementById('trainingOverlay').style.display = 'none';
}

/* ===== UTIL ===== */
function format(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
