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

/* ==============================================================
   EXERCICE 2 – ENCHAÎNEMENT PERSONNALISÉ (lecture uniquement du titre)
   ============================================================== */

/* ---------- 2️⃣ IIFE qui regroupe tout l'exercice 2 ---------- */
;(function () {
  /* -------------------------------------------------
     2.1 Références du DOM (celles déjà présentes dans le HTML)
     ------------------------------------------------- */
  const searchAssaut      = document.getElementById('searchAssaut');
  const assautsList       = document.getElementById('assautsList');
  const btnValidateSequence= document.getElementById('btnValidateSequence');
  const btnPlaySequence    = document.getElementById('btnPlaySequence');
  const btnStopSequence    = document.getElementById('btnStopSequence');
  const intervalRange      = document.getElementById('intervalRange');
  const intervalValue      = document.getElementById('intervalValue');
  const sequenceStatus     = document.getElementById('sequenceStatus');
  const sequenceDisplay    = document.getElementById('sequenceDisplay');
  const optionLoop         = document.getElementById('optionLoop');
  const optionRandom       = document.getElementById('optionRandom');

  /* -------------------------------------------------
     2.2 Données **en dur** – exactement les 20 intitulés que vous avez fournis
     ------------------------------------------------- */
  const titlesHardCoded = [
    "Etranglement de face à une main",
    "Etranglement de face à deux mains",
    "Soumission par clé de jambe",
    "Couché‑ferme (guard pass)",
    "Passage de garde inversé",
    "Escapatoire en cage",
    "Projection d’épaule",
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

  /* -------------------------------------------------
     2.3 Tableau d’objets minimal (pour garder la même forme que le JSON)
     ------------------------------------------------- */
  const assautsData = titlesHardCoded.map(t => ({ assaut: t }));

  /* -------------------------------------------------
     2.4 Variables propres à lExercise 2
     ------------------------------------------------- */
  let selectedSequence = [];               // tableau d’assauts (doublons possibles)
  let isPlaying = false;
  let sequenceTimeout = null;
  let audioContext, bbpSound, notifSound;
  let synth;                               // ré‑utilise le même lecteur vocal du script 1

  /* -------------------------------------------------
     2.5 Initialisation (appelée après le DOMContentLoaded)
     ------------------------------------------------- */
  function initExercise2() {
    displayAssaultsList();                 // remplissage initial de la liste

    // Recherche en temps réel
    searchAssaut.addEventListener('input', () => displayAssaultsList(searchAssaut.value));

    // Validation / lecture / arrêt
    btnValidateSequence.addEventListener('click', validateSequence);
    btnPlaySequence.addEventListener('click', playSequence);
    btnStopSequence.addEventListener('click', stopSequence);

    // Gestion du délai entre deux assauts
    intervalRange.addEventListener('input', updateIntervalDisplay);

    // Sons (si les fichiers existent)
    initSounds();
  }

  /* -------------------------------------------------
     2.6 Construction de la liste d’assauts (avec bouton “Ajouter”)
     ------------------------------------------------- */
  function displayAssaultsList(filter = '') {
    assautsList.innerHTML = '';

    const matches = assautsData.filter(a =>
      a.assaut.toLowerCase().includes(filter.toLowerCase())
    );

    matches.forEach((assaut, idx) => {
      const container = document.createElement('div');
      container.className = 'assault-item';
      container.dataset.idx = idx;

      const badge = document.createElement('span');
      badge.className = 'config-badge';
      badge.textContent = assaut.assaut;      // vous pouvez mettre un icône ou la config ici
      badge.title = '';

      const label = document.createElement('label');
      label.htmlFor = `assault-${idx}`;
      label.textContent = `${assaut.assaut}`;

      const btnAdd = document.createElement('button');
      btnAdd.textContent = '➕ Ajouter';
      btnAdd.className = 'add-btn';
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        addAssautToSelection(idx);
      });

      container.appendChild(badge);
      container.appendChild(label);
      container.appendChild(btnAdd);
      assautsList.appendChild(container);
    });
  }

  /* -------------------------------------------------
     2.7 Ajout d’un assaut à la séquence (les doublons sont autorisés)
     ------------------------------------------------- */
  function addAssautToSelection(idx) {
    selectedSequence.push(assautsData[idx]);   // push de l’objet complet
    displaySequencePreview();
    btnValidateSequence.disabled = false;      // on active la validation dès qu’on a au moins un élément
  }

  /* -------------------------------------------------
     2.8 Validation (simple retour visuel)
     ------------------------------------------------- */
  function validateSequence() {
    showStatus(`✅ ${selectedSequence.length} assaut(s) sélectionné(s)`);
  }

  /* -------------------------------------------------
     2.9 Affichage de la séquence (chips avec up/down / ✕)
     ------------------------------------------------- */
  function displaySequencePreview() {
    sequenceDisplay.innerHTML = '';
    if (selectedSequence.length === 0) {
      sequenceDisplay.classList.remove('active');
      btnPlaySequence.disabled = true;
      return;
    }
    sequenceDisplay.classList.add('active');

    const chipsHTML = selectedSequence
      .map((assaut, i) => createSequenceChip(i, assaut))
      .join('');

    const countHTML = `<div class="sequence-count">Total : ${selectedSequence.length} assaut(s)</div>`;
    sequenceDisplay.innerHTML = `
      <div class="sequence-items">${chipsHTML}</div>
      ${countHTML}
    `;
  }

  /** Crée le HTML d’une « chip » (numéro + titre + flèches + croix) */
  function createSequenceChip(pos, assaut) {
    const up = document.createElement('button');
    up.className = 'move-btn up';
    up.innerHTML = '▲';
    up.title = 'Monter';
    up.onclick = () => moveInSequence(pos, -1);

    const dn = document.createElement('button');
    dn.className = 'move-btn down';
    dn.innerHTML = '▼';
    dn.title = 'Descendre';
    dn.onclick = () => moveInSequence(pos, +1);

    const rm = document.createElement('button');
    rm.className = 'remove-btn';
    rm.innerHTML = '✕';
    rm.title = 'Retirer';
    rm.onclick = e => {
      e.stopPropagation();
      removeFromSequence(pos);
    };

    const txt = document.createElement('span');
    txt.textContent = `${pos + 1}. ${assaut.assaut}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'sequence-chip';
    wrapper.dataset.idx = pos;
    wrapper.appendChild(txt);
    wrapper.appendChild(up);
    wrapper.appendChild(dn);
    wrapper.appendChild(rm);
    return wrapper;
  }

  /** Déplace un assaut dans le tableau `selectedSequence` */
  function moveInSequence(idx, direction) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= selectedSequence.length) return;
    const [moved] = selectedSequence.splice(idx, 1);
    selectedSequence.splice(newIdx, 0, moved);
    displaySequencePreview();
  }

  /** Retire un assaut (les doublons sont simplement supprimés) */
  function removeFromSequence(idx) {
    selectedSequence.splice(idx, 1);
    displaySequencePreview();
    if (selectedSequence.length === 0) {
      btnPlaySequence.disabled = true;
    }
  }

  /* -------------------------------------------------
     2.10 Gestion du délai (interval) entre deux assauts
     ------------------------------------------------- */
  function updateIntervalDisplay() {
    intervalValue.textContent = intervalRange.value;
  }

  /* -------------------------------------------------
     2.11 Lecture de la séquence complète (boucle / random / interval)
          → chaque appel utilise **seulement** le titre.
     ------------------------------------------------- */
  async function playSequence() {
    if (selectedSequence.length === 0 || isPlaying) return;

    stopSequence();               // sécurise le cas où on relance
    isPlaying = true;

    btnPlaySequence.disabled = true;
    btnStopSequence.disabled = false;
    btnValidateSequence.disabled = true;

    const shouldLoop  = optionLoop.checked;
    const shouldRandom = optionRandom.checked;

    let working = [...selectedSequence];

    do {
      // Randomisation éventuelle
      if (shouldRandom) working = shuffleArray([...selectedSequence]);

      // Petite pause avant le premier assaut
      showStatus('⏱️ Démarrage dans 5 s…');
      await sleep(5000);

      // Son d’accompagnement (bbp)
      playSound('bbp');

      // Lecture de chaque assaut **uniquement du titre**
      for (let i = 0; i < working.length; i++) {
        if (!isPlaying) break;

        if (i > 0) {
          // Petit signal entre deux assauts
          playSound('notif');
          await sleep(500);
        }

        await speakAssaut(working[i]);           // ← **titre uniquement**
        // Pause définie par l’utilisateur
        if (i < working.length - 1) {
          const ms = parseInt(intervalRange.value) * 1000;
          showStatus(`# Pause (${intervalRange.value}s)`);
          await sleep(ms);
        }
      }

      // Boucle éventuelle
      if (shouldLoop && isPlaying) {
        showStatus('🔁 Nouvelle boucle dans 3 s…');
        await sleep(3000);
      }
    } while (shouldLoop && isPlaying);

    showStatus('✅ Séquence terminée !');
    resetControlsAfterPlay();
  }

  /** Lecture d’un assaut – **seulement** le titre + point final */
  async function speakAssaut(assaut) {
    const text = `${assaut.assaut}.`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = 1;
    utter.onend = () => {};
    synth.speak(utter);
  }

  /** Fonction utilitaire de pause */
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /** Lecture des sons (bbp / notif) – fonctionne si les fichiers existent */
  function playSound(type) {
    if (!audioContext || !bbpSound || !notifSound) return;
    const s = type === 'bbp' ? bbpSound : notifSound;
    s.currentTime = 0;
    s.play().catch(() => console.warn('Erreur de lecture du son'));
  }

  /** Affichage du statut (en haut à droite) */
  function showStatus(msg) {
    sequenceStatus.textContent = msg;
    sequenceStatus.classList.add('active');
  }
  function hideStatus() { sequenceStatus.classList.remove('active'); }

  /** Remise à zéro des boutons après la lecture */
  function resetControlsAfterPlay() {
    setTimeout(() => {
      btnPlaySequence.disabled = false;
      btnStopSequence.disabled = true;
      btnValidateSequence.disabled = false;
      hideStatus();
    }, 3000);
  }

  /** Arrêt de la séquence en cours */
  function stopSequence() {
    isPlaying = false;
    if (sequenceTimeout) clearTimeout(sequenceTimeout);
    stopSpeech();                         // fonction du script 1
    btnPlaySequence.disabled = false;
    btnStopSequence.disabled = true;
    btnValidateSequence.disabled = false;
    hideStatus();
  }

  /** Mélange d’un tableau (pour le mode random) */
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* -------------------------------------------------
     2.12 Initialisation finale de lExercise 2
     ------------------------------------------------- */
  function runExercise2() {
    // (re)création du AudioContext et chargement des fichiers son
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      bbpSound = new Audio('bbp.mp3');
      notifSound = new Audio('notif.mp3');
      bbpSound.load();
      notifSound.load();
    } catch (e) {
      console.warn('Audio non supporté :', e);
    }

    initializeScript2();   // attache tous les écouteurs nécessaires
  }

  // Attente du DOM avant d’appeler runExercise2()
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runExercise2);
  } else {
    runExercise2();
  }

  /* -------------------------------------------------
     2.13 Export global de la fonction de retrait (pour les ✕)
     ------------------------------------------------- */
  window.removeFromSequence = removeFromSequence;

})();   // ← FIN de lIIFE qui encapsule lExercise 2
