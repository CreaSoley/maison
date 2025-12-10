// encart2.js - UV2 Ippon Kumite avec réglage intervalle via slider

// -----------------------------
// CONFIG
// -----------------------------
const DELAI_AVANT_TITRE = 5000; // 5 secondes avant annonce du titre
const DELAI_AVANT_LISTE = 5000; // 5 secondes après le titre
let intervalleLecture = 15000;   // 15 secondes par défaut (modifiable via slider)

// -----------------------------
// AUDIOS
// -----------------------------
const ding = new Audio("ding.mp3");
const beep = new Audio("beep.mp3");

// -----------------------------
// Synthèse vocale japonaise
// -----------------------------
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
  speechSynthesis.cancel();

  // 1) Annonce du titre
  await new Promise(res => setTimeout(res, DELAI_AVANT_TITRE));
  lireJaponais("Ippon Kumite");

  // 2) Attendre avant la liste
  await new Promise(res => setTimeout(res, DELAI_AVANT_LISTE));

  // 3) Lecture séquentielle des techniques
  for (const tech of ipponKumite.techniques) {
    ding.play();
    await new Promise(res => setTimeout(res, 1000)); // attendre fin ding
    lireJaponais(tech.jp);
    await new Promise(res => setTimeout(res, intervalleLecture));
  }

  // 4) Fin de la liste → beep final
  beep.play();
}

// -----------------------------
// CREATION SLIDER DANS L'UI
// -----------------------------
const container = document.querySelector("#uv2 .content"); // On ajoute dans la card UV2
if (container) {
  const sliderContainer = document.createElement("div");
  sliderContainer.style.margin = "10px 0";
  sliderContainer.innerHTML = `
    <label style="color:#fff; display:block; margin-bottom:6px;">
      Intervalle entre techniques : <span id="slider-value">15</span> s
    </label>
    <input type="range" min="5" max="30" value="15" step="1" id="interval-slider" style="width:100%;">
  `;
  container.prepend(sliderContainer);

  const slider = sliderContainer.querySelector("#interval-slider");
  const label = sliderContainer.querySelector("#slider-value");

  slider.addEventListener("input", () => {
    intervalleLecture = parseInt(slider.value) * 1000; // convertir en ms
    label.textContent = slider.value;
  });
}

// -----------------------------
// LIEN AVEC LE BOUTON
// -----------------------------
const boutonLecture = document.querySelector("#btn-ippon-kumite");
if (boutonLecture) {
  boutonLecture.addEventListener("click", lectureIpponKumite);
}
