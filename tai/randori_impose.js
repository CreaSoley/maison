/* =========================================
   VARIABLES GLOBALES
========================================= */

let sequence = [];
let isPlaying = false;
let isLoop = false;
let isRandom = false;
let currentTimer = null;

/* =========================================
   DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindUI();
}

/* =========================================
   BIND UI
========================================= */

function bindUI() {
  const playBtn = document.getElementById("playSequence");
  const stopBtn = document.getElementById("stopSequence");
  const loopBtn = document.getElementById("loopSeq");
  const randomBtn = document.getElementById("randomSeq");
  const intervalRange = document.getElementById("intervalRange");
  const intervalVal = document.getElementById("intervalVal");
  const repeatSelect = document.getElementById("repeatCount");
  const printBtn = document.getElementById("printAssaut");

  if (intervalRange && intervalVal) {
    intervalVal.textContent = intervalRange.value;
    intervalRange.oninput = () => {
      intervalVal.textContent = intervalRange.value;
    };
  }

  playBtn?.addEventListener("click", startSequence);
  stopBtn?.addEventListener("click", stopSequence);

  loopBtn?.addEventListener("click", () => {
    isLoop = !isLoop;
    loopBtn.classList.toggle("mode-active", isLoop);
    if (isLoop) {
      isRandom = false;
      randomBtn.classList.remove("mode-active");
    }
  });

  randomBtn?.addEventListener("click", () => {
    isRandom = !isRandom;
    randomBtn.classList.toggle("mode-active", isRandom);
    if (isRandom) {
      isLoop = false;
      loopBtn.classList.remove("mode-active");
    }
  });

  printBtn?.addEventListener("click", exportPDF);
}

/* =========================================
   LECTURE SÉQUENCE
========================================= */

function startSequence() {
  if (!sequence.length || isPlaying) return;

  isPlaying = true;
  document.getElementById("playSequence")?.classList.add("playing");

  const interval = Number(document.getElementById("intervalRange")?.value || 10) * 1000;
  const repeatCount = Number(document.getElementById("repeatCount")?.value || 1);

  let list = [...sequence];
  if (isRandom) shuffle(list);

  let totalRuns = repeatCount === 0 ? Infinity : repeatCount;
  let run = 0;
  let index = 0;

  function playNext() {
    if (!isPlaying) return;

    if (index >= list.length) {
      index = 0;
      run++;
      if (!isLoop && run >= totalRuns) {
        stopSequence();
        return;
      }
      if (isRandom) shuffle(list);
    }

    const assaut = list[index];
    speak(assaut.assaut || assaut);
    index++;

    currentTimer = setTimeout(playNext, interval);
  }

  playNext();
}

function stopSequence() {
  isPlaying = false;
  clearTimeout(currentTimer);
  document.getElementById("playSequence")?.classList.remove("playing");
}

/* =========================================
   SYNTHÈSE VOCALE (si présente)
========================================= */

function speak(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* =========================================
   EXPORT PDF – EXERCICE 1 UNIQUEMENT
========================================= */

function exportPDF() {
  const content = document.getElementById("print-zone");
  if (!content) return;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Fiche Exercice 1</title>
        <style>
          body { font-family: Arial; padding: 20px; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);
  win.document.close();
}

/* =========================================
   OUTILS
========================================= */

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
