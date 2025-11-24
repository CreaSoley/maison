async function chargerProverbe() {
    try {
        const res = await fetch("data/proverbes.csv");
        const texte = await res.text();

        const lignes = texte.split("\n").slice(1);

        const d = new Date();
        const cle = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        let trouve = false;

        for (let ligne of lignes) {
            if (!ligne.trim()) continue;

            const parts = ligne.split(",");
            if (parts.length < 3) continue;

            const [date, proverbe, traduction] = parts;

            if (date.trim() === cle) {
                document.querySelector("#proverbe-du-jour .proverbe-text").innerHTML =
                    `<strong>« ${proverbe.trim()} »</strong><br>${traduction.trim()}`;
                trouve = true;
                break;
            }
        }

        if (!trouve) {
            document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
                "Aucun proverbe pour aujourd’hui.";
        }

    } catch (err) {
        console.error("⛔ Erreur chargement proverbes :", err);
        document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
            "Erreur de chargement.";
    }
}
