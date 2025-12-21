/* ==============================================================
   EXERCICE 1 – ASSAUT GUIDÉ (lecture complète)
   ============================================================== */

/* ---------- 1️⃣ Références DOM ---------- */
const selectAssaut      = document.getElementById('selectAssaut');
const filterConfig      = document.getElementById('filterConfig');
const btnRandomAssaut   = document.getElementById('btnRandomAssaut');
const btnPlayAssaut     = document.getElementById('btnPlayAssaut');
const btnStopAssaut     = document.getElementById('btnStopAssaut');
const speedRange        = document.getElementById('speedRange');
const speedValue        = document.getElementById('speedValue');
const assautCard        = document.getElementById('assautCard');
const btnPrintAssaut    = document.getElementById('btnPrintAssaut');

/* ---------- 2️⃣ Variables globales ---------- */
let currentAssaut = null;
let synth = window.speechSynthesis;   // lecteur vocal du navegateur
let isPlaying = false;

/* ---------- 3️⃣ Chargement du JSON ---------- */
fetch('exercices_assauts.json')
  .then(r => r.json())
  .then(data => {
    // on garde les exercices dans une variable globale accessible par le script 1
    window.assautsData = data.exercices;
    // démarrage dès que le DOM est prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initializeScript1());
    } else {
      initializeScript1();
    }
  })
  .catch(err => {
    console.error('Erreur chargement JSON :', err);
    alert('Impossible de charger les exercices d\'assauts');
  });

/* ====================== EXERCICE 1 – INITIALISATION ====================== */
function initializeScript1() {
  /* ---- 1.1 Remplir le <select> ---- */
  selectAssaut.innerHTML = '';
  window.assautsData.forEach((assaut, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = assaut.assaut;
    opt.dataset.config = assaut.configuration;   // utile pour le filtre
    selectAssaut.appendChild(opt);
  });

  /* ---- 1.2 Attacher les écouteurs ---- */
  filterConfig.addEventListener('change', handleAssautSelect);
  btnRandomAssaut.addEventListener('click', selectRandomAssaut);
  btnPlayAssaut.addEventListener('click', playAssaut);
  btnStopAssaut.addEventListener('click', stopSpeech);
  speedRange.addEventListener('input', updateSpeedDisplay);
  btnPrintAssaut.addEventListener('click', printAssaut);

  /* ---- 1.3 Initialiser les sons (facultatif) ---- */
  initSounds();
}

/* ---------- 1.4 Gestion du changement du <select> ---------- */
function handleAssautSelect() {
  const idx = selectAssaut.value;
  if (idx === '') {
    currentAssaut = null;
    assautCard.innerHTML = '';
    btnPlayAssaut.disabled = true;
    btnPrintAssaut.disabled = true;
    return;
  }
  currentAssaut = window.assautsData[idx];
  displayAssaut(currentAssaut);
  btnPlayAssaut.disabled = false;
  btnPrintAssaut.disabled = false;
}

/* ---------- 1.5 Filtrage par configuration ---------- */
function filterAssauts() {
  const cfg = filterConfig.value;
  const opts = selectAssaut.options;
  for (let i = 0; i < opts.length; i++) {
    const o = opts[i];
    o.style.display = (cfg === '' || o.dataset.config === cfg) ? '' : 'none';
  }
  if (cfg && currentAssaut && currentAssaut.configuration !== cfg) {
    selectAssaut.value = '';
    currentAssaut = null;
    assautCard.innerHTML = '';
    btnPlayAssaut.disabled = true;
    btnPrintAssaut.disabled = true;
  }
}

