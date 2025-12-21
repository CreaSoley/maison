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

/* ==================== EXERCICES D'ASSAUTS (SCRIPT 2) ==================== */

// ---------------------------------------------------------------------
// 1️⃣  Données en dur (plus besoin de fetch / JSON)
// ---------------------------------------------------------------------
const assautsData = [
  {
    assaut: "Etranglement de face à une main",
    configuration: "fauteuil",
    objectif: "Maintenir l’équilibre tout en appliquant la pression",
    points_cles: [
      "Pliage du coude",
      "Utilisation du bras fort",
      "Contrôle de l’angle"
    ],
    errores_a_evitar: [
      "Forcer le poignet",
      "Laisser l’adversaire s’échapper"
    ],
    deroule: [
      { etape: 1, texte: "Attraper la main de l’adversaire" },
      { etape: 2, texte: "Faire pivoter le bras vers l’intérieur" },
      { etape: 3, texte: "Appliquer la pression progressive" }
    ]
  },
  {
    assaut: "Etranglement de face à deux mains",
    configuration: "debout",
    objectif: "Contrôler les deux bras adverses",
    points_cles: [
      "Synchronisation des deux bras",
      "Utiliser le corps comme levier",
      "Maintenir la distance"
    ],
    errores_a_evitar: [
      "Trop s’étirer",
      "Laisser les poignets ouverts"
    ],
    deroule: [
      { etape: 1, texte: "Saisir les deux mains" },
      { etape: 2, texte: "Tirer vers le centre du corps" },
      { etape: 3, texte: "Verrouiller les coudes" }
    ]
  },
  // ← ajoutez autant d’assauts que vous le souhaitez ici
];

// ---------------------------------------------------------------------
// 2️⃣  Références DOM (les mêmes que dans votre HTML)
// ---------------------------------------------------------------------
const searchAssaut       = document.getElementById('searchAssaut');
const assautsList        = document.getElementById('assautsList');
const btnValidateSequence= document.getElementById('btnValidateSequence');
const btnPlaySequence    = document.getElementById('btnPlaySequence');
const btnStopSequence    = document.getElementById('btnStopSequence');
const intervalRange      = document.getElementById('intervalRange');
const intervalValue      = document.getElementById('intervalValue');
const sequenceStatus     = document.getElementById('sequenceStatus');
const sequenceDisplay    = document.getElementById('sequenceDisplay');
const optionLoop         = document.getElementById('optionLoop');
const optionRandom       = document.getElementById('optionRandom');

let selectedSequence = [];          // tableau d’assauts (avec doublons possibles)
let isPlaying = false;
let sequenceTimeout  = null;
let audioContext, bbpSound, notifSound;
let synth;

/* --------------------------------------------------------------------
   3️⃣  Initialisation du script 2
-------------------------------------------------------------------- */
function initializeScript2() {
  // 3.1 → affichage de la liste d’assauts (filtrable)
  displayAssaultsList();                               // ← remplissage initial

  // 3.2 → actions de l’outil de recherche
  searchAssaut.addEventListener('input', () => displayAssaultsList(searchAssaut.value));

  // 3.3 → validation / lecture / arrêt de la séquence
  btnValidateSequence.addEventListener('click', validateSequence);
  btnPlaySequence.addEventListener('click', playSequence);
  btnStopSequence.addEventListener('click', stopSequence);

  // 3.4 → gestion du délai entre les assauts
  intervalRange.addEventListener('input', updateIntervalDisplay);

  // 3.5 → sons
  initSounds();
}

/* --------------------------------------------------------------------
   4️⃣  Construction de la liste “sélectionnable”
-------------------------------------------------------------------- */
function displayAssaultsList(filter = '') {
  assautsList.innerHTML = '';

  const matches = assautsData.filter(a =>
    a.assaut.toLowerCase().includes(filter.toLowerCase())
  );

  matches.forEach((assaut, idx) => {
    const item = document.createElement('div');
    item.className = 'assault-item';
    item.dataset.idx = idx;                         // pour récupérer les données

    const badge = document.createElement('span');
    badge.className = 'config-badge';
    badge.textContent = assaut.configuration === 'fauteuil' ? '🪑' : '🧍';
    badge.title = assaut.configuration;

    const label = document.createElement('label');
    label.htmlFor = `assault-${idx}`;
    label.textContent = `${assaut.assaut}`;

    const btnAdd = document.createElement('button');
    btnAdd.textContent = '➕ Ajouter';
    btnAdd.className = 'add-btn';
    btnAdd.addEventListener('click', (e) => {
      e.stopPropagation();          // ne pas déclencher le label
      addAssautToSelection(idx);
    });

    item.appendChild(badge);
    item.appendChild(label);
    item.appendChild(btnAdd);
    assautsList.appendChild(item);
  });
}

