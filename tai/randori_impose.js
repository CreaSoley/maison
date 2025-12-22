/* ==============================
   CHARGEMENT DES DONNÉES
============================== */

let assauts = [];
let currentAssaut = null;
let utterance = null;
let sequence = [];
let isPlayingSequence = false;

fetch("exercices_assauts.json")
  .then(r => r.json())
  .then(data => {
    assauts = data.exercices;
    initAssauts();
  });

/* ==============================
   INIT
============================== */

function initAssauts() {
  populateSelects();
  renderChips();
  bindUI();
}

/* ==============================
   EXERCICE 1 – ASSAUT GUIDÉ
============================== */

function populateSelects() {
  const select = document.getElementById("assautSelect");
  assauts.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = a.assaut;
    select.appendChild(opt);
  });
}

function bindUI() {
  document.getElementById("assautSelect").addEventListener("change", e => {
    currentAssaut = assauts[e.target.value];
    renderAssautFiche(currentAssaut);
  });

  document.getElementById("configFilter").addEventListener("change", filterConfig);

  document.getElementById("assautRandom").onclick = () => {
    const filtered = getFilteredAssauts();
    currentAssaut = filtered[Math.floor(Math.random() * filtered.length)];
    renderAssautFiche(currentAssaut);
  };

  document.getElementById("playAssaut").onclick = () => {
    if (!currentAssaut) return;
    const rate = document.getElementById("speechSpeed").value;
    speak(buildSpeech(currentAssaut), rate);
  };

  document.getElementById("stopAssaut").onclick = stopSpeech;
  document.getElementById("printAssaut").onclick = () => window.print();

  /* EXERCICE 2 */
  document.getElementById("playSequence").onclick = playSequenceHandler;
  document.getElementById("stopSequence").onclick = stopSequence;
  document.getElementById("clearSequence").onclick = clearSequence;
}

/* ==============================
   FILTRAGE CONFIG
============================== */

function getFilteredAssauts() {
  const config = document.getElementById("configFilter").value;
  return config ? assauts.filter(a => a.configuration === config) : assauts;
}

function filterConfig() {
  const select = document.getElementById("assautSelect");
  select.innerHTML = `<option value="">Choisir un assaut</option>`;
  getFilteredAssauts().forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = assauts.indexOf(a);
    opt.textContent = a.assaut;
    select.appendChild(opt);
  });
}

/* ==============================
   FICHE VISUELLE
============================== */

function renderAssautFiche(a) {
  const c = document.getElementById("assautFiche");
  c.innerHTML = `
    <div class="fiche-card">
      <div class="fiche-row">
        <div class="fiche-left fiche-photo">
          <img src="${a.image}" alt="">
          <p style="text-align:center;font-weight:700">${a.configuration}</p>
        </div>
        <div class="fiche-right">
          <h3 class="tech-title">${a.assaut}</h3>
          <p><strong>Objectif :</strong> ${a.objectif}</p>
        </div>
      </div>

      <div class="fiche-row">
        <div class="fiche-left">
          <h4>Points clés</h4>
          <ul>${a.points_cles.map(p => `<li>${p}</li>`).join("")}</ul>
        </div>
        <div class="fiche-right">
          <h4>Erreurs à éviter</h4>
          <ul>${a.erreurs_a_eviter.map(e => `<li>${e}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="fiche-row">
        <div class="fiche-left">
          <h4>Déroulé</h4>
          <ol>${a.deroule.map(d => `<li>${d.texte}</li>`).join("")}</ol>
        </div>
      </div>
    </div>
  `;
}

/* ==============================
   SYNTHÈSE VOCALE
============================== */

function buildSpeech(a) {
  let txt = `Aujourd’hui, nous travaillons sur ${a.assaut}. `;
  txt += `L'objectif est de ${a.objectif}. `;
  txt += `Points clés. ${a.points_cles.join(", ")}. `;
  txt += `Erreurs à éviter. ${a.erreurs_a_eviter.join(", ")}. `;
  txt += `Commençons. `;
  a.deroule.forEach(d => {
    txt += `Étape ${d.etape}. ${d.texte}. `;
  });
  return txt;
}

function speak(text, rate = 1) {
  stopSpeech();
  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  speechSynthesis.cancel();
}

/* ==============================
   EXERCICE 2 – COMPOSITION
============================== */

function renderChips() {
  const list = document.getElementById("assautList");
  list.innerHTML = "";
  assauts.forEach(a => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = a.assaut;
    chip.onclick = () => addToSequence(a);
    list.appendChild(chip);
  });
}

function addToSequence(a) {
  sequence.push(a);
  saveSequence();
  renderSequence();
}

function renderSequence() {
  const zone = document.getElementById("sequenceZone");
  zone.innerHTML = "";
  sequence.forEach((a, i) => {
    const chip = document.createElement("div");
    chip.className = "chip selected";
    chip.draggable = true;
    chip.textContent = a.assaut;
    chip.onclick = () => removeFromSequence(i);
    chip.ondragstart = e => e.dataTransfer.setData("index", i);
    chip.ondragover = e => e.preventDefault();
    chip.ondrop = e => reorder(e, i);
    zone.appendChild(chip);
  });
}

function reorder(e, i) {
  const from = e.dataTransfer.getData("index");
  const temp = sequence[from];
  sequence.splice(from, 1);
  sequence.splice(i, 0, temp);
  saveSequence();
  renderSequence();
}

function removeFromSequence(i) {
  sequence.splice(i, 1);
  saveSequence();
  renderSequence();
}

function clearSequence() {
  sequence = [];
  saveSequence();
  renderSequence();
}

/* ==============================
   SAUVEGARDE LOCALE
============================== */

function saveSequence() {
  localStorage.setItem("assautSequence", JSON.stringify(sequence.map(a => a.assaut)));
}

function loadSequence() {
  const saved = JSON.parse(localStorage.getItem("assautSequence"));
  if (!saved) return;
  sequence = saved.map(name => assauts.find(a => a.assaut === name));
  renderSequence();
}

loadSequence();

/* ==============================
   LECTURE SÉQUENCÉE
============================== */

const notif = new Audio("notif.mp3");
const bip = new Audio("bbp.mp3");

async function playSequenceHandler() {
  if (!sequence.length || isPlayingSequence) return;
  isPlayingSequence = true;

  const interval = +document.getElementById("intervalRange").value * 1000;
  bip.play();
  await wait(5000);

  for (let a of sequence) {
    if (!isPlayingSequence) break;
    notif.play();
    speak(a.assaut);
    await wait(interval);
  }

  bip.play();
  isPlayingSequence = false;
}

function stopSequence() {
  isPlayingSequence = false;
  stopSpeech();
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
