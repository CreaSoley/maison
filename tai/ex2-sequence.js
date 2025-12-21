/* ==================== EXERCICE 2 – ENCHAÎNEMENT PERSONNALISÉ ==================== */

/* -------------------------------------------------
   0️⃣  Namespace – évite tout conflit avec lExercise 1
------------------------------------------------- */
const _ex2 = (() => {
  /* ------------------- 1️⃣ Références DOM ------------------- */
  const searchAssaut         = document.getElementById('searchAssaut');
  const assautsList          = document.getElementById('assautsList');
  const btnValidateSequence = document.getElementById('btnValidateSequence');
  const btnPlaySequence     = document.getElementById('btnPlaySequence');
  const btnStopSequence     = document.getElementById('btnStopSequence');
  const intervalRange       = document.getElementById('intervalRange');
  const intervalValue       = document.getElementById('intervalValue');
  const sequenceStatus      = document.getElementById('sequenceStatus');
  const sequenceDisplay     = document.getElementById('sequenceDisplay');
  const optionLoop          = document.getElementById('optionLoop');
  const optionRandom        = document.getElementById('optionRandom');

  /* ------------------- 2️⃣ Données **en dur** (les 20 intitulés) ------------------- */
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

  // On garde la forme “objet” (pour que le reste du code fonctionne sans changer)
  const exercise2Data = titlesHardCoded.map(t => ({ assaut: t }));

  /* ------------------- 3️⃣ Variables locales ------------------- */
  let selectedSequence = [];   // tableau d’assauts (doublons autorisés)
  let isPlaying = false;
  let sequenceTimeout = null;
  let audioContext, bbpSound, notifSound;
  let synth;                                   // ré‑utilise le même SpeechSynthesis du DOM

  /* ------------------- 4️⃣ Initialisation ------------------- */
  function init() {
    displayAssaultsList();                     // remplissage initial (filtrable)

    // Recherche en temps réel
    searchAssaut.addEventListener('input', () => displayAssaultsList(searchAssaut.value));

    // Validation / lecture / arrêt
    btnValidateSequence.addEventListener('click', validateSequence);
    btnPlaySequence.addEventListener('click', playSequence);
    btnStopSequence.addEventListener('click', stopSequence);

    // Gestion du délai entre deux assauts
    intervalRange.addEventListener('input', updateIntervalDisplay);

    // Chargement des sons (facultatif)
    initSounds();
  }

  /* ------------------- 5️⃣ Construction de la liste d’assauts (avec bouton « Ajouter ») ------------------- */
  function displayAssaultsList(filter = '') {
    assautsList.innerHTML = '';
    const matches = exercise2Data.filter(a =>
      a.assaut.toLowerCase().includes(filter.toLowerCase())
    );

    matches.forEach((assaut, idx) => {
      const item = document.createElement('div');
      item.className = 'assault-item';
      item.dataset.idx = idx;

      const badge = document.createElement('span');
      badge.className = 'config-badge';
      badge.textContent = assaut.assaut;             // vous pouvez mettre un icône ici

      const label = document.createElement('label');
      label.htmlFor = `assault-${idx}`;
      label.textContent = `${assaut.assaut}`;

      const btnAdd = document.createElement('button');
      btnAdd.textContent = '➕ Ajouter';
      btnAdd.className = 'add-btn';
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        addAssoutToSelection(idx);
      });

      item.appendChild(badge);
      item.appendChild(label);
      item.appendChild(btnAdd);
      assautsList.appendChild(item);
    });
  }

  /* ------------------- 6️⃣ Ajout d’un assaut à la séquence ------------------- */
  function addAssoutToSelection(idx) {
    selectedSequence.push(exercise2Data[idx]);   // push de l’objet complet
    displaySequencePreview();
    btnValidateSequence.disabled = false;        // active la validation dès qu’on a au moins un élément
  }

  /* ------------------- 7️⃣ Validation (simple statut) ------------------- */
  function validateSequence() {
    showStatus(`✅ ${selectedSequence.length} assaut(s) sélectionné(s)`);
  }

  /* ------------------- 8️⃣ Affichage de la séquence (chips) ------------------- */
  function displaySequencePreview() {
    sequenceDisplay.innerHTML = '';
    if (selectedSequence.length === 0) {
      sequenceDisplay.classList.remove('active');
      btnPlaySequence.disabled = true;
      return;
    }
    sequenceDisplay.classList.add('active');

    const chipsHTML = selectedSequence.map((assaut, i) => createSequenceChip(i, assaut)).join('');
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
    if (selectedSequence.length === 0) btnPlaySequence.disabled = true;
  }

  /* ------------------- 9️⃣ Gestion du délai (interval) ------------------- */
  function updateIntervalDisplay() {
    intervalValue.textContent = intervalRange.value;
  }

  /* ------------------- 🔟 Lecture de la séquence (boucle / random / interval) ------------------- */
  async function playSequence() {
    if (selectedSequence.length === 0 || isPlaying) return;
    stopSequence();                // sécurise le cas où on relance
    isPlaying = true;

    btnPlaySequence.disabled = true;
    btnStopSequence.disabled = false;
    btnValidateSequence.disabled = true;

    const shouldLoop   = optionLoop.checked;
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

        await speakAssaut(working[i]);          // ← **titre uniquement**
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
    // `stopSpeech` appartient à lExercise 1, mais il est disponible globalement,
    // donc on l’appelle ici (c’est le même lecteur vocal).
    stopSpeech();
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

  /** Initialisation des sons (facultatif) */
  function initSounds() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      bbpSound = new Audio('bbp.mp3');
      notifSound = new Audio('notif.mp3');
      bbpSound.load();
      notifSound.load();
    } catch (e) {
      console.warn('Audio non supporté :', e);
    }
  }

  /* ------------------- 1️⃣1️⃣ Lancement au chargement du DOM ------------------- */
  function run() {
    // Le code ci‑dessus (init()) doit être appelé dès que le DOM est prêt.
    // Nous utilisons le même mécanisme que lExercise 1 : on attend
    // `DOMContentLoaded` dans le HTML (voir ci‑dessous) puis on appelle `init()`.
    init();
  }

  // Expose uniquement ce qui doit être accessible depuis d’autres scripts.
  // Le reste reste privé dans le namespace _ex2.
  window._ex2 = { run };   // <-- helper global uniquement pour le démarrage

})();   // ← fin du IIFE de lExercise 2
