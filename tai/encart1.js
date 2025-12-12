/* =============================================================
   ENCART 1 — UV1 KIHON (Fichier séparé encart1.js)
   - Lecture japonaise + ding
   - Timers contrôlés par sliders (intervalle dynamique)
   - Structure identique à UV5/UV6
============================================================= */

/* -------------------------------------------------------------
   Déblocage du moteur vocal
------------------------------------------------------------- */
function unlockSpeech() {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance("あ");
    u.lang = "ja-JP";
    u.rate = 0.01;
    u.volume = 0.001;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

/* Ding commun */
const ding = new Audio("ding.mp3");

function playDing(callback, delay = 3000) {
  ding.currentTime = 0;
  ding.play()
      .then(() => setTimeout(callback, delay))
      .catch(() => setTimeout(callback, delay));
}

/* =============================================================
   MODULE GÉNÉRIQUE DE LECTURE
   Simplifie la gestion Lecture / Stop
============================================================= */
function createReader() {
  return {
    reading: false,
    timer: null,

    start(callback, intervalMs) {
      if (this.reading) return;
      this.reading = true;

      let index = 0;

      // délai avant premier ding (5s)
      setTimeout(() => {
        const step = () => {
          if (!this.reading) return;

          // ding → voix
          playDing(() => {
            callback(index);

            index++;
            if (!this.reading || callback.done(index)) {
              this.reading = false;
              return;
            }

            // prochain cycle
            this.timer = setTimeout(step, intervalMs);
          });

        };

        step();
      }, 5000);
    },

    stop() {
      this.reading = false;
      if (this.timer) clearTimeout(this.timer);
      try { speechSynthesis.cancel(); } catch (e) {}
    }
  };
}

/* =============================================================
   KIHON SIMPLES
============================================================= */

let KS_DATA = [];
let KS_SELECTED = [];
const KS_READER = createReader();

async function ksLoad() {
  try {
    const res = await fetch("kihon_simples.json");
    KS_DATA = (await res.json()).kihon;
  } catch (e) { console.error("Erreur JSON Kihon simples", e); }
}

function ksGenerate() {
  const n = parseInt(ksCount.value) || 3;
  KS_SELECTED = [];

  for (let i = 0; i < n; i++) {
    KS_SELECTED.push(
      KS_DATA[Math.floor(Math.random() * KS_DATA.length)]
    );
  }

  ksResult.innerHTML = KS_SELECTED.map((x, i) => `
    <p><b>${i + 1}.</b> ${x.romaji}<br><i>${x.jp}</i></p>
  `).join("");
}

function ksSpeak(i) {
  const u = new SpeechSynthesisUtterance(KS_SELECTED[i].jp);
  u.lang = "ja-JP";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

function ksRead() {
  if (!KS_SELECTED.length) return;
  unlockSpeech().then(() => {
    const intervalMs = parseInt(ksInterval.value) * 1000;
    KS_READER.start((index) => {
      ksSpeak(index);
    }, intervalMs);

    KS_READER.start.done = (index) => (index >= KS_SELECTED.length);
  });
}

function ksStop() { KS_READER.stop(); }

/* =============================================================
   ENCHAÎNEMENTS KIHON
============================================================= */

let KC_DATA = [];
let KC_SELECTED = [];
const KC_READER = createReader();

async function kcLoad() {
  try {
    const res = await fetch("kihon_enchainements.json");
    KC_DATA = (await res.json()).enchaînements;
  } catch (e) { console.error("Erreur JSON Enchaînements", e); }
}

function kcGenerate() {
  const n = parseInt(kcCount.value) || 2;
  KC_SELECTED = [];

  for (let i = 0; i < n; i++) {
    KC_SELECTED.push(
      KC_DATA[Math.floor(Math.random() * KC_DATA.length)]
    );
  }

  kcResult.innerHTML = KC_SELECTED.map((x, i) => `
    <p><b>${i + 1}.</b> ${x.fr}<br><i>${x.jp}</i></p>
  `).join("");
}

function kcSpeak(i) {
  const u = new SpeechSynthesisUtterance(KC_SELECTED[i].jp);
  u.lang = "ja-JP";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

function kcRead() {
  if (!KC_SELECTED.length) return;
  unlockSpeech().then(() => {
    const intervalMs = parseInt(kcInterval.value) * 1000;
    KC_READER.start((index) => {
      kcSpeak(index);
    }, intervalMs);

    KC_READER.start.done = (index) => (index >= KC_SELECTED.length);
  });
}

function kcStop() { KC_READER.stop(); }

/* =============================================================
   TECHNIQUES DE COMBAT (FR)
============================================================= */

const KCB_LIST = [
  "Mae Geri, de la jambe arrière posée derrière, niveau chudan",
  "Mawashi Geri, de la jambe arrière posée derrière, niveau jodan ou chudan",
  "Mae Geri de la jambe avant avec sursaut, niveau chudan",
  "Mawashi Geri, de la jambe avant avec sursaut, niveau jodan ou chudan",
  "Gyaku Zuki chudan",
  "Kizami Zuki/Maete Zuki suivi de Gyaku Zuki",
  "Oï Zuki jodan, retour arrière"
];

let KCB_SELECTED = [];
const KCB_READER = createReader();

function kcbGenerate() {
  KCB_SELECTED = [...KCB_LIST].sort(() => 0.5 - Math.random()).slice(0, 3);
  kcbResult.innerHTML = KCB_SELECTED.map(x => `<p>• ${x}</p>`).join("");
}

function kcbSpeak(i) {
  const u = new SpeechSynthesisUtterance(KCB_SELECTED[i]);
  u.lang = "fr-FR";
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

function kcbRead() {
  if (!KCB_SELECTED.length) return;

  const intervalMs = parseInt(kcbInterval.value) * 1000;
  KCB_READER.start((index) => {
    kcbSpeak(index);
  }, intervalMs);

  KCB_READER.start.done = (index) => (index >= KCB_SELECTED.length);
}

function kcbStop() { KCB_READER.stop(); }

/* =============================================================
   INITIALISATION
============================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // Mise à jour dynamique des sliders
  ksInterval.addEventListener("input", () =>
    ksIntervalDisplay.textContent = ksInterval.value + "s"
  );
  kcInterval.addEventListener("input", () =>
    kcIntervalDisplay.textContent = kcInterval.value + "s"
  );
  kcbInterval.addEventListener("input", () =>
    kcbIntervalDisplay.textContent = kcbInterval.value + "s"
  );

  // Chargement JSON
  ksLoad();
  kcLoad();

  // Boutons UV1
  ksGenerateBtn.onclick = ksGenerate;
  ksReadBtn.onclick = ksRead;
  ksStopBtn.onclick = ksStop;

  kcGenerateBtn.onclick = kcGenerate;
  kcReadBtn.onclick = kcRead;
  kcStopBtn.onclick = kcStop;

  kcbGenerateBtn.onclick = kcbGenerate;
  kcbReadBtn.onclick = kcbRead;
  kcbStopBtn.onclick = kcbStop;

});
