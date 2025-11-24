// Fichier : js/devinette-du-jour.js

document.addEventListener("DOMContentLoaded", chargerDevinette);

function chargerDevinette() {
    fetch("data/devinettes.csv")
        .then(response => response.text())
        .then(csv => {
            const lignes = csv.split("\n").map(l => l.trim());

            // Retirer la ligne d'en-tête
            lignes.shift();

            const today = new Date();
            const jour = String(today.getDate()).padStart(2, '0');
            const mois = String(today.getMonth() + 1).padStart(2, '0');
            const dateDuJour = `${jour}/${mois}`;

            let devinetteTrouvee = null;
            let reponseCorrecte = null;

            lignes.forEach(ligne => {
                const [date, devinette, reponse] = ligne.split(",");

                if (date === dateDuJour) {
                    devinetteTrouvee = devinette;
                    reponseCorrecte = reponse;
                }
            });

            const zoneDevinette = document.getElementById("texte-devinette");

            if (devinetteTrouvee) {
                zoneDevinette.textContent = devinetteTrouvee;

                // Activer la vérification
                const btn = document.getElementById("btn-valider");
                const input = document.getElementById("reponse-utilisateur");
                const message = document.getElementById("message-devinette");

                btn.addEventListener("click", () => {
                    const saisie = input.value.trim();

                    if (!saisie) {
                        message.textContent = "Veuillez saisir une réponse.";
                        message.style.color = "darkred";
                        return;
                    }

                    if (saisie.toLowerCase() === reponseCorrecte.toLowerCase()) {
                        message.textContent = "Super, bien joué ! À demain pour une autre devinette 🎉";
                        message.style.color = "green";
                    } else {
                        message.textContent = "C’est une erreur !";
                        message.style.color = "darkred";
                    }
                });

            } else {
                zoneDevinette.textContent = "Aucune devinette prévue pour aujourd’hui.";
            }
        })
        .catch(err => {
            document.getElementById("texte-devinette").textContent =
                "Impossible de charger la devinette.";
            console.error("Erreur devinette :", err);
        });
}
