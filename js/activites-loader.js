fetch("data/activites.csv")
    .then(response => response.text())
    .then(csv => {

        const rows = csv.trim().split("\n").map(l => l.split(","));

        // Première ligne = en-têtes : Activité,Catégorie,Niveau,Couleur
        const headers = rows[0];
        const data = rows.slice(1);

        // Choix aléatoire du défi
        const randomIndex = Math.floor(Math.random() * data.length);
        const [activite, categorie, niveau, couleur] = data[randomIndex];

        // Affichage
        const bloc = document.getElementById("defi-du-jour");
        bloc.innerHTML = `
            <p><strong>${activite}</strong></p>
            <p>Catégorie : ${categorie}</p>
            <p>Niveau : ${niveau}</p>
            <div style="
                width: 35px; 
                height: 35px; 
                margin-top: 10px;
                border-radius: 8px;
                background: ${couleur};
                border: 1px solid #fff4;
            "></div>
        `;
    })
    .catch(err => console.error("Erreur chargement CSV défis :", err));
