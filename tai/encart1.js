/********************************************************************
 * UV1 – Kihon (FINAL VERSION) — charge les données depuis JSON
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

    /********************************************************************
     * OUTILS GÉNÉRAUX
     ********************************************************************/
    function playBeep() {
        try {
            new Audio("beep.mp3").play();
        } catch (e) {
            console.log("Fichier beep.mp3 non trouvé ou lecture impossible.");
        }
    }

    function speakJP(text) {
        if (!text) return; // Sécurité si le texte est vide
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
        try {
            const res = await fetch(file);
            if (!res.ok) {
                console.error(`❌ Erreur ${res.status}: Impossible de charger ${file}.`);
                return null; // Retourne null pour indiquer un échec clair
            }
            return res.json();
        } catch (error) {
            console.error(`❌ Erreur réseau/JSON pour ${file}.`, error);
            return null;
        }
    }

    /********************************************************************
     * DONNÉES EN DUR POUR KIHON COMBAT (KCB)
     ********************************************************************/
    const KCB_FALLBACK = [
        { jp: "Oï Zuki, jodan, retour à l’arrière" },
        { jp: "Gyaku Zuki chudan" },
        { jp: "Kizami Zuki / Maete Zuki jodan, suivi de Gyaku Zuki chudan" },
        { jp: "Mae Geri, jambe arrière posée derrière, chudan" },
        { jp: "Mawashi Geri, jambe arrière posée derrière, jodan ou chudan" },
        { jp: "Mae Geri, jambe avant avec sursaut, chudan" },
        { jp: "Mawashi Geri, jambe avant avec sursaut, jodan ou chudan" }
    ];

    /********************************************************************
     * CHARGEMENT DES JSON (CORRIGÉ AVEC LES BONNES CLÉS)
     ********************************************************************/
    // 1. Pour kihon_simples.json, on accède à la clé "kihon"
    const ksJson = await loadJSON("kihon_simples.json");
    const KS_DATA = ksJson ? ksJson.kihon : [];

    // 2. Pour kihon_enchainements.json, on accède à la clé "enchaînements"
    const kcJson = await loadJSON("kihon_enchainements.json");
    // La notation ['key'] est nécessaire à cause de l'accent circonflexe.
    const KC_DATA = kcJson ? kcJson['enchaînements'] : []; 

    // 3. Pour kihon_combat.json, on essaie de charger et on utilise le fallback si ça échoue.
    let kcbJson = await loadJSON("kihon_combat.json");
    let KCB_DATA = kcbJson ? (kcbJson.kihon || kcbJson.combat || []) : [];
    
    if (KCB_DATA.length === 0) {
        console.warn("⚠️ Fichier kihon_combat.json non trouvé ou vide. Utilisation des données en dur.");
        KCB_DATA = KCB_FALLBACK;
    }

    console.log(`KS chargés: ${KS_DATA.length} techniques.`);
    console.log(`KC chargés: ${KC_DATA.length} techniques.`);
    console.log(`KCB chargés: ${KCB_DATA.length} techniques.`);

    /********************************************************************
     * MODULE GÉNÉRIQUE
     ********************************************************************/
    function initModule(config) {
        const {
            countInput, intervalInput,
            btnRandom, btnRead, btnStop,
            outBox, beepIcon, data,
            intervalDisplayId
        } = config;
        
        const intervalDisplay = document.getElementById(intervalDisplayId);

        if (!data || data.length === 0) {
             outBox.innerHTML = "<div>❌ Données manquantes.</div>";
             btnRandom.disabled = true;
             btnRead.disabled = true;
             return;
        }

        let timer = null;
        let sequence = [];
        let beepEnabled = true;

        intervalDisplay.textContent = intervalInput.value + "s";

        beepIcon.addEventListener("click", () => {
            beepEnabled = !beepEnabled;
            beepIcon.classList.toggle("off", !beepEnabled);
        });

        intervalInput.addEventListener("input", () => {
            intervalDisplay.textContent = intervalInput.value + "s";
        });

        btnRandom.addEventListener("click", () => {
            const count = countInput ? parseInt(countInput.value) : 1; 
            sequence = pickRandom(data, count);
            outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");

            if (beepEnabled) playBeep();
        });

        btnRead.addEventListener("click", () => {
            if (sequence.length === 0) {
                btnRandom.click();
                if (sequence.length === 0) return; 
            }
            if (timer) clearInterval(timer);

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

        btnStop.addEventListener("click", () => {
            if (timer) clearInterval(timer);
            timer = null;
            speechSynthesis.cancel();
        });

        btnRandom.click(); 
    }

    /********************************************************************
     * ACTIVATION DES MODULES
     ********************************************************************/
    initModule({
        countInput: document.getElementById("ks-count"),
        intervalInput: document.getElementById("ks-interval"),
        intervalDisplayId: "ks-interval-display",
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
        intervalDisplayId: "kc-interval-display",
        btnRandom: document.getElementById("kc-generate"),
        btnRead: document.getElementById("kc-read"),
        btnStop: document.getElementById("kc-stop"),
        outBox: document.getElementById("kc-result"),
        beepIcon: document.getElementById("kc-beep"),
        data: KC_DATA
    });

    initModule({
        countInput: document.getElementById("kcb-count"),
        intervalInput: document.getElementById("kcb-interval"),
        intervalDisplayId: "kcb-interval-display",
        btnRandom: document.getElementById("kcb-generate"),
        btnRead: document.getElementById("kcb-read"),
        btnStop: document.getElementById("kcb-stop"),
        outBox: document.getElementById("kcb-result"),
        beepIcon: document.getElementById("kcb-beep"),
        data: KCB_DATA
    });
});
