async function chargerDevinette() {
    const zone = document.querySelector("#devinette-du-jour");
    
    try {
        const response = await fetch("data/devinettes.csv");
        if (!response.ok) throw new Error("Impossible de charger le fichier CSV");

        const data = await response.text();

        // Nettoyage CSV
        const lignes = data
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .slice(1); // skip header

        // Date jj/mm
        const today = new Date();
        const jour = String(today.getDate()).padStart(2, "0");
        const mois = String(today.getMonth() + 1).padStart(2, "0");
        const cle = `${jour}/${mois}`;

        let trouve = false;

        for (const ligne of lignes) {

            // Découpage sécurisé (gère les virgules dans les devinettes)
            const parts = ligne.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            if (!parts || parts.length < 3) continue;

            const date = parts[0].replace(/"/g, "").trim();
            const question = parts[1].replace(/"/g, "").trim();
            const reponse = parts[2].replace(/"/g, "").trim();

            if (date === cle) {
                afficherDevinette(question, reponse);
                trouve = true;
                break;
            }
        }

        if (!trouve) {
            zone.innerHTML = `<p>Aucune devinette prévue pour aujourd’hui.</p>`;
        }

    } catch (err) {
        console.error("Erreur chargement devinette :", err);
        zone.innerHTML = `<p>Erreur de chargement.</p>`;
    }
}

function afficherDevinette(question, bonneReponse) {
    const zone = document.querySelector("#devinette-du-jour");

    zone.innerHTML = `
        <p class="question"><strong>${question}</strong></p>
        
        <input id="reponse-user" type="text" placeholder="Votre réponse..." />
        
        <button id="btn-valider">Valider</button>

        <p id="message-reponse" class="msg"></p>
    `;

    document.getElementById("btn-valider").addEventListener("click", () => {
        const saisie = document.getElementById("reponse-user").value.trim();

        if (saisie === "") {
            afficherMessage("Veuillez saisir une réponse.", "erreur");
            return;
        }

        if (saisie.toLowerCase() === bonneReponse.toLowerCase()) {
            afficherMessage("🎉 Bravo ! À demain pour une nouvelle devinette !", "ok");

            // Lancer l’animation zen si demandée (C)
            if (typeof declencherZen === "function") declencherZen();

        } else {
            afficherMessage("❌ Ce n'est pas la bonne réponse…", "erreur");
        }
    });
}

function afficherMessage(msg, type) {
    const zone = document.getElementById("message-reponse");
    zone.textContent = msg;

    zone.className = "msg " + (type === "ok" ? "msg-ok" : "msg-erreur");
}

document.addEventListener("DOMContentLoaded", chargerDevinette);
