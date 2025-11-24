async function chargerProverbe() {
    const zoneAffichage = document.querySelector("#proverbe-du-jour .proverbe-text");

    try {
        const response = await fetch("data/proverbes.csv");
        if (!response.ok) throw new Error("Impossible de charger le fichier CSV");

        const data = await response.text();

        // Nettoyage du CSV + split ligne par ligne
        const lignes = data
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .slice(1); // skip header

        // Date du jour jj/mm
        const aujourdHui = new Date();
        const jour = String(aujourdHui.getDate()).padStart(2, "0");
        const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");
        const cle = `${jour}/${mois}`;

        let trouve = false;

        for (const ligne of lignes) {
            // Découpage sécurisé (gère les virgules dans le texte)
            const parts = ligne.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

            if (!parts || parts.length < 3) continue;

            const date = parts[0].replace(/"/g, "").trim();
            const proverbe = parts[1].replace(/"/g, "").trim();
            const traduction = parts[2].replace(/"/g, "").trim();

            if (date === cle) {
                zoneAffichage.innerHTML = `
                    <strong>« ${proverbe} »</strong><br>
                    <em>${traduction}</em>
                `;
                trouve = true;
                break;
            }
        }

        if (!trouve) {
            zoneAffichage.textContent =
                "Aucun proverbe prévu pour aujourd'hui.";
        }

    } catch (err) {
        console.error("Erreur chargement proverbes :", err);
        zoneAffichage.textContent = "Erreur de chargement.";
    }
}

document.addEventListener("DOMContentLoaded", chargerProverbe);
