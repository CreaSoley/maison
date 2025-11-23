function genererDefi() {
    fetch('../data/defis-artistiques.json')
        .then(response => response.json())
        .then(defis => {
            const defi = defis[Math.floor(Math.random() * defis.length)];
            const container = document.getElementById('resultat-defi');
            
            if (container) {
                container.innerHTML = `
                    <h3>${defi.titre}</h3>
                    <p>${defi.defi}</p>
                    <p style="font-style: italic; color: #777;">Temps suggéré : ${defi.duree}</p>
                `;
            }
        })
        .catch(error => {
            console.error('Erreur de chargement des défis:', error);
            const container = document.getElementById('resultat-defi');
            if (container) container.innerText = "Défis non disponibles.";
        });
}

// Optionnel: Générer un défi au chargement de la page
document.addEventListener('DOMContentLoaded', genererDefi);
