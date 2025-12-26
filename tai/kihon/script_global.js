Voici les scripts complètement réécrits avec toutes les fonctionnalités demandées :

```javascript
/**************************************************
 *  SCRIPT 2 — ENCHAINEMENT AVANCÉ
 *  - Tirage aléatoire depuis JSON
 *  - Filtrage par spécialité
 *  - Lecture japonaise avec répétitions
 *  - Beeper configurable
 *  - Popup descriptions
 **************************************************/

// Variables globales Script 2
let enchainementsData = [];
let techniquesDescriptions = [];
let currentEnchainement = null;
let enchainementBeeper = null;
let enchainementTimeouts = [];
let isReadingEnchainement = false;
let enchainementSpeechRate = 0.7;

// Chargement des données
async function loadEnchainementData() {
    try {
        // Charger les enchainements
        const response1 = await fetch("kihon_maj2025.json");
        enchainementsData = await response1.json();
        
        // Charger les descriptions pour les popups
        const response2 = await fetch("tjkihon.json");
        techniquesDescriptions = await response2.json();
        
        initEnchainementUI();
        populateSpecialites();
    } catch (err) {
        console.error("❌ Erreur chargement données enchainements :", err);
    }
}

// Initialisation de l'interface Enchainement
function initEnchainementUI() {
    const container = document.getElementById("enchainementSection");
    if (!container) return;
    
    // Ajouter les contrôles s'ils n'existent pas
    if (!document.getElementById("enchainementControls")) {
        const controls = document.createElement("div");
        controls.id = "enchainementControls";
        controls.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: var(--card-shadow); border: 2px solid var(--pink-2);">
                <!-- Filtre spécialité -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; color: var(--accent);">Filtrer par spécialité :</label>
                    <select id="filterSpecialite" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 8px; border: 2px solid var(--pink-2);">
                        <option value="">Toutes les spécialités</option>
                    </select>
                </div>
                
                <!-- Bouton tirage -->
                <button id="btnNouveauEnchainement" style="
                    width: 100%;
                    padding: 12px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-bottom: 15px;
                ">🎲 Nouveau tirage</button>
                
                <!-- Contrôles audio -->
                <div style="display: grid; gap: 10px;">
                    <!-- Vitesse de lecture -->
                    <div>
                        <label style="font-weight: bold; color: var(--accent);">
                            Vitesse lecture JP : <span id="enchainementSpeedValue">×0.7</span>
                        </label>
                        <input type="range" id="enchainementSpeedSlider" 
                            min="0.3" max="2" step="0.1" value="0.7"
                            style="width: 100%;">
                    </div>
                    
                    <!-- Bouton lecture -->
                    <button id="btnLectureJP" style="
                        padding: 10px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">▶️ Lire en japonais (2 fois)</button>
                    
                    <!-- Beeper -->
                    <div>
                        <label style="font-weight: bold; color: var(--accent);">
                            Beeper : <span id="beeperFreqValue">3s</span>
                        </label>
                        <input type="range" id="beeperFreqSlider" 
                            min="1" max="10" step="1" value="3"
                            style="width: 100%;">
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button id="btnStartBeeper" style="
                            flex: 1;
                            padding: 10px;
                            background: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">🔔 Démarrer Beeper</button>
                        
                        <button id="btnStopBeeper" style="
                            flex: 1;
                            padding: 10px;
                            background: #ff4444;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">⏹ Stop Beeper</button>
                    </div>
                </div>
            </div>
            
            <!-- Affichage de l'enchainement -->
            <div id="enchainementResult" style="
                background: white;
                padding: 25px;
                border-radius: 15px;
                box-shadow: var(--card-shadow);
                border: 2px solid var(--pink-2);
                min-height: 150px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
            ">
                <p style="color: #999;">Cliquez sur "Nouveau tirage" pour commencer</p>
            </div>
        `;
        container.appendChild(controls);
    }
    
    // Attacher les événements
    attachEnchainementEvents();
}

