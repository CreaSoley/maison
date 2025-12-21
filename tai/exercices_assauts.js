let assautsData = [];
let selectedSequence = [];
let synth = window.speechSynthesis;
let isPlaying = false;
let bbpSound = null;
let notifSound = null;
const LOCAL_SEQUENCE_KEY = 'tai_sequence_assauts';

document.addEventListener('DOMContentLoaded', init);

function init() {
  fetch('exercices_assauts.json')
    .then(res => res.json())
    .then(data => {
      assautsData = data.exercices;
      initScript1();
      initScript2();
    });
}

// ---------- SCRIPT 1 : Assaut guidé ----------
function initScript1() {
  const select = document.getElementById('selectAssaut');
  const filter = document.getElementById('filterConfig');
  const play = document.getElementById('btnPlayAssaut');
  const stop = document.getElementById('btnStopAssaut');
  const print = document.getElementById('btnPrintAssaut');
  const speedRange = document.getElementById('speedRange');
  const speedValue = document.getElementById('speedValue');
  const randomBtn = document.getElementById('btnRandomAssaut');
  const container = document.getElementById('assautCard');

  assautsData.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = a.assaut;
    opt.dataset.config = a.configuration;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const a = assautsData[select.value];
    window.currentAssaut = a;
    displayAssaut(a, container);
    play.disabled = false;
    print.disabled = false;
  });

  filter.addEventListener('change', () => {
    Array.from(select.options).forEach(opt => {
      opt.style.display = !filter.value || opt.dataset.config === filter.value ? '' : 'none';
    });
  });

  randomBtn.addEventListener('click', () => {
    let arr = filter.value
      ? assautsData.filter(a => a.configuration === filter.value)
      : assautsData;
    const rand = arr[Math.floor(Math.random() * arr.length)];
    select.value = assautsData.indexOf(rand);
    select.dispatchEvent(new Event('change'));
  });

  speedRange.addEventListener('input', () => {
    speedValue.textContent = speedRange.value + "x";
  });

  play.addEventListener('click', playAssaut);
  stop.addEventListener('click', () => {
    synth.cancel();
    isPlaying = false;
  });
  print.addEventListener('click', printAssaut);

  initSounds();
}

function displayAssaut(assaut, container) {
  const configLabel = assaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
  const derouleHTML = assaut.deroule.map(e => `
    <div class="deroule-item">
      <span class="deroule-num">${e.etape}.</span> <span>${e.texte}</span>
    </div>`).join('');

  container.innerHTML = `
    <div class="assaut-display">
      <div class="assaut-header">
        <div class="assaut-image-container">
          <img src="${assaut.image}" class="assaut-image" />
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
          <ul>${assaut.points_cles.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>
        <div class="assaut-section">
          <h5>⚠️ Erreurs à éviter</h5>
          <ul>${assaut.erreurs_a_eviter.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>
        <div class="assaut-section deroule-section">
          <h5>📋 Déroulé</h5>
          <div class="deroule-grid">${derouleHTML}</div>
        </div>
      </div>
    </div>`;
}

async function playAssaut() {
  if (!window.currentAssaut) return;
  const a = window.currentAssaut;
  isPlaying = true;
  const speed = parseFloat(document.getElementById('speedRange').value);

  await speak(a.assaut, 1); await delay(1000);
  await speak("Configuration : " + a.configuration, 1); await delay(1000);
  await speak("Objectif : " + a.objectif, 1); await delay(1000);
  await speak("Voici les points clés :", 1);
  for (let p of a.points_cles) await speak(p, 1);
  await speak("Voici les erreurs à éviter :", 1);
  for (let e of a.erreurs_a_eviter) await speak(e, 1);
  await speak("Commençons le travail", 1);
  for (let etape of a.deroule) {
    await speak(`Étape ${etape.etape} : ${etape.texte}`, speed);
  }

  isPlaying = false;
}

