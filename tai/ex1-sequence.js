/* ==================== EXERCICE 1 – ASSAUT GUIDÉ ==================== */

/* -------------------------------------------------
   0️⃣  Namespace – empêche toute collision avec d'autres scripts
------------------------------------------------- */
const _ex1 = (() => {
  /* ------------------- 1️⃣ Références DOM ------------------- */
  const selectAssaut      = document.getElementById('selectAssaut');
  const filterConfig      = document.getElementById('filterConfig');
  const btnRandomAssaut   = document.getElementById('btnRandomAssaut');
  const btnPlayAssaut     = document.getElementById('btnPlayAssaut');
  const btnStopAssaut     = document.getElementById('btnStopAssaut');
  const speedRange        = document.getElementById('speedRange');
  const speedValue        = document.getElementById('speedValue');
  const assautCard        = document.getElementById('assautCard');
  const btnPrintAssaut    = document.getElementById('btnPrintAssaut');

  /* ------------------- 2️⃣ Variables globales ------------------- */
  let currentAssaut = null;
  let synth = window.speechSynthesis;
  let isPlaying = false;
  let assautsData = [];          // ← sera remplie après le fetch

  /* ------------------- 3️⃣ Chargement du JSON ------------------- */
  fetch('data/exercices_assauts.json')
    .then(r => r.json())
    .then(data => {
      assautsData = data.exercices;           // <- données brutes
      init();                                 // démarre le script dès que les données sont prêtes
    })
    .catch(err => {
      console.error('Erreur chargement JSON :', err);
      alert('Impossible de charger les exercices d\'assauts');
    });

  /* ------------------- 4️⃣ Initialisation ------------------- */
  function init() {
    // ---- Remplir le <select> ----
    selectAssaut.innerHTML = '';
    assautsData.forEach((assaut, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = assaut.assaut;
      opt.dataset.config = assaut.configuration;
      selectAssaut.appendChild(opt);
    });

    // ---- Attacher les écouteurs ----
    filterConfig.addEventListener('change', handleAssautSelect);
    btnRandomAssaut.addEventListener('click', selectRandomAssaut);
    btnPlayAssaut.addEventListener('click', playAssaut);
    btnStopAssaut.addEventListener('click', stopSpeech);
    speedRange.addEventListener('input', updateSpeedDisplay);
    btnPrintAssaut.addEventListener('click', printAssaut);

    //_optionnel_ : charger les sons si vous en avez besoin
    // initSounds();
  }

  /* ------------------- 5️⃣ Gestion du <select> ------------------- */
  function handleAssautSelect() {
    const idx = selectAssaut.value;
    if (idx === '') {
      currentAssaut = null;
      assautCard.innerHTML = '';
      btnPlayAssaut.disabled = true;
      btnPrintAssaut.disabled = true;
      return;
    }
    currentAssaut = assautsData[idx];
    displayAssaut(currentAssaut);
    btnPlayAssaut.disabled = false;
    btnPrintAssaut.disabled = false;
  }

  /* ------------------- 6️⃣ Filtrage ------------------- */
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

  /* ------------------- 7️⃣ Affichage de la carte ------------------- */
  function displayAssaut(assaut) {
    const cfgLabel = assaut.configuration === 'fauteuil' ? '🪑 Fauteuil' : '🧍 Debout';
    const pointsHTML = assaut.points_cles?.map(p => `<li>${p}</li>`).join('');
    const erreursHTML = assaut.erreurs_a_eviter?.map(e => `<li>${e}</li>`).join('');
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

  /* ------------------- 8️⃣ Vitesse & Pause ------------------- */
  function updateSpeedDisplay() {
    speedValue.textContent = parseFloat(speedRange.value).toFixed(1) + 'x';
  }

  /* ------------------- 9️⃣ Lecture complète (Play) ------------------- */
  async function playAssaut() {
    if (!currentAssaut || isPlaying) return;
    stopSpeech(); isPlaying = true;
    btnPlayAssaut.disabled = true;
    btnStopAssaut.disabled = false;

    const speed = parseFloat(speedRange.value);

    // 1️⃣ Nom de l’assaut
    await speakAssautFull(currentAssaut.assaut);
    await sleep(800);

    // 2️⃣ (Optionnel) Configuration – décommentez si vous voulez la lire
    // const cfg = currentAssaut.configuration === 'fauteuil' ? 'Fauteuil' : 'Debout';
    // await speakWithPause(`Configuration : ${cfg}`, speed);
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

    // 6️⃣ Déroulé
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

  /* ------------------- 10️⃣ Outils vocaux ------------------- */
  function speakWithPause(text, speed) {
    return new Promise(resolve => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      utter.rate = speed;
      utter.onend = resolve;
      synth.speak(utter);
    });
  }

  // Lecture **uniquement** du titre (utilisée uniquement par lExercise 2)
  async function speakAssautFull(title) {
    const utter = new SpeechSynthesisUtterance(`${title}.`);
    utter.lang = 'fr-FR';
    utter.rate = 1;
    synth.speak(utter);
  }

  function stopSpeech() {
    synth.cancel();
    isPlaying = false;
    btnPlayAssaut.disabled = false;
    btnStopAssaut.disabled = true;
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ------------------- 11️⃣ Sons (facultatifs) ------------------- */
  function initSounds() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // Si vous avez des fichiers son, chargez‑les ici.
    } catch (e) {
      console.warn('AudioContext non disponible', e);
    }
  }

  function printAssaut() {
    /* Votre code d’impression tel‑qu’il était avant */
  }

  /* ------------------- 12️⃣ Export du namespace (facultatif) ------------------- */
  // Si vous avez besoin d’appeler depuis l’extérieur (ex. testing) vous pouvez
  // exposer uniquement ce qui doit l’être.
  // window._ex1 = _ex1;   // <-- décommentez seulement si vous le voulez

})();   // ← fin du IIFE de lExercise 1
