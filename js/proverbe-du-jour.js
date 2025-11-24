/************************************************************
 * 📜 PROVERBE DU JOUR — Version robuste + compatible CSV
 ************************************************************/

// Fonction robuste pour parser une ligne CSV avec guillemets
function parseCSVLine(line) {
    const parts = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            inQuotes = !inQuotes; // bascule dans / hors guillemets
            continue;
        }

        if (ch === "," && !inQuotes) {
            parts.push(cur.trim());
            cur = "";
        } else {
            cur += ch;
        }
    }

    parts.push(cur.trim());
    return parts;
}

async function chargerProverbe() {
    try {
        const res = await fetch("data/proverbes.csv");
        if (!res.ok) throw new Error("Fichier introuvable");
        
        const texte = await res.text();
        const lignes = texte.trim().split(/\r?\n/).slice(1); // sauter header

        const now = new Date();
        const cle = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;

        let trouve = false;

        for (let ligne of lignes) {
            if (!ligne.trim()) continue;

            const parts = parseCSVLine(ligne);

            if (parts.length < 3) continue;

            const date = parts[0];
            const proverbe = parts[1];
            const traduction = parts[2];

            if (date.trim() === cle) {
                document.querySelector("#proverbe-du-jour .proverbe-text").innerHTML = `
                    <strong>« ${proverbe.trim()} »</strong><br>
                    ${traduction.trim()}
                `;
                trouve = true;
                break;
            }
        }

        if (!trouve) {
            document.querySelector("#proverbe-du-jour .proverbe-text").textContent =
                "Aucun
