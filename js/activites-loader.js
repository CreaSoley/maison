async function chargerDefi() {
    try {
        const response = await fetch("data/activites.csv");
        const data = await response.text();

        const lignes = data.split("\n").slice(1); // skip header
        const alea = lignes[Math.floor(Math.random() * lignes.length)];
        const [couleur, description, categorie, niveau] = alea.split(",");

        const bloc = document.getElementById("defi-du-jour-bloc");

        bloc.style.border = `4px solid ${couleur.trim()}`;

        document.getElementById("defi-du-jour").innerHTML = `
            <p><strong>${description.trim()}</strong></p>
            <p><strong>Catégorie :</strong> ${categorie.trim()}</p>
            <p><strong>Niveau :</strong> ${niveau.trim()}</p>
        `;
    } catch (err) {
        console.error("Erreur défi :", err);
        document.getElementById("defi-du-jour").textContent =
            "Impossible de charger le défi.";
    }
}

document.addEventListener("DOMContentLoaded", chargerDefi);
