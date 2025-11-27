let activites = []; // stock JSON en mémoire

/* ============================================================
   ⚡ Charger les données JSON
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
   🎯 Afficher un défi avec animation
============================================================ */
function afficherDefi(index) {
    const item = activites[index];
    if (!item) return;

    const bloc = document.getElementById("defi-du-jour-bloc");

    // Animation sortante
    bloc.classList.add("bloc-animate");

    setTimeout(() => {

        // Mise à jour du contenu
        document.getElementById("defi-texte").textContent = item["Activité"];
        document.getElementById("couleur-preview").style.background = item["Code"];
        document.getElementById("couleur-nom").textContent = item["Couleur"];
        bloc.style.border = `4px solid ${item["Code"]}`;

        // Animation entrante
        bloc.classList.remove("bloc-animate");

    }, 250);
}

/* ============================================================
   📅 Défi du jour basé sur la date
============================================================ */
function defiDuJour() {
    const d = new Date();
    return (d.getMonth() * 31 + d.getDate()) % activites.length;
}

/* ============================================================
   🎲 Générer un défi aléatoire différent du précédent
============================================================ */
function defiAleatoire(indexActuel) {
    let idx;
    do {
        idx = Math.floor(Math.random() * activites.length);
    } while (idx === indexActuel);
    return idx;
}

/* ============================================================
   🚀 Initialisation
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    await chargerJson();

    let indexActuel = defiDuJour();
    afficherDefi(indexActuel);

    document.getElementById("nouveau-defi-btn").addEventListener("click", () => {
        indexActuel = defiAleatoire(indexActuel);
        afficherDefi(indexActuel);
    });
});
