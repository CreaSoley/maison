let assautsData = [];
let selectedSequence = [];
let synth = window.speechSynthesis;
let isPlaying = false;
const LOCAL_SEQUENCE_KEY = 'tai_sequence_assauts';

document.addEventListener('DOMContentLoaded', () => {
  fetch('exercices_assauts.json')
    .then(res => res.json())
    .then(data => {
      assautsData = data.exercices;
      initializeScript1();
      initializeScript2();
    });
});

// ==================== SCRIPT 1 — Assaut guidé ====================

function initializeScript1() {
  const select = document.getElementById("selectAssaut");
  const filter = document.getElementById("filterConfig");
  const assautCard = document.getElementById("assautCard");

  // Charger assauts dans le select
  assautsData.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = a.assaut;
    opt.dataset.config = a.configuration;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const selected = assautsData[select.value];
    displayAssaut(selected, assautCard);
    window.currentAssaut = selected;
    document.getElementById('btnPlayAssaut').disabled = false;
    document.getElementById('btnExportPdfAssaut').disabled = false;
  });

  filter.addEventListener("change", () => {
    const config = filter.value;
    Array.from(select.options).forEach(opt => {
      opt.style.display = !config || opt.dataset.config === config ? '' : 'none';
    });
  });

  document.getElementById("btnRandomAssaut").addEventListener("click", () => {
    let filtered = filter.value
      ? assautsData.filter(a => a.configuration === filter.value)
      : assautsData;
    const rand = filtered[Math.floor(Math.random() * filtered.length)];
    const index = assautsData.indexOf(rand);
    select.value = index;
    select.dispatchEvent(new Event("change"));
  });

  document.getElementById("btnPlayAssaut").addEventListener("click", playAssaut);
  document.getElementById("btnStopAssaut").addEventListener("click", () => synth.cancel());
  document.getElementById("speedRange").addEventListener("input", e => {
    document.getElementById("speedValue").textContent = parseFloat(e.target.value).toFixed(1) + "x";
  });

  document.getElementById("btnExportPdfAssaut").addEventListener("click", exportAssautAsPdf);
}

function displayAssaut(a, container) {
  const derouleHTML = a.deroule.map(e =>
    `<div class="deroule-item"><span class="deroule-num">${e.etape}.</span> ${e.texte}</div>`).join('');

  container.innerHTML = `
    <div class="assaut-display">
      <div class="assaut-header">
        <div class="assaut-image-container">
          <img src="${a.image}" class="assaut-image" alt="${a.assaut}" />
        </div>
        <div class="assaut-info">
          <h4 class="assaut-title">${a.assaut}</h4>
          <div class="assaut-config">${a.configuration}</div>
          <div class="assaut-objectif">${a.objectif}</div>
        </div>
      </div>
      <div class="assaut-columns">
        <div class="assaut-section">
          <h5>🔑 Points clés</h5>
          <ul>${a.points_cles.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="assaut-section">
          <h5>⚠️ Erreurs à éviter</h5>
          <ul>${a.erreurs_a_eviter.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="assaut-section deroule-section">
          <h5>📋 Déroulé</h5>
          <div class="deroule-grid">${derouleHTML}</div>
        </div>
      </div>
    </div>
  `;
}

async function playAssaut() {
  const a = window.currentAssaut;
  if (!a) return;
  const speed = parseFloat(document.getElementById("speedRange").value);
  await speak(`${a.assaut}`, 1); await wait(1000);
  await speak(`Configuration : ${a.configuration}`, 1);
  await speak(`Objectif : ${a.objectif}`, 1);
  await speak(`Voici les points clés :`, 1);
  for (const point of a.points_cles) await speak(point, 1);
  await speak(`Voici les erreurs à éviter :`, 1);
  for (const err of a.erreurs_a_eviter) await speak(err, 1);
  await speak(`Commençons le travail`, 1);
  for (const etape of a.deroule) {
    await speak(`Étape ${etape.etape} : ${etape.texte}`, speed);
  }
}

function exportAssautAsPdf() {
  const a = window.currentAssaut;
  if (!a) return alert("Aucun assaut sélectionné.");
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>${a.assaut}</title>
     <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { text-align: center; color: #ff1493; }
      .config { text-align: center; font-weight: bold; margin: 10px; }
      .objectif { font-style: italic; margin: 20px 0; border-left: 4px solid #ff1493; padding-left: 10px; }
      ul { padding-left: 20px; }
      .columns { display: flex; gap: 20px; }
      .column { flex: 1; }
      .etape { margin-bottom: 8px; }
     </style>
    </head><body>
     <h1>${a.assaut}</h1>
     <div class="config">${a.configuration}</div>
     <div class="objectif">${a.objectif}</div>
     <div class="columns">
      <div class="column"><h3>🔑 Points clés</h3><ul>${a.points_cles.map(p => `<li>${p}</li>`).join('')}</ul></div>
      <div class="column"><h3>⚠️ Erreurs à éviter</h3><ul>${a.erreurs_a_eviter.map(p => `<li>${p}</li>`).join('')}</ul></div>
     </div>
     <h3>📋 Déroulé</h3>${a.deroule.map(e => `<div class="etape"><strong>${e.etape}.</strong> ${e.texte}</div>`).join('')}
    </body></html>`);
  win.document.close();
}

// ==================== SCRIPT 2 — Enchaînement perso ====================

exercices_assauts.js:219 Uncaught SyntaxError: Unexpected token '}'
randori.js:19 Loaded randori data from randori.json 18 items

function previewAssaut(a) {
  document.getElementById('previewAssautCard').innerHTML = `
    <div><strong>${a.assaut}</strong></div>
    <div style="font-style: italic; color: #555;">🎯 ${a.objectif}</div>
    <div style="margin-top: 5px;"><strong>Étape 1 :</strong> ${a.deroule[0].texte}</div>
  `;
}

function updateSequencePreview() {
  const zone = document.getElementById('sequenceDisplay');
  if (selectedSequence.length === 0) {
    zone.innerHTML = '';
    zone.classList.remove('active');
    return;
  }

  const output = selectedSequence.map((a, i) => `
    <div class="sequence-item">
      <span>${i + 1}. ${a.assaut}</span>
      <button class="remove-btn" onclick="removeFromSequence(${i})">✕</button>
    </div>
  `).join('');

  zone.innerHTML = `<div class="sequence-items">${output}</div>
    <div class="sequence-count">Total : ${selectedSequence.length} assaut(s)</div>`;
  zone.classList.add('active');
}

function removeFromSequence(index) {
  selectedSequence.splice(index, 1);
  updateSequencePreview();
}

// ==================== UTILITAIRES ====================

function speak(txt, rate = 1) {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'fr-FR';
    u.rate = rate;
    u.onend = res;
    synth.speak(u);
  });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function showStatus(txt) {
  const el = document.getElementById("sequenceStatus");
  el.textContent = txt;
  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 3000);
}

// Permet de retirer dynamiquement un assaut
window.removeFromSequence = removeFromSequence;