/* ---------- 1.6 Affichage de la carte ---------- */
function displayAssaut(assaut) {
  const cfgLabel = assaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
  const pointsHTML = assaut.points_cles?.map(p => `<li>${p}</li>`).join('') ?? '';
  const erreursHTML = assaut.erreurs_a_eviter?.map(e => `<li>${e}</li>`).join('') ?? '';
  const derouleHTML = assaut.deroule?.map(e => `
    <div class="deroule-item"><span class="deroule-num">${e.etape}.</span>${e.texte}</div>`).join('') ?? '';

  assautCard.innerHTML = `
    <div class="assaut-display">
      <div class="assaut-header">
        <div class="assaut-image-container">
          <img src="${assaut.image}" alt="${assaut.assaut}" class="assaut-image"/>
        </div>
        <div class="assaut-info">
          <h4 class="assaut-title">${assaut.assaut}</h4>
          <div class="assaut-config">${cfgLabel}</div>
          <div class="assaut-objectif">${assaut.objectif ?? ''}</div>
        </div>
      </div>
      <div class="assaut-columns">
        <div class="assaut-section"><h5>🔑 Points clés</h5><ul>${pointsHTML}</ul></div>
        <div class="assaut-section"><h5>⚠️ Erreurs à éviter</h5><ul>${erreursHTML}</ul></div>
        <div class="assaut-section deroule-section"><h5>📋 Déroulé</h5><div class="deroule-grid">${derouleHTML}</div></div>
      </div>
    </div>`;
}

/* ---------- 1.7 Gestion de la vitesse ---------- */
function updateSpeedDisplay() {
  speedValue.textContent = parseFloat(speedRange.value).toFixed(1) + 'x';
}

/* ---------- 1.8 **Lecture complète** de l’assaut ---------- */
async function playAssaut() {
  if (!currentAssaut || isPlaying) return;
  stopSpeech(); isPlaying = true;
  btnPlayAssaut.disabled = true;
  btnStopAssaut.disabled = false;

  const speed = parseFloat(speedRange.value);

  // 1️⃣ Nom de l’assaut
  await speakAssautFull(currentAssaut.assaut);
  await sleep(800);

  // 2️⃣ Configuration (lecture optionnelle, on peut la laisser de côté)
  //    Si vous voulez la lire, décommentez les lignes suivantes :
  // const cfgLabel = currentAssaut.configuration === 'fauteuil' ? 'Fauteuil' : 'Debout';
  // await speakWithPause(`Configuration : ${cfgLabel}`, speed);
  // await sleep(800);

  // 3️⃣ Objectif
  await speakWithPause(`Objectif : ${currentAssaut.objectif}`, speed);
  await sleep(800);

  // 4️⃣ Points clés
  await speakWithPause('Points clés :', speed);
  currentAssaut.points_cles?.forEach(p => {
    await speakWithPause(p, speed);
    await sleep(400);
  });
  await sleep(800);

  // 5️⃣ Erreurs à éviter
  await speakWithPause('Erreurs à éviter :', speed);
  currentAssaut.erreurs_a_eviter?.forEach(e => {
    await speakWithPause(e, speed);
    await sleep(400);
  });
  await sleep(800);

  // 6️⃣ Déroulé (étape par étape)
  await speakWithPause('Commençons le travail.', speed);
  await sleep(500);
  currentAssaut.deroule?.forEach(e => {
    await speakWithPause(`Étape ${e.etape} : ${e.texte}`, speed);
    await sleep(500);
  });

  isPlaying = false;
  btnPlayAssaut.disabled = false;
  btnStopAssaut.disabled = true;
}

/* ---------- 1.9 Fonction utilitaire : lecture d’un texte avec pause ---------- */
function speakWithPause(text, speed) {
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = speed;
    utter.onend = resolve;
    synth.speak(utter);
  });
}

/* ---------- 1.10 Lecture **uniquement** du titre (pour les appels de lExercise 2) ---------- */
async function speakAssautFull(title) {
  // Cette fonction est **exclusivement** utilisée par lExercise 1.
  // Elle ne fait qu’annoncer le titre, mais on la garde séparée afin de
  // ne pas impacter lExercise 2 qui utilise une fonction du même nom.
  const utter = new SpeechSynthesisUtterance(`${title}.`);
  utter.lang = 'fr-FR';
  utter.rate = 1;
  utter.onend = () => {};
  synth.speak(utter);
}

/* ---------- 1.11 Arrêt de la lecture ---------- */
function stopSpeech() {
  synth.cancel();
  isPlaying = false;
  btnPlayAssaut.disabled = false;
  btnStopAssaut.disabled = true;
}

