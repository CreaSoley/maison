// --- Proverbe du jour (Date,Proverbe,Traduction) ---

function parseCSVLineProverbes(ligne) {
    const parts = [];
    let current = "";
    let inQuotes = false;

    for (let char of ligne) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = "";
        } else current += char;
    }
    parts.push(current.trim());

    if (parts.length < 3) return null;

    let dateBrute = parts[0].trim();
    let texte = parts[1].replace(/"/g, "").trim();
    let traduction = parts[2].replace(/"/g, "").trim();

    const d = dateBrute.split("/");
    let date_jj_mm = `${d[0].padStart(2, "0")}/${d[1].padStart(2, "0")}`;

    return { date: date_jj_mm, texte, traduction };
}

function chargerProverbe() {
    fetch("data/proverbes.csv")
        .then(r => r.text())
        .then(csv => {
            const lignes = csv.trim().split("\n");

            const liste = lignes
                .map(parseCSVLineProverbes)
                .filter(v => v !== null)
                .slice(1);

            const now = new Date();
            const dateToday = String(now.getDate()).padStart(2, '0') + "/" +
                              String(now.getMonth() + 1).padStart(2, '0');

            let choix = liste.find(p => p.date === dateToday);
            if (!choix) choix = liste[Math.floor(Math.random() * liste.length)];

            const el = document.getElementById("proverbe-du-jour");
            el.innerHTML = `
                <h2>💬 Proverbe du jour</h2>
                <p class="proverbe-text">« ${choix.texte} »</p>
                <p class="proverbe-traduction">${choix.traduction}</p>
            `;
        })
        .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", chargerProverbe);
