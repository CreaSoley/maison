document.addEventListener("DOMContentLoaded", function() {

    const nomsCouleurs = {
        "#D7D3CF": "Gris Perle",
        "#D8D0C2": "Sable Doux",
        "#AEB1A0": "Vert Sauge",
        "#C7D3E8": "Bleu Lavande",
        "#F5E6D3": "Lin Doux",
        "#E8D5C4": "Beige Rosé",
        "#C6D1C3": "Feuille Pâle",
        "#E2E8F0": "Brume Matinale",
        "#B8C1D1": "Bleu Brume",
        "#D4C5D9": "Mauve Thé",

        "#E3DAC9": "Sable Lunaire",
        "#B4C7C9": "Écume de Mer",
        "#C0D6C4": "Menthe Thé",
        "#D9E3DA": "Brume d’Herbes",
        "#E7D9E8": "Rose Brume",
        "#C9D4E2": "Aube Bleutée",
        "#F2E9DD": "Neige Dorée",
        "#D8E2CB": "Thym Doux",
        "#BFCAD2": "Pluie Grise",
        "#C7D9D5": "Amande d’Eau",
        "#D9C8BA": "Argile Claire",
        "#F3EFE2": "Nuage Vanille",
        "#ECE2D0": "Pêche Poudrée",
        "#C7B8A6": "Bois Blanchi",
        "#B2BCA9": "Olive Matin",
        "#DDE3E9": "Voile d’Hiver",
        "#E0D4E4": "Lilas Calme",
        "#C5D8E4": "Bleu Thé",
        "#EDE3CE": "Lumière de Chanvre",
        "#D1E0D0": "Sauge d’Argent"
    };

    const bloc = document.getElementById("defi-du-jour-bloc");
    const zone = document.getElementById("defi-du-jour");

    fetch("data/activites.csv")
        .then(r => r.text())
        .then(text => {
            const rows = text.split("\n").map(r => r.split(","));

            // date du jour en jj/mm
            const today = new Date();
            const d = String(today.getDate()).padStart(2, '0');
            const m = String(today.getMonth()+1).padStart(2, '0');
            const key = `${d}/${m}`;

            // ligne correspondant au jour
            const index = today.getDate(); // 1 = 1er janvier
            const row = rows[index];

            if (!row) {
                zone.innerHTML = "<p>Aucune activité trouvée.</p>";
                return;
            }

            const activite = row[0];
            const categorie = row[1];
            const niveau = row[2];
            const couleur = row[3].trim();
            const nomCouleur = nomsCouleurs[couleur] || "Couleur inconnue";

            // appliquer couleur bordure
            bloc.style.borderColor = couleur;

            // afficher contenu
            zone.innerHTML = `
                <p><strong>Activité :</strong> ${activite}</p>
                <p><strong>Catégorie :</strong> ${categorie}</p>
                <p><strong>Niveau :</strong> ${niveau}</p>
                <p><strong>Couleur :</strong> ${nomCouleur} <span style="color:${couleur}; font-weight:bold;">(${couleur})</span></p>
            `;
        })
        .catch(err => {
            console.error("Erreur CSV :", err);
            zone.innerHTML = "<p>Impossible de charger l'activité du jour.</p>";
        });

});
