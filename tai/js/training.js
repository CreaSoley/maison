import { speak, playBeep, playDing } from './audio.js';
import { saveSessions, loadSessions } from './storage.js';

let seqIndex = 0;
let timer = null;

export let currentSessionName = '';
export let selection = [];
export let fullscreen = false;
export let trainingOverlay, timerEl, progressEl;

export function startTraining(sel, sessionName, overlay, timerElement, progressBar) {
  selection = sel;
  currentSessionName = sessionName;
  trainingOverlay = overlay;
  timerEl = timerElement;
  progressEl = progressBar;
  seqIndex = 0;
  nextExercise();
}

export function nextExercise() {
  if (seqIndex >= selection.length) {
    speak("Entraînement terminé, à bientôt !");
    if (fullscreen) trainingOverlay.style.display = 'none';
    return;
  }

  const ex = selection[seqIndex];
  if (fullscreen) trainingOverlay.style.display = 'flex';
  timerEl.textContent = `${ex.duration}:00`;

  speak(`Exercice ${seqIndex + 1}: ${ex.name}`, () => {
    setTimeout(() => {
      playBeep();
      let remaining = ex.duration * 60;
      clearInterval(timer);
      timer = setInterval(() => {
        remaining--;
        const min = Math.floor(remaining / 60).toString().padStart(2, '0');
        const sec = (remaining % 60).toString().padStart(2, '0');
        timerEl.textContent = `${min}:${sec}`;
        progressEl.value = ((seqIndex + (ex.duration*60-remaining)/(ex.duration*60)) / selection.length) * 100;

        if (remaining <= 0) {
          clearInterval(timer);
          playDing();
          // enregistrer durée réelle
          const sessions = loadSessions();
          if (sessions[currentSessionName]) {
            sessions[currentSessionName].exercises[seqIndex].doneMinutes = ex.duration;
            saveSessions(sessions);
          }
          speak("Fin de l'exercice", () => {
            seqIndex++;
            nextExercise();
          });
        }
      }, 1000);
    }, 2000);
  });
}

export function toggleFullscreen() {
  fullscreen = !fullscreen;
  if (trainingOverlay) trainingOverlay.style.display = fullscreen ? 'flex' : 'none';
}
