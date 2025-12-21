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
const searchAssaut = document.getElementById('searchAssaut');
const assautsList = document.getElementById('assautsList');
const btnValidateSequence = document.getElementById('btnValidateSequence');
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
let sequenceTimeout = null;
let audioContext = null;
let bbpSound = null;
let notifSound = null;
let isPlaying = false;

// ==================== INITIALISATION ====================

fetch('exercices_assauts.json')
  .then(response => response.json())
  .then(data => {
    assautsData = data.exercices;
    initializeScript1();
    initializeScript2();
  })
  .catch(error => {
    console.error('Erreur chargement JSON:', error);
    alert('Erreur lors du chargement des exercices d\'assauts');
  });

// ==================== SCRIPT 1 : ASSAUT GUIDÉ ====================

function initializeScript1() {
  assautsData.forEach((assaut, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = assaut.assaut;
    option.dataset.config = assaut.configuration;
    selectAssaut.appendChild(option);
  });

  selectAssaut.addEventListener('change', handleAssautSelect);
  filterConfig.addEventListener('change', filterAssauts);
  btnRandomAssaut.addEventListener('click', selectRandomAssaut);
  btnPlayAssaut.addEventListener('click', playAssaut);
  btnStopAssaut.addEventListener('click', stopSpeech);
  speedRange.addEventListener('input', updateSpeedDisplay);
  btnPrintAssaut.addEventListener('click', printAssaut);

  initSounds();
}

function handleAssautSelect() {
  const index = selectAssaut.value;
  if (index === '') {
    currentAssaut = null;
    assautCard.innerHTML = '';
    btnPlayAssaut.disabled = true;
    btnPrintAssaut.disabled = true;
    return;
  }
  
  currentAssaut = assautsData[index];
  displayAssaut(currentAssaut);
  btnPlayAssaut.disabled = false;
  btnPrintAssaut.disabled = false;
}

function filterAssauts() {
  const config = filterConfig.value;
  const options = selectAssaut.options;
  
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (config === '' || option.dataset.config === config) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  }
  
  if (config && currentAssaut && currentAssaut.configuration !== config) {
    selectAssaut.value = '';
    currentAssaut = null;
    assautCard.innerHTML = '';
    btnPlayAssaut.disabled = true;
    btnPrintAssaut.disabled = true;
  }
}

function selectRandomAssaut() {
  const config = filterConfig.value;
  let availableAssauts = assautsData;
  
  if (config) {
    availableAssauts = assautsData.filter(a => a.configuration === config);
  }
  
  if (availableAssauts.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * availableAssauts.length);
  const randomAssaut = availableAssauts[randomIndex];
  const originalIndex = assautsData.indexOf(randomAssaut);
  
  selectAssaut.value = originalIndex;
  handleAssautSelect();
}

