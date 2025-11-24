/* ============================================================
   🎨 Noms poétiques des couleurs
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
   📌 Parseur CSV robuste (gère guillemets + virgules)
============================================================ */
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            inQuotes = !inQuotes; 
        } else if (ch === "," && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ""));
            current = "";
        } else {
            current += ch;
        }
    }

    result.push(current.trim().replace(/^"|"$/g, ""));
    return result;
}

/* ============================================================
   🎨 Défi du jour
============================================================ */

async function chargerDefi() {
    try {
        const res = await fetch("data/activites.csv");
        if (!res.ok) throw new Error("Impossible de charger activites.csv");

        const texte = await res.text();

        // Nettoyage + découpe
        const lignes = texte
            .split(/\r?\n/)
            .slice(1)
            .filter(l => l.trim() !== "");

        if (lignes.length === 0) return;

        // Calcul du jour
        const d = new Date();
        const index = (d.getMonth() * 31 + d.getDate()) % lignes.length;

        const parts = parseCSVLine(lignes[index]);
        const [defi, categorie, niveau, couleur] = parts;

        // injection texte
        document.getElementById("defi-texte").textContent = defi || "Défi non disponible";

        // couleur
        const color = (couleur || "").trim();
        const bloc = document.getElementById("defi-du-jour-bloc");

        if (color) {
            bloc.style.border = "4px solid " + color;
            document.getElementById("couleur-preview").style.background = color;
            document.getElementById("couleur-nom").textContent =
                nomCouleurs[color] || `Couleur ${color}`;
        } else {
            document.getElementById("couleur-nom").textContent = "—";
        }

    } catch (err) {
        console.error("⛔ Erreur défi :", err);
        document.getElementById("defi-texte").textContent =
            "Erreur lors du chargement du défi.";
    }
}

/* ============================================================
   🚀 Lancement auto
============================================================ */
document.addEventListener("DOMContentLoaded", chargerDefi);
