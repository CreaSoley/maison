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

async function chargerDefi() {
    try {
        const res = await fetch("data/activites.csv");
        const texte = await res.text();

        const lignes = texte.split("\n").slice(1);
        const d = new Date();
        const index = (d.getMonth() * 31 + d.getDate()) % lignes.length;

        const parts = lignes[index].split(",");
        const [defi, cat, niv, couleur] = parts;

        document.getElementById("defi-texte").textContent = defi;

        // carré de couleur
        const bloc = document.getElementById("defi-du-jour-bloc");
        bloc.style.border = "4px solid " + couleur.trim();

        const prev = document.getElementById("couleur-preview");
        prev.style.background = couleur.trim();

        document.getElementById("couleur-nom").textContent =
            nomCouleurs[couleur.trim()] || "Couleur du jour";

    } catch (err) {
        console.error("⛔ Erreur défi :", err);
    }
}
