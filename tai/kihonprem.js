/**************************************************
 *  KIHONPREM – Script complet et réparé
 *  - Sélection aléatoire
 *  - Lecture japonaise avec ding
 *  - Déblocage desktop Chrome/Firefox
 **************************************************/

let data = [];
let selected = [];

/* Délais configurables */
const delayFirstDing = 5000;   // 5 sec avant le premier ding
const delayAfterDing = 3000;   // 3 sec après ding avant la lecture
const delayBetweenSets = 60000; // 1 minute entre enchaînements (tu peux modifier)

const dingSound = new Audio("ding.mp3");  // fichier dans le repo

/* ----------------------------------------------
   Chargement du JSON
----------------------------------------------- */
async function loadJSON() {
    try {
        const response = await fetch("kihonprem.json");
        const json = await response.json();
        data = json.enchaînements;
    } catch (err) {
        console.error("❌ Erreur chargement JSON :", err);
    }
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
        container.innerHTML += `<p><b>${i + 1}.</b> ${e.fr} <br><i>${e.jp}</i></p>`;
    });
}

/* ----------------------------------------------
   Déblocage de la synthèse sur DESKTOP
   (Chrome/Firefox/Edge 2024-2025)
----------------------------------------------- */
function unlockSpeech() {
    return new Promise(resolve => {
        const utter = new SpeechSynthesisUtterance("あ"); // très discret
        utter.lang = "ja-JP";
        utter.rate = 0.01;  // quasi inaudible
        utter.volume = 0.001; // encore plus discret
        utter.onend = resolve;
        speechSynthesis.speak(utter);
    });
}

/* ----------------------------------------------
   Lecture japonaise + ding + délais
----------------------------------------------- */
async function readJapanese() {
    if (selected.length === 0) return;

    // Très important : débloque la synthèse sur desktop
    await unlockSpeech();

    let index = 0;

    // 5 sec → ding → 3 sec → lecture du premier enchaînement
    setTimeout(() => {

        playDing(() => {
            readOne(index);
            index++;

            // Pour les suivants : ding → 3 sec → lecture
            const interval = setInterval(() => {

                if (index >= selected.length) {
                    clearInterval(interval);
                    return;
                }

                playDing(() => {
                    readOne(index);
                    index++;
                });

            }, delayBetweenSets);

        });

    }, delayFirstDing);
}

/* ----------------------------------------------
   Lecture d'un seul enchaînement japonais
   avec vitesse réduite
----------------------------------------------- */
function readOne(i) {
    const text = selected[i].jp;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = 0.7;  // 🔥 vitesse réduite pour compréhension
    utter.pitch = 1.0;
    utter.volume = 1.0;

    speechSynthesis.speak(utter);
}

/* ----------------------------------------------
   Ding + délai d'attente
----------------------------------------------- */
function playDing(after) {
    dingSound.currentTime = 0;
    dingSound.play().then(() => {
        setTimeout(after, delayAfterDing);
    }).catch(err => {
        console.error("Erreur lecture ding :", err);
        setTimeout(after, delayAfterDing); // même sans ding → on continue
    });
}

/* ----------------------------------------------
   Init
----------------------------------------------- */
loadJSON();