// Population du filtre de spécialités
function populateSpecialites() {
    const select = document.getElementById("filterSpecialite");
    if (!select) return;
    
    // Extraire toutes les spécialités uniques
    const allSpecs = new Set();
    enchainementsData.forEach(e => {
        e.specialite.forEach(s => allSpecs.add(s));
    });
    
    allSpecs.forEach(spec => {
        const option = document.createElement("option");
        option.value = spec;
        option.textContent = spec;
        select.appendChild(option);
    });
}

// Attacher les événements
function attachEnchainementEvents() {
    // Bouton nouveau tirage
    document.getElementById("btnNouveauEnchainement")?.addEventListener("click", nouveauEnchainement);
    
    // Slider vitesse
    const speedSlider = document.getElementById("enchainementSpeedSlider");
    speedSlider?.addEventListener("input", (e) => {
        enchainementSpeechRate = parseFloat(e.target.value);
        document.getElementById("enchainementSpeedValue").textContent = `×${enchainementSpeechRate.toFixed(1)}`;
    });
    
    // Bouton lecture JP
    document.getElementById("btnLectureJP")?.addEventListener("click", lireEnchainementJaponais);
    
    // Slider beeper
    const beeperSlider = document.getElementById("beeperFreqSlider");
    beeperSlider?.addEventListener("input", (e) => {
        document.getElementById("beeperFreqValue").textContent = `${e.target.value}s`;
    });
    
    // Boutons beeper
    document.getElementById("btnStartBeeper")?.addEventListener("click", startEnchainementBeeper);
    document.getElementById("btnStopBeeper")?.addEventListener("click", stopEnchainementBeeper);
}

// Nouveau tirage d'enchainement
function nouveauEnchainement() {
    const specialite = document.getElementById("filterSpecialite")?.value;
    let filtered = enchainementsData;
    
    // Filtrer par spécialité si sélectionnée
    if (specialite) {
        filtered = enchainementsData.filter(e => e.specialite.includes(specialite));
    }
    
    if (filtered.length === 0) {
        alert("Aucun enchainement trouvé pour cette spécialité");
        return;
    }
    
    // Sélection aléatoire
    currentEnchainement = filtered[Math.floor(Math.random() * filtered.length)];
    afficherEnchainement();
}

// Affichage de l'enchainement
function afficherEnchainement() {
    const resultDiv = document.getElementById("enchainementResult");
    if (!resultDiv || !currentEnchainement) return;
    
    resultDiv.innerHTML = `
        <div style="animation: fadeIn 0.4s;">
            <h3 style="color: var(--accent); margin-bottom: 15px;">Enchainement sélectionné :</h3>
            <div id="enchainementFR" style="font-size: 1.3rem; font-weight: bold; margin-bottom: 10px; color: #333;">
                ${createClickableTerms(currentEnchainement.fr)}
            </div>
            <div style="font-size: 1.2rem; color: #666; font-style: italic;">
                ${currentEnchainement.jp}
            </div>
            <div style="margin-top: 10px; font-size: 0.9rem; color: var(--accent);">
                <em>Cliquez sur une technique pour voir sa description</em>
            </div>
        </div>
    `;
}

// Créer des termes cliquables
function createClickableTerms(text) {
    // Séparer par virgule et flèche
    const terms = text.split(/[,→]/);
    return terms.map(term => {
        const trimmed = term.trim();
        return `<span class="clickable-term" onclick="showTechniquePopup('${trimmed}')" style="
            cursor: pointer;
            text-decoration: underline;
            text-decoration-style: dotted;
            text-underline-offset: 3px;
            transition: 0.2s;
        " onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#333'">${trimmed}</span>`;
    }).join(' → ');
}