/* ---------- 1.12 Pause (utilitaire) ---------- */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ---------- 1.13 Son (facultatif) ---------- */
function initSounds() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // chargement éventuel de fichiers mp3 (bbp, notif…) reste ici si vous l’utilisez
  } catch (e) {
    console.warn('AudioContext non disponible', e);
  }
}

/* ---------- 1.14 Impression de la carte ---------- */
function printAssaut() {
  /* ... votre code d’impression reste inchangé ... */
}

/* ==================== EXERCICE 2 : ENCHAÎNEMENT PERSONNALISÉ ==================== */

// 📦 DONNÉES EN DUR (21 intitulés d'assauts)
const SEQUENCE_ASSAUTS = [
  "Étranglement de face à une main",
  "Étranglement de face à deux mains",
  "Soumission par clé de jambe",
  "Couché‑ferme (guard pass)",
  "Passage de garde inversé",
  "Escapatoire en cage",
  "Projection d'épaule",
  "Projection de hanche",
  "Clef de poignet inversée",
  "Triangulation de jambe",
  "Kimura de bras",
  "Arm‑bar à la jambe",
  "Scapula‑lock",
  "Sangle de cou",
  "Couché‑ferme par coulisser",
  "Double‑leg takedown",
  "Cut‑back de jambe",
  "Sote‑gatame (somme)",
  "Butterfly guard sweep",
  "Hip‑stir‑sweep",
  "Reveil de garde à la volée"
];

// 🎯 ÉLÉMENTS DOM
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

// 📊 VARIABLES GLOBALES (ne PAS redéclarer assautsData !)
let selectedSequence = [];
let sequenceTimeout = null;
let audioContext = null;
let bbpSound = null;
let notifSound = null;
let isPlaying = false;

// 🚀 INITIALISATION (dès que le DOM est prêt)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript2);
} else {
  initializeScript2();
}

function initializeScript2() {
  displayAvailableAssauts();
  
  if (searchAssaut) {
    searchAssaut.addEventListener('input', () => displayAvailableAssauts(searchAssaut.value));
  }
  if (btnValidateSequence) {
    btnValidateSequence.addEventListener('click', validateSequence);
  }
  if (btnPlaySequence) {
    btnPlaySequence.addEventListener('click', playSequence);
  }
  if (btnStopSequence) {
    btnStopSequence.addEventListener('click', stopSequence);
  }
  if (intervalRange) {
    intervalRange.addEventListener('input', updateIntervalDisplay);
  }
  
  initSounds();
}

