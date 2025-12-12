document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       OUTILS COMMUNS
    ============================================================ */

    function speakJP(text) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ja-JP";
        speechSynthesis.speak(u);
    }

    function speakFR(text) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "fr-FR";
        speechSynthesis.speak(u);
    }



    /* ============================================================
       KIHÔN SIMPLES
    ============================================================ */

    const ksNumber = document.getElementById("ks-number");
    const ksInterval = document.getElementById("ks-interval");
    const ksOutput = document.getElementById("ks-output");

    let ksTimer = null;
    let ksRunning = false;

    document.getElementById("ks-play").addEventListener("click", () => {

        if (ksRunning) return;
        ksRunning = true;

        let n = parseInt(ksNumber.value);
        let delay = parseInt(ksInterval.value) * 1000;

        let i = 1;

        function next() {
            if (i > n) {
                ksRunning = false;
                return;
            }

            speakJP("Kihon simple " + i);
            ksOutput.textContent = i;

            i++;
            ksTimer = setTimeout(next, delay);
        }

        next();
    });

    document.getElementById("ks-stop").addEventListener("click", () => {
        ksRunning = false;
        clearTimeout(ksTimer);
    });



    /* ============================================================
       KIHÔN ENCHAINEMENTS
    ============================================================ */

    const keNumber = document.getElementById("ke-number");
    const keInterval = document.getElementById("ke-interval");
    const keOutput = document.getElementById("ke-output");

    let keTimer = null;
    let keRunning = false;

    document.getElementById("ke-play").addEventListener("click", () => {

        if (keRunning) return;
        keRunning = true;

        let n = parseInt(keNumber.value);
        let delay = parseInt(keInterval.value) * 1000;

        let i = 1;

        function next() {
            if (i > n) {
                keRunning = false;
                return;
            }

            speakJP("Enchaînement " + i);
            keOutput.textContent = i;

            i++;
            keTimer = setTimeout(next, delay);
        }

        next();
    });

    document.getElementById("ke-stop").addEventListener("click", () => {
        keRunning = false;
        clearTimeout(keTimer);
    });



    /* ============================================================
       TECHNIQUES DE COMBAT (FR)
    ============================================================ */

    const tcInterval = document.getElementById("tc-interval");
    const tcOutput = document.getElementById("tc-output");

    let tcTimer = null;
    let tcRunning = false;

    const tcList = [
        "Parade circulaire",
        "Coup de pied frontal",
        "Déplacement avant",
        "Déplacement arrière",
        "Blocage haut",
        "Blocage bas"
    ];

    document.getElementById("tc-play").addEventListener("click", () => {

        if (tcRunning) return;
        tcRunning = true;

        let delay = parseInt(tcInterval.value) * 1000;
        let i = 0;

        function next() {
            if (i >= tcList.length) {
                tcRunning = false;
                return;
            }

            speakFR(tcList[i]);
            tcOutput.textContent = tcList[i];

            i++;
            tcTimer = setTimeout(next, delay);
        }

        next();
    });

    document.getElementById("tc-stop").addEventListener("click", () => {
        tcRunning = false;
        clearTimeout(tcTimer);
    });

});
