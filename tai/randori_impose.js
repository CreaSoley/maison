/* =======================
   VARIABLES
======================= */
let assauts = [];
let currentAssaut = null;
let sequence = [];
let playing = false;
let loop = false;

const notif = new Audio("notif.mp3");
const bbp = new Audio("bbp.mp3");

/* =======================
   LOAD JSON
======================= */
fetch("exercices_assauts.json")
  .then(r => r.json())
  .then(d => {
    assauts = d.exercices;
    init();
  });

/* =======================
   INIT
======================= */
function init() {
  fillAssautSelect();
  renderAssautChips();
  bindUI();
  loadSavedList();

  // Drag & Drop avec SortableJS (https://sortablejs.github.io/Sortable/)
  new Sortable(sequenceZone, {
    animation: 150,
    onEnd: () => renderSequence()
  });
}

/* =======================
   UI BINDINGS
======================= */
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

  playSequence.onclick = playSequenceHandler;
  stopSequence.onclick = stopAll;

  loopSeq.onclick = () => {
    loop = !loop;
    loopSeq.classList.toggle("active", loop);
  };

  randomSeq.onclick = () => {
    shuffleSequence();
    randomSeq.classList.toggle("active");
  };

  saveSeq.onclick = saveNamedSequence;
  loadSeq.onchange = loadNamedSequence;

  // Clear sequence
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Effacer";
  clearBtn.className = "btn ghost";
  clearBtn.onclick = () => {
    sequence = [];
    renderSequence();
  };
  document.querySelector("#sequenceZone").insertAdjacentElement("afterend", clearBtn);
}

/* =======================
   EXERCICE 1
======================= */
function fillAssautSelect() {
  assautSelect.innerHTML = `<option value="">Choisir un assaut</option>`;
  assauts.forEach((a, i) => {
    assautSelect.innerHTML += `<option value="${i}">${a.assaut}</option>`;
  });
}

function renderFiche(a) {
  if (!a) return;
  assautFiche.innerHTML = `
  <div class="fiche-card">
    <div class="fiche-header">
      <img src="${a.image}" alt="">
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

/* =======================
   EXERCICE 2 – SÉQUENCE
======================= */
function renderAssautChips() {
  assautList.innerHTML = "";
  assauts.forEach(a => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = a.assaut;
    b.onclick = () => {
      sequence.push(a);
      renderSequence();
    };
    assautList.appendChild(b);
  });
}

function renderSequence() {
  sequenceZone.innerHTML = "";
  sequence.forEach((a, i) => {
    const row = document.createElement("div");
    row.className = "sequence-item";

    row.innerHTML = `
      <span>${a.assaut}</span>
      <div>
        <button>⬆️</button>
        <button>⬇️</button>
        <button>❌</button>
      </div>
    `;

    const [up, down, del] = row.querySelectorAll("button");

    up.onclick = () => {
      if (i === 0) return;
      [sequence[i - 1], sequence[i]] = [sequence[i], sequence[i - 1]];
      renderSequence();
    };

    down.onclick = () => {
      if (i === sequence.length - 1) return;
      [sequence[i + 1], sequence[i]] = [sequence[i], sequence[i + 1]];
      renderSequence();
    };

    del.onclick = () => {
      sequence.splice(i, 1);
      renderSequence();
    };

    sequenceZone.appendChild(row);
  });
}

/* =======================
   LECTURE AVEC RÉPÉTITIONS
======================= */
async function playSequenceHandler() {
  if (!sequence.length) return;
  playing = true;

  const interval = intervalRange.value * 1000;
  const repeat = parseInt(repeatCount.value);

  bbp.play(); // Son début
  await wait(5000); // Latence avant lecture

  let rounds = repeat === 0 ? Infinity : repeat;

  while (rounds-- > 0 && playing) {
    for (let a of sequence) {
      if (!playing) break;
      notif.play();
      await wait(1000);
      speak(a.assaut);
      await wait(interval);
    }
    if (!loop) bbp.play();
    if (!loop) break;
  }

  generateQR();
}

function stopAll() {
  playing = false;
  stopSpeech();
}

/* =======================
   SAUVEGARDE
======================= */
function saveNamedSequence() {
  const name = saveName.value.trim();
  if (!name) return;
  const all = JSON.parse(localStorage.getItem("assautSeq") || "{}");
  all[name] = sequence.map(a => a.assaut);
  localStorage.setItem("assautSeq", JSON.stringify(all));
  loadSavedList();
}

function loadSavedList() {
  loadSeq.innerHTML = `<option value="">Charger une séquence</option>`;
  const all = JSON.parse(localStorage.getItem("assautSeq") || "{}");
  Object.keys(all).forEach(k => {
    loadSeq.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

function loadNamedSequence() {
  const all = JSON.parse(localStorage.getItem("assautSeq"));
  sequence = all[loadSeq.value].map(n => assauts.find(a => a.assaut === n));
  renderSequence();
}

/* =======================
   UTILS
======================= */
function shuffleSequence() {
  sequence.sort(() => Math.random() - 0.5);
  renderSequence();
}

function generateQR() {
  new QRious({
    element: qrSeq,
    value: sequence.map(a => a.assaut).join(" | "),
    size: 160
  });
}

const wait = ms => new Promise(r => setTimeout(r, ms));
