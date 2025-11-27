/* ============================================================
   ⚡ Charger le défi du jour depuis JSON
============================================================ */
async function chargerDefi() {
    try {
        const res = await fetch("data/activites.json");
        if (!res.ok) throw new Error("activites.json introuvable");

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;

        // index basé sur la date
        const d = new Date();
        const index = (d.getMonth() * 31 + d.getDate()) % data.length;

        const item = data[index];

        const defi    = item["Activité"]  || "Défi manquant";
        const cat     = item["Catégorie"] || "";
        const niveau  = item["Niveau"]    || "";
        const couleur = item["Code"]      || "#000000";
        const nom     = item["Couleur"]   || "Couleur du jour";

        /* 🌈 Texte du défi */
        document.getElementById("defi-texte").textContent = defi;

        /* 🌈 Bordure colorée */
        const bloc = document.getElementById("defi-du-jour-bloc");
        bloc.style.border = `4px solid ${couleur}`;

        /* 🌈 Carré couleur */
        const prev = document.getElementById("couleur-preview");
        prev.style.background = couleur;

        /* 🌈 Nom de la couleur */
        document.getElementById("couleur-nom").textContent = nom;

    } catch (err) {
        console.error("⛔ Erreur défi JSON :", err);
        document.getElementById("defi-texte").textContent =
            "Erreur de chargement.";
    }
}

/* ============================================================
   🚀 Auto-lancement
============================================================ */
document.addEventListener("DOMContentLoaded", chargerDefi);