function displayAssaut(assaut) {
  const configLabel = assaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
  
  const pointsClesHTML = assaut.points_cles
    .map(point => `<li>${point}</li>`)
    .join('');
  
  const erreursHTML = assaut.erreurs_a_eviter
    .map(erreur => `<li>${erreur}</li>`)
    .join('');
  
  const derouleHTML = assaut.deroule
    .map(etape => `
      <div class="deroule-item">
        <span class="deroule-num">${etape.etape}.</span>
        <span>${etape.texte}</span>
      </div>
    `).join('');

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
          <ul>${pointsClesHTML}</ul>
        </div>

        <div class="assaut-section">
          <h5>⚠️ Erreurs à éviter</h5>
          <ul>${erreursHTML}</ul>
        </div>

        <div class="assaut-section deroule-section">
          <h5>📋 Déroulé</h5>
          <div class="deroule-grid">${derouleHTML}</div>
        </div>
      </div>
    </div>
  `;
  
  assautCard.innerHTML = html;
}

function updateSpeedDisplay() {
  speedValue.textContent = parseFloat(speedRange.value).toFixed(1) + 'x';
}

async function playAssaut() {
  if (!currentAssaut || isPlaying) return;

  stopSpeech();
  isPlaying = true;
  btnPlayAssaut.disabled = true;
  btnStopAssaut.disabled = false;

  const speed = parseFloat(speedRange.value);

  // 1. Nom de l'assaut
  await speakWithPause(`${currentAssaut.assaut}.`, speed);
  await sleep(1000);

  // 2. Configuration
  const configText = currentAssaut.configuration === 'fauteuil' ? 'Fauteuil' : 'Debout';
  await speakWithPause(`Configuration : ${configText}.`, speed);
  await sleep(1000);

  // 3. Objectif
  await speakWithPause(`Objectif : ${currentAssaut.objectif}.`, speed);
  await sleep(1000);

  // 4. Points clés
  await speakWithPause(`Points clés :`, speed);
  for (let i = 0; i < currentAssaut.points_cles.length; i++) {
    await speakWithPause(currentAssaut.points_cles[i], speed);
  }
  await sleep(1000);

  // 5. Erreurs à éviter
  await speakWithPause(`Erreurs à éviter :`, speed);
  for (let i = 0; i < currentAssaut.erreurs_a_eviter.length; i++) {
    await speakWithPause(currentAssaut.erreurs_a_eviter[i], speed);
  }
  await sleep(1000);

  // 6. Déroulé
  await speakWithPause(`Commençons le travail.`, speed);
  await sleep(500);

  for (let i = 0; i < currentAssaut.deroule.length; i++) {
    const etape = currentAssaut.deroule[i];
    await speakWithPause(`Étape ${etape.etape} : ${etape.texte}.`, speed);
  }

  isPlaying = false;
  btnPlayAssaut.disabled = false;
  btnStopAssaut.disabled = true;
}

function speakWithPause(text, speed) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.onend = resolve;
    synth.speak(utterance);
  });
}

function stopSpeech() {
  if (synth.speaking) {
    synth.cancel();
    isPlaying = false;
    btnPlayAssaut.disabled = false;
    btnStopAssaut.disabled = true;
  }
}

function printAssaut() {
  if (!currentAssaut) return;
  
  const printWindow = window.open('', '', 'height=600,width=800');
  const assautDisplay = assautCard.innerHTML;
  
  const configLabel = currentAssaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Fiche d'exercice - ${currentAssaut.assaut}</title>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Fredoka', Arial, sans-serif;
          padding: 20px;
          color: #222;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        h1 {
          color: #ff1493;
          font-size: 1.8rem;
          margin: 0 0 10px 0;
        }
        .config-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #fff0f6;
          border: 2px solid #ffd6ec;
          border-radius: 20px;
          font-weight: 600;
          color: #ff5fc1;
          margin-bottom: 8px;
        }
        .objectif {
          font-style: italic;
          color: #666;
          padding: 10px;
          background: #fffaf8;
          border-left: 3px solid #ff5fc1;
          margin: 10px 0;
        }
        .columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .section {
          border: 2px solid #ffd6ec;
          border-radius: 12px;
          padding: 15px;
          background: #fffaf8;
        }
        .section h3 {
          color: #ff1493;
          font-size: 1.1rem;
          margin: 0 0 10px 0;
          text-align: center;
          padding-bottom: 8px;
          border-bottom: 2px solid #ffd6ec;
        }
        .section ul {
          margin: 0;
          padding-left: 20px;
          line-height: 1.6;
        }
        .deroule-section {
          grid-column: 1 / -1;
        }
        .deroule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .deroule-item {
          display: flex;
          gap: 6px;
        }
        .deroule-num {
          font-weight: 700;
          color: #ff5fc1;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>🎯 Fiche d'exercice - Tai-Jitsu</h1>
        <div class="config-badge">${configLabel}</div>
        <div class="objectif">${currentAssaut.objectif}</div>
      </div>
      ${assautDisplay}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/* ==================== EXERCICES D'ASSAUTS ==================== */

// 📦 DONNÉES EN DUR (plus de JSON)
let assautsData = [
  {
    assaut: "Étranglement de face à une main",
    configuration: "fauteuil",
    objectif: "Se dégager et contrôler l'adversaire",
    points_cles: ["Saisir le poignet fermement", "Placer l'autre main sous le menton", "Tirer en arrière en pivotant"],
    erreurs_a_eviter: ["Tirer vers le bas", "Lâcher la prise", "Ne pas pivoter les hanches"],
    deroule: [
      { etape: 1, texte: "Saisir le poignet de l'adversaire" },
      { etape: 2, texte: "Placer l'autre main sous son menton" },
      { etape: 3, texte: "Pivoter les hanches et tirer en arrière" }
    ],
    image: ""
  },
  {
    assaut: "Étranglement de face à deux mains",
    configuration: "fauteuil",
    objectif: "Contrôle total de la tête adverse",
    points_cles: ["Saisir les deux poignets", "Placer les avant-bras sous le menton", "Tirer avec le dos"],
    erreurs_a_eviter: ["Écarter les coudes", "Tirer trop vite", "Mal positionner les avant-bras"],
    deroule: [
      { etape: 1, texte: "Saisir les deux poignets croisés" },
      { etape: 2, texte: "Placer les avant-bras sous le menton" },
      { etape: 3, texte: "Tirer en arrière avec le dos"}
    ],
    image: ""
  },
  {
    assaut: "Clé de bras en montée",
    configuration: "debout",
    objectif: "Amener l'adversaire au sol par douleur",
    points_cles: ["Contrôler le bras adverse", "Placer son coude sous l'aisselle", "Pousser avec les hanches"],
    erreurs_a_eviter: ["Tirer le bras", "Ne pas contrôler le corps", "Mal positionner son coude"],
    deroule: [
      { etape: 1, texte: "Saisir le poignet adverse" },
      { etape: 2, texte: "Placer son coude sous l'aisselle" },
      { etape: 3, texte: "Pousser avec les hanches vers le bas" }
    ],
    image: ""
  },
  {
    assaut: "Balayage avant",
    configuration: "debout",
    objectif: "Déséquilibrer l'adversaire vers l'avant",
    points_cles: ["Entrer dans la garde", "Placer le pied derrière le talon", "Tirer vers soi"],
    erreurs_a_eviter: ["Pousser au lieu de tirer", "Mal positionner le pied", "Ne pas entrer assez"],
    deroule: [
      { etape: 1, texte: "Entrer dans la garde adverse" },
      { etape: 2, texte: "Placer le pied derrière son talon" },
      { etape: 3, texte: "Tirer vivement vers soi" }
    ],
    image: ""
  },
  {
    assaut: "Étranglement arrière",
    configuration: "debout",
    objectif: "Finalisation au sol",
    points_cles: ["Passer le bras sous le menton", "Saisir le biceps opposé", "Serrer progressivement"],
    erreurs_a_eviter: ["Serrer trop vite", "Mal placer le bras", "Laisser de l'espace"],
    deroule: [
      { etape: 1, texte: "Passer le bras sous le menton" },
      { etape: 2, texte: "Saisir le biceps opposé" },
      { etape: 3, texte: "Serrer progressivement en contrôlant" }
    ],
    image: ""
  }
];

// 🎯 ÉLÉMENTS DOM - SCRIPT 1
const selectAssaut = document.getElementById('selectAssaut');
const filterConfig = document.getElementById('filterConfig');
const btnRandomAssaut = document.getElementById('btnRandomAssaut');
const btnPlayAssaut = document.getElementById('btnPlayAssaut');
const btnStopAssaut = document.getElementById('btnStopAssaut');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const assautCard = document.getElementById('assautCard');
const btnPrintAssaut = document.getElementById('btnPrintAssaut');

// 🎯 ÉLÉMENTS DOM - SCRIPT 2
const searchAssaut = document.getElementById('searchAssaut');
const assautsList = document.getElementById('assautsList');
const btnValidateSequence = document.getElementById('btnValidateSequence');
const btnPlaySequence = document.getElementById('btnPlaySequence');
const btnStopSequence = document.getElementById('btnStopSequence');
const intervalRange = document.getElementById('intervalRange');
const intervalValue = document.getElementById('intervalValue');
const sequenceStatus = document.getElementById('sequenceStatus');
const sequenceDisplay = document.getElementById('sequenceDisplay');
const optionLoop = document.getElementById('optionLoop');
const optionRandom = document.getElementById('optionRandom');

// 📊 VARIABLES GLOBALES
let currentAssaut = null;
let synth = window.speechSynthesis;
let selectedSequence = [];
let sequenceTimeout = null;
let audioContext = null;
let bbpSound = null;
let notifSound = null;
let isPlaying = false;

// 🚀 INITIALISATION (plus de fetch !)
initializeScript1();
initializeScript2();

// ==================== SCRIPT 1 : ASSAUT GUIDÉ (inchangé) ====================

function initializeScript1() {
  assautsData.forEach((assaut, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = assaut.assaut;
    option.dataset.config = assaut.configuration;
    selectAssaut.appendChild(option);
  });

  selectAssaut.addEventListener('change', handleAssautSelect);
  filterConfig.addEventListener('change', filterAssauts);
  btnRandomAssaut.addEventListener('click', selectRandomAssaut);
  btnPlayAssaut.addEventListener('click', playAssaut);
  btnStopAssaut.addEventListener('click', stopSpeech);
  speedRange.addEventListener('input', updateSpeedDisplay);
  btnPrintAssaut.addEventListener('click', printAssaut);

  initSounds();
}

function handleAssautSelect() {
  const index = selectAssaut.value;
  if (index === '') {
    currentAssaut = null;
    assautCard.innerHTML = '';
    btnPlayAssaut.disabled = true;
    btnPrintAssaut.disabled = true;
    return;
  }
  
  currentAssaut = assautsData[index];
  displayAssaut(currentAssaut);
  btnPlayAssaut.disabled = false;
  btnPrintAssaut.disabled = false;
}

function filterAssauts() {
  const config = filterConfig.value;
  const options = selectAssaut.options;
  
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (config === '' || option.dataset.config === config) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  }
  
  if (config && currentAssaut && currentAssaut.configuration !== config) {
    selectAssaut.value = '';
    currentAssaut = null;
    assautCard.innerHTML = '';
    btnPlayAssaut.disabled = true;
    btnPrintAssaut.disabled = true;
  }
}

function selectRandomAssaut() {
  const config = filterConfig.value;
  let availableAssauts = assautsData;
  
  if (config) {
    availableAssauts = assautsData.filter(a => a.configuration === config);
  }
  
  if (availableAssauts.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * availableAssauts.length);
  const randomAssaut = availableAssauts[randomIndex];
  const originalIndex = assautsData.indexOf(randomAssaut);
  
  selectAssaut.value = originalIndex;
  handleAssautSelect();
}

function displayAssaut(assaut) {
  const configLabel = assaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
  
  const pointsClesHTML = assaut.points_cles
    .map(point => `<li>${point}</li>`)
    .join('');
  
  const erreursHTML = assaut.erreurs_a_eviter
    .map(erreur => `<li>${erreur}</li>`)
    .join('');
  
  const derouleHTML = assaut.deroule
    .map(etape => `
      <div class="deroule-item">
        <span class="deroule-num">${etape.etape}.</span>
        <span>${etape.texte}</span>
      </div>
    `).join('');

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
          <ul>${pointsClesHTML}</ul>
        </div>

        <div class="assaut-section">
          <h5>⚠️ Erreurs à éviter</h5>
          <ul>${erreursHTML}</ul>
        </div>

        <div class="assaut-section deroule-section">
          <h5>📋 Déroulé</h5>
          <div class="deroule-grid">${derouleHTML}</div>
        </div>
      </div>
    </div>
  `;
  
  assautCard.innerHTML = html;
}

