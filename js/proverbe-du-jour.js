async function chargerProverbe() {
    try {
        const res = await fetch("data/proverbes.csv");
        if (!res.ok) throw new Error("Fichier introuvable");
        
        const texte = await res.text();

        // On gère correctement les retours chariot Windows + Mac
        const lignes = texte.split(/\r?\n/).slice(1).filter(l => l.trim() !== "");

        // Date du jour : JJ/MM
        const d = new Date();
        const cle = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        let trouvé = false;

        for (let ligne of lignes) {
            const parts = ligne.split(",");

            // sécurité si une ligne a moins de 3 éléments
            if (parts.length < 3) continue;

            const date = parts[0].trim();
            const proverbe = parts[1].trim();
            const traduction = parts.slice(2).join(",").trim(); // pour gérer les virgules dans la traduction

            if (date === cle) {
                document.querySelector("#proverbe-du-jour .proverbe-text").innerHTML =
                    `<strong>« ${proverbe} »</strong><br>${traduction}`;
                trouvé = true;
                break;
            }
        }

        if (!trouvé) {
            document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
                "Aucun proverbe pour aujourd’hui.";
        }

    } catch (err) {
        console.error("⛔ Erreur chargement proverbes :", err);
        document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
            "Erreur de chargement.";
    }
}

document.addEventListener("DOMContentLoaded", chargerProverbe);
