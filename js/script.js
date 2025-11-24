/* Couleur du jour (statique pour l'instant) */
document.addEventListener("DOMContentLoaded", () => {
    const couleurDiv = document.querySelector(".color-preview");
    const code = document.getElementById("couleur-code").textContent;

    couleurDiv.style.setProperty("--couleur", code);
});

/* Défi du jour (exemple simple en attendant ton API) */
document.addEventListener("DOMContentLoaded", () => {
    const defi = [
        "Créer une texture avec un seul outil.",
        "Dessiner 5 variations d’un même motif.",
        "Faire un croquis sans lever la main.",
        "Revisiter une œuvre que tu aimes."
    ];

    const target = document.getElementById("defi-text");

    if (defi.length === 0) {
        target.textContent = "Aucun défi disponible aujourd’hui.";
    } else {
        const random = defi[Math.floor(Math.random() * defi.length)];
        target.textContent = random;
    }
});
