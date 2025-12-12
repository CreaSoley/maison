/********************************************************************
 * UV1 – Kihon (FINAL VERSION) — charge les données depuis JSON
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

    /********************************************************************
     * OUTILS GÉNÉRAUX
     ********************************************************************/
    function playBeep() {
        new Audio("beep.mp3").play();
    }

    function speakJP(text) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "ja-JP";
        speechSynthesis.speak(utter);
    }

    function pickRandom(arr, count) {
        const copy = [...arr];
        const result = [];
        for (let i = 0; i < count && copy.length; i++) {
            const index = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(index, 1)[0]);
        }
        return result;
    }

    async function loadJSON(file) {
        const res = await fetch(file);
        if (!res.ok) {
            console.error("❌ Impossible de charger : " + file);
            return [];
        }
        return res.json();
    }

    /********************************************************************
     * CHARGEMENT DES JSON
     ********************************************************************/
    const KS_DATA = await loadJSON("kihon_simples.json");          // ✔
    const KC_DATA = await loadJSON("kihon_enchainements.json");    // ✔
    const KCB_DATA = await loadJSON("kihon_combat.json");          // ✔ (si tu as un fichier)

    console.log("KS chargés :", KS_DATA);
    console.log("KC chargés :", KC_DATA);
    console.log("KCB chargés :", KCB_DATA);

    /********************************************************************
     * MODULE GÉNÉRIQUE
     ********************************************************************/
    function initModule(config) {
        const {
            countInput, intervalInput,
            btnRandom, btnRead, btnStop,
            outBox, beepIcon,
            data
        } = config;

        let timer = null;
        let sequence = [];
        let beepEnabled = true;

        // bip ON/OFF
        beepIcon.addEventListener("click", () => {
            beepEnabled = !beepEnabled;
            beepIcon.classList.toggle("off", !beepEnabled);
        });

        // slider affichage
        intervalInput.addEventListener("input", () => {
            intervalInput.nextElementSibling.textContent = intervalInput.value + "s";
        });

        // bouton Changer
        btnRandom.addEventListener("click", () => {
            const count = countInput ? parseInt(countInput.value) : 1;
            sequence = pickRandom(data, count);
            outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");

            if (beepEnabled) playBeep();
        });

        // bouton Lecture
        btnRead.addEventListener("click", () => {
            if (sequence.length === 0) return;

            let i = 0;
            const interval = parseInt(intervalInput.value) * 1000;

            if (beepEnabled) playBeep();

            timer = setInterval(() => {
                if (i >= sequence.length) {
                    clearInterval(timer);
                    timer = null;
                    if (beepEnabled) playBeep();
                    return;
                }
                speakJP(sequence[i].jp);
                i++;
            }, interval);
        });

        // bouton Stop
        btnStop.addEventListener("click", () => {
            if (timer) clearInterval(timer);
            timer = null;
            speechSynthesis.cancel();
        });
    }

    /********************************************************************
     * ACTIVATION DES MODULES
     ********************************************************************/
    initModule({
        countInput: document.getElementById("ks-count"),
        intervalInput: document.getElementById("ks-interval"),
        btnRandom: document.getElementById("ks-generate"),
        btnRead: document.getElementById("ks-read"),
        btnStop: document.getElementById("ks-stop"),
        outBox: document.getElementById("ks-result"),
        beepIcon: document.getElementById("ks-beep"),
        data: KS_DATA
    });

    initModule({
        countInput: document.getElementById("kc-count"),
        intervalInput: document.getElementById("kc-interval"),
        btnRandom: document.getElementById("kc-generate"),
        btnRead: document.getElementById("kc-read"),
        btnStop: document.getElementById("kc-stop"),
        outBox: document.getElementById("kc-result"),
        beepIcon: document.getElementById("kc-beep"),
        data: KC_DATA
    });

    initModule({
        countInput: null,
        intervalInput: document.getElementById("kcb-interval"),
        btnRandom: document.getElementById("kcb-generate"),
        btnRead: document.getElementById("kcb-read"),
        btnStop: document.getElementById("kcb-stop"),
        outBox: document.getElementById("kcb-result"),
        beepIcon: document.getElementById("kcb-beep"),
        data: KCB_DATA
    });

});