function updateSpeedDisplay() {
  speedValue.textContent = parseFloat(speedRange.value).toFixed(1) + 'x';
}

async function playAssaut() {
  if (!currentAssaut || isPlaying) return;

  stopSpeech();
  isPlaying = true;
  btnPlayAssaut.disabled = true;
  btnStopAssaut.disabled = false;

  const speed = parseFloat(speedRange.value);

  await speakWithPause(`${currentAssaut.assaut}.`, speed);
  await sleep(1000);

  const configText = currentAssaut.configuration === 'fauteuil' ? 'Fauteuil' : 'Debout';
  await speakWithPause(`Configuration : ${configText}.`, speed);
  await sleep(1000);

  await speakWithPause(`Objectif : ${currentAssaut.objectif}.`, speed);
  await sleep(1000);

  await speakWithPause(`Points clés :`, speed);
  for (let i = 0; i < currentAssaut.points_cles.length; i++) {
    await speakWithPause(currentAssaut.points_cles[i], speed);
  }
  await sleep(1000);

  await speakWithPause(`Erreurs à éviter :`, speed);
  for (let i = 0; i < currentAssaut.erreurs_a_eviter.length; i++) {
    await speakWithPause(currentAssaut.erreurs_a_eviter[i], speed);
  }
  await sleep(1000);

  await speakWithPause(`Commençons le travail.`, speed);
  await sleep(500);

  for (let i = 0; i < currentAssaut.deroule.length; i++) {
    const etape = currentAssaut.deroule[i];
    await speakWithPause(`Étape ${etape.etape} : ${etape.texte}.`, speed);
  }

  isPlaying = false;
  btnPlayAssaut.disabled = false;
  btnStopAssaut.disabled = true;
}

