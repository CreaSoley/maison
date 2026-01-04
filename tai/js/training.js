// js/training.js
import { speak, safePlay } from "./audio.js";

let index = 0;
let timer = null;

export function startTraining(sequence, ui, sounds) {
  if (!sequence.length) return;

  index = 0;
  speak("Commençons l'entraînement", () => {
    next(sequence, ui, sounds);
  });
}

function next(sequence, ui, sounds) {
  if (index >= sequence.length) {
    speak("Entraînement terminé, à bientôt !");
    ui.onFinish();
    return;
  }

  const ex = sequence[index];
  ui.showExercise(ex, index, sequence.length);

  speak(`Exercice ${index + 1} ${ex.name}`, () => {
    setTimeout(() => {
      safePlay(sounds.beep);

      let remaining = ex.duration * 60;
      ui.updateTimer(remaining);

      clearInterval(timer);
      timer = setInterval(() => {
        remaining--;
        ui.updateTimer(remaining);
        ui.updateProgress(index, remaining, ex.duration, sequence.length);

        if (remaining <= 0) {
          clearInterval(timer);
          safePlay(sounds.ding);

          speak("Fin de l'exercice", () => {
            index++;
            next(sequence, ui, sounds);
          });
        }
      }, 1000);
    }, 1000);
  });
}
