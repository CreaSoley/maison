/* ============================================================================
   FONCTIONS UTILITAIRES : PARSER CSV
============================================================================ */
function parseCSVLine(line) {
    const parts = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === "," && !inQuotes) {
            parts.push(cur.trim());
            cur = "";
        } else cur += ch;
    }
    parts.push(cur.trim());
    return parts;
}

/* ============================================================================
   PROVERBE DU JOUR
============================================================================ */
async function chargerProverbe() {
    try {
        const res = await fetch("data/proverbes.csv");
        const text = await res.text();

        const lignes = text.split("\n").slice(1);

        const today = new Date();
        const key = String(today.getDate()).padStart(2, "0") + "/" +
                    String(today.getMonth() + 1).padStart(2, "0");

        let trouve = false;

        lignes.forEach(l => {
            const [date, proverbe, traduction] = parseCSVLine(l);
            if (date === key) {
                document.querySelector("#proverbe-du-jour .proverbe-text").innerHTML =
                    `<strong>« ${proverbe} »</strong><br>${traduction}`;
                trouve = true;
            }
        });

        if (!trouve) {
            document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
                "Aucun proverbe pour aujourd’hui.";
        }

    } catch (err) {
        console.error(err);
        document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
            "Erreur de chargement.";
    }
}

/* ============================================================================
   DEVINETTE DU JOUR (CSV)
============================================================================ */
let reponseDuJour = "";

async function chargerDevinette() {
    try {
        const res = await fetch("data/devinettes.csv");
        const text = await res.text();

        const lignes = text.split("\n").slice(1);

        const today = new Date();
        const key =
            String(today.getDate()).padStart(2, "0") + "/" +
            String(today.getMonth() + 1).padStart(2, "0");

        lignes.forEach(l => {
            const [date, devinette, reponse] = parseCSVLine(l);
            if (date === key) {
                document.querySelector("#devinette-question").textContent = devinette;
                reponseDuJour = reponse.trim().toLowerCase();
            }
        });

    } catch (err) {
        console.error("Erreur devinette:", err);
    }
}

function validerReponse() {
    const input = document.getElementById("devinette-input").value.trim().toLowerCase();
    const result = document.getElementById("devinette-resultat");

    if (input === "") {
        result.textContent = "Veuillez saisir une réponse.";
        return;
    }

    if (input === reponseDuJour) {
        result.textContent = "🎉 Bravo ! A demain pour une nouvelle devinette.";
        lancerPluieZen();
    } else {
        result.textContent = "❌ Ce n’est pas la bonne réponse…";
    }
}

/* ============================================================================
   ANIMATION ZEN (pluie de pétales)
============================================================================ */
function lancerPluieZen() {
    for (let i = 0; i < 15; i++) {
        const petale = document.createElement("div");
        petale.classList.add("petale");
        petale.style.left = Math.random() * 100 + "vw";
        petale.style.animationDuration = 3 + Math.random() * 3 + "s";
        document.body.appendChild(petale);

        setTimeout(() => petale.remove(), 6000);
    }
}

/* ============================================================================
   DEFI ARTISTIQUE
============================================================================ */
async function chargerDefi() {
    try {
        const res = await fetch("data/activites.csv");
        const text = await res.text();
        const lignes = text.split("\n").slice(1);

        const today = new Date();
        const index = (today.getMonth() * 31 + today.getDate()) % lignes.length;

        const [activite, categorie, niveau, couleur] = parseCSVLine(lignes[index]);

        document.getElementById("defi-texte").textContent = activite;
        document.getElementById("defi-du-jour-bloc").style.borderColor = couleur;

    } catch (err) {
        console.error("Erreur défi:", err);
    }
}

/* ============================================================================
   LANCEMENT
============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    chargerProverbe();
    chargerDevinette();
    chargerDefi();
});
