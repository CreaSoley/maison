// ippon.js – gestion des 3 modules : filtres côté, sélection attaque+côté, boutons PDF

// ===== Données JSON =====
const techniques = [
  {
    attaque: "Oi Tsuki Jodan",
    cote: "droite",
    esquive: "Tai sabaki diagonal extérieur, léger pivot de hanche",
    blocage: "jodan age-uke en avançant",
    defense: "contrôle du poignet → empi uchi au plexus",
    video: "https://www.youtube.com/embed/Rp1drfqOMKY"
  },
  {
    attaque: "Oi Tsuki Jodan",
    cote: "gauche",
    esquive: "decrire esquive",
    blocage: "jodan age uke avec rotation du buste.",
    defense: "tate tsuki chudan puis mae geri chudan (position contrôlée).",
    video: "https://www.youtube.com/embed//W1C3zZQ4KtQ"
  },
  {
    attaque: "Oi Tsuki Chudan",
    cote: "droit",
    esquive: "exterieur gauche",
    blocage: "ngashi uke → saisie poignet",
    defense: "uraken tsuki",
    video: "https://www.youtube.com/embed/ynE0eX2jpXc"
  },
  {
    attaque: "Oi Tsuki Chudan",
    cote: "gauche",
    esquive: "Pas intérieur rapide vers la droite (tai sabaki intérieur).",
    blocage: "decrire blocage",
    defense: "décrire défense",
    video: "https://www.youtube.com/embed/L18tYBdkTdg"
  },
  {
    attaque: "Mae Geri",
    cote: "droit",
    esquive: "déplacement extérieur gauche",
    blocage: "blocage gedan barai déviant",
    defense: "yoko geri gedan creux genou",
    video: "https://www.youtube.com/embed/rq67slGGZAw"
  },
  {
    attaque: "Mae Geri",
    cote: "droit",
    esquive: "decrire esquive",
    blocage: "decrire blocage",
    defense: "décrire défense",
    video: "https://www.youtube.com/embed/mq8B1Xq9050"
  },
  {
    attaque: "Mawashi Geri",
    cote: "droit",
    esquive: "decrire esquive",
    blocage: "decrire blocage",
    defense: "décrire défense",
    video: "https://www.youtube.com/embed/UK4E4PgYw-g"
  },
  {
    attaque: "Mawashi Geri",
    cote: "gauche",
    esquive: "decrire esquive",
    blocage: "decrire blocage",
    defense: "décrire défense",
    video: "https://www.youtube.com/embed/d-YZ8euC_YQ?"
  },
  {
    attaque: "Yoko geri",
    cote: "droite",
    esquive: "decrire esquive",
    blocage: "decrire blocage",
    defense: "décrire défense",
    video: "https://www.youtube.com/embed/d-YZ8euC_YQ?"
  },
  {
    attaque: "Yoko geri",
    cote: "gauche",
    esquive: "decrire esquive",
    blocage: "decrire blocage",
    defense: "décrire défense",
    video: "https://www.youtube.com/embed/oSPe3ER_YdQ"
  }
];

// ===== Module 1 : choix du côté → card affichée =====
function initModuleCote() {
  const selectCote = document.getElementById("selectCote1");
  const result = document.getElementById("resultCote1");

  selectCote.addEventListener("change", () => {
    const cote = selectCote.value;
    const tech = techniques.filter(t => t.cote.toLowerCase() === cote.toLowerCase());

    if (!cote) {
      result.innerHTML = "";
      return;
    }

    // Affiche la première technique trouvée de ce côté
    if (tech.length > 0) {
      const t = tech[0];
      result.innerHTML = `
        <div class="kawaii-card card-block spicy">
          <h3>${t.attaque} – ${t.cote}</h3>
          <p><strong>Tai sabaki :</strong> ${t.esquive}</p>
          <p><strong>Blocage :</strong> ${t.blocage}</p>
          <p><strong>Défense :</strong> ${t.defense}</p>
        </div>`;
    }
  });
}

// ===== Module 2 : choix attaque + côté → card + vidéo =====
function initModuleAttaqueCote() {
  const selectAtt = document.getElementById("selectAttaque2");
  const selectCote = document.getElementById("selectCote2");
  const result = document.getElementById("resultModule2");

  function update() {
    const att = selectAtt.value;
    const cote = selectCote.value;

    const tech = techniques.find(t => t.attaque === att && t.cote.toLowerCase() === cote.toLowerCase());

    if (tech) {
      result.innerHTML = `
        <div class="kawaii-card card-block spicy">
          <h3>${tech.attaque} – ${tech.cote}</h3>
          <p><strong>Tai sabaki :</strong> ${tech.esquive}</p>
          <p><strong>Blocage :</strong> ${tech.blocage}</p>
          <p><strong>Défense :</strong> ${tech.defense}</p>
          <iframe src="${tech.video}" class="video" frameborder="0" allowfullscreen></iframe>
        </div>`;
    }
  }

  selectAtt.addEventListener("change", update);
  selectCote.addEventListener("change", update);
}

// ===== Module 3 : boutons PDF + bouton surprise =====
function initModulePDF() {
  const surpriseBtn = document.getElementById("btnSurprise");
  const surpriseOutput = document.getElementById("surpriseOutput");

  surpriseBtn.addEventListener("click", () => {
    const t = techniques[Math.floor(Math.random() * techniques.length)];
    surpriseOutput.innerHTML = `
      <div class="kawaii-card card-block spicy">
        <h3>${t.attaque} – ${t.cote}</h3>
        <p><strong>Tai sabaki :</strong> ${t.esquive}</p>
        <p><strong>Blocage :</strong> ${t.blocage}</p>
        <p><strong>Défense :</strong> ${t.defense}</p>
        <iframe src="${t.video}" class="video" frameborder="0" allowfullscreen></iframe>
      </div>`;
  });
}

// ===== Initialisation =====
document.addEventListener("DOMContentLoaded", () => {
  initModuleCote();
  initModuleAttaqueCote();
  initModulePDF();
});
