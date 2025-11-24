/* ============================================================
   🎨 Noms de couleurs
============================================================ */
const nomCouleurs = {
    "#D7D3CF": "Sable doux",
    "#D8D0C2": "Aube ivoire",
    "#AEB1A0": "Saule argenté",
    "#C6D8FF": "Bleu lavande",
    "#F2C2D4": "Rose pastel",
    "#F9EAC3": "Crème soleil",
    "#C8E6C9": "Vert eucalyptus",
    "#B2DFDB": "Menthe givrée",
    "#FFE0B2": "Pêche douce",
    "#FFCDD2": "Pétale rosé",
    "#D1C4E9": "Lilas tendre",
    "#B39DDB": "Violet brume",
    "#BBDEFB": "Bleu ciel",
    "#C5CAE9": "Brume lunaire",
    "#DCEDC8": "Thé matcha",
    "#FFECB3": "Miel doré",
    "#FFE082": "Ambre clair",
    "#FFAB91": "Corail léger",
    "#B2EBF2": "Aqua pure",
    "#F8BBD0": "Pivoine douce"
};

/* ============================================================
   📌 Parseur CSV robuste (gère les guillemets et virgules)
============================================================ */
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            inQuotes = !inQuotes;
        }
        else if (ch === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        }
        else {
            current += ch;
        }
    }

    result.push(current.trim());
    return result;
}

/* ============================================================
   ⚡ Charger le défi du jour
============================================================ */
async function chargerDefi() {
    try {
        const res = await fetch("data/activites.csv");
        if (!res.ok) throw new Error("activites.csv introuvable");

        const texte = await res.text();

        // lignes propres
        const lignes = texte
            .split(/\r?\n/)
            .filter(l => l.trim() !== "")
            .slice(1);

        if (lignes.length === 0) return;

        // index basé sur la date
        const d = new Date();
        const index = (d.getMonth() * 31 + d.getDate()) % lignes.length;

        const parts = parseCSVLine(lignes[index]);

        const defi   = parts[0] || "Défi manquant";
        const cat    = parts[1] || "";
        const niveau = parts[2] || "";
        const couleur = (parts[3] || "").trim();

        /* 🌈 Texte du défi */
        document.getElementById("defi-texte").textContent = defi;

        /* 🌈 Bordure colorée */
        const bloc = document.getElementById("defi-du-jour-bloc");
        bloc.style.border = `4px solid ${couleur}`;

        /* 🌈 Carré de couleur */
        const prev = document.getElementById("couleur-preview");
        prev.style.background = couleur;

        /* 🌈 Nom de la couleur */
        document.getElementById("couleur-nom").textContent =
            nomCouleurs[couleur] || "Couleur du jour";

    } catch (err) {
        console.error("⛔ Erreur défi :", err);
        document.getElementById("defi-texte").textContent =
            "Erreur de chargement.";
    }
}

/* ============================================================
   🚀 Auto-lancement
============================================================ */
document.addEventListener("DOMContentLoaded", chargerDefi);
