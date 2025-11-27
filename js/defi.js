let activites = []; // cache du JSON

/* ============================================================
   ⚡ Charger JSON au lancement
============================================================ */
async function chargerJson() {
    try {
        const res = await fetch("data/activites.json");
        activites = await res.json();
    } catch (err) {
        console.error("Erreur JSON :", err);
    }
}

/* ============================================================
   🎯 Afficher un défi
   (index choisi par date OU aléatoire)
============================================================ */
function afficherDefi(index) {
    const item = activites[index];
    if (!item) return;

    const bloc = document.getElementById("defi-du-jour-bloc");

    // Animation : fade + zoom OUT
    bloc.classList.add("bloc-animate");

    // Attendre la fin du fade-out
    setTimeout(() => {
        /* 🌈 Mise à jour du contenu */
        document.getElementById("defi-texte").textContent = item["Activité"];
        document.getElementById("couleur-preview").style.background = item["Code"];
        document.getElementById("couleur-nom").textContent = item["Couleur"];
        bloc.style.border = `4px solid ${item["Code"]}`;

        // Fade + zoom IN
        bloc.classList.remove("bloc-animate");
    }, 300);
}

/* ============================================================
   📅 Défi du jour (index basé sur la date)
============================================================ */
function defiDuJour() {
    const d = new Date();
    return (d.getMonth() * 31 + d.getDate()) % activites.length;
}

/* ============================================================
   🎲 Tirage aléatoire pour le bouton
============================================================ */
function defiAleatoire() {
    return Math.floor(Math.random() * activites.length);
}

/* ============================================================
   🚀 Initialisation
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    await chargerJson();

    // Charger défi du jour
    afficherDefi(defiDuJour());

    // Activer le bouton
    document.getElementById("nouveau-defi-btn").addEventListener("click", () => {
        afficherDefi(defiAleatoire());
    });
});
