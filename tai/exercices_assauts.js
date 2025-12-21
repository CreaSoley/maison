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

// ==================== SCRIPT 2 : ENCHAÎNEMENT PERSONNALISÉ ====================

function initializeScript2() {
  displayAssautsList();
  
  searchAssaut.addEventListener('input', () => displayAssautsList(searchAssaut.value));
  btnValidateSequence.addEventListener('click', validateSequence);
  btnPlaySequence.addEventListener('click', playSequence);
  btnStopSequence.addEventListener('click', stopSequence);
  intervalRange.addEventListener('input', updateIntervalDisplay);
  
  initSounds();
}

function displayAssautsList(filter = '') {
  assautsList.innerHTML = '';
  
  const filtered = assautsData.filter(assaut => 
    assaut.assaut.toLowerCase().includes(filter.toLowerCase())
  );
  
  filtered.forEach((assaut, index) => {
    const item = document.createElement('div');
    item.className = 'assaut-checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `assaut-${index}`;
    checkbox.value = index;
    checkbox.addEventListener('change', updateValidateButton);
    
    const label = document.createElement('label');
    label.htmlFor = `assaut-${index}`;
    label.textContent = assaut.assaut;
    
    const badge = document.createElement('span');
    badge.className = 'config-badge';
    badge.textContent = assaut.configuration === 'fauteuil' ? '🪑' : '🧍';
    badge.title = assaut.configuration;
    
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(badge);
    
    assautsList.appendChild(item);
  });
}

function updateValidateButton() {
  const checkboxes = assautsList.querySelectorAll('input[type="checkbox"]:checked');
  btnValidateSequence.disabled = checkboxes.length === 0;
}

function validateSequence() {
  const checkboxes = assautsList.querySelectorAll('input[type="checkbox"]:checked');
  selectedSequence = Array.from(checkboxes).map(cb => {
    const index = parseInt(cb.value);
    return assautsData[index];
  });
  
  if (selectedSequence.length > 0) {
    btnPlaySequence.disabled = false;
    displaySequencePreview();
    showStatus(`✅ ${selectedSequence.length} assaut(s) sélectionné(s)`);
  }
}

function displaySequencePreview() {
  sequenceDisplay.innerHTML = '';
  
  if (selectedSequence.length === 0) {
    sequenceDisplay.classList.remove('active');
    return;
  }
  
  sequenceDisplay.classList.add('active');
  
  const itemsHTML = selectedSequence.map((assaut, index) => `
    <div class="sequence-item">
      <span>${index + 1}. ${assaut.assaut}</span>
      <button class="remove-btn" onclick="removeFromSequence(${index})" title="Retirer">✕</button>
    </div>
  `).join('');
  
  const countHTML = `<div class="sequence-count">Total : ${selectedSequence.length} assaut(s)</div>`;
  
  sequenceDisplay.innerHTML = `
    <div class="sequence-items">${itemsHTML}</div>
    ${countHTML}
  `;
}

function removeFromSequence(index) {
  selectedSequence.splice(index, 1);
  displaySequencePreview();
  
  if (selectedSequence.length === 0) {
    btnPlaySequence.disabled = true;
  }
}

function updateIntervalDisplay() {
  intervalValue.textContent = intervalRange.value;
}

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
    }
    
    showStatus('⏱️ Démarrage dans 5 secondes...');
    await sleep(5000);
    
    playSound('bbp');
    showStatus('🎵 Lecture en cours...');
    
    for (let i = 0; i < sequence.length; i++) {
      if (!isPlaying) break;
      
      const assaut = sequence[i];
      
      if (i > 0) {
        playSound('notif');
        await sleep(500);
      }
      
      await speakAssaut(assaut);
      
      if (i < sequence.length - 1) {
        const interval = parseInt(intervalRange.value) * 1000;
        showStatus(`# Pause... (${interval/1000}s)`);
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
    bbpSound.load();
    notifSound.load();
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

// Rendre removeFromSequence globale
window.removeFromSequence = removeFromSequence;
