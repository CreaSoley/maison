/********************************************************************
 * UV1 – Kihon (VERSION FINALE AMÉLIORÉE)
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

    function playDing() {
        try {
            return new Audio("ding.mp3").play();
        } catch (e) {
            console.log("Fichier ding.mp3 non trouvé.");
            return Promise.resolve();
        }
    }

    function speakJP(text, speed = 1) {
        if (!text) return Promise.resolve();
        
        return new Promise((resolve) => {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = "ja-JP";
            utter.rate = speed; // Contrôle de la vitesse
            utter.onend = resolve;
            utter.onerror = resolve;
            speechSynthesis.speak(utter);
        });
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
                return null;
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
        { jp: "Oï Zuki, jodan, retour à l'arrière" },
        { jp: "Gyaku Zuki chudan" },
        { jp: "Kizami Zuki / Maete Zuki jodan, suivi de Gyaku Zuki chudan" },
        { jp: "Mae Geri, jambe arrière posée derrière, chudan" },
        { jp: "Mawashi Geri, jambe arrière posée derrière, jodan ou chudan" },
        { jp: "Mae Geri, jambe avant avec sursaut, chudan" },
        { jp: "Mawashi Geri, jambe avant avec sursaut, jodan ou chudan" }
    ];

    /********************************************************************
     * CHARGEMENT DES JSON
     ********************************************************************/
    const ksJson = await loadJSON("kihon_simples.json");
    const KS_DATA = ksJson ? ksJson.kihon : [];

    const kcJson = await loadJSON("kihon_enchainements.json");
    const KC_DATA = kcJson ? kcJson['enchaînements'] : [];

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
            intervalDisplayId,
            speedInput, speedDisplayId,
            useDing = false // Nouveau paramètre pour activer le ding
        } = config;
        
        const intervalDisplay = document.getElementById(intervalDisplayId);
        const speedDisplay = speedDisplayId ? document.getElementById(speedDisplayId) : null;

        if (!data || data.length === 0) {
             outBox.innerHTML = "<div>❌ Données manquantes.</div>";
             btnRandom.disabled = true;
             btnRead.disabled = true;
             return;
        }

        let timer = null;
        let sequence = [];
        let beepEnabled = true;

        // Initialisation de l'affichage
        intervalDisplay.textContent = intervalInput.value + "s";
        if (speedDisplay && speedInput) {
            speedDisplay.textContent = speedInput.value + "x";
        }

        // Gestion du bip ON/OFF
        beepIcon.addEventListener("click", () => {
            beepEnabled = !beepEnabled;
            beepIcon.classList.toggle("off", !beepEnabled);
        });

        // Slider intervalle
        intervalInput.addEventListener("input", () => {
            intervalDisplay.textContent = intervalInput.value + "s";
        });

        // Slider vitesse (si présent)
        if (speedInput && speedDisplay) {
            speedInput.addEventListener("input", () => {
                speedDisplay.textContent = speedInput.value + "x";
            });
        }

        // Bouton Changer (sans déclencher la lecture)
        btnRandom.addEventListener("click", () => {
            const count = countInput ? parseInt(countInput.value) : 1; 
            sequence = pickRandom(data, count);
            outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");
            // Pas de lecture automatique ni de beep au changement
        });

        // Bouton Lecture
        btnRead.addEventListener("click", async () => {
            if (sequence.length === 0) {
                btnRandom.click(); // Génère une séquence si elle n'existe pas
                if (sequence.length === 0) return; 
            }
            if (timer) clearInterval(timer);

            let i = 0;
            const interval = parseInt(intervalInput.value) * 1000;
            const speed = speedInput ? parseFloat(speedInput.value) : 1;

            if (beepEnabled) playBeep();

            // Fonction pour lire une technique
            const readTechnique = async () => {
                if (i >= sequence.length) {
                    clearInterval(timer);
                    timer = null;
                    if (beepEnabled) playBeep();
                    return;
                }

                // Jouer le ding avant la lecture (si activé)
                if (useDing) {
                    await playDing();
                    // Petite pause après le ding
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                // Lire la technique avec la vitesse choisie
                await speakJP(sequence[i].jp, speed);
                i++;
            };

            // Première lecture immédiate
            await readTechnique();

            // Puis répétition avec intervalle
            timer = setInterval(readTechnique, interval);
        });

        // Bouton Stop
        btnStop.addEventListener("click", () => {
            if (timer) clearInterval(timer);
            timer = null;
            speechSynthesis.cancel();
        });

        // Génération initiale pour avoir quelque chose à afficher
        btnRandom.click(); 
    }

    /********************************************************************
     * ACTIVATION DES MODULES
     ********************************************************************/
    
    // Kihon Simples (avec ding et contrôle de vitesse)
    initModule({
        countInput: document.getElementById("ks-count"),
        intervalInput: document.getElementById("ks-interval"),
        intervalDisplayId: "ks-interval-display",
        speedInput: document.getElementById("ks-speed"),
        speedDisplayId: "ks-speed-display",
        btnRandom: document.getElementById("ks-generate"),
        btnRead: document.getElementById("ks-read"),
        btnStop: document.getElementById("ks-stop"),
        outBox: document.getElementById("ks-result"),
        beepIcon: document.getElementById("ks-beep"),
        data: KS_DATA,
        useDing: true // Active le ding pour Kihon Simples
    });

    // Kihon Enchaînements (avec ding et contrôle de vitesse)
    initModule({
        countInput: document.getElementById("kc-count"),
        intervalInput: document.getElementById("kc-interval"),
        intervalDisplayId: "kc-interval-display",
        speedInput: document.getElementById("kc-speed"),
        speedDisplayId: "kc-speed-display",
        btnRandom: document.getElementById("kc-generate"),
        btnRead: document.getElementById("kc-read"),
        btnStop: document.getElementById("kc-stop"),
        outBox: document.getElementById("kc-result"),
        beepIcon: document.getElementById("kc-beep"),
        data: KC_DATA,
        useDing: true // Active le ding pour Kihon Enchaînements
    });

    // Kihon Combat (sans ding, sans contrôle de vitesse)
    initModule({
        countInput: document.getElementById("kcb-count"),
        intervalInput: document.getElementById("kcb-interval"),
        intervalDisplayId: "kcb-interval-display",
        speedInput: null, // Pas de contrôle de vitesse
        speedDisplayId: null,
        btnRandom: document.getElementById("kcb-generate"),
        btnRead: document.getElementById("kcb-read"),
        btnStop: document.getElementById("kcb-stop"),
        outBox: document.getElementById("kcb-result"),
        beepIcon: document.getElementById("kcb-beep"),
        data: KCB_DATA,
        useDing: false // Pas de ding pour Kihon Combat
    });
});