function printAssaut() {
  const a = window.currentAssaut;
  if (!a) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>${a.assaut}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
      h1 { text-align: center; color: #ff1493; }
      .config { background:#fee; padding:8px; border-radius:12px; text-align: center; }
      .objectif { font-style: italic; margin:1em 0; padding-left:10px; border-left:3px solid #f09; }
      h3 { color:#f06; border-bottom:1px solid #fcc; }
    </style>
    </head><body>
      <h1>${a.assaut}</h1>
      <div class="config">${a.configuration}</div>
      <div class="objectif">${a.objectif}</div>
      <h3>🔑 Points clés</h3>
      <ul>${a.points_cles.map(p => `<li>${p}</li>`).join('')}</ul>
      <h3>⚠️ Erreurs à éviter</h3>
      <ul>${a.erreurs_a_eviter.map(p => `<li>${p}</li>`).join('')}</ul>
      <h3>📋 Déroulé</h3>
      ${a.deroule.map(e => `<div><strong>${e.etape}.</strong> ${e.texte}</div>`).join('')}
    </body></html>`);
  win.document.close();
  win.focus();
}

// ---------- SCRIPT 2 : Enchaînement personnalisé ----------
function initScript2() {
  const preview = document.getElementById('sequenceDisplay');
  document.getElementById('btnPlaySequence').addEventListener('click', playSequence);
  document.getElementById('btnStopSequence').addEventListener('click', () => {
    isPlaying = false;
    synth.cancel();
  });
  document.getElementById('intervalRange').addEventListener('input', e => {
    document.getElementById('intervalValue').textContent = e.target.value;
  });

  // Gestion formulaire sélection
  const search = document.getElementById('searchAssaut');
  const list = document.getElementById('assautsList');

  // Remplacer anciennes checkbox par select
  const selectorZone = `
    <div class="selectors-row">
      <select id="selectAssautSequence"></select>
      <button id="btnAddToSequence" class="btn ghost">➕ Ajouter</button>
    </div>
  `;
  list.innerHTML = selectorZone;

  const select = document.getElementById('selectAssautSequence');
  assautsData.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerText = `${a.assaut} (${a.configuration})`;
    select.appendChild(opt);
  });

  document.getElementById('btnAddToSequence').addEventListener('click', () => {
    const index = select.value;
    if (!index) return;
    selectedSequence.push(assautsData[index]);
    updateSequencePreview();
  });

  // Actions supplémentaires
  document.getElementById('btnValidateSequence').addEventListener('click', updateSequencePreview);
  document.getElementById('btnClearSequence').addEventListener('click', () => {
    selectedSequence = [];
    updateSequencePreview();
    showStatus("🧽 Séquence vidée !");
  });
  document.getElementById('btnSaveSequence').addEventListener('click', () => {
    const indices = selectedSequence.map(a => assautsData.indexOf(a));
    localStorage.setItem(LOCAL_SEQUENCE_KEY, JSON.stringify(indices));
    showStatus("💾 Sauvegarde effectuée !");
  });
  document.getElementById('btnLoadSequence').addEventListener('click', () => {
    const raw = localStorage.getItem(LOCAL_SEQUENCE_KEY);
    if (!raw) return showStatus("⚠️ Aucune sauvegarde trouvée");
    const indices = JSON.parse(raw);
    selectedSequence = indices.map(i => assautsData[i]);
    updateSequencePreview();
    showStatus("📂 Séquence restaurée !");
  });
  document.getElementById('btnExportSequence').addEventListener('click', exportSequenceAsPdf);
}

function updateSequencePreview() {
  const preview = document.getElementById('sequenceDisplay');
  if (selectedSequence.length === 0) {
    preview.innerHTML = '';
    preview.classList.remove('active');
    return;
  }

  let items = selectedSequence.map((a, i) => `
    <div class="sequence-item">
      <span>${i + 1}. ${a.assaut}</span>
      <button class="remove-btn" onclick="removeFromSequence(${i})">✕</button>
    </div>`).join('');

  preview.innerHTML = `
    <div class="sequence-items">${items}</div>
    <div class="sequence-count">Total : ${selectedSequence.length} assaut(s)</div>
  `;
  preview.classList.add('active');
}

function removeFromSequence(index) {
  selectedSequence.splice(index, 1);
  updateSequencePreview();
}

// ---------- Export PDF - Séquence ----------
function exportSequenceAsPdf() {
  if (selectedSequence.length === 0) return alert("Aucune séquence sélectionnée.");
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>Enchaînement</title>
    <style>
      body { font-family: Arial, sans-serif; padding:20px; }
      h1 { text-align:center; color:#f06; }
      .step { margin-bottom:1rem; padding:10px; border-left:4px solid #f06; background:#fff5fa; }
      .step-title { font-weight:bold; margin-bottom:4px; color:#c06; }
      .objectif { font-style: italic; font-size: 0.95em; color:#555; }
    </style>
    </head><body>
    <h1>🎵 Enchaînement — Tai-Jitsu</h1>
    ${selectedSequence.map((a, i) => `
      <div class="step">
        <div class="step-title">${i+1}. ${a.assaut}</div>
        <div class="objectif">🎯 ${a.objectif}</div>
      </div>
    `).join('')}
    </body></html>`);
  w.document.close();
  w.focus();
}

// ---------- Utils ----------
function speak(text, rate = 1) {
  return new Promise(r => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = rate;
    synth.speak(u);
    u.onend = r;
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function showStatus(txt) {
  const el = document.getElementById('sequenceStatus');
  el.textContent = txt;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 3000);
}

function initSounds() {
  bbpSound = new Audio("bbp.mp3");
  notifSound = new Audio("notif.mp3");
}
