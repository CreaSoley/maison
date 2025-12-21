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

// Variables globales
let currentAssaut = null;
let synth = window.speechSynthesis;
let selectedAssauts = [];
let sequenceTimeout = null;
let audioContext = null;
let bbpSound = null;
let notifSound = null;

// ==================== INITIALISATION ====================

// Charger le JSON
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
  // Remplir le select
  assautsData.forEach((assaut, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = assaut.assaut;
    option.dataset.config = assaut.configuration;
    selectAssaut.appendChild(option);
  });

  // Event listeners
  selectAssaut.addEventListener('change', handleAssautSelect);
  filterConfig.addEventListener('change', filterAssauts);
  btnRandomAssaut.addEventListener('click', selectRandomAssaut);
  btnPlayAssaut.addEventListener('click', playAssaut);
  btnStopAssaut.addEventListener('click', stopSpeech);
  speedRange.addEventListener('input', updateSpeedDisplay);
  btnPrintAssaut.addEventListener('click', printAssaut);

  // Initialiser les sons
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
  
  // Réinitialiser la sélection si elle est filtrée
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
  const html = `
    <div class="assaut-card">
      <h4>${assaut.assaut}</h4>
      
      <div class="assaut-section">
        <h5>🎯 Objectif</h5>
        <p>${assaut.objectif}</p>
      </div>

      <div class="assaut-section">
        <h5>🔑 Points clés</h5>
        <ul>
          ${assaut.points_cles.map(point => `<li>${point}</li>`).join('')}
        </ul>
      </div>

      <div class="assaut-section">
        <h5>⚠️ Erreurs à éviter</h5>
        <ul>
          ${assaut.erreurs_a_eviter.map(erreur => `<li>${erreur}</li>`).join('')}
        </ul>
      </div>

      <div class="assaut-section">
        <h5>📋 Déroulé</h5>
        <ul>
          ${assaut.deroule.map(etape => `<li>${etape}</li>`).join('')}
        </ul>
      </div>

      ${assaut.image ? `<img src="${assaut.image}" alt="${assaut.assaut}" class="assaut-image" />` : ''}
    </div>
  `;
  
  assautCard.innerHTML = html;
}

function updateSpeedDisplay() {
  speedValue.textContent = parseFloat(speedRange.value).toFixed(1) + 'x';
}

function playAssaut() {
  if (!currentAssaut || synth.speaking) return;

  stopSpeech();

  const text = buildAssautText(currentAssaut);
  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = 'fr-FR';
  utterance.rate = parseFloat(speedRange.value);
  utterance.pitch = 1;
  
  utterance.onstart = () => {
    btnPlayAssaut.disabled = true;
    btnStopAssaut.disabled = false;
  };
  
  utterance.onend = () => {
    btnPlayAssaut.disabled = false;
    btnStopAssaut.disabled = true;
  };

  synth.speak(utterance);
}

function buildAssautText(assaut) {
  let text = '';
  
  text += `Assaut : ${assaut.assaut}. `;
  text += `Objectif : ${assaut.objectif}. `;
  
  text += 'Points clés : ';
  assaut.points_cles.forEach(point => {
    text += `${point}. `;
  });
  
  text += 'Erreurs à éviter : ';
  assaut.erreurs_a_eviter.forEach(erreur => {
    text += `${erreur}. `;
  });
  
  text += 'Déroulé : ';
  assaut.deroule.forEach(etape => {
    text += `${etape}. `;
  });
  
  return text;
}

function stopSpeech() {
  if (synth.speaking) {
    synth.cancel();
    btnPlayAssaut.disabled = false;
    btnStopAssaut.disabled = true;
  }
}

function printAssaut() {
  if (!currentAssaut) return;
  
  // Créer une fenêtre d'impression temporaire
  const printWindow = window.open('', '', 'height=600,width=800');
  
  const assautCardContent = assautCard.innerHTML;
  
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
        h1 {
          color: #ff1493;
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 20px;
        }
        .assaut-card {
          background: #fffaf8;
          padding: 20px;
          border-radius: 14px;
          border: 2px solid #ffd6ec;
        }
        h4 {
          color: #ff4fb8;
          font-size: 1.4rem;
          margin-bottom: 15px;
        }
        h5 {
          color: #ff1493;
          margin-top: 15px;
          margin-bottom: 8px;
        }
        ul {
          line-height: 1.6;
        }
        .assaut-image {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          margin-top: 15px;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>🎯 Fiche d'exercice - Tai-Jitsu</h1>
      ${assautCardContent}
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
  
  searchAssaut.addEventListener('input', filterAssautsList);
  btnValidateSequence.addEventListener('click', validateSequence);
  btnPlaySequence.addEventListener('click', playSequence);
  btnStopSequence.addEventListener('click', stopSequence);
  intervalRange.addEventListener('input', updateIntervalDisplay);
  
  // Initialiser les sons
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
    badge.textContent = assaut.configuration;
    
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(badge);
    
    assautsList.appendChild(item);
  });
}

function filterAssautsList() {
  const filter = searchAssaut.value;
  displayAssautsList(filter);
}

function updateValidateButton() {
  const checkboxes = assautsList.querySelectorAll('input[type="checkbox"]:checked');
  btnValidateSequence.disabled = checkboxes.length === 0;
}

function validateSequence() {
  const checkboxes = assautsList.querySelectorAll('input[type="checkbox"]:checked');
  selectedAssauts = Array.from(checkboxes).map(cb => assautsData[cb.value]);
  
  if (selectedAssauts.length > 0) {
    btnPlaySequence.disabled = false;
    showStatus(`✅ ${selectedAssauts.length} assaut(s) sélectionné(s)`);
  }
}

function updateIntervalDisplay() {
  intervalValue.textContent = intervalRange.value;
}

async function playSequence() {
  if (selectedAssauts.length === 0) return;
  
  stopSequence();
  
  btnPlaySequence.disabled = true;
  btnStopSequence.disabled = false;
  btnValidateSequence.disabled = true;
  
  showStatus('#marrage dans 5 secondes...');
  
  // Attendre 5 secondes
  await sleep(5000);
  
  // Son de début
  playSound('bbp');
  
  showStatus('🎵 Lecture en cours...');
  
  // Lire chaque assaut
  for (let i = 0; i < selectedAssauts.length; i++) {
    const assaut = selectedAssauts[i];
    
    // Son avant chaque assaut
    if (i > 0) {
      playSound('notif');
      await sleep(500); // Petite pause après le son
    }
    
    // Lire l'assaut
    await speakAssaut(assaut);
    
    // Pause entre les assauts (sauf pour le dernier)
    if (i < selectedAssauts.length - 1) {
      const interval = parseInt(intervalRange.value) * 1000;
      showStatus(`⏸️ Pause... (${interval/1000}s)`);
      await sleep(interval);
    }
  }
  
  // Son de fin
  playSound('bbp');
  
  showStatus('✅ Séquence terminée !');
  
  setTimeout(() => {
    btnPlaySequence.disabled = false;
    btnStopSequence.disabled = true;
    btnValidateSequence.disabled = false;
    hideStatus();
  }, 3000);
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
    // Créer l'AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Précharger les sons
    bbpSound = new Audio('bbp.mp3');
    notifSound = new Audio('notif.mp3');
    
    bbpSound.load();
    notifSound.load();
  } catch (error) {
    console.warn('Audio non supporté:', error);
  }
}

function playSound(type) {
  if (!audioContext) return;
  
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

// Nettoyage à la fermeture
window.addEventListener('beforeunload', () => {
  stopSpeech();
  stopSequence();
});
