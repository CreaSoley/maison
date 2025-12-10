// encart2.js - UV2 Ippon Kumite
// Lecture japonaise complète du JSON avec délais + ding + beep

// -----------------------------
// CONFIG
// -----------------------------
const DELAI_AVANT_TITRE = 5000; // 5 secondes avant annonce du titre
const DELAI_AVANT_LISTE = 5000; // 5 secondes après le titre
let intervalleLecture = 15000; // 15 secondes entre chaque terme (modifiable si tu veux)

// -----------------------------
// AUDIOS
// -----------------------------
const ding = new Audio("ding.mp3");
const beep = new Audio("beep.mp3");

// Synthèse vocale japonaise
function lireJaponais(texte) {
  const utter = new SpeechSynthesisUtterance(texte);
  utter.lang = "ja-JP";
  speechSynthesis.speak(utter);
}

// -----------------------------
// JSON TECHNIQUES IPPON KUMITE
// -----------------------------
const ipponKumite = {
  "techniques": [
    { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
    { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
    { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
    { "romaji": "Mawashi Geri Jodan", "jp": "回し蹴り 上段" },
    { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
    { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" },

    { "romaji": "Oi Tsuki Jodan", "jp": "追い突き 上段" },
    { "romaji": "Oi Tsuki Chudan", "jp": "追い突き 中段" },
    { "romaji": "Mae Geri Chudan", "jp": "前蹴り 中段" },
    { "romaji": "Mawashi Geri Jodan", "jp": "回し蹴り 上段" },
    { "romaji": "Mawashi Geri Chudan", "jp": "回し蹴り 中段" },
    { "romaji": "Yoko Geri Chudan", "jp": "横蹴り 中段" }
  ]
};

// -----------------------------
// FONCTION PRINCIPALE
// -----------------------------
async function lectureIpponKumite() {
  // sécurité si la synthèse vocale est déjà en cours
  speechSynthesis.cancel();

  // --------------------
  // 1) Annonce du titre
  // --------------------
  await new Promise(res => setTimeout(res, DELAI_AVANT_TITRE));
  lireJaponais("Ippon Kumite");

  // --------------------
  // 2) Attendre avant la liste
  // --------------------
  await new Promise(res => setTimeout(res, DELAI_AVANT_LISTE));

  // --------------------
  // 3) Lecture séquentielle des techniques
  // --------------------
  for (const tech of ipponKumite.techniques) {
    ding.play();

    // attendre la fin du ding
    await new Promise(res => setTimeout(res, 1000));

    lireJaponais(tech.jp);

    // délai entre chaque technique
    await new Promise(res => setTimeout(res, intervalleLecture));
  }

  // --------------------
  // 4) Fin de la liste → beep final
  // --------------------
  beep.play();
}

// -----------------------------
// LIEN AVEC LE BOUTON DE L'ENCART
// -----------------------------
// Le bouton doit avoir l'ID : #btn-ippon-kumite

const boutonLecture = document.querySelector("#btn-ippon-kumite");

if (boutonLecture) {
  boutonLecture.addEventListener("click", () => {
    lectureIpponKumite();
  });
}
