// =============================
// Défi créatif depuis activites.csv
// =============================

function genererDefi() {
    fetch("data/activites.csv")
        .then(r => r.text())
        .then(csv => {
            const lignes = csv.trim().split("\n");
            const lignesData = lignes.slice(1); // on enlève l'en-tête

            if (lignesData.length === 0) return;

            const alea = lignesData[Math.floor(Math.random() * lignesData.length)];

            // simple split (ton CSV n'a pas de champs entre guillemets multiples)
            const [texte, categorie, niveau, couleur] = alea.split(",");

            const cont = document.getElementById("resultat-defi");
            if (!cont) return;

            cont.innerHTML = `
                <p style="font-size:1.1rem;">${texte}</p>
                <p style="color:#666"><strong>${categorie}</strong> • ${niveau}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            const cont = document.getElementById("resultat-defi");
            if (cont) cont.innerHTML = "<p>Erreur lors du chargement des défis.</p>";
        });
}
