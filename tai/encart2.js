document.addEventListener('DOMContentLoaded', () => {

    // ===== LISTE DES TECHNIQUES UV2 =====
    const techniques = [
        { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
        { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
        { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
        { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
        { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" },

        // doublons comme ton fichier original
        { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
        { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
        { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
        { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
        { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" }
    ];

    // ===== CHECK SI L’UI EXISTE =====
    const uv2Content = document.getElementById("uv2-content");
    if (!uv2Content) {
        console.error("❌ ERREUR : élément #uv2-content introuvable dans le HTML");
        return;
    }

    // ===== AFFICHE LES TECHNIQUES =====
    uv2Content.innerHTML = techniques.map(t => `<p>${t.jp}</p>`).join('');

    // ===== LECTURE AUDIO =====
    window.readIppon = function () {
        const intervalInput = document.getElementById("uv2-interval");
        if (!intervalInput) {
            console.error("❌ ERREUR : #uv2-interval manquant dans le HTML");
            return;
        }

        const interval = parseInt(intervalInput.value) * 1000 || 15000;

        const synth = window.speechSynthesis;
        const ding = new Audio("ding.mp3");
        const beep = new Audio("beep.mp3");

        let i = 0;

        setTimeout(function next() {
            if (i >= techniques.length) {
                beep.play();
                return;
            }

            ding.play();

            const utter = new SpeechSynthesisUtterance(techniques[i].jp);
            utter.lang = "ja-JP";
            synth.speak(utter);

            i++;
            setTimeout(next, interval);

        }, 5000);
    };

});
