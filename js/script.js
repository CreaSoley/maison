document.addEventListener("DOMContentLoaded", () => {

    // Charger webapp mensuelle
    const zone = document.getElementById("webapp-mensuelle");
    const month = new Date().getMonth() + 1;

    zone.innerHTML = `<p>Chargement de l'atelier du mois… (${month})</p>`;

    // Exemple (tu peux remplacer par tes vraies webapps)
    if (month === 1) zone.innerHTML = "<p>❄ Atelier de Janvier : Inspiration froide</p>";
    if (month === 2) zone.innerHTML = "<p>💘 Atelier de Février : Création intuitive</p>";
});
