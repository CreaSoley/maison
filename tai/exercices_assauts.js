/* ==================== EXERCICES D'ASSAUTS ==================== */

// Données JSON
let assautsData = [];

// Éléments DOM - Script 1
const selectAssaut = document.getElementById('selectAssaut');
const filterConfig = document.getElementById('filterConfig');
const btnRandomAssaut = document.getElementById('btnRandomAssaut');
const btnPlayAssaut = document.getElementById('btnPlayAssaut');
const btnStopAssaut = document.getElementById('btnStopAssaut');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const assautCard = document.getElementById('assautCard');
const btnPrintAssaut = document.getElementById('btnPrintAssaut');

// Éléments DOM - Script 2
const assautsList = document.getElementById('assautsList');
const btnPlaySequence = document.getElementById('btnPlaySequence');
const btnStopSequence = document.getElementById('btnStopSequence');
const intervalRange = document.getElementById('intervalRange');
const intervalValue = document.getElementById('intervalValue');
const sequenceStatus = document.getElementById('sequenceStatus');
const sequenceDisplay = document.getElementById('sequenceDisplay');
const optionLoop = document.getElementById('optionLoop');
const optionRandom = document.getElementById('optionRandom');

// Variables globales
let currentAssaut = null;
let synth = window.speechSynthesis;
let selectedSequence = [];
let isPlaying = false;
let bbpSound = null;
let notifSound = null;

// ==================== INITIALISATION ====================

fetch('exercices_assauts.json')
  .then(res => res.json())
  .then(data => {
    assautsData = data.exercices;
    initializeScript1();
    initializeScript2();
  })
  .catch(() => alert("Erreur lors du chargement des données."));

/* -------- SCRIPT 1 — GUIDÉ -------- */

function initializeScript1() {
  assautsData.forEach((assaut, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = assaut.assaut;
    opt.dataset.config = assaut.configuration;
    selectAssaut.appendChild(opt);
  });

  selectAssaut.addEventListener('change', () => {
    const index = selectAssaut.value;
    currentAssaut = assautsData[index];
    displayAssaut(currentAssaut);
    btnPlayAssaut.disabled = false;
    btnPrintAssaut.disabled = false;
  });

  filterConfig.addEventListener('change', () => {
    const config = filterConfig.value;
    Array.from(selectAssaut.options).forEach(opt => {
      opt.style.display = !config || opt.dataset.config === config ? '' : 'none';
    });
  });

  btnRandomAssaut.addEventListener('click', () => {
    const config = filterConfig.value;
    const valid = config ? assautsData.filter(a => a.configuration === config) : assautsData;
    const rand = valid[Math.floor(Math.random() * valid.length)];
    const index = assautsData.indexOf(rand);
    selectAssaut.value = index;
    selectAssaut.dispatchEvent(new Event('change'));
  });

  btnPlayAssaut.addEventListener('click', playAssaut);
  btnStopAssaut.addEventListener('click', () => {
    synth.cancel();
    isPlaying = false;
  });

  speedRange.addEventListener('input', () => {
    speedValue.textContent = speedRange.value + "x";
  });

  btnPrintAssaut.addEventListener('click', printAssaut);

  initSounds();
}

function displayAssaut(assaut) {
  const configLabel = assaut.configuration === "fauteuil" ? "🪑 Fauteuil" : "🧍 Debout";

  const html = `
    <div class="assaut-display">
      <div class="assaut-header">
        <div class="assaut-image-container">
          <img src="${assaut.image}" alt="${assaut.assaut}" class="assaut-image" />
        </div>
        <div class="assaut-info">
          <h4 class="assaut-title">${assaut.assaut}</h4>
          <div class="assaut-config">${configLabel}</div>
          <div class="assaut-objectif">${assaut.objectif}</div>
        </div>
      </div>
      <div class="assaut-columns">
        <div class="assaut-section">
          <h5>🔑 Points clés</h5>
          <ul>${assaut.points_cles.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div class="assaut-section">
          <h5>⚠️ Erreurs à éviter</h5>
          <ul>${assaut.erreurs_a_eviter.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div class="assaut-section deroule-section">
          <h5>📋 Déroulé</h5>
          <div class="deroule-grid">
            ${assaut.deroule.map(e => `<div class="deroule-item"><span class="deroule-num">${e.etape}.</span><span>${e.texte}</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  assautCard.innerHTML = html;
}

async function playAssaut() {
  if (!currentAssaut) return;
  isPlaying = true;
  const speed = parseFloat(speedRange.value);

  await speak(`${currentAssaut.assaut}`, 1);
  await sleep(1000);
  await speak(`Configuration : ${currentAssaut.configuration}`, 1);
  await sleep(1000);
  await speak(`Objectif : ${currentAssaut.objectif}`, 1);
  await sleep(1000);

  await speak(`Voici les points clés :`, 1);
  for (let p of currentAssaut.points_cles) await speak(p, 1);
  await sleep(1000);

  await speak(`Voici les erreurs à éviter :`, 1);
  for (let e of currentAssaut.erreurs_a_eviter) await speak(e, 1);
  await sleep(1000);

  await speak(`Commençons le travail`, 1);
  await sleep(1000);

  for (let etape of currentAssaut.deroule) {
    await speak(`Étape ${etape.etape} : ${etape.texte}`, speed);
  }

  isPlaying = false;
}

