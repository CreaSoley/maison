/**************************************************
 *  KIHONPREM – Script amélioré avec contrôles
 *  - Sélection aléatoire
 *  - Lecture japonaise avec ding
 *  - Déblocage desktop Chrome/Firefox
 *  - NOUVEAU : Bouton stop, contrôle vitesse, intervalles
 **************************************************/

let data = [];
let selected = [];
let isPlaying = false;
let currentInterval = null;
let currentTimeouts = [];
let currentIndex = 0;

/* Délais configurables */
const delayFirstDing = 5000;   // 5 sec avant le premier ding
const delayAfterDing = 3000;   // 3 sec après ding avant la lecture
let delayBetweenSets = 30000;  // Valeur par défaut : 30 sec (modifiable via slider)
let speechRate = 0.7;          // Vitesse par défaut (modifiable via slider)

const dingSound = new Audio("ding.mp3");
const beepSound = new Audio("beep.mp3");  // Nouveau son de fin

/* ----------------------------------------------
   Chargement du JSON
----------------------------------------------- */
async function loadJSON() {
    try {
        const response = await fetch("kihonprem.json");
        const json = await response.json();
        data = json.enchaînements;
        initControls(); // Initialiser les contrôles après le chargement
    } catch (err) {
        console.error("❌ Erreur chargement JSON :", err);
    }
}