/* --------------------------------------------------------------------
   5️⃣  Ajout d’un assaut (avec duplication possible)
-------------------------------------------------------------------- */
function addAssautToSelection(idx) {
  const assaut = assautsData[idx];
  selectedSequence.push(assaut);           // ← on autorise les doublons
  displaySequencePreview();
  btnValidateSequence.disabled = false;    // on active la validation dès qu’on a au moins 1 élément
}

/* --------------------------------------------------------------------
   6️⃣  Validation → affichage de la séquence sélectionnée
-------------------------------------------------------------------- */
function validateSequence() {
  // rien de spécial à faire ici ; la séquence est déjà affichée.
  showStatus(`✅ ${selectedSequence.length} assaut(s) sélectionné(s)`);
}

/* --------------------------------------------------------------------
   7️⃣  Affichage / ré‑ordonnancement de la séquence sélectionnée
-------------------------------------------------------------------- */
function displaySequencePreview() {
  // vide le conteneur
  sequenceDisplay.innerHTML = '';

  if (selectedSequence.length === 0) {
    sequenceDisplay.classList.remove('active');
    btnPlaySequence.disabled = true;
    return;
  }

  sequenceDisplay.classList.add('active');

  // chaque élément de la séquence devient une « chip » avec boutons up/down & ✕
  const itemsHTML = selectedSequence
    .map((assaut, i) => createSequenceChip(i, assaut))
    .join('');

  const countHTML = `<div class="sequence-count">Total : ${selectedSequence.length} assaut(s)</div>`;

  sequenceDisplay.innerHTML = `
    <div class="sequence-items">${itemsHTML}</div>
    ${countHTML}
  `;
}

/**
 * Crée le HTML d’une « chip » (assaut + up/down + suppr)
 */
function createSequenceChip(position, assaut) {
  const upBtn = document.createElement('button');
  upBtn.className = 'move-btn up';
  upBtn.innerHTML = '▲';
  upBtn.title = 'Monter';
  upBtn.onclick = () => moveInSequence(position, -1);

  const dnBtn = document.createElement('button');
  dnBtn.className = 'move-btn down';
  dnBtn.innerHTML = '▼';
  dnBtn.title = 'Descendre';
  dnBtn.onclick = () => moveInSequence(position, +1);

  const rmBtn = document.createElement('button');
  rmBtn.className = 'remove-btn';
  rmBtn.innerHTML = '✕';
  rmBtn.title = 'Retirer';
  rmBtn.onclick = (e) => {
    e.stopPropagation();
    removeFromSequence(position);
  };

  const label = document.createElement('span');
  label.textContent = `${position + 1}. ${assaut.assaut}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'sequence-chip';
  wrapper.dataset.idx = position;
  wrapper.appendChild(label);
  wrapper.appendChild(upBtn);
  wrapper.appendChild(dnBtn);
  wrapper.appendChild(rmBtn);
  return wrapper;
}

/**
 * Déplace un assaut dans le tableau selectedSequence
 */
function moveInSequence(idx, direction) {
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= selectedSequence.length) return;

  const [moved] = selectedSequence.splice(idx, 1);
  selectedSequence.splice(newIdx, 0, moved;
  displaySequencePreview();
}

/* --------------------------------------------------------------------
   8️⃣  Retrait d’un assaut (doublon inclus)
-------------------------------------------------------------------- */
function removeFromSequence(idx) {
  selectedSequence.splice(idx, 1);
  displaySequencePreview();

  // si plus aucun assaut, on désactive le bouton Play
  if (selectedSequence.length === 0) {
    btnPlaySequence.disabled = true;
  }
}

/* --------------------------------------------------------------------
   9️⃣  Gestion du délai (interval) entre deux assauts
-------------------------------------------------------------------- */
function updateIntervalDisplay() {
  intervalValue.textContent = intervalRange.value;
}

/* --------------------------------------------------------------------
   🔟  Lecture de la séquence (avec boucle, random, etc.)
-------------------------------------------------------------------- */
async function playSequence() {
  if (selectedSequence.length === 0 || isPlaying) return;

  stopSequence();               // sécurise le cas où on relance
  isPlaying = true;

  btnPlaySequence.disabled   = true;
  btnStopSequence.disabled   = false;
  btnValidateSequence.disabled = true;

  const shouldLoop   = optionLoop.checked;
  const shouldRandom = optionRandom.checked;

  let workingSequence = [...selectedSequence];

  do {
    // randomisation éventuelle
    if (shouldRandom) workingSequence = shuffleArray([...selectedSequence]);

    // petite pause avant le premier assaut
    showStatus('⏱️ Démarrage dans 5 s…');
    await sleep(5000);

    // son d’accroche
    playSound('bbp');

    // lecture de chaque assaut
    for (let i = 0; i < workingSequence.length; i++) {
      if (!isPlaying) break;

      // petit signal sonore entre deux assauts (si ce n’est pas le premier)
      if (i > 0) {
        playSound('notif');
        await sleep(500);
      }

      await speakAssaut(workingSequence[i]);
      // pause intermédiaire définie par l’utilisateur
      if (i < workingSequence.length - 1) {
        const ms = parseInt(intervalRange.value) * 1000;
        showStatus(`# Pause (${intervalRange.value}s)`);
        await sleep(ms);
      }
    }

    // fin de boucle éventuelle
    if (shouldLoop && isPlaying) {
      showStatus('🔁 Nouvelle boucle dans 3 s…');
      await sleep(3000);
    }

  } while (shouldLoop && isPlaying);

  showStatus('✅ Séquence terminée !');
  resetControlsAfterPlay();
}

