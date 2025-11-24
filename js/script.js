// -----------------------------------------------------------
// Script principal du site
// - Initialise toutes les sections
// - Charge la couleur + activité du jour via CSV
// - Prépare l'espace "Devinette du jour"
// -----------------------------------------------------------

// --------- UTILS CSV ---------
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}


// -----------------------------------------------------------
// 🔵 ACTIVITÉ & COULEUR DU JOUR (via activites.csv)
// -----------------------------------------------------------
function chargerActiviteEtCouleur() {
    fetch("data/activites.csv")
        .then(r => r.text())
        .then(text => {
            const lignes = text.trim().split("\n").slice(1); // ignore header

            const liste = lignes.map(l => {
                const [activite, categorie, niveau, couleur] = parseCSVLine(l);
                return { activite, categorie, niveau, couleur };
            });

            if (liste.length === 0) return;

            // Choix aléatoire
            const choix = liste[Math.floor(Math.random() * liste.length)];
            const bloc = document.getElementById("couleur-activite");

            if (!bloc) return;

            bloc.innerHTML = `
                <div class="couleur-carre" style="background:${choix.couleur}"></div>
                <p class="code-couleur">${choix.couleur}</p>
                <p class="activite-texte">« ${choix.activite} »</p>
                <p><strong>Catégorie :</strong> ${choix.categorie}</p>
                <p><strong>Niveau :</strong> ${choix.niveau}</p>
            `;
        })
        .catch(err => console.error("Erreur CSV activités:", err));
}



// -----------------------------------------------------------
// 🟣 DEVINETTE DU JOUR (placeholder — webapp à venir)
// -----------------------------------------------------------
function chargerDevinette() {
    const bloc = document.getElementById("devinette-du-jour");
    if (!bloc) return;

    // Tu intégreras la webapp ici
    bloc.innerHTML = `
        <h2>🧩 Devinette du jour</h2>
        <p class="devinette-placeholder">
            (Webapp en cours de développement)
        </p>
    `;
}



// -----------------------------------------------------------
// 🟢 INITIALISATION GLOBALE
