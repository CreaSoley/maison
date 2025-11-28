async function chargerProverbe() {
    try {
        // Charger le CSV
        const res = await fetch("./data/proverbes.csv");
        if (!res.ok) throw new Error("Fichier introuvable");

        const texte = await res.text();

        // Séparer les lignes et supprimer les lignes vides, en ignorant l'entête
        const lignes = texte.split(/\r?\n/).slice(1).filter(l => l.trim() !== "");
        if (!lignes.length) throw new Error("CSV vide");

        // Calculer le jour de l'année (1-366)
        const d = new Date();
        const debutAnnee = new Date(d.getFullYear(), 0, 0);
        const diff = d - debutAnnee;
        const unJour = 1000 * 60 * 60 * 24;
        const jourAnnee = Math.floor(diff / unJour); // 1er janvier = 1

        // Chercher la ligne correspondante
        let trouvé = false;
        for (let ligne of lignes) {
            const parts = ligne.split(",").map(s => s.trim());
            const numero = parseInt(parts[0], 10);

            if (numero === jourAnnee) {
                const proverbe = parts[1] || "";
                const traduction = parts.slice(2).join(",") || "";
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
