/**************************************************
 *  UV5 – UV6 Randori
 *  Version propre (n'écrase plus le HTML)
 **************************************************/

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

const techniquesUV6 = techniquesUV5.filter(t => !t.toLowerCase().includes("matraque") && !t.toLowerCase().includes("couteau"));

/**************************************************
 * OUTILS
 **************************************************/
function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.9;
    speechSynthesis.speak(u);
}

function getRandom(list, count, allowDuplicates) {
    if (allowDuplicates) {
        return Array.from({length: count}, () => list[Math.floor(Math.random() * list.length)]);
    }
    let arr = [...list];
    let out = [];
    for (let i = 0; i < count && arr.length > 0; i++) {
        let idx = Math.floor(Math.random() * arr.length);
        out.push(arr.splice(idx, 1)[0]);
    }
    return out;
}

function filterTech(list, mode) {
    switch (mode) {
        case "poignet": return list.filter(t => t.includes("poignet"));
        case "revers": return list.filter(t => t.includes("revers"));
        case "poing": return list.filter(t => t.includes("poing") || t.includes("tsuki"));
        case "arme": return list.filter(t => t.includes("couteau") || t.includes("matraque"));
        default: return list;
    }
}

/**************************************************
 * UV6 – RANDORI + TIMER BIP
 **************************************************/
let uv6Reading = false;
let uv6BeepTimer = null;

function updateUV6Selection() {
    const filterMode = document.getElementById("uv6-filter").value;
    const count = parseInt(document.getElementById("uv6-count").value);
    const allowDup = document.getElementById("uv6-duplicates").checked;

    const base = filterTech(techniquesUV6, filterMode);
    const selection = getRandom(base, count, allowDup);

    document.getElementById("uv6-result").innerHTML =
        selection.map((t, i) => `<p><b>${i+1}.</b> ${t}</p>`).join("");

    return selection;
}

let uv6Current = updateUV6Selection();

document.getElementById("uv6-generate").addEventListener("click", () => {
    uv6Current = updateUV6Selection();
});

/*********** LECTURE ***********/
document.getElementById("uv6-read").addEventListener("click", () => {
    if (uv6Reading) return;
    uv6Reading = true;

    const interval = parseInt(document.getElementById("uv6-interval").value) * 1000;
    const ding = new Audio("ding.mp3");

    let i = 0;
    function step() {
        if (!uv6Reading) return;
        if (i >= uv6Current.length) {
            uv6Reading = false;
            return;
        }

        ding.play();
        ding.onended = () => {
            speak(uv6Current[i]);
            i++;
            setTimeout(step, interval);
        };
    }

    setTimeout(step, 1000);
});

document.getElementById("uv6-stop").addEventListener("click", () => {
    uv6Reading = false;
    speechSynthesis.cancel();
});

/*********** TIMER DE BIP ***********/
document.getElementById("uv6-beep-interval").addEventListener("input", e => {
    document.getElementById("uv6-beep-display").textContent = e.target.value;
});

document.getElementById("uv6-beep-start").addEventListener("click", () => {
    if (uv6BeepTimer) return;

    const ding = new Audio("ding.mp3");

    uv6BeepTimer = setInterval(() => {
        ding.play();
    }, parseInt(document.getElementById("uv6-beep-interval").value) * 1000);
});

document.getElementById("uv6-beep-stop").addEventListener("click", () => {
    clearInterval(uv6BeepTimer);
    uv6BeepTimer = null;
});
