let data = [];
let selected = [];

const delayFirstDing = 5000;   // 5 sec avant le premier ding
const delayAfterDing = 3000;   // 3 sec après chaque ding avant la lecture japonaise
const delayBetweenSets = 60000; // délai entre enchaînements (1 minute pour toi)

const dingSound = new Audio("ding.mp3");  // fichier présent dans le repo

async function loadJSON() {
    const response = await fetch("enchaînements.json");
    const json = await response.json();
    data = json.enchaînements;
}

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

function display() {
    const container = document.getElementById("result");
    container.innerHTML = "<h3>Enchaînements sélectionnés :</h3>";
    selected.forEach((e, i) => {
        container.innerHTML += `<p><b>${i+1}.</b> ${e.fr} <br><i>${e.jp}</i></p>`;
    });
}

/* ------------- LECTURE JAPONAIS AMÉLIORÉE ------------- */
function readJapanese() {
    if (selected.length === 0) return;

    let index = 0;

    // On attend 5 sec puis ding
    setTimeout(() => {

        playDing(() => {
            // après ding + 3 sec → lecture du premier enchaînement
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

/* Lecture japonaise d'un seul bloc */
function readOne(i) {
    const text = selected[i].jp;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
}

/* Lecture du ding puis délai 3 sec */
function playDing(after) {
    dingSound.currentTime = 0;
    dingSound.play().then(() => {
        setTimeout(after, delayAfterDing);
    });
}

loadJSON();