/* ----------------------------------------------
   Initialisation des contrôles UI
----------------------------------------------- */
function initControls() {
    // Créer les contrôles s'ils n'existent pas déjà dans le HTML
    const controlsContainer = document.getElementById("audioControls");
    if (!controlsContainer) {
        const container = document.createElement("div");
        container.id = "audioControls";
        container.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: var(--card-shadow);
            border: 2px solid var(--pink-2);
        `;
        
        container.innerHTML = `
            <div style="display: grid; gap: 15px;">
                <!-- Bouton Stop -->
                <button id="stopBtn" style="
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 1rem;
                    cursor: pointer;
                    display: none;
                    transition: 0.3s;
                ">⏹ STOP</button>
                
                <!-- Contrôle de vitesse -->
                <div>
                    <label style="font-weight: bold; color: var(--accent);">
                        Vitesse de lecture : <span id="speedValue">×0.7</span>
                    </label>
                    <input type="range" id="speedSlider" 
                        min="0.3" max="2" step="0.1" value="0.7"
                        style="width: 100%; margin-top: 5px;">
                </div>
                
                <!-- Contrôle d'intervalle -->
                <div>
                    <label style="font-weight: bold; color: var(--accent);">
                        Intervalle entre enchaînements : <span id="intervalValue">30s</span>
                    </label>
                    <input type="range" id="intervalSlider" 
                        min="5" max="60" step="5" value="30"
                        style="width: 100%; margin-top: 5px;">
                </div>
                
                <!-- Indicateur de progression -->
                <div id="progressIndicator" style="
                    display: none;
                    padding: 10px;
                    background: var(--pink-1);
                    border-radius: 10px;
                    text-align: center;
                ">
                    <span id="progressText">En cours...</span>
                </div>
            </div>
        `;
        
        // Insérer après les boutons existants
        const resultDiv = document.getElementById("result");
        resultDiv.parentNode.insertBefore(container, resultDiv);
    }
    
    // Attacher les événements
    const stopBtn = document.getElementById("stopBtn");
    const speedSlider = document.getElementById("speedSlider");
    const intervalSlider = document.getElementById("intervalSlider");
    const speedValue = document.getElementById("speedValue");
    const intervalValue = document.getElementById("intervalValue");
    
    // Bouton Stop
    stopBtn.addEventListener("click", stopReading);
    
    // Slider de vitesse
    speedSlider.addEventListener("input", (e) => {
        speechRate = parseFloat(e.target.value);
        speedValue.textContent = `×${speechRate.toFixed(1)}`;
    });
    
    // Slider d'intervalle
    intervalSlider.addEventListener("input", (e) => {
        const seconds = parseInt(e.target.value);
        delayBetweenSets = seconds * 1000;
        intervalValue.textContent = `${seconds}s`;
    });
}

/* ----------------------------------------------
   Génération aléatoire
----------------------------------------------- */
function generate() {
    const count = parseInt(document.getElementById("count").value);
    selected = [];

    if (data.length === 0) return;

    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * data.length);
        selected.push(data[r]);
    }

    display();
}

/* ----------------------------------------------
   Affichage FR + JP
----------------------------------------------- */
function display() {
    const container = document.getElementById("result");
    container.innerHTML = "<h3>Enchaînements sélectionnés :</h3>";

    selected.forEach((e, i) => {
        container.innerHTML += `
            <p id="item-${i}" style="transition: 0.3s;">
                <b>${i + 1}.</b> ${e.fr} <br><i>${e.jp}</i>
            </p>`;
    });
}

/* ----------------------------------------------
   Déblocage de la synthèse sur DESKTOP
----------------------------------------------- */
function unlockSpeech() {
    return new Promise(resolve => {
        const utter = new SpeechSynthesisUtterance("あ");
        utter.lang = "ja-JP";
        utter.rate = 0.01;
        utter.volume = 0.001;
        utter.onend = resolve;
        speechSynthesis.speak(utter);
    });
}

/* ----------------------------------------------
   Lecture japonaise améliorée avec contrôles
----------------------------------------------- */
async function readJapanese() {
    if (selected.length === 0) return;
    if (isPlaying) return; // Éviter les lectures multiples

    isPlaying = true;
    currentIndex = 0;
    showControls(true);
    updateProgress(`Préparation... (${(delayFirstDing/1000)}s)`);

    // Débloque la synthèse sur desktop
    await unlockSpeech();

    // 5 sec → ding → 3 sec → lecture du premier enchaînement
    const firstTimeout = setTimeout(() => {
        if (!isPlaying) return;

        playDing(() => {
            if (!isPlaying) return;
            
            highlightItem(currentIndex);
            readOne(currentIndex);
            currentIndex++;
            
            updateProgress(`Enchaînement ${currentIndex}/${selected.length}`);

            // Pour les suivants
            if (currentIndex < selected.length) {
                scheduleNext();
            } else {
                // Fin de tous les enchaînements
                finishReading();
            }
        });
    }, delayFirstDing);

    currentTimeouts.push(firstTimeout);
}

/* ----------------------------------------------
   Planification du prochain enchaînement
----------------------------------------------- */
function scheduleNext() {
    if (!isPlaying) return;

    updateProgress(`Pause ${(delayBetweenSets/1000)}s avant le suivant...`);
    
    // Jouer le beep après l'intervalle
    const beepTimeout = setTimeout(() => {
        if (!isPlaying) return;
        playBeep();
    }, delayBetweenSets - 3000); // Beep 3 secondes avant le prochain ding
    
    currentTimeouts.push(beepTimeout);

    // Programmer le prochain enchaînement
    const nextTimeout = setTimeout(() => {
        if (!isPlaying || currentIndex >= selected.length) {
            finishReading();
            return;
        }

        playDing(() => {
            if (!isPlaying) return;
            
            highlightItem(currentIndex);
            readOne(currentIndex);
            currentIndex++;
            
            updateProgress(`Enchaînement ${currentIndex}/${selected.length}`);

            if (currentIndex < selected.length) {
                scheduleNext();
            } else {
                finishReading();
            }
        });
    }, delayBetweenSets);

    currentTimeouts.push(nextTimeout);
}

/* ----------------------------------------------
   Lecture d'un seul enchaînement avec vitesse variable
----------------------------------------------- */
function readOne(i) {
    if (!isPlaying) return;
    
    const text = selected[i].jp;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = speechRate;  // Utilise la vitesse configurée
    utter.pitch = 1.0;
    utter.volume = 1.0;

    speechSynthesis.speak(utter);
}

/* ----------------------------------------------
   Fonction Stop
----------------------------------------------- */
function stopReading() {
    isPlaying = false;
    
    // Annuler tous les timeouts
    currentTimeouts.forEach(timeout => clearTimeout(timeout));
    currentTimeouts = [];
    
    // Arrêter la synthèse vocale
    speechSynthesis.cancel();
    
    // Réinitialiser l'affichage
    showControls(false);
    updateProgress("");
    removeAllHighlights();
}

/* ----------------------------------------------
   Fin de lecture
----------------------------------------------- */
function finishReading() {
    isPlaying = false;
    currentTimeouts = [];
    showControls(false);
    updateProgress("✅ Terminé !");
    removeAllHighlights();
    
    // Jouer un double beep de fin
    playBeep(() => {
        setTimeout(() => playBeep(), 300);
    });
    
    // Masquer le message après 3 secondes
    setTimeout(() => updateProgress(""), 3000);
}

/* ----------------------------------------------
   Sons : Ding et Beep
----------------------------------------------- */
function playDing(after) {
    dingSound.currentTime = 0;
    dingSound.play().then(() => {
        setTimeout(after, delayAfterDing);
    }).catch(err => {
        console.error("Erreur lecture ding :", err);
        setTimeout(after, delayAfterDing);
    });
}

function playBeep(callback) {
    beepSound.currentTime = 0;
    beepSound.play().then(() => {
        if (callback) callback();
    }).catch(err => {
        console.error("Erreur lecture beep :", err);
        if (callback) callback();
    });
}

/* ----------------------------------------------
   Fonctions UI auxiliaires
----------------------------------------------- */
function showControls(show) {
    const stopBtn = document.getElementById("stopBtn");
    const progressDiv = document.getElementById("progressIndicator");
    
    if (stopBtn) stopBtn.style.display = show ? "block" : "none";
    if (progressDiv) progressDiv.style.display = show ? "block" : "none";
}

function updateProgress(text) {
    const progressText = document.getElementById("progressText");
    if (progressText) progressText.textContent = text;
}

function highlightItem(index) {
    removeAllHighlights();
    const item = document.getElementById(`item-${index}`);
    if (item) {
        item.style.backgroundColor = "var(--pink-1)";
        item.style.padding = "10px";
        item.style.borderRadius = "10px";
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function removeAllHighlights() {
    selected.forEach((_, i) => {
        const item = document.getElementById(`item-${i}`);
        if (item) {
            item.style.backgroundColor = "transparent";
            item.style.padding = "0";
        }
    });
}

/* ----------------------------------------------
   Init
----------------------------------------------- */
loadJSON();
