/* =========================
   ÉTAT GLOBAL
========================= */
let assauts = [];
let currentAssaut = null;
let sequence = [];

let playing = false;
let loop = false;
let randomMode = false;
let repetitions = 1;

/* =========================
   AUDIO
========================= */
const notif = new Audio("notif.mp3");
const bbp = new Audio("bbp.mp3");

/* =========================
   LOAD JSON
========================= */
fetch("exercices_assauts.json")
  .then(r => r.json())
  .then(d => {
    assauts = d.exercices;
    init();
  });

/* =========================
   INIT
========================= */
function init() {
  fillAssautSelect();
  renderChips();
  bindUI();
  loadSavedSequences();
}

/* =========================
   UI BINDINGS
========================= */
function bindUI() {

  speechSpeed.oninput = () => speedVal.textContent = speechSpeed.value;
  intervalRange.oninput = () => intervalVal.textContent = intervalRange.value;

  assautSelect.onchange = e => {
    currentAssaut = assauts[e.target.value];
    renderFiche(currentAssaut);
  };

  assautRandom.onclick = () => {
    currentAssaut = assauts[Math.floor(Math.random() * assauts.length)];
    renderFiche(currentAssaut);
  };

  playAssaut.onclick = () => speak(buildSpeech(currentAssaut), speechSpeed.value);
  stopAssaut.onclick = stopSpeech;
  printAssaut.onclick = () => window.print();

  /* Séquence */
  playSequence.onclick = playSequenceHandler;
  stopSequence.onclick = stopSequenceHandler;

  loopSeq.onclick = () => toggleMode("loop");
  randomSeq.onclick = () => toggleMode("random");

  repetitionsSelect.onchange = () => {
    repetitions = +repetitionsSelect.value;
    if (repetitions > 1) {
      loop = false;
      loopSeq.classList.remove("active");
    }
  };

  saveSeq.onclick = saveSequence;
  loadSeq.onchange = loadSequence;
}

/* =========================
   EXERCICE 1
========================= */
function fillAssautSelect() {
  assautSelect.innerHTML = `<option value="">Choisir un assaut</option>`;
  assauts.forEach((a, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = a.assaut;
    assautSelect.appendChild(o);
  });
}

function renderFiche(a) {
  assautFiche.innerHTML = `
  <div class="fiche-card">
    <div class="fiche-header">
      <img src="${a.image}">
      <h3>${a.assaut}</h3>
    </div>

    <p class="fiche-objectif">🎯 ${a.objectif}</p>

    <div class="fiche-row">
      <div>
        <h4>🧠 Points clés</h4>
        <ul>${a.points_cles.map(p => `<li>${p}</li>`).join("")}</ul>
      </div>
      <div>
        <h4>⚠️ Erreurs à éviter</h4>
        <ul>${a.erreurs_a_eviter.map(e => `<li>${e}</li>`).join("")}</ul>
      </div>
    </div>

    <h4>📜 Déroulé</h4>
    <div class="deroule-grid">
      ${a.deroule.map(d => `<p>${d.etape}. ${d.texte}</p>`).join("")}
    </div>
  </div>`;
}

function buildSpeech(a) {
  return `
Aujourd’hui, nous travaillons sur ${a.assaut}.
Objectif. ${a.objectif}.
Points clés. ${a.points_cles.join(", ")}.
Erreurs à éviter. ${a.erreurs_a_eviter.join(", ")}.
Commençons.
${a.deroule.map(d => `Étape ${d.etape}. ${d.texte}.`).join(" ")}
`;
}

function speak(text, rate = 1) {
  stopSpeech();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = rate;
  speechSynthesis.speak(u);
}

function stopSpeech() {
  speechSynthesis.cancel();
}
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

/* =========================
   EXERCICE 2 – SÉQUENCE
========================= */
function renderChips() {
  assautList.innerHTML = "";
  assauts.forEach(a => {
    const c = document.createElement("button");
    c.className = "chip";
    c.textContent = a.assaut;
    c.onclick = () => {
      sequence.push(a);
      renderSequence();
    };
    assautList.appendChild(c);
  });
}

function renderSequence() {
  sequenceZone.innerHTML = "";
  sequence.forEach((a, i) => {
    const row = document.createElement("div");
    row.className = "sequence-item";

    row.innerHTML = `
      <span>${a.assaut}</span>
      <div class="seq-actions">
        <button>⬆️</button>
        <button>⬇️</button>
        <button>❌</button>
      </div>
    `;

    const [up, down, del] = row.querySelectorAll("button");

    up.onclick = () => i > 0 && swap(i, i - 1);
    down.onclick = () => i < sequence.length - 1 && swap(i, i + 1);
    del.onclick = () => {
      sequence.splice(i, 1);
      renderSequence();
    };

    sequenceZone.appendChild(row);
  });
}

function swap(i, j) {
  [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  renderSequence();
}

/* =========================
   LECTURE SÉQUENCE
========================= */
async function playSequenceHandler() {
  if (!sequence.length) return;

  playing = true;
  await wait(5000);

  const runs = loop ? Infinity : repetitions;

  for (let r = 0; r < runs && playing; r++) {
    const list = randomMode ? shuffle([...sequence]) : sequence;

    for (let a of list) {
      if (!playing) break;
      notif.play();
      await wait(1000);
      speak(a.assaut);
      await wait(intervalRange.value * 1000);
    }
    bbp.play();
  }
}

function stopSequenceHandler() {
  playing = false;
  stopSpeech();
}

/* =========================
   MODES
========================= */
function toggleMode(type) {
  if (type === "loop") {
    loop = !loop;
    loopSeq.classList.toggle("active", loop);
    if (loop) {
      repetitions = 1;
      repetitionsSelect.value = "1";
    }
  }

  if (type === "random") {
    randomMode = !randomMode;
    randomSeq.classList.toggle("active", randomMode);
  }
}

/* =========================
   SAUVEGARDE
========================= */
function saveSequence() {
  const name = saveName.value.trim();
  if (!name || !sequence.length) return;

  const all = JSON.parse(localStorage.getItem("assautSequences") || "{}");
  all[name] = sequence.map(a => a.assaut);
  localStorage.setItem("assautSequences", JSON.stringify(all));
  loadSavedSequences();
}

function loadSavedSequences() {
  loadSeq.innerHTML = `<option value="">Charger</option>`;
  const all = JSON.parse(localStorage.getItem("assautSequences") || "{}");
  Object.keys(all).forEach(k => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = k;
    loadSeq.appendChild(o);
  });
}

function loadSequence() {
  const all = JSON.parse(localStorage.getItem("assautSequences"));
  sequence = all[loadSeq.value].map(n => assauts.find(a => a.assaut === n));
  renderSequence();
}

/* =========================
   UTILS
========================= */
const wait = ms => new Promise(r => setTimeout(r, ms));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
