/* =============================================================
   ENCART 1 – UV1 KIHON
   Code propre, structuré et entièrement autonome
   Gère :
   - Kihon simples (JSON)
   - Enchaînements kihon (JSON)
   - Techniques combat (liste fixe)
   - Lecture japonaise / française avec ding, délais, vitesse
   ============================================================= */

/* -------------------------------------------------------------
   GLOBAL : Déblocage vocal + ding
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

const ding = new Audio("ding.mp3");

function playDing(callback) {
  ding.currentTime = 0;
  ding.play().then(() => {
    setTimeout(callback, 3000); // 3 secondes après ding
  }).catch(() => setTimeout(callback, 3000));
}

/* =============================================================
   SCRIPT 1 — KIHON SIMPLES
============================================================= */

let KS_DATA = [];
let KS_SELECTED = [];

async function ksLoad() {
  try {
    const res = await fetch("kihon_simples.json");
    const json = await res.json();
    KS_DATA = json.kihon;
  } catch (e) {
    console.error("Erreur JSON Kihon Simples :", e);
  }
}

function ksGenerate() {
  const n = parseInt(document.getElementById("ks-count").value) || 3;
  KS_SELECTED = [];

  for (let i = 0; i < n; i++) {
    KS_SELECTED.push(KS_DATA[Math.floor(Math.random() * KS_DATA.length)]);
  }

  ksDisplay();
}

function ksDisplay() {
  const zone = document.getElementById("ks-result");
  zone.innerHTML = KS_SELECTED.map((x, i) => `
    <p><b>${i + 1}.</b> ${x.romaji}<br><i>${x.jp}</i></p>
  `).join("");
}

async function ksRead() {
  if (KS_SELECTED.length === 0) return;
  await unlockSpeech();

  let index = 0;
  setTimeout(() => {
    playDing(() => {
      ksSpeak(index++);

      const loop = setInterval(() => {
        if (index >= KS_SELECTED.length) {
          clearInterval(loop);
          return;
        }
        playDing(() => ksSpeak(index++));
      }, 60000); // 1 min entre techniques

    });
  }, 5000); // 5 sec avant premier ding
}

function ksSpeak(i) {
  const u = new SpeechSynthesisUtterance(KS_SELECTED[i].jp);
  u.lang = "ja-JP";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

/* =============================================================
   SCRIPT 2 — ENCHAÎNEMENTS KIHON
============================================================= */

let KC_DATA = [];
let KC_SELECTED = [];

async function kcLoad() {
  try {
    const res = await fetch("kihon_enchainements.json");
    const json = await res.json();
    KC_DATA = json.enchaînements;
  } catch (e) {
    console.error("Erreur JSON Enchaînements :", e);
  }
}

function kcGenerate() {
  const n = parseInt(document.getElementById("kc-count").value) || 2;
  KC_SELECTED = [];

  for (let i = 0; i < n; i++) {
    KC_SELECTED.push(KC_DATA[Math.floor(Math.random() * KC_DATA.length)]);
  }

  kcDisplay();
}

function kcDisplay() {
  const zone = document.getElementById("kc-result");
  zone.innerHTML = KC_SELECTED.map((e, i) => `
    <p><b>${i + 1}.</b> ${e.fr}<br><i>${e.jp}</i></p>
  `).join("");
}

async function kcRead() {
  if (KC_SELECTED.length === 0) return;
  await unlockSpeech();

  let index = 0;
  setTimeout(() => {
    playDing(() => {
      kcSpeak(index++);

      const loop = setInterval(() => {
        if (index >= KC_SELECTED.length) {
          clearInterval(loop);
          return;
        }
        playDing(() => kcSpeak(index++));
      }, 60000);
    });
  }, 5000);
}

function kcSpeak(i) {
  const u = new SpeechSynthesisUtterance(KC_SELECTED[i].jp);
  u.lang = "ja-JP";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

/* =============================================================
   SCRIPT 3 — TECHNIQUES COMBAT (FR)
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

function kcbGenerate() {
  KCB_SELECTED = [...KCB_LIST].sort(() => 0.5 - Math.random()).slice(0, 3);
  document.getElementById("kcb-result").innerHTML =
    KCB_SELECTED.map(x => `<p>• ${x}</p>`).join("");
}

function kcbRead() {
  if (KCB_SELECTED.length === 0) return;

  let index = 0;
  setTimeout(() => {
    playDing(() => {
      kcbSpeak(index++);

      const loop = setInterval(() => {
        if (index >= KCB_SELECTED.length) {
          clearInterval(loop);
          return;
        }
        playDing(() => kcbSpeak(index++));
      }, 60000);
    });
  }, 5000);
}

function kcbSpeak(i) {
  const u = new SpeechSynthesisUtterance(KCB_SELECTED[i]);
  u.lang = "fr-FR";
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

/* =============================================================
   INITIALISATION
============================================================= */

window.addEventListener("DOMContentLoaded", () => {
  // Kihon simples
  ksLoad();
  document.getElementById("ks-generate").onclick = ksGenerate;
  document.getElementById("ks-read").onclick = ksRead;

  // Enchaînements
  kcLoad();
  document.getElementById("kc-generate").onclick = kcGenerate;
  document.getElementById("kc-read").onclick = kcRead;

  // Combat
  kcbGenerate();
  document.getElementById("kcb-generate").onclick = kcbGenerate;
  document.getElementById("kcb-read").onclick = kcbRead;
});
