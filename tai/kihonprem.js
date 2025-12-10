let data = [];
let selected = [];

const delayFirstDing = 5000;   // 5 sec avant le premier ding
const delayAfterDing = 3000;   // 3 sec après chaque ding avant la lecture japonaise
const delayBetweenSets = 60000; // 1 minute entre enchaînements

const dingSound = new Audio("ding.mp3");

/* --------- Chargement JSON --------- */
async function loadJSON() {
    try {
        const response = await fetch("kihonprem.json");
        const json = await response.json();
        data = json.enchaînements;
    } catch (e) {
        console.error("Erreur chargement JSON :", e);
    }
}

/* --------- Sélection aléatoire --------- */
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

/* --------- Affichage --------- */
function display() {
    const container = document.getElementById("result");
    container.innerHTML = "<h3>Enchaînements sélectionnés :</h3>";

    selected.forEach((e, i) => {
        container.innerHTML += `<p><b>${i+1}.</b> ${e.fr} <br><i>${e.jp}</i></p>`;
    });
}

/* --------- Débloque SpeechSynthesis --------- */
function unlockSpeech() {
    const utter = new SpeechSynthesisUtterance(" ");
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
}

/* --------- LECTURE JAPONAIS AVEC DING --------- */
function readJapanese() {
    if (selected.length === 0) return;

    unlockSpeech(); // IMPORTANT : débloque la synthèse

    let index = 0;

    setTimeout(() => {
        playDing(() => {
            readOne(index);
            index++;

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

/* --------- Lecture d’un seul item --------- */
function readOne(i) {
    const text = selected[i].jp;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
}

/* --------- Ding + délai --------- */
function playDing(after) {
    dingSound.currentTime = 0;
    dingSound.play().then(() => {
        setTimeout(after, delayAfterDing);
    });
}

loadJSON();
