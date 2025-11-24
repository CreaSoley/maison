const colorNames = {
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

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/activites.csv")
        .then(res => res.text())
        .then(text => {
            const lignes = text.split("\n").slice(1);
            const today = new Date();
            const index = (today.getMonth() * 31 + today.getDate()) % lignes.length;

            const [defi, categorie, niveau, couleur] = lignes[index].split(",");

            document.getElementById("defi-texte").textContent = defi;

            const colorBox = document.getElementById("couleur-preview");
            colorBox.style.background = couleur.trim();

            const nom = colorNames[couleur.trim()] || "Couleur du jour";
            document.getElementById("couleur-nom").textContent = nom;

            document.getElementById("defi-du-jour-bloc").style.border =
                "4px solid " + couleur.trim();
        });
});
