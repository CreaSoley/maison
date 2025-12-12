// ========================
//   ENCAT 2 : IPPON KUMITE
// ========================

// rendu GLOBAL pour être appelé depuis l’HTML
window.readIppon = readIppon;

document.addEventListener("DOMContentLoaded", () => {

    // LISTE DES TECHNIQUES
    const techniques = [
        { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
        { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
        { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
        { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
        { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" },
        { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
        { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
        { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
        { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
        { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" }
    ];

    // insertion UI
    const uv2Content = document.getElementById("uv2-content");
    if (uv2Content) {
        uv2Content.innerHTML = techniques
            .map(t => `<p>${t.jp}</p>`)
            .join('');
    }

});


// ========================
//  LECTURE (GLOBAL)
// ========================
let ipponTimer = null;
let ipponRunning = false;

function readIppon() {

    if (ipponRunning) return;
    ipponRunning = true;

    const intervalInput = document.getElementById("uv2-interval");
    const interval = parseInt(intervalInput?.value || 15) * 1000;

    // ding & beep
    const ding = new Audio("ding.mp3");
    const beep = new Audio("beep.mp3");

    // techniques (du DOM)
    const list = [...document.querySelectorAll("#uv2-content p")].map(e => e.textContent);

    let i = 0;

    function next() {

        if (i >= list.length) {
            beep.play();
            ipponRunning = false;
            return;
        }

        ding.play();

        const utter = new SpeechSynthesisUtterance(list[i]);
        utter.lang = "ja-JP";
        speechSynthesis.speak(utter);

        i++;
        ipponTimer = setTimeout(next, interval);
    }

    setTimeout(next, 3000);
}
