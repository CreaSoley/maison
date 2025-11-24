async function chargerProverbe() {
    try {
        const response = await fetch("data/proverbes.csv");
        const data = await response.text();

        const lignes = data.split("\n").slice(1); // skip header

        const aujourdHui = new Date();
        const jour = String(aujourdHui.getDate()).padStart(2, "0");
        const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");
        const cle = `${jour}/${mois}`;

        let trouvé = false;

        lignes.forEach(ligne => {
            const [date, proverbe, traduction] = ligne.split(",");

            if (date && date.trim() === cle) {
                document.querySelector("#proverbe-du-jour .proverbe-text").innerHTML =
                    `<strong>« ${proverbe.trim()} »</strong><br>${traduction.trim()}`;
                trouvé = true;
            }
        });

        if (!trouvé) {
            document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
                "Aucun proverbe trouvé pour aujourd'hui.";
        }

    } catch (err) {
        console.error("Erreur chargement proverbes :", err);
        document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
            "Erreur de chargement.";
    }
}

document.addEventListener("DOMContentLoaded", chargerProverbe);
