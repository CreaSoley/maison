// =====================
//  IPPON KUMITE – JS COMPLET
//  Version mobile/desktop corrigée
//  Vidéo en colonne, accordéons, surprise, PDF, tooltips
// =====================

// ----------------------
// 1. DONNÉES TECHNIQUES
// ----------------------
const techniques = [
    {
        technique: "Oi Tsuki Jodan",
        cote: "droite",
        tai_sabaki: "Tai sabaki diagonal extérieur, léger pivot de hanche",
        blocage: "jodan age-uke en avançant",
        defense: "contrôle du poignet → empi uchi au plexus",
        video: "https://www.youtube.com/embed/Rp1drfqOMKY"
    },{
        technique: "Oi Tsuki Jodan",
        cote: "gauche",
        tai_sabaki: "décrire esquive",
        blocage: "jodan age uke avec rotation du buste.",
        defense: "tate tsuki chudan puis mae geri chudan (position contrôlée).",
        video: "https://www.youtube.com/embed/W1C3zZQ4KtQ"
    },{
        technique: "Oi Tsuki Chudan",
        cote: "droit",
        tai_sabaki: "exterieur gauche",
        blocage: "ngashi uke → saisie poignet",
        defense: "uraken tsuki",
        video: "https://www.youtube.com/embed/ynE0eX2jpXc"
    },{
        technique: "Oi Tsuki Chudan",
        cote: "gauche",
        tai_sabaki: "Pas intérieur rapide vers la droite (tai sabaki intérieur).",
        blocage: "décrire blocage",
        defense: "décrire défense",
        video: "https://www.youtube.com/embed/L18tYBdkTdg"
    },{
        technique: "Mae Geri",
        cote: "droit",
        tai_sabaki: "déplacement extérieur gauche",
        blocage: "blocage gedan barai déviant",
        defense: "yoko geri gedan creux genou",
        video: "https://www.youtube.com/embed/rq67slGGZAw"
    },{
        technique: "Mae Geri",
        cote: "droit",
        tai_sabaki: "décrire esquive",
        blocage: "décrire blocage",
        defense: "décrire défense",
        video: "https://www.youtube.com/embed/mq8B1Xq9050"
    },{
        technique: "Mawashi Geri",
        cote: "droit",
        tai_sabaki: "décrire esquive",
        blocage: "décrire blocage",
        defense: "décrire défense",
        video: "https://www.youtube.com/embed/UK4E4PgYw-g"
    },{
        technique: "Mawashi Geri",
        cote: "gauche",
        tai_sabaki: "décrire esquive",
        blocage: "décrire blocage",
        defense: "décrire défense",
        video: "https://www.youtube.com/embed/d-YZ8euC_YQ"
    },{
        technique: "Yoko geri",
        cote: "droite",
        tai_sabaki: "décrire esquive",
        blocage: "décrire blocage",
        defense: "décrire défense",
        video: "https://www.youtube.com/embed/d-YZ8euC_YQ"
    },{
        technique: "Yoko geri",
        cote: "gauche",
        tai_sabaki: "décrire esquive",
        blocage: "décrire blocage",
        defense: "décrire défense",
        video: "https://www.youtube.com/embed/oSPe3ER_YdQ"
    }
];


// ----------------------
// 2. SCRIPT 1 — FILTRE PAR CÔTÉ → ACCORDÉONS
// ----------------------
const selectCote1 = document.getElementById("cote1");
const result1 = document.getElementById("resultScript1");

selectCote1.addEventListener("change", renderAccordion);

function renderAccordion() {
    const cote = selectCote1.value;
    result1.innerHTML = "";
    if (!cote) return;

    const filtered = techniques.filter(t => t.cote.toLowerCase() === cote.toLowerCase());

    filtered.forEach((tech, i) => {
        const acc = document.createElement("div");
        acc.className = "accordion-item";

        acc.innerHTML = `
            <div class="accordion-header spicy">${tech.technique}</div>
            <div class="accordion-body">
                <p><strong>Tai Sabaki :</strong> ${tech.tai_sabaki}</p>
                <p><strong>Blocage :</strong> ${tech.blocage}</p>
                <p><strong>Défense :</strong> ${tech.defense}</p>
            </div>
        `;

        acc.querySelector(".accordion-header").addEventListener("click", () => {
            acc.classList.toggle("open");
        });

        result1.appendChild(acc);
    });
}


// ----------------------
// 3. SCRIPT 2 — CHOIX TECHNIQUE + CÔTÉ → FICHE TECHNIQUE
// ----------------------
const selectTech2 = document.getElementById("tech2");
const selectCote2 = document.getElementById("cote2");
const result2 = document.getElementById("resultScript2");

// Remplir liste des techniques
const techNames = [...new Set(techniques.map(t => t.technique))];
techNames.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    selectTech2.appendChild(opt);
});

selectTech2.addEventListener("change", updateCard);
selectCote2.addEventListener("change", updateCard);

function updateCard() {
    const name = selectTech2.value;
    const cote = selectCote2.value;

    result2.innerHTML = "";
    if (!name || !cote) return;

    const tech = techniques.find(t => t.technique === name && t.cote === cote);
    if (!tech) return;

    result2.innerHTML = `
        <div class="tech-card">
            <div class="tech-info">
                <h3 class="spicy">${tech.technique} (${tech.cote})</h3>
                <p><strong>Tai Sabaki :</strong> ${tech.tai_sabaki}</p>
                <p><strong>Blocage :</strong> ${tech.blocage}</p>
                <p><strong>Défense :</strong> ${tech.defense}</p>
            </div>
            <div class="tech-video">
                <iframe src="${tech.video}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;
}


// ----------------------
// 4. SCRIPT 3 — BOUTON SURPRISE
// ----------------------
const btnSurprise = document.getElementById("btnSurprise");
const surpriseBox = document.getElementById("surpriseResult");

btnSurprise.addEventListener("click", () => {
    const rnd = techniques[Math.floor(Math.random() * techniques.length)];
    renderSurprise(rnd);
});

function renderSurprise(tech) {
    surpriseBox.innerHTML = `
        <div class="tech-card">
            <div class="tech-info">
                <h3 class="spicy">${tech.technique} (${tech.cote})</h3>
                <p><strong>Tai Sabaki :</strong> ${tech.tai_sabaki}</p>
                <p><strong>Blocage :</strong> ${tech.blocage}</p>
                <p><strong>Défense :</strong> ${tech.defense}</p>
            </div>
            <div class="tech-video">
                <iframe src="${tech.video}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;
}


// ----------------------
// 5. SUPPORT MOBILE → events tactiles
// ----------------------
// Rendre les clics fonctionnels sur iOS/Android

document.querySelectorAll("button, .accordion-header").forEach(btn => {
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        btn.click();
    });
});

document.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("input", () => {
        sel.dispatchEvent(new Event("change"));
    });
});
