document.addEventListener("DOMContentLoaded", () => {
    const couleurs = [
        { nom: "Bleu Céleste", code: "#7FBFFF" },
        { nom: "Rose Fuchsia", code: "#FF4FA1" },
        { nom: "Vert Menthe", code: "#3FE0A1" },
        { nom: "Soleil Chaud", code: "#FFCA3A" },
        { nom: "Lavande Douce", code: "#C19BFF" }
    ];

    const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];

    document.getElementById("couleur-du-jour").innerHTML = `
        <strong>${couleur.nom}</strong>
        <span>${couleur.code}</span>
        <div class="color-swatch" style="background:${couleur.code}"></div>
    `;
});
