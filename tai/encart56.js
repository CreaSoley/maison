/**************************************************
 *  RANDORI – UV5 & UV6
 *  (Sélections, lecture vocale, filtres, bip, doublons)
 **************************************************/

/* ============================================================
   LISTES BRUTES
   ============================================================ */

const LIST_ALL = [
    "Saisie de poignet direct",
    "Saisie de poignet opposé",
    "Saisie de poignet haut",
    "Saisie des deux poignets bas",
    "Saisie des deux poignets haut",
    "Saisie d'un poignet à deux mains",
    "Étranglement de face à une main",
    "Étranglement de face à deux mains",
    "Saisie de revers + mawashi tsuki",
    "Saisie de cheveux",

    "Attaque couteau basse ou pique",
    "Attaque couteau circulaire",
    "Attaque couteau revers",
    "Attaque couteau haute",
    "Matraque haute",
    "Matraque revers",
    "Coup de poing direct",
    "Mawashi tsuki gauche",
    "Mawashi tsuki droit",

    "Saisie manche haute",
    "Saisie manche basse"
];

const LIST_CATEGORIE_A = [
    "Saisie de poignet direct",
    "Saisie de poignet opposé",
    "Saisie de poignet haut",
    "Saisie des deux poignets bas",
    "Saisie des deux poignets haut",
    "Saisie d'un poignet à deux mains",
    "Étranglement de face à une main",
    "Étranglement de face à deux mains",
    "Saisie de revers + mawashi tsuki",
    "Saisie de cheveux",
    "Saisie manche haute",
    "Saisie manche basse"
];

const LIST_CATEGORIE_B = [
    "Attaque couteau basse ou pique",
    "Attaque couteau circulaire",
    "Attaque couteau revers",
    "Attaque couteau haute",
    "Matraque haute",
    "Matraque revers",
    "Coup de poing direct",
    "Mawashi tsuki gauche",
    "Mawashi tsuki droit"
];


/* ============================================================
   UTILITAIRES
   ============================================================ */

function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.9;
    speechSynthesis.speak(u);
}

function getListFromCategory(cat) {
    switch (cat) {
        case "A": return LIST_CATEGORIE_A;
        case "B": return LIST_CATEGORIE_B;
        default:  return LIST_ALL;
    }
}

function getRandomSelection(list, count, allowDuplicates) {
    if (allowDuplicates) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(list[Math.floor(Math.random() * list.length)]);
        }
        return arr;
    }

    // Sans doublons
    const copy = [...list];
    const selected = [];
    while (selected.length < count && copy.length > 0) {
        const idx = Math.floor(Math.random() * copy.length);
        selected.push(copy.splice(idx, 1)[0]);
    }
    return selected;
}


/* ============================================================
   GÉNÉRATEUR D’UI POUR UV5 ET UV6
   ============================================================ */

function buildUI(cardId) {

    const card = document.getElementById(cardId);
    card.innerHTML = `
        <div class="subtitle-arial">Techniques sélectionnées :</div>
        <div id="${cardId}-result" class="result-box" style="margin-bottom:10px;"></div>

        <label>Catégorie :
            <select id="${cardId}-filter">
                <option value="all">Toutes</option>
                <option value="A">Etranglements & Saisies</option>
                <option value="B">Armes & Atemi</option>
            </select>
        </label>
        <br><br>

        <label>
            <input type="checkbox" id="${cardId}-doublons">
            Accepter les doublons
        </label>
        <br><br>

        <label>Nombre de techniques :
            <input id="${cardId}-count" type="number" value="5" min="1" class="input-small">
        </label>

        <br><br>

        <label>Bip toutes les :
            <input id="${cardId}-bip-interval" type="range" min="3" max="30" value="10">
            <span id="${cardId}-bip-display">10</span>s
            <span id="${cardId}-bip-icon" style="font-size:1.4rem;margin-left:8px;">🔇</span>
        </label>

        <br><br>

        <div class="button-row">
            <button id="${cardId}-generate" class="training-button">Changer</button>
            <button id="${cardId}-read" class="training-button">Lecture</button>
            <button id="${cardId}-stop" class="training-button stop">Stop</button>
        </div>
    `;

    setupLogic(cardId);
}


/* ============================================================
   LOGIQUE POUR CHAQUE UV (UV5 & UV6)
   ============================================================ */

function setupLogic(cardId) {

    // Éléments
    const resultBox = document.getElementById(`${cardId}-result`);
    const selectFilter = document.getElementById(`${cardId}-filter`);
    const inputDoublons = document.getElementById(`${cardId}-doublons`);
    const inputCount = document.getElementById(`${cardId}-count`);

    const bipSlider = document.getElementById(`${cardId}-bip-interval`);
    const bipDisplay = document.getElementById(`${cardId}-bip-display`);
    const bipIcon = document.getElementById(`${cardId}-bip-icon`);

    const btnGenerate = document.getElementById(`${cardId}-generate`);
    const btnRead = document.getElementById(`${cardId}-read`);
    const btnStop = document.getElementById(`${cardId}-stop`);

    /* --- BIP TIMER --- */
    let bipTimer = null;
    const ding = new Audio("ding.mp3");

    bipSlider.addEventListener("input", () => {
        bipDisplay.textContent = bipSlider.value;
    });

    function startBip() {
        stopBip();
        bipIcon.textContent = "🔊";
        bipTimer = setInterval(() => ding.play(), bipSlider.value * 1000);
    }

    function stopBip() {
        bipIcon.textContent = "🔇";
        if (bipTimer) {
            clearInterval(bipTimer);
            bipTimer = null;
        }
    }

    /* --- SÉLECTION DES TECHNIQUES --- */
    let currentList = [];

    function refreshSelection() {
        const category = selectFilter.value;
        const baseList = getListFromCategory(category);
        const allowDup = inputDoublons.checked;
        const count = parseInt(inputCount.value);

        currentList = getRandomSelection(baseList, count, allowDup);

        resultBox.innerHTML = currentList
            .map((t, i) => `<p><b>${i + 1}.</b> ${t}</p>`)
            .join("");
    }

    /* Initial */
    refreshSelection();

    /* --- ÉVÉNEMENTS --- */
    btnGenerate.addEventListener("click", () => {
        refreshSelection();
    });

    let reading = false;
    let readIndex = 0;

    btnRead.addEventListener("click", () => {

        if (reading) return;

        reading = true;
        readIndex = 0;

        /* Activation bip */
        startBip();

        const loop = () => {
            if (!reading) return;

            if (readIndex >= currentList.length) {
                stopBip();
                reading = false;
                return;
            }

            ding.play();
            ding.onended = () => {
                speak(currentList[readIndex]);
                readIndex++;
                setTimeout(loop, 1500);
            };
        };

        loop();
    });

    btnStop.addEventListener("click", () => {
        reading = false;
        stopBip();
    });
}


/* ============================================================
   INITIALISATION UV5 + UV6
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    buildUI("uv5");
    buildUI("uv6");
});