function speakWithPause(text, speed) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.onend = resolve;
    synth.speak(utterance);
  });
}

function stopSpeech() {
  if (synth.speaking) {
    synth.cancel();
    isPlaying = false;
    btnPlayAssaut.disabled = false;
    btnStopAssaut.disabled = true;
  }
}

function printAssaut() {
  if (!currentAssaut) return;
  
  const printWindow = window.open('', '', 'height=600,width=800');
  const assautDisplay = assautCard.innerHTML;
  
  const configLabel = currentAssaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Fiche d'exercice - ${currentAssaut.assaut}</title>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Fredoka', Arial, sans-serif;
          padding: 20px;
          color: #222;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        h1 {
          color: #ff1493;
          font-size: 1.8rem;
          margin: 0 0 10px 0;
        }
        .config-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #fff0f6;
          border: 2px solid #ffd6ec;
          border-radius: 20px;
          font-weight: 600;
          color: #ff5fc1;
          margin-bottom: 8px;
        }
        .objectif {
          font-style: italic;
          color: #666;
          padding: 10px;
          background: #fffaf8;
          border-left: 3px solid #ff5fc1;
          margin: 10px 0;
        }
        .columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .section {
          border: 2px solid #ffd6ec;
          border-radius: 12px;
          padding: 15px;
          background: #fffaf8;
        }
        .section h3 {
          color: #ff1493;
          font-size: 1.1rem;
          margin: 0 0 10px 0;
          text-align: center;
          padding-bottom: 8px;
          border-bottom: 2px solid #ffd6ec;
        }
        .section ul {
          margin: 0;
          padding-left: 20px;
          line-height: 1.6;
        }
        .deroule-section {
          grid-column: 1 / -1;
        }
        .deroule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .deroule-item {
          display: flex;
          gap: 6px;
        }
        .deroule-num {
          font-weight: 700;
          color: #ff5fc1;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>🎯 Fiche d'exercice - Tai-Jitsu</h1>
        <div class="config-badge">${configLabel}</div>
        <div class="objectif">${currentAssaut.objectif}</div>
      </div>
      ${assautDisplay}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

// ==================== SCRIPT 2 : ENCHAÎNEMENT PERSONNALISÉ (NOUVELLE VERSION) ====================

function initializeScript2() {
  displayAvailableAssauts();
  
  searchAssaut.addEventListener('input', () => displayAvailableAssauts(searchAssaut.value));
  btnValidateSequence.addEventListener('click', validateSequence);
  btnPlaySequence.addEventListener('click', playSequence);
  btnStopSequence.addEventListener('click', stopSequence);
  intervalRange.addEventListener('input', updateIntervalDisplay);
  
  initSounds();
}

// 📋 AFFICHAGE DES ASSAUTS DISPONIBLES
function displayAvailableAssauts(filter = '') {
  assautsList.innerHTML = '';
  
  const filtered = assautsData.filter(assaut => 
    assaut.assaut.toLowerCase().includes(filter.toLowerCase())
  );
  
  if (filtered.length === 0) {
    assautsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Aucun assaut trouvé</p>';
    return;
  }
  
  filtered.forEach((assaut, index) => {
    const realIndex = assautsData.indexOf(assaut);
    const item = document.createElement('div');
    item.className = 'assaut-checkbox-item';
    
    const badge = document.createElement('span');
    badge.className = 'config-badge';
    badge.textContent = assaut.configuration === 'fauteuil' ? '🪑' : '🧍';
    badge.title = assaut.configuration;
    
    const label = document.createElement('label');
    label.style.cursor = 'pointer';
    label.style.flex = '1';
    label.htmlFor = `assaut-${realIndex}`;
    label.textContent = assaut.assaut;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `assaut-${realIndex}`;
    checkbox.value = realIndex;
    
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(badge);
    
    assautsList.appendChild(item);
  });
}

// ✅ VALIDER LA SÉLECTION
function validateSequence() {
  const checkboxes = assautsList.querySelectorAll('input[type="checkbox"]:checked');
  
  if (checkboxes.length === 0) {
    alert('⚠️ Veuillez sélectionner au moins un assaut');
    return;
  }
  
  selectedSequence = Array.from(checkboxes).map(cb => {
    const index = parseInt(cb.value);
    return assautsData[index];
  });
  
  btnPlaySequence.disabled = false;
  displaySelectedSequence();
  showStatus(`✅ ${selectedSequence.length} assaut(s) ajouté(s) à la séquence`);
  
  // Décocher toutes les cases
  checkboxes.forEach(cb => cb.checked = false);
}

// 📊 AFFICHAGE DE LA SÉQUENCE SÉLECTIONNÉE (avec drag & drop)
function displaySelectedSequence() {
  sequenceDisplay.innerHTML = '';
  
  if (selectedSequence.length === 0) {
    sequenceDisplay.classList.remove('active');
    btnPlaySequence.disabled = true;
    return;
  }
  
  sequenceDisplay.classList.add('active');
  
  const itemsHTML = selectedSequence.map((assaut, index) => `
    <div class="sequence-item" draggable="true" data-index="${index}">
      <span class="drag-handle">⋮⋮</span>
      <span class="sequence-number">${index + 1}</span>
      <span class="sequence-name">${assaut.assaut}</span>
      <span class="config-badge">${assaut.configuration === 'fauteuil' ? '🪑' : '🧍'}</span>
      <button class="remove-btn" onclick="removeFromSequence(${index})" title="Retirer">✕</button>
    </div>
  `).join('');
  
  const countHTML = `<div class="sequence-count">📦 Total : ${selectedSequence.length} assaut(s) | 💡 Glissez pour réorganiser</div>`;
  
  sequenceDisplay.innerHTML = `<div class="sequence-items">${itemsHTML}</div>${countHTML}`;
  
  // 🎯 AJOUTER LES ÉVÉNEMENTS DRAG & DROP
  addDragAndDropHandlers();
}

// 🖱️ DRAG & DROP
function addDragAndDropHandlers() {
  const items = sequenceDisplay.querySelectorAll('.sequence-item');
  let draggedElement = null;
  
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
  
  function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }
  
  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    if (draggedElement !== this) {
      const draggedIndex = parseInt(draggedElement.dataset.index);
      const targetIndex = parseInt(this.dataset.index);
      
      // Réorganiser le tableau
      const draggedItem = selectedSequence[draggedIndex];
      selectedSequence.splice(draggedIndex, 1);
      selectedSequence.splice(targetIndex, 0, draggedItem);
      
      // Rafraîchir l'affichage
      displaySelectedSequence();
    }
    
    return false;
  }
  
  function handleDragEnd() {
    this.style.opacity = '1';
  }
}