// Afficher popup description
function showTechniquePopup(termName) {
    // Chercher la technique dans les descriptions
    const technique = techniquesDescriptions.find(t => 
        t.nom.toLowerCase() === termName.toLowerCase() ||
        t.nom.toLowerCase().includes(termName.toLowerCase()) ||
        termName.toLowerCase().includes(t.nom.toLowerCase())
    );
    
    // Créer le popup
    const existingPopup = document.getElementById("techniquePopup");
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement("div");
    popup.id = "techniquePopup";
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        animation: fadeIn 0.3s;
    `;
    
    if (technique) {
        popup.innerHTML = `
            <button onclick="this.parentElement.remove()" style="
                float: right;
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 18px;
            ">×</button>
            <h2 style="color: var(--accent); margin-bottom: 15px;">${technique.nom}</h2>
            <p style="font-style: italic; color: #666; margin-bottom: 10px;">Catégorie: ${technique.categorie}</p>
            <p style="line-height: 1.6;">${technique.description.replace(/\n/g, '<br>')}</p>
            ${technique.video ? `
                <iframe src="${technique.video}" 
                    style="width: 100%; height: 250px; margin-top: 15px; border-radius: 10px;"
                    frameborder="0" allowfullscreen></iframe>
            ` : ''}
        `;
    } else {
        popup.innerHTML = `
            <button onclick="this.parentElement.remove()" style="
                float: right;
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
            ">×</button>
            <h3 style="color: var(--accent);">${termName}</h3>
            <p style="color: #666;">Description non trouvée dans la base de données.</p>
        `;
    }
    
    document.body.appendChild(popup);
    
    // Fermer en cliquant à l'extérieur
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && !e.target.classList.contains('clickable-term')) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 100);
}

// Lecture en japonais
async function lireEnchainementJaponais() {
    if (!currentEnchainement || isReadingEnchainement) return;
    
    isReadingEnchainement = true;
    const btn = document.getElementById("btnLectureJP");
    const originalText = btn.textContent;
    btn.textContent = "⏳ Préparation (5s)...";
    btn.disabled = true;
    
    // Déblocage synthèse vocale
    await unlockSpeechSynthesis();
    
    // Attendre 5 secondes
    enchainementTimeouts.push(setTimeout(() => {
        btn.textContent = "🔊 Lecture 1/2...";
        speakJapanese(currentEnchainement.jp, () => {
            // Attendre 5 secondes avant la 2ème lecture
            btn.textContent = "⏸ Pause (5s)...";
            enchainementTimeouts.push(setTimeout(() => {
                btn.textContent = "🔊 Lecture 2/2...";
                speakJapanese(currentEnchainement.jp, () => {
                    // Fin
                    btn.textContent = originalText;
                    btn.disabled = false;
                    isReadingEnchainement = false;
                });
            }, 5000));
        });
    }, 5000));
}

// Synthèse vocale japonaise
function speakJapanese(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = enchainementSpeechRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = callback;
    speechSynthesis.speak(utterance);
}

// Beeper enchainement
function startEnchainementBeeper() {
    stopEnchainementBeeper(); // Stop si déjà en cours
    
    const freq = parseInt(document.getElementById("beeperFreqSlider")?.value || 3) * 1000;
    const topSound = new Audio("top.mp3");
    
    // Jouer immédiatement
    topSound.play().catch(e => console.error("Erreur lecture top:", e));
    
    // Répéter
    enchainementBeeper = setInterval(() => {
        topSound.currentTime = 0;
        topSound.play().catch(e => console.error("Erreur lecture top:", e));
    }, freq);
    
    // Feedback visuel
    document.getElementById("btnStartBeeper").style.background = "#4CAF50";
}

function stopEnchainementBeeper() {
    if (enchainementBeeper) {
        clearInterval(enchainementBeeper);
        enchainementBeeper = null;
        document.getElementById("btnStartBeeper").style.background = "#2196F3";
    }
}

/**************************************************
 *  SCRIPT 3 — 3 TECHNIQUES CIBLES
 *  - Sélection aléatoire
 *  - Beeper indépendant
 *  - Lecture française
 **************************************************/

// Variables globales Script 3
const techniquesCible = [
    "Mae Geri (jambe arrière, chudan)",
    "Mawashi Geri (jambe arrière, jodan/chudan)",
    "Mae Geri jambe avant avec sursaut (chudan)",
    "Mawashi Geri jambe avant avec sursaut (jodan/chudan)",
    "Gyaku Zuki chudan",
    "Kizami/Maete Zuki jodan → Gyaku Zuki chudan",
    "Oï Zuki jodan → retour arrière"
];

let cibleBeeper = null;
let currentTiragesCible = [];

// Initialisation Script 3
function initCibleUI() {
    const container = document.getElementById("cibleSection");
    if (!container) {
        // Créer la section si elle n'existe pas
        const newSection = document.createElement("section");
        newSection.id = "cibleSection";
        newSection.className = "card";
        newSection.innerHTML = `
            <h2 style="color: var(--accent); margin-bottom: 20px;">🎯 3 Techniques Cibles</h2>
            
            <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: var(--card-shadow); border: 2px solid var(--pink-2);">
                <!-- Boutons principaux -->
                <button id="btnNouveauCible" style="
                    width: 100%;
                    padding: 12px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-bottom: 15px;
                ">🎲 Nouveau tirage (3 techniques)</button>
                
                <!-- Contrôles -->
                <div style="display: grid; gap: 10px;">
                    <!-- Lecture française -->
                    <button id="btnLectureFR" style="
                        padding: 10px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">🔊 Lire en français</button>
                    
                    <!-- Beeper cible -->
                    <div>
                        <label style="font-weight: bold; color: var(--accent);">
                            Beeper Cible : <span id="cibleBeeperFreqValue">3s</span>
                        </label>
                        <input type="range" id="cibleBeeperFreqSlider" 
                            min="1" max="10" step="1" value="3"
                            style="width: 100%;">
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button id="btnStartCibleBeeper" style="
                            flex: 1;
                            padding: 10px;
                            background: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">🔔 Démarrer Beeper</button>
                        
                        <button id="btnStopCibleBeeper" style="
                            flex: 1;
                            padding: 10px;
                            background: #ff4444;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">⏹ Stop Beeper</button>
                    </div>
                </div>
            </div>
            
            <!-- Liste des techniques -->
            <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: var(--card-shadow); border: 2px solid var(--pink-2);">
                <ul id="cibleList" style="list-style: none; padding: 0; margin: 0;">
                    <li style="color: #999; text-align: center;">Cliquez sur "Nouveau tirage" pour commencer</li>
                </ul>
            </div>
        `;
        
        // Insérer après la section enchainement ou à la fin du main
        const main = document.querySelector("main");
        const enchainementSection = document.getElementById("enchainementSection");
        if (enchainementSection) {
            enchainementSection.parentNode.insertBefore(newSection, enchainementSection.nextSibling);
        } else if (main) {
            main.appendChild(newSection);
        }
    }
    
    // Attacher les événements
    attachCibleEvents();
}

// Attacher événements Script 3
function attachCibleEvents() {
    document.getElementById("btnNouveauCible")?.addEventListener("click", nouveauTirageCible);
    document.getElementById("btnLectureFR")?.addEventListener("click", lireTechniquesFrancais);
    
    // Slider beeper cible
    const cibleBeeperSlider = document.getElementById("cibleBeeperFreqSlider");
    cibleBeeperSlider?.addEventListener("input", (e) => {
        document.getElementById("cibleBeeperFreqValue").textContent = `${e.target.value}s`;
    });
    
    // Boutons beeper cible
    document.getElementById("btnStartCibleBeeper")?.addEventListener("click", startCibleBeeper);
    document.getElementById("btnStopCibleBeeper")?.addEventListener("click", stopCibleBeeper);
}

// Nouveau tirage de 3 techniques
function nouveauTirageCible() {
    currentTiragesCible = [];
    const disponibles = [...techniquesCible];
    
    // Sélectionner 3 techniques différentes
    for (let i = 0; i < 3 && disponibles.length > 0; i++) {
        const index = Math.floor(Math.random() * disponibles.length);
        currentTiragesCible.push(disponibles[index]);
        disponibles.splice(index, 1);
    }
    
    afficherTechniquesCible();
}

// Affichage des techniques cibles
function afficherTechniquesCible() {
    const list = document.getElementById("cibleList");
    list.innerHTML = "";
    
    currentTiragesCible.forEach((tech, i) => {
        const li = document.createElement("li");
        li.style.cssText = `
            padding: 12px;
            margin-bottom: 10px;
            background: var(--pink-1);
            border-radius: 10px;
            font-size: 1.1rem;
            animation: fadeIn 0.4s;
            animation-delay: ${i * 0.1}s;
            animation-fill-mode: both;
        `;
        li.innerHTML = `<strong>${i + 1}.</strong> ${tech}`;
        list.appendChild(li);
    });
}

// Lecture en français
function lireTechniquesFrancais() {
    if (currentTiragesCible.length === 0) {
        alert("Veuillez d'abord faire un tirage");
        return;
    }
    
    speechSynthesis.cancel(); // Arrêter toute lecture en cours
    
    let index = 0;
    function speakNext() {
        if (index < currentTiragesCible.length) {
            const utterance = new SpeechSynthesisUtterance(`${index + 1}. ${currentTiragesCible[index]}`);
            utterance.lang = "fr-FR";
            utterance.rate = 0.9;
            utterance.onend = () => {
                index++;
                setTimeout(speakNext, 1000); // Pause entre les techniques
            };
            speechSynthesis.speak(utterance);
        }
    }
    
    speakNext();
}

// Beeper cible
function startCibleBeeper() {
    stopCibleBeeper(); // Stop si déjà en cours
    
    const freq = parseInt(document.getElementById("cibleBeeperFreqSlider")?.value || 3) * 1000;
    const topSound = new Audio("top.mp3");
    
    // Jouer immédiatement
    topSound.play().catch(e => console.error("Erreur lecture top:", e));
    
    // Répéter
    cibleBeeper = setInterval(() => {
        topSound.currentTime = 0;
        topSound.play().catch(e => console.error("Erreur lecture top:", e));
    }, freq);
    
    // Feedback visuel
    document.getElementById("btnStartCibleBeeper").style.background = "#4CAF50";
}

function stopCibleBeeper() {
    if (cibleBeeper) {
        clearInterval(cibleBeeper);
        cibleBeeper = null;
        document.getElementById("btnStartCibleBeeper").style.background = "#2196F3";
    }
}

// Fonction utilitaire de déblocage synthèse vocale
async function unlockSpeechSynthesis() {
    return new Promise(resolve => {
        const utter = new SpeechSynthesisUtterance("a");
        utter.volume = 0.001;
        utter.onend = resolve;
        speechSynthesis.speak(utter);
    });
}

// Initialisation globale
document.addEventListener("DOMContentLoaded", () => {
    loadEnchainementData();
    initCibleUI();
    nouveauTirageCible(); // Tirage initial
});
```

## Principales fonctionnalités ajoutées :

### SCRIPT 2 - ENCHAINEMENT :
1. **Chargement depuis JSON** avec filtrage par spécialité
2. **Affichage FR + JP** avec animation
3. **Termes cliquables** qui ouvrent une popup avec description
4. **Lecture japonaise** : 2 fois avec 5s d'intervalle
5. **Contrôle de vitesse** de lecture (0.3× à 2.0×)
6. **Beeper configurable** (1-10 secondes) avec top.mp3
7. **Bouton stop** pour le beeper

### SCRIPT 3 - 3 TECHNIQUES CIBLES :
1. **Section complète** qui s'affiche sur la page
2. **Tirage de 3 techniques** aléatoires et uniques
3. **Lecture en français** des techniques
4. **Beeper indépendant** avec contrôles séparés
5. **Animation** lors de l'affichage

Les deux scripts sont maintenant indépendants mais peuvent fonctionner simultanément avec leurs propres beepers et contrôles audio.
