/* ------------------------------------------
   SCRIPT 2 — ENCHAINEMENTS AU HASARD
------------------------------------------- */

const enchainements = [
  "Gedan Barai → Gyaku Tsuki → Mae Geri",
  "Jodan Age Uke → Oï Tsuki → Mae Geri",
  "Soto Ude Uke → Gyaku Tsuki → Mawashi Geri",
  "Uchi Ude Uke → Kizami Tsuki → Gyaku Tsuki",
  "Shuto Uke → Shuto Uchi → Gyaku Tsuki",
  "Osae Uke → Tate Tsuki → Mawashi Geri",
  "Teisho Uke → Teisho Uchi → Gyaku Tsuki",
  "Juji Uke → Uraken Uchi → Gyaku Tsuki",
  "Kakiwake Uke → Nukite → Tate Tsuki",
  "Morote Uke → Tetsui Uchi → Gyaku Tsuki",
  "Heiko Uke → Haito Uchi → Gyaku Tsuki",
  "Sukui Uke → Empi Uchi → Gyaku Tsuki",
  "Nagashi Uke → Kizami Tsuki → Tate Gyaku tsuki",
  "Otoshi Uke → Oï Tsuki → Yoko Geri Keage",
  "Soto Ude Uke → Tate Tsuki → Yoko Geri Kekomi",
  "Uchi Ude Uke → Mawashi Tsuki → Mae Geri",
  "Gedan Barai → Kizami Tsuki → Yoko Geri Keage",
  "Morote Uke → Maete Tsuki → Mawashi Geri",
  "Shuto Uke → Gyaku Tsuki → Tetsui Uchi",
  "Koken Uke → Uraken Uchi → Mawashi Geri",
  "Teisho Uke → Haito Uchi → Gyaku Tsuki",
  "Nagashi Uke → Kagi Tsuki",
  "Juji Uke → Morote Tsuki",
  "Osae Uke → Shuto Uchi → Gyaku Tsuki",
  "Sukui Uke → Empi Uchi → Mae Geri",
  "Heiko Uke → Nukite → Mawashi Tsuki",
  "Otoshi Uke → Koken Uchi → Gyaku Tsuki",
  "Jodan Age Uke → Kizami Tsuki → Mawashi Geri",
  "Kakiwake Uke → Age Tsuki → Yoko Geri Keage"
];

function nouveauEnchainement() {
  const random = enchainements[Math.floor(Math.random() * enchainements.length)];
  document.getElementById("comboResult").textContent = random;
}

document.getElementById("btnCombo").addEventListener("click", nouveauEnchainement);

nouveauEnchainement(); // affichage initial



/* ------------------------------------------
   SCRIPT 3 — CIBLE (tirage de 3 techniques)
------------------------------------------- */

const techniquesCible = [
  "Mae Geri (jambe arrière, chudan)",
  "Mawashi Geri (jambe arrière, jodan/chudan)",
  "Mae Geri jambe avant avec sursaut (chudan)",
  "Mawashi Geri jambe avant avec sursaut (jodan/chudan)",
  "Gyaku Zuki chudan",
  "Kizami/Maete Zuki jodan → Gyaku Zuki chudan",
  "Oï Zuki jodan → retour arrière"
];

function nouveauTirageCible() {
  const tirage = [];

  while (tirage.length < 3) {
    const tech = techniquesCible[Math.floor(Math.random() * techniquesCible.length)];
    if (!tirage.includes(tech)) tirage.push(tech);
  }

  const list = document.getElementById("cibleList");
  list.innerHTML = "";
  tirage.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });
}

document.getElementById("btnCible").addEventListener("click", nouveauTirageCible);

nouveauTirageCible(); // affichage initial