// 🗑️ RETIRER DE LA SÉQUENCE
function removeFromSequence(index) {
  const assautName = selectedSequence[index].assaut;
  
  if (confirm(`Retirer "${assautName}" de la séquence ?`)) {
    selectedSequence.splice(index, 1);
    displaySelectedSequence();
    
    if (selectedSequence.length === 0) {
      btnPlaySequence.disabled = true;
      hideStatus();
    } else {
      showStatus(`🗑️ "${assautName}" retiré (${selectedSequence.length} restant)`);
    }
  }
}

function updateIntervalDisplay() {
  intervalValue.textContent = intervalRange.value;
}

// ▶️ JOUER LA SÉQUENCE
async function playSequence() {
  if (selectedSequence.length === 0 || isPlaying) return;
  
  stopSequence();
  isPlaying = true;
  
  btnPlaySequence.disabled = true;
  btnStopSequence.disabled = false;
  btnValidateSequence.disabled = true;
  
  const shouldLoop = optionLoop.checked;
  const shouldRandomize = optionRandom.checked;
  
  let sequence = [...selectedSequence];
  
  do {
    if (shouldRandomize) {
      sequence = shuffleArray([...selectedSequence]);
      showStatus('🔀 Mode aléatoire activé');
    } else {
      showStatus('🎵 Lecture en cours...');
    }
    
    await sleep(2000);
    playSound('bbp');
    await sleep(500);
    
    for (let i = 0; i < sequence.length; i++) {
      if (!isPlaying) break;
      
      const assaut = sequence[i];
      
      // Surligner l'assaut en cours
      highlightCurrentAssaut(i);
      
      if (i > 0) {
        playSound('notif');
        await sleep(500);
      }
      
      await speakAssaut(assaut);
      
      if (i < sequence.length - 1) {
        const interval = parseInt(intervalRange.value) * 1000;
        showStatus(`⏸️ Pause... (${interval/1000}s) - ${i+1}/${sequence.length}`);
        await sleep(interval);
      }
    }
    
    playSound('bbp');
    
    if (shouldLoop && isPlaying) {
      showStatus('🔁 Nouvelle boucle dans 3 secondes...');
      await sleep(3000);
    }
    
  } while (shouldLoop && isPlaying);
  
  showStatus('✅ Séquence terminée !');
  
  setTimeout(() => {
    btnPlaySequence.disabled = false;
    btnStopSequence.disabled = true;
    btnValidateSequence.disabled = false;
    hideStatus();
  }, 3000);
  
  isPlaying = false;
  
  // Enlever le surlignage
  document.querySelectorAll('.sequence-item').forEach(item => {
    item.style.background = '';
    item.style.borderColor = '';
  });
}