function speak(text, rate = 1) {
  return new Promise(resolve => {
    if (!isPlaying) return resolve();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    utter.rate = rate;
    utter.onend = resolve;
    synth.speak(utter);
  });
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function printAssaut() {
  if (!currentAssaut) return;
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${currentAssaut.assaut}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
      h1 { color: #ff1493; text-align: center; }
      .objectif { font-style: italic; margin: 20px 0; }
      .config { font-weight: bold; background: #fee; padding: 6px 10px; border-radius: 10px; text-align: center; }
      .columns { display: flex; gap: 20px; margin-top: 20px; }
      .column { flex: 1; }
      .deroule { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
      .step { display: flex; gap: 6px; }
    </style>
    </head><body>
    <h1>${currentAssaut.assaut}</h1>
    <div class="config">${currentAssaut.configuration}</div>
    <div class="objectif">${currentAssaut.objectif}</div>
    <div class="columns">
      <div class="column"><h3>Points clés</h3><ul>${currentAssaut.points_cles.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="column"><h3>Erreurs à éviter</h3><ul>${currentAssaut.erreurs_a_eviter.map(x => `<li>${x}</li>`).join('')}</ul></div>
    </div>
    <div class="deroule">
      ${currentAssaut.deroule.map(e => `<div class="step"><strong>${e.etape}.</strong> ${e.texte}</div>`).join('')}
    </div></body></html>
  `);
  w.document.close();
  w.focus();
}

/* -------- SCRIPT 2 — ENCHAÎNEMENT -------- */

function initializeScript2() {
  displayAssautsList2();

  btnPlaySequence.addEventListener('click', playSequence);
  btnStopSequence.addEventListener('click', () => {
    synth.cancel();
    isPlaying = false;
    btnPlaySequence.disabled = false;
    btnStopSequence.disabled = true;
  });

  intervalRange.addEventListener('input', () => {
    intervalValue.textContent = intervalRange.value + "s";
  });

  initSounds();
}

function displayAssautsList2() {
  assautsList.innerHTML = `
    <div class="selectors-row">
      <input type="text" id="searchField" placeholder="Rechercher...">
      <select id="selectAssautSequence"></select>
      <button class="btn ghost" id="addToSequence">➕ Ajouter</button>
    </div>
  `;
  const select = document.getElementById('selectAssautSequence');
  const search = document.getElementById('searchField');

  function updateSelect(filter = '') {
    select.innerHTML = '';
    assautsData.forEach((assaut, index) => {
      if (!filter || assaut.assaut.toLowerCase().includes(filter.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = assaut.assaut + " (" + assaut.configuration + ")";
        select.appendChild(opt);
      }
    });
  }

  search.addEventListener('input', () => updateSelect(search.value));
  updateSelect();

  document.getElementById('addToSequence').addEventListener('click', () => {
    const index = select.value;
    if (index !== "") {
      selectedSequence.push(assautsData[index]);
      updateSequencePreview();
      btnPlaySequence.disabled = false;
    }
  });
}

function updateSequencePreview() {
  sequenceDisplay.innerHTML = selectedSequence.map((a, i) => `
    <div>${i+1}. ${a.assaut}</div>
  `).join('');
}

/* --- Lecture de la séquence --- */

async function playSequence() {
  if (selectedSequence.length === 0 || isPlaying) return;

  isPlaying = true;
  btnPlaySequence.disabled = true;
  btnStopSequence.disabled = false;

  let seq = [...selectedSequence];
  const delay = parseInt(intervalRange.value) * 1000;
  const loop = optionLoop.checked;
  const rand = optionRandom.checked;

  do {
    if (rand) seq = shuffle([...selectedSequence]);

    await delayStart();

    for (let i = 0; i < seq.length; i++) {
      await playSound('notif');
      await speak(`${seq[i].assaut}`, 1);
      if (i < seq.length - 1) await sleep(delay);
    }

    await playSound('bbp');
    await sleep(delay);

  } while (loop && isPlaying);

  isPlaying = false;
  btnPlaySequence.disabled = false;
  btnStopSequence.disabled = true;
}

function shuffle(arr) {
  return arr.map(x => [x, Math.random()]).sort((a,b) => a[1]-b[1]).map(x => x[0]);
}

/* -------- Sons -------- */

function initSounds() {
  bbpSound = new Audio("bbp.mp3");
  notifSound = new Audio("notif.mp3");
}

async function playSound(type) {
  let sound = type === 'bbp' ? bbpSound : notifSound;
  sound.currentTime = 0;
  try {
    await sound.play();
    await sleep(500);
  } catch (e) {}
}

async function delayStart() {
  sequenceStatus.textContent = "⏳ Démarrage dans 5s...";
  await sleep(5000);
  sequenceStatus.textContent = "🎶 Lecture en cours...";
}