/* --------------------------------------------------------------------
   1️⃣1️⃣  Lecture d’un seul assaut (pour le script 1 & 2)
-------------------------------------------------------------------- */
function speakAssaut(assaut) {
  return new Promise((resolve) => {
    const text = `${assaut.assaut}. ${assaut.objectif}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR';
    utt.rate = 1;
    utt.pitch = 1;
    utt.onend = resolve;
    synth.speak(utt);
  });
}

/* --------------------------------------------------------------------
   1️⃣2️⃣  Arrêt et remise à zéro
-------------------------------------------------------------------- */
function stopSequence() {
  isPlaying = false;

  if (sequenceTimeout) {
    clearTimeout(sequenceTimeout);
    sequenceTimeout = null;
  }
  stopSpeech();                     // fonction déjà présente dans le script 1

  btnPlaySequence.disabled   = false;
  btnStopSequence.disabled   = true;
  btnValidateSequence.disabled = false;

  hideStatus();
}

/* --------------------------------------------------------------------
   1️⃣3️⃣  Réinitialisation des boutons après lecture
-------------------------------------------------------------------- */
function resetControlsAfterPlay() {
  // remise à zéro après la boucle ou après l’arrêt
  setTimeout(() => {
    btnPlaySequence.disabled   = false;
    btnStopSequence.disabled   = true;
    btnValidateSequence.disabled = false;
    hideStatus();
  }, 3000);
}

/* --------------------------------------------------------------------
   1️⃣4️⃣  Boucle de rafraîchissement du délai
-------------------------------------------------------------------- */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* --------------------------------------------------------------------
   1️⃣5️⃣  Gestion du son (identique à votre version d'origine)
-------------------------------------------------------------------- */
function initSounds() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    bbpSound   = new Audio('bbp.mp3');
    notifSound = new Audio('notif.mp3');
    bbpSound.load();
    notifSound.load();
  } catch (e) {
    console.warn('Audio non supporté :', e);
  }
}
function playSound(type) {
  if (!audioContext || !bbpSound || !notifSound) return;
  const s = type === 'bbp' ? bbpSound : notifSound;
  s.currentTime = 0;
  s.play().catch(() => console.warn('Erreur lecture son'));
}

/* --------------------------------------------------------------------
   1️⃣6️⃣  Utilitaires de status / affichage
-------------------------------------------------------------------- */
function showStatus(msg) {
  sequenceStatus.textContent = msg;
  sequenceStatus.classList.add('active');
}
function hideStatus() {
  sequenceStatus.classList.remove('active');
}

/* --------------------------------------------------------------------
   1️⃣7️⃣  Petit helper : shuffle d’un tableau
-------------------------------------------------------------------- */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* --------------------------------------------------------------------
   1️⃣8️⃣  Autres fonctions déjà présentes (speech, affichage, etc.)
-------------------------------------------------------------------- */
// -- Les fonctions `stopSpeech`, `speakWithPause`, `playAssaut` … 
//     proviennent du script 1 et sont strictement conservées.
//     Elles sont donc **déclarées **au‑dessus** de ce bloc (voir le
//     script complet que vous avez déjà).  
//     Aucun changement n’est requis ici.

/* --------------------------------------------------------------------
   ✅  FIN DE L’INITIALISATION
-------------------------------------------------------------------- */
// Appel de l’initialiseur au moment où le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript2);
} else {
  initializeScript2();
}

/* --------------------------------------------------------------------
   📢  On rend la fonction removeFromSequence globale afin que le HTML
        (ex. bouton “✕” dans les chips) puisse l’appeler.
-------------------------------------------------------------------- */
window.removeFromSequence = removeFromSequence;
