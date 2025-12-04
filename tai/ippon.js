/* -----------------------------
   DONNÉES IPPON KUMITE
----------------------------- */

const ipponData = [
    {
        attaque: "Oi Tsuki Jodan",
        cote: "droite",
        sabaki: "Tai sabaki diagonal extérieur, léger pivot de hanche",
        blocage: "Jodan age-uke en avançant",
        defense: "Contrôle du poignet → empi uchi au plexus",
        video: "https://www.youtube.com/embed/Rp1drfqOMKY"
    },
    {
        attaque: "Oi Tsuki Jodan",
        cote: "gauche",
        sabaki: "Décrire esquive",
        blocage: "Jodan age uke avec rotation du buste",
        defense: "Tate tsuki chudan puis mae geri chudan (position contrôlée)",
        video: "https://www.youtube.com/embed/W1C3zZQ4KtQ"
    },
    {
        attaque: "Oi Tsuki Chudan",
        cote: "droit",
        sabaki: "Extérieur gauche",
        blocage: "Ngashi uke → saisie poignet",
        defense: "Uraken tsuki",
        video: "https://www.youtube.com/embed/ynE0eX2jpXc"
    },
    {
        attaque: "Oi Tsuki Chudan",
        cote: "gauche",
        sabaki: "Pas intérieur rapide vers la droite (tai sabaki intérieur)",
        blocage: "Décrire blocage",
        defense: "Décrire défense",
        video: "https://www.youtube.com/embed/L18tYBdkTdg"
    },
    {
        attaque: "Mae Geri",
        cote: "droit",
        sabaki: "Déplacement extérieur gauche",
        blocage: "Blocage gedan barai déviant",
        defense: "Yoko geri gedan creux genou",
        video: "https://www.youtube.com/embed/rq67slGGZAw"
    },
    {
        attaque: "Mae Geri",
        cote: "gauche",
        sabaki: "Décrire esquive",
        blocage: "Décrire blocage",
        defense: "Décrire défense",
        video: "https://www.youtube.com/embed/mq8B1Xq9050"
    },
    {
        attaque: "Mawashi Geri",
        cote: "droit",
        sabaki: "Décrire esquive",
        blocage: "Décrire blocage",
        defense: "Décrire défense",
        video: "https://www.youtube.com/embed/UK4E4PgYw-g"
    },
    {
        attaque: "Mawashi Geri",
        cote: "gauche",
        sabaki: "Décrire esquive",
        blocage: "Décrire blocage",
        defense: "Décrire défense",
        video: "https://www.youtube.com/embed/d-YZ8euC_YQ?"
    },
    {
        attaque: "Yoko geri",
        cote: "droite",
        sabaki: "Décrire esquive",
        blocage: "Décrire blocage",
        defense: "Décrire défense",
        video: "https://www.youtube.com/embed/d-YZ8euC_YQ?"
    },
    {
        attaque: "Yoko geri",
        cote: "gauche",
        sabaki: "Décrire esquive",
        blocage: "Décrire blocage",
        defense: "Décrire défense",
        video: "https://www.youtube.com/embed/oSPe3ER_YdQ"
    }
];



/* --------------------------------------------------------------------
   REMPLISSAGE DES SELECTS (attaques et techniques)
-------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {

    const selectAttaque = document.getElementById("selectAttaque");
    const selectTechnique = document.getElementById("selectTechnique");

    const attaquesUniques = [...new Set(ipponData.map(t => t.attaque))];

    attaquesUniques.forEach(a => {
        const opt1 = document.createElement("option");
        opt1.value = a;
        opt1.textContent = a;
        selectAttaque.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = a;
        opt2.textContent = a;
        selectTechnique.appendChild(opt2);
    });

});



/* --------------------------------------------------------------------
   SCRIPT 1 — ACCORDIONS
-------------------------------------------------------------------- */

function genererAccordion() {
    const attaque = document.getElementById("selectAttaque").value;
    const container = document.getElementById("accordionContainer");
    container.innerHTML = "";

    if (!attaque) return;

    const fiches = ipponData.filter(f => f.attaque === attaque);

    fiches.forEach(fiche => {
        const acc = document.createElement("div");
        acc.className = "ippon-accordion";

        acc.innerHTML = `
            <div class="ippon-acc-header">${fiche.attaque} — ${fiche.cote}</div>
            <div class="ippon-acc-content">
                <p><strong>Tai Sabaki :</strong> ${fiche.sabaki}</p>
                <p><strong>Blocage :</strong> ${fiche.blocage}</p>
                <p><strong>Défense :</strong> ${fiche.defense}</p>
            </div>
        `;

        acc.querySelector(".ippon-acc-header").addEventListener("click", () => {
            const content = acc.querySelector(".ippon-acc-content");
            content.style.display = content.style.display === "block" ? "none" : "block";
        });

        container.appendChild(acc);
    });
}



/* --------------------------------------------------------------------
   SCRIPT 2 — FICHE TECHNIQUE
-------------------------------------------------------------------- */

function genererFicheTechnique() {

    const tech = document.getElementById("selectTechnique").value;
    const cote = document.getElementById("selectCote").value;
    const card = document.getElementById("resultCard");

    card.innerHTML = "";

    if (!tech || !cote) return;

    const fiche = ipponData.find(f => f.attaque === tech && f.cote === cote);

    if (!fiche) {
        card.innerHTML = "<p>Aucune donnée trouvée.</p>";
        return;
    }

    card.innerHTML = `
        <div class="tech-title">${fiche.attaque}</div>
        <div class="tech-side">${fiche.cote.toUpperCase()}</div>

        <p><strong class="result-title">Tai Sabaki :</strong> 
           <span class="result-text">${fiche.sabaki}</span></p>

        <p><strong class="result-title">Blocage :</strong> 
           <span class="result-text">${fiche.blocage}</span></p>

        <p><strong class="result-title">Défense :</strong> 
           <span class="result-text">${fiche.defense}</span></p>

        <iframe class="video-frame" src="${fiche.video}" allowfullscreen></iframe>
    `;
}



/* --------------------------------------------------------------------
   SCRIPT 3 — FICHE SURPRISE (2 colonnes sur desktop)
-------------------------------------------------------------------- */

const btnSurprise = document.getElementById("btnSurprise");
const surpriseBox = document.getElementById("surpriseResult");

btnSurprise.addEventListener("click", () => {

    const fiche = ipponData[Math.floor(Math.random() * ipponData.length)];

    surpriseBox.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:flex-start;">

            <div style="flex:1; min-width:260px;">
                <div class="tech-title">${fiche.attaque}</div>
                <div class="tech-side">${fiche.cote}</div>

                <p><strong>Tai Sabaki :</strong> ${fiche.sabaki}</p>
                <p><strong>Blocage :</strong> ${fiche.blocage}</p>
                <p><strong>Défense :</strong> ${fiche.defense}</p>
            </div>

            <div style="flex:1; min-width:260px; text-align:center;">
                <iframe 
                    src="${fiche.video}"
                    class="video-frame"
                    allowfullscreen>
                </iframe>
            </div>

        </div>
    `;
});
