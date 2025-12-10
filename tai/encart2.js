// ===== TECHNIQUES IPPON KUMITE =====
const techniques = [
    { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
    { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
    { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
    { "romaji": "Mawashi Geri Jodan", "jp": "回し蹴り 上段" },
    { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
    { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" }
];

// ===== AFFICHAGE DANS L'UI =====
const uv2Content = document.getElementById("uv2-content");
uv2Content.innerHTML = techniques.map(t => `<p>${t.jp}</p>`).join('');

// ===== LECTURE =====
function readIppon(){
    const interval = parseInt(document.getElementById("uv2-interval").value)*1000 || 15000;
    const synth = window.speechSynthesis;
    const ding = new Audio("ding.mp3");
    const beep = new Audio("beep.mp3");

    let i=0;
    setTimeout(function next(){
        if(i>=techniques.length){
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
}
