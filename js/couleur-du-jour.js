// --- Activité/Couleur du jour (Activité,Catégorie,Niveau,Couleur) ---

function parseCSVLineActivites(line) {
    const parts = [];
    let current = "";
    let inQuotes = false;

    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = "";
        } else current += char;
    }
    parts.push(current.trim());

    if (parts.length < 4) return null;

    return {
        activite: parts[0].replace(/"/g, "").trim(),
        categorie: parts[1].replace(/"/g, "").trim(),
        niveau: parts[2].replace(/"/g, "").trim(),
        couleur: parts[3].replace(/"/g, "").trim()
    };
}

function chargerActiviteDuJour() {
    fetch("data/activites.csv")
        .then(r => r.text())
        .then(csv => {
            const lignes = csv.trim().split("\n");

            const liste = lignes
                .map(parseCSVLineActivites)
                .filter(v => v !== null)
                .slice(1);

            const today = new Date().getDate();
            let index = today - 1;

            if (index >= liste.length) {
                index = Math.floor(Math.random() * liste.length);
            }

            const choix = liste[index];
            const el = document.getElementById("couleur-du-jour");

            el.innerHTML = `
                <h2>🎨 Couleur & activité du jour</h2>

                <div class="color-box" style="background:${choix.couleur};"></div>

                <p class="color-code">${choix.couleur}</p>

                <p class="activite-texte">« ${choix.activite} »</p>

                <p class="activite-meta">
                    <strong>Catégorie :</strong> ${choix.categorie}<br>
                    <strong>Niveau :</strong> ${choix.niveau}
                </p>
            `;
        })
        .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", chargerActiviteDuJour);
