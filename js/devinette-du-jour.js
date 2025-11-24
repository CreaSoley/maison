// --- CHARGEMENT DU CSV ---
async function chargerCSVDevinettes() {
    const url = "data/devinettes.csv";

    const response = await fetch(url);
    const text = await response.text();

    const lignes = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    const data = lignes.slice(1).map(l => {
        const [date, devinette, reponse] = l.split(",");
        return { date, devinette, reponse };
    });

    return data;
}

// --- OBTENIR LA DEVINETTE DU JOUR ---
function obtenirDateAujourdhui() {
    const d = new Date();
    const j = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${j}/${m}`;
}

// --- INITIALISATION ---
async function chargerDevinetteDuJour() {
    const data = await chargerCSVDevinettes();
    const today = obtenirDateAujourdhui();

    const trouvée = data.find(l => l.date === today);

    const bloc = document.getElementById("texte-devinette");

    if (!trouvée) {
        bloc.textContent = "Aucune devinette prévue pour aujourd'hui.";
        return;
    }

    // Affichage de la devinette
    bloc.textContent = trouvée.devinette;

    // Gestion du bouton de validation
    document.getElementById("btn-valider").onclick = function () {
        verifierReponse(trouvée.reponse);
    };
}

// --- VÉRIFICATION DE LA RÉPONSE ---
function verifierReponse(bonneReponse) {
    const input = document.getElementById("reponse-user");
    const message = document.getElementById("message-devinette");
    const animation = document.getElementById("zen-animation");

    const user = input.value.trim().toLowerCase();
    const correct = bonneReponse.trim().toLowerCase();

    // Champ vide
    if (user === "") {
        message.textContent = "Veuillez saisir une réponse.";
        message.style.color = "darkred";
        return;
    }

    // Bonne réponse
    if (user === correct) {
        message.textContent = "Super, bien joué ! 🌟 À demain pour une nouvelle devinette.";
        message.style.color = "green";

        // Animation zen
        animation.classList.remove("zen-hidden");
        animation.classList.add("zen-active");

        return;
    }

    // Mauvaise réponse
    message.textContent = "C'est une erreur… Essaie encore !";
    message.style.color = "darkred";
}

// --- LANCEMENT ---
document.addEventListener("DOMContentLoaded", chargerDevinetteDuJour);
