/********************************************************************
 * UV1 – Kihon (FINAL VERSION) — charge les données depuis JSON
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

    /********************************************************************
     * OUTILS GÉNÉRAUX
     ********************************************************************/
    function playBeep() {
        // Vérifie si le fichier existe ou simule un son si possible
        new Audio("beep.mp3").play().catch(e => console.log("Beep failed, maybe no file?"));
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
        try {
            const res = await fetch(file);
            if (!res.ok) {
                console.error(`❌ Erreur ${res.status} : Impossible de charger ${file}.`);
                return [];
            }
            return res.json();
        } catch (error) {
            console.error(`❌ Réseau/JSON impossible à charger pour ${file}.`, error);
            return []; // Retourne un tableau vide en cas d'échec
        }
    }

    /********************************************************************
     * DONNÉES EN DUR POUR KIHON COMBAT (KCB)
     * Utilisées si le chargement de 'kihon_combat.json' échoue.
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
     * CHARGEMENT DES JSON (Si ces fichiers n'existent pas, les modules KS et KC ne fonctionneront pas)
     ********************************************************************/
    const KS_DATA = await loadJSON("kihon_simples.json");
    const KC_DATA = await loadJSON("kihon_enchainements.json");
    let KCB_DATA = await loadJSON("kihon_combat.json");
    
    // Si le chargement de KCB échoue, utilise les données en dur.
    if (KCB_DATA.length === 0) {
        console.warn("⚠️ Utilisation des données KCB en dur.");
        KCB_DATA = KCB_FALLBACK;
    }

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

        if (data.length === 0) {
             outBox.innerHTML = "<div>❌ Données manquantes.</div>";
             return; // Stop l'initialisation si pas de données
        }
        
        // Initialiser l'affichage de l'intervalle
        const intervalDisplay = intervalInput.nextElementSibling;
        intervalDisplay.textContent = intervalInput.value + "s";


        // bip ON/OFF
        beepIcon.addEventListener("click", () => {
            beepEnabled = !beepEnabled;
            beepIcon.classList.toggle("off", !beepEnabled);
            if (!beepEnabled) speechSynthesis.cancel();
        });

        // slider affichage
        intervalInput.addEventListener("input", () => {
            intervalDisplay.textContent = intervalInput.value + "s";
        });

        // bouton Changer
        btnRandom.addEventListener("click", () => {
            // Utilise countInput si disponible, sinon prend 1
            const count = countInput ? parseInt(countInput.value) : 1; 
            sequence = pickRandom(data, count);
            outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");

            if (beepEnabled) playBeep();
        });

        // bouton Lecture
        btnRead.addEventListener("click", () => {
            if (sequence.length === 0) {
                // Tente de générer une séquence si la lecture est lancée sans génération préalable
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

        // bouton Stop
        btnStop.addEventListener("click", () => {
            if (timer) clearInterval(timer);
            timer = null;
            speechSynthesis.cancel();
        });

        // Génération initiale (pour ne pas avoir le texte 'Attente...' trop longtemps)
        btnRandom.click(); 
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
        countInput: document.getElementById("kcb-count"), // <-- NOUVEAU : on utilise l'input quantité
        intervalInput: document.getElementById("kcb-interval"),
        btnRandom: document.getElementById("kcb-generate"),
        btnRead: document.getElementById("kcb-read"),
        btnStop: document.getElementById("kcb-stop"),
        outBox: document.getElementById("kcb-result"),
        beepIcon: document.getElementById("kcb-beep"),
        data: KCB_DATA
    });

});
