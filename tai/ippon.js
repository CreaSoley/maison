// ippon.js – version corrigée pour correspondre aux IDs du HTML fourni
// - corrige les IDs (filterSide, accordionList, selectAttack, selectSide, resultCard, surpriseResult)
// - remplit automatiquement la liste des attaques dans le select
// - crée les accordéons dans #accordionList
// - affiche la fiche détaillée dans #resultCard
// - affiche surprise dans #surpriseResult

const techniques = [
  { attaque: "Oi Tsuki Jodan", cote: "droite", esquive: "Tai sabaki diagonal extérieur, léger pivot de hanche", blocage: "jodan age-uke en avançant", defense: "contrôle du poignet → empi uchi au plexus", video: "https://www.youtube.com/embed/Rp1drfqOMKY" },
  { attaque: "Oi Tsuki Jodan", cote: "gauche", esquive: "decrire esquive", blocage: "jodan age uke avec rotation du buste.", defense: "tate tsuki chudan puis mae geri chudan (position contrôlée).", video: "https://www.youtube.com/embed//W1C3zZQ4KtQ" },
  { attaque: "Oi Tsuki Chudan", cote: "droite", esquive: "exterieur gauche", blocage: "ngashi uke → saisie poignet", defense: "uraken tsuki", video: "https://www.youtube.com/embed/ynE0eX2jpXc" },
  { attaque: "Oi Tsuki Chudan", cote: "gauche", esquive: "Pas intérieur rapide vers la droite (tai sabaki intérieur).", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/L18tYBdkTdg" },
  { attaque: "Mae Geri", cote: "droite", esquive: "déplacement extérieur gauche", blocage: "blocage gedan barai déviant", defense: "yoko geri gedan creux genou", video: "https://www.youtube.com/embed/rq67slGGZAw" },
  { attaque: "Mae Geri", cote: "gauche", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/mq8B1Xq9050" },
  { attaque: "Mawashi Geri", cote: "droite", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/UK4E4PgYw-g" },
  { attaque: "Mawashi Geri", cote: "gauche", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/d-YZ8euC_YQ?" },
  { attaque: "Yoko geri", cote: "droite", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/d-YZ8euC_YQ?" },
  { attaque: "Yoko geri", cote: "gauche", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/oSPe3ER_YdQ" }
];

// Helpers
function uniqAttaques() {
  const s = new Set();
  techniques.forEach(t => s.add(t.attaque));
  return Array.from(s);
}

// Module: Remplir selectAttack
function populateAttackSelect() {
  const sel = document.getElementById('selectAttack');
  if (!sel) return;
  const attaques = uniqAttaques();
  attaques.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  });
}

// =========================
// Remplissage des attaques (menu déroulant Script 2)
// =========================
function populateAttackSelect() {
    const select = document.getElementById("selectAttack");
    if (!select) return;

    const alreadyAdded = new Set();

    techniquesData.forEach(t => {
        if (!alreadyAdded.has(t.technique)) {
            const opt = document.createElement("option");
            opt.value = t.technique;
            opt.textContent = t.technique;
            select.appendChild(opt);
            alreadyAdded.add(t.technique);
        }
    });
}


// =========================
// SCRIPT 1 : Filtrer par côté → affichage accordéon
// =========================
document.getElementById("filterSide")?.addEventListener("change", function () {
    const side = this.value;
    renderAccordion(side);
});

function renderAccordion(side) {
    const container = document.getElementById("accordionList");
    if (!container) return;

    container.innerHTML = "";

    if (!side) return;

    const filtered = techniquesData.filter(t => t.cote === side);

    filtered.forEach(tech => {
        const item = document.createElement("div");
        item.classList.add("accordion-item");

        const header = document.createElement("div");
        header.classList.add("accordion-header");
        header.tabIndex = 0;

        // Technique = police Spicy
        header.innerHTML = `<span class="spicy">${tech.technique}</span>`;

        const panel = document.createElement("div");
        panel.classList.add("accordion-panel");

        panel.innerHTML = `
            <p><strong>Tai Sabaki :</strong> ${tech.tai_sabaki}</p>
            <p><strong>Blocage :</strong> ${tech.blocage}</p>
            <p><strong>Défense :</strong> ${tech.defense}</p>
            ${tech.video ? `
            <div class="tech-video">
                <video controls>
                    <source src="${tech.video}" type="video/mp4">
                </video>
            </div>
            ` : ""}
        `;

        header.addEventListener("click", () => {
            panel.classList.toggle("open");
        });

        header.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") panel.classList.toggle("open");
        });

        item.appendChild(header);
        item.appendChild(panel);
        container.appendChild(item);
    });
}


// =========================
// SCRIPT 2 : Fiche technique complète
// =========================
document.getElementById("selectSide")?.addEventListener("change", updateCard);
document.getElementById("selectAttack")?.addEventListener("change", updateCard);

function updateCard() {
    const attack = document.getElementById("selectAttack")?.value;
    const side = document.getElementById("selectSide")?.value;
    const container = document.getElementById("resultCard");

    if (!container) return;

    container.innerHTML = "";

    if (!attack || !side) return;

    const tech = techniquesData.find(t => t.technique === attack && t.cote === side);

    if (!tech) return;

    container.innerHTML = `
        <div class="tech-card">
            <h3 class="spicy">${tech.technique} (${tech.cote})</h3>

            <p><strong>Tai Sabaki :</strong> ${tech.tai_sabaki}</p>
            <p><strong>Blocage :</strong> ${tech.blocage}</p>
            <p><strong>Défense :</strong> ${tech.defense}</p>

            ${tech.video ? `
                <div class="tech-video">
                    <video controls>
                        <source src="${tech.video}" type="video/mp4">
                    </video>
                </div>
            ` : ""}
        </div>
    `;
}


// =========================
// SCRIPT 3 : BOUTON SURPRISE
// =========================
document.getElementById("btnSurprise")?.addEventListener("click", () => {
    if (techniquesData.length === 0) return;

    const rand = Math.floor(Math.random() * techniquesData.length);
    renderSurprise(techniquesData[rand]);
});

function renderSurprise(tech) {
    const container = document.getElementById("surpriseResult");
    if (!container) return;

    container.innerHTML = `
        <div class="tech-card">
            <h3 class="spicy">${tech.technique} (${tech.cote})</h3>

            <p><strong>Tai Sabaki :</strong> ${tech.tai_sabaki}</p>
            <p><strong>Blocage :</strong> ${tech.blocage}</p>
            <p><strong>Défense :</strong> ${tech.defense}</p>

            ${tech.video ? `
                <div class="tech-video">
                    <video controls>
                        <source src="${tech.video}" type="video/mp4">
                    </video>
                </div>
            ` : ""}
        </div>
    `;
}
