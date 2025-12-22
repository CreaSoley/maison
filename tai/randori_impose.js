/* ===============================
   DONNÉES
================================ */
let assauts = [];
let currentAssaut = null;
let sequence = [];
let utterance = null;
let playing = false;
let loop = false;

const notif = new Audio("notif.mp3");
const bbp = new Audio("bbp.mp3");

/* ===============================
   LOAD JSON
================================ */
fetch("exercices_assauts.json")
  .then(r => r.json())
  .then(d => {
    assauts = d.exercices;
    init();
  });

/* ===============================
   INIT
================================ */
function init() {
  fillAssauts();
  renderChips();
  bindUI();
  loadSavedList();
}

/* ===============================
   UI
================================ */
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
  coachMode.onclick = () => coach(currentAssaut);
  printAssaut.onclick = () => window.print();

  playSequence.onclick = playSequenceHandler;
  stopSequence.onclick = stopAll;
  loopSeq.onclick = () => loop = !loop;
  randomSeq.onclick = () => shuffle(sequence);

  saveSeq.onclick = saveNamedSequence;
  loadSeq.onchange = loadNamedSequence;

  fullscreen.onclick = toggleFullscreen;
}

/* ===============================
   EXERCICE 1
================================ */
function renderFiche(a) {
  assautFiche.innerHTML = `
  <div class="fiche-card">
    <div class="fiche-header">
      <img src="${a.image}" style="width:5cm;height:5cm;object-fit:contain">
      <h3 class="tech-title">${a.assaut}</h3>
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
Objectif : ${a.objectif}.
Points clés : ${a.points_cles.join(", ")}.
Erreurs à éviter : ${a.erreurs_a_eviter.join(", ")}.
Commençons.
${a.deroule.map(d => `Étape ${d.etape}. ${d.texte}.`).join(" ")}
`;
}

function speak(t, rate = 1) {
  stopSpeech();
  utterance = new SpeechSynthesisUtterance(t);
  utterance.lang = "fr-FR";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  speechSynthesis.cancel();
}

/* ===============================
   MODE COACH
================================ */
async function coach(a) {
  await wait(5000);
  for (let d of a.deroule) {
    speak(`Étape ${d.etape}`);
    await wait(1500);
    speak(d.texte, 0.9);
    await wait(3000);
  }
  speak("Fin. Zanshin.");
}

/* ===============================
   EXERCICE 2
================================ */
function renderChips() {
  assautList.innerHTML = "";
  assauts.forEach(a => {
    const c = document.createElement("div");
    c.className = "chip";
    c.textContent = a.assaut;
    c.onclick = () => addToSequence(a);
    assautList.appendChild(c);
  });
}

function addToSequence(a) {
  sequence.push(a);
  renderSequence();
}

function renderSequence() {
  sequenceZone.innerHTML = "";
  sequence.forEach((a, i) => {
    const c = document.createElement("div");
    c.className = "chip selected";
    c.textContent = a.assaut;
    c.onclick = () => {
      sequence.splice(i, 1);
      renderSequence();
    };
    sequenceZone.appendChild(c);
  });
}

async function playSequenceHandler() {
  if (!sequence.length) return;
  playing = true;
  await wait(5000);

  do {
    for (let a of sequence) {
      if (!playing) break;
      notif.play();
      await wait(1000);
      speak(a.assaut);
      await wait(intervalRange.value * 1000);
    }
    bbp.play();
  } while (loop && playing);

  generateQR();
}

/* ===============================
   SAUVEGARDE
================================ */
function saveNamedSequence() {
  const name = saveName.value.trim();
  if (!name) return;
  const all = JSON.parse(localStorage.getItem("assautSeq") || "{}");
  all[name] = sequence.map(a => a.assaut);
  localStorage.setItem("assautSeq", JSON.stringify(all));
  loadSavedList();
}

function loadSavedList() {
  loadSeq.innerHTML = `<option value="">📂 Charger</option>`;
  const all = JSON.parse(localStorage.getItem("assautSeq") || "{}");
  Object.keys(all).forEach(k => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = k;
    loadSeq.appendChild(o);
  });
}

function loadNamedSequence() {
  const all = JSON.parse(localStorage.getItem("assautSeq"));
  sequence = all[loadSeq.value].map(n => assauts.find(a => a.assaut === n));
  renderSequence();
}

/* ===============================
   QR + UTILS
================================ */
function generateQR() {
  new QRious({
    element: qrSeq,
    value: sequence.map(a => a.assaut).join(" | "),
    size: 160
  });
}

function stopAll() {
  playing = false;
  stopSpeech();
}

function shuffle(arr) {
  arr.sort(() => Math.random() - 0.5);
  renderSequence();
}

function toggleFullscreen() {
  document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
}

const wait = ms => new Promise(r => setTimeout(r, ms));
