// -----------------------------------------------------------
// 🔸 PROVERBE DU JOUR
// CSV format : Date,Proverbe,Traduction
// -----------------------------------------------------------

// Parse une ligne CSV robuste (gère les guillemets)
function parseCSVLine(ligne) {
    const parts = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < ligne.length; i++) {
        const char = ligne[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    parts.push(current.trim());
    return parts;
}


// Chargement principal du proverbe
function chargerProverbeDuJour() {
    fetch("data/proverbes.csv")
        .then(r => r.text())
        .then(text => {
            const lignes = text.trim().split("\n");

            // on ignore l'en-tête
            const donnees = lignes.slice(1)
                .map(parseCSVLine)
                .filter(cols => cols.length >= 3)
                .map(cols => {
                    const dateBrute = cols[0].trim();
                    const texte = cols[1].replace(/"/g, "").trim();
                    const traduction = cols[2].replace(/"/g, "").trim();

                    // formatage jj/mm
                    const d = dateBrute.split("/");
                    let date_jj_mm = dateBrute;
                    if (d.length === 2) {
                        date_jj_mm = d[0].padStart(2, "0") + "/" + d[1].padStart(2, "0");
                    }

                    return { date: date_jj_mm, texte, traduction };
                });

            if (donnees.length === 0) return;

            // Date actuelle
            const now = new Date();
            const jj = String(now.getDate()).padStart(2, "0");
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dateToday = `${jj}/${mm}`;

            // Recherche d’un proverbe pour la date exacte
            let choix = donnees.find(x => x.date === dateToday);

            // Sinon random
            if (!choix) choix = donnees[Math.floor(Math.random() * donnees.length)];

            const bloc = document.getElementById("proverbe-du-jour");
            if (!bloc) return;

            bloc.innerHTML = `
                <h2>💬 Proverbe du jour</h2>
                <p class="proverbe-text">« ${choix.texte} »</p>
                <p class="proverbe-traduction">${choix.traduction}</p>
            `;
        })
        .catch(err => {
            console.error("Erreur CSV proverbes :", err);
            const bloc = document.getElementById("proverbe-du-jour");
            if (bloc) bloc.innerHTML = "<p>Erreur de chargement du proverbe.</p>";
        });
}


// ⚡ Lancement automatique
document.addEventListener("DOMContentLoaded", chargerProverbeDuJour);
