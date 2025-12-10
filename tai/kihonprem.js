let data = [];
let selected = [];
const delayBeforeReading = 3000; // 3 secondes avant la lecture
const delayBetween = 60000; // 1 minute entre chaque enchaînement

async function loadJSON() {
    const response = await fetch("kihonprem.json");
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

function readJapanese() {
    if (selected.length === 0) return;

    let index = 0;

    setTimeout(() => {
        const interval = setInterval(() => {
            const text = selected[index].jp;
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = "ja-JP";
            speechSynthesis.speak(utter);

            index++;
            if (index >= selected.length) clearInterval(interval);

        }, delayBetween);
    }, delayBeforeReading);
}

loadJSON();