// 📋 AFFICHAGE DES ASSAUTS DISPONIBLES
function displayAvailableAssauts(filter = '') {
  if (!assautsList) return;
  
  assautsList.innerHTML = '';
  
  const filtered = SEQUENCE_ASSAUTS.filter(assaut => 
    assaut.toLowerCase().includes(filter.toLowerCase())
  );
  
  if (filtered.length === 0) {
    assautsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Aucun assaut trouvé</p>';
    return;
  }
  
  filtered.forEach((assaut, index) => {
    const item = document.createElement('div');
    item.className = 'assaut-checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `assaut-seq-${index}`;
    checkbox.value = assaut;
    
    const label = document.createElement('label');
    label.htmlFor = `assaut-seq-${index}`;
    label.textContent = assaut;
    
    item.appendChild(checkbox);
    item.appendChild(label);
    
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
  
  selectedSequence = Array.from(checkboxes).map(cb => cb.value);
  
  if (btnPlaySequence) btnPlaySequence.disabled = false;
  displaySelectedSequence();
  showStatus(`✅ ${selectedSequence.length} assaut(s) ajouté(s) à la séquence`);
  
  // Décocher toutes les cases
  checkboxes.forEach(cb => cb.checked = false);
}

// 📊 AFFICHAGE DE LA SÉQUENCE SÉLECTIONNÉE (avec drag & drop)
function displaySelectedSequence() {
  if (!sequenceDisplay) return;
  
  sequenceDisplay.innerHTML = '';
  
  if (selectedSequence.length === 0) {
    sequenceDisplay.classList.remove('active');
    if (btnPlaySequence) btnPlaySequence.disabled = true;
    return;
  }
  
  sequenceDisplay.classList.add('active');
  
  const itemsHTML = selectedSequence.map((assaut, index) => `
    <div class="sequence-item" draggable="true" data-index="${index}">
      <span class="drag-handle">⋮⋮</span>
      <span class="sequence-number">${index + 1}</span>
      <span class="sequence-name">${assaut}</span>
      <button class="remove-btn" onclick="removeFromSequence(${index})" title="Retirer">✕</button>
    </div>
  `).join('');
  
  const countHTML = `<div class="sequence-count">📦 Total : ${selectedSequence.length} assaut(s) | 💡 Glissez pour réorganiser</div>`;
  
  sequenceDisplay.innerHTML = `<div class="sequence-items">${itemsHTML}</div>${countHTML}`;
  
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
      
      const draggedItem = selectedSequence[draggedIndex];
      selectedSequence.splice(draggedIndex, 1);
      selectedSequence.splice(targetIndex, 0, draggedItem);
      
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
  const assautName = selectedSequence[index];
  
  if (confirm(`Retirer "${assautName}" de la séquence ?`)) {
    selectedSequence.splice(index, 1);
    displaySelectedSequence();
    
    if (selectedSequence.length === 0) {
      if (btnPlaySequence) btnPlaySequence.disabled = true;
      hideStatus();
    } else {
      showStatus(`🗑️ "${assautName}" retiré (${selectedSequence.length} restant)`);
    }
  }
}

function updateIntervalDisplay() {
  if (intervalValue && intervalRange) {
    intervalValue.textContent = intervalRange.value;
  }
}

// ▶️ JOUER LA SÉQUENCE (UNIQUEMENT L'INTITULÉ)
async function playSequence() {
  if (selectedSequence.length === 0 || isPlaying) return;
  
  stopSequence();
  isPlaying = true;
  
  if (btnPlaySequence) btnPlaySequence.disabled = true;
  if (btnStopSequence) btnStopSequence.disabled = false;
  if (btnValidateSequence) btnValidateSequence.disabled = true;
  
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
      highlightCurrentAssaut(i);
      
      if (i > 0) {
        playSound('notif');
        await sleep(500);
      }
      
      // ✅ UNIQUEMENT L'INTITULÉ (vitesse normale)
      await speakWithPause(assaut, 1);
      
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
    if (btnPlaySequence) btnPlaySequence.disabled = false;
    if (btnStopSequence) btnStopSequence.disabled = true;
    if (btnValidateSequence) btnValidateSequence.disabled = false;
    hideStatus();
  }, 3000);
  
  isPlaying = false;
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

function stopSequence() {
  isPlaying = false;
  
  if (sequenceTimeout) {
    clearTimeout(sequenceTimeout);
    sequenceTimeout = null;
  }
  
  stopSpeech();
  
  if (btnPlaySequence) btnPlaySequence.disabled = false;
  if (btnStopSequence) btnStopSequence.disabled = true;
  if (btnValidateSequence) btnValidateSequence.disabled = false;
  
  hideStatus();
  document.querySelectorAll('.sequence-item').forEach(item => {
    item.style.background = '';
    item.style.borderColor = '';
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
  if (sequenceStatus) {
    sequenceStatus.textContent = message;
    sequenceStatus.classList.add('active');
  }
}

function hideStatus() {
  if (sequenceStatus) {
    sequenceStatus.classList.remove('active');
  }
}

// 🔊 GESTION DES SONS
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

// 🛠️ UTILITAIRES
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stopSpeech() {
  if (synth && synth.speaking) {
    synth.cancel();
  }
}

function speakWithPause(text, speed) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.onend = resolve;
    if (synth) synth.speak(utterance);
  });
}

// 🌐 GLOBALES
window.removeFromSequence = removeFromSequence;

window.addEventListener('beforeunload', () => {
  stopSpeech();
  stopSequence();
});
