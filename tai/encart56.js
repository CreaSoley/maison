/**************************************************
 *  RANDORI – UV5 & UV6
 *  Lecture en français
 *  - Sélection aléatoire
 *  - Intervalle réglable
 *  - Délai initial 5 sec
 **************************************************/

// ---------------------------------------------
// Listes des techniques
// ---------------------------------------------
const techniquesUV5 = [
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
    "Matraque haute",
    "Matraque revers",
    "Coup de poing direct",
    "Mawashi tsuki gauche",
    "Mawashi tsuki droit",
    "Saisie manche haute",
    "Saisie manche basse"
];

const techniquesUV6 = techniquesUV5.filter(t => !t.toLowerCase().includes("couteau") && !t.toLowerCase().includes("matraque"));

// ---------------------------------------------
// Fonctions utilitaires
// ---------------------------------------------
function getRandomSelection(list, count) {
    const copy = [...list];
    const selected = [];
    for (let i = 0; i < count && copy.length > 0; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        selected.push(copy.splice(idx, 1)[0]);
    }
    return selected;
}

function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
}

// ---------------------------------------------
// Création des UI pour chaque encart
// ---------------------------------------------
function createRandoriUI(cardId, techniquesList) {
    const card = document.getElementById(cardId);
    card.innerHTML = `
        <div class="content" id="${cardId}-result"></div>
        <div style="margin-top:10px;">
            <label>Nombre de termes : <input type="number" id="${cardId}-count" value="5" style="width:50px;"></label>
        </div>
        <div style="margin-top:10px;">
            <label>Intervalle (sec) : <input type="range" id="${cardId}-interval" min="5" max="60" value="15">
            <span id="${cardId}-interval-display">15</span>s</label>
        </div>
        <button id="${cardId}-generate" class="training-button">Changer la sélection</button>
        <button id="${cardId}-read" class="training-button">Lecture</button>
    `;

    const resultDiv = document.getElementById(`${cardId}-result`);
    const countInput = document.getElementById(`${cardId}-count`);
    const intervalInput = document.getElementById(`${cardId}-interval`);
    const intervalDisplay = document.getElementById(`${cardId}-interval-display`);
    const btnGenerate = document.getElementById(`${cardId}-generate`);
    const btnRead = document.getElementById(`${cardId}-read`);

    let selected = getRandomSelection(techniquesList, parseInt(countInput.value));

    function displaySelection() {
        resultDiv.innerHTML = `<h3>Techniques sélectionnées :</h3>` + selected.map((t, i) => `<p><b>${i+1}.</b> ${t}</p>`).join('');
    }

    displaySelection();

    // Slider affichage
    intervalInput.addEventListener('input', () => {
        intervalDisplay.textContent = intervalInput.value;
    });

    // Bouton changer sélection
    btnGenerate.addEventListener('click', () => {
        const count = parseInt(countInput.value);
        selected = getRandomSelection(techniquesList, count);
        displaySelection();
    });

    // Bouton lecture
    btnRead.addEventListener('click', () => {
        if(selected.length === 0) return;

        setTimeout(() => {
            // Lecture avec ding avant chaque terme
            let index = 0;
            const ding = new Audio("ding.mp3");
            const beep = new Audio("beep.mp3");

            const intervalMs = parseInt(intervalInput.value) * 1000;

            const playNext = () => {
                if(index >= selected.length){
                    beep.play();
                    return;
                }
                ding.play();
                ding.onended = () => {
                    speak(selected[index]);
                    index++;
                    setTimeout(playNext, intervalMs);
                }
            }

            playNext();

        }, 5000); // délai initial 5 sec
    });
}

// ---------------------------------------------
// Initialisation
// ---------------------------------------------
createRandoriUI("uv5", techniquesUV5);
createRandoriUI("uv6", techniquesUV6);