// 🎨 SURLIGNER L'ASSAUT EN COURS
function highlightCurrentAssaut(index) {
  document.querySelectorAll('.sequence-item').forEach((item, i) => {
    if (i === index) {
      item.style.background = '#fff0f6';
      item.style.borderColor = '#ff1493';
      item.style.transform = 'scale(1.02)';
    } else {
      item.style.background = '';
      item.style.borderColor = '';
      item.style.transform = '';
    }
  });
}

function speakAssaut(assaut) {
  return new Promise((resolve) => {
    const text = `${assaut.assaut}. ${assaut.objectif}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = resolve;
    synth.speak(utterance);
  });
}

function stopSequence() {
  isPlaying = false;
  
  if (sequenceTimeout) {
    clearTimeout(sequenceTimeout);
    sequenceTimeout = null;
  }
  
  stopSpeech();
  
  btnPlaySequence.disabled = false;
  btnStopSequence.disabled = true;
  btnValidateSequence.disabled = false;
  
  hideStatus();
  
  // Enlever le surlignage
  document.querySelectorAll('.sequence-item').forEach(item => {
    item.style.background = '';
    item.style.borderColor = '';
    item.style.transform = '';
  });
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function showStatus(message) {
  sequenceStatus.textContent = message;
  sequenceStatus.classList.add('active');
}

function hideStatus() {
  sequenceStatus.classList.remove('active');
}

// ==================== GESTION DES SONS ====================

function initSounds() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    bbpSound = new Audio('bbp.mp3');
    notifSound = new Audio('notif.mp3');
    if (bbpSound) bbpSound.load();
    if (notifSound) notifSound.load();
  } catch (error) {
    console.warn('Audio non supporté:', error);
  }
}

function playSound(type) {
  if (!audioContext || !bbpSound || !notifSound) return;
  
  const sound = type === 'bbp' ? bbpSound : notifSound;
  
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(err => console.warn('Erreur lecture son:', err));
  }
}

// ==================== UTILITAIRES ====================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('beforeunload', () => {
  stopSpeech();
  stopSequence();
});

// 🌍 GLOBALES
window.removeFromSequence = removeFromSequence;
