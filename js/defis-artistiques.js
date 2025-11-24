// --- Défi du jour aléatoire (fallback si pas de CSV dédié) ---

const defis = [
    "Créer une forme en 30 secondes.",
    "Dessiner en n'utilisant que des lignes droites.",
    "Créer quelque chose avec seulement 3 couleurs.",
    "Représenter une émotion abstraite."
];

function chargerDefi() {
    const el = document.getElementById("defi-du-jour");
    const index = Math.floor(Math.random() * defis.length);

    el.innerHTML = `
        <h2>🎯 Défi du jour</h2>
        <p>${defis[index]}</p>
    `;
}

document.addEventListener("DOMContentLoaded", chargerDefi);
