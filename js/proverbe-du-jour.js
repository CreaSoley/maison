// --- Proverbe du jour avec traduction (CSV: Date,Proverbe,Traduction) ---

function parseCSVLine(ligne) {
    const parts = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < ligne.length; i++) {
        const char = ligne[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    parts.push(current.trim());

    // Format: [Date, Proverbe, Traduction]
    if (parts.length >= 3) {
        let dateBrute = parts[0].trim();
        let texte = parts[1].trim().replace(/"/g, "");
        let traduction = parts[2].trim().replace(/"/g, "");

        // format jj/mm
        const d = dateBrute.split('/');
        let date_jj_mm = dateBrute;
        if (d.length >= 2) {
            date_jj_mm = `${d[0].padStart(2, '0')}/${d[1].padStart(2, '0')}`;
        }

        return { date: date_jj_mm, texte, traduction };
    }
    return null;
}

function chargerDicton() {
    fetch('data/proverbes.csv')
        .then(r => r.text())
        .then(csv => {
            const lignes = csv.trim().split('\n');

            const liste = lignes
                .map(parseCSVLine)
                .filter(v => v !== null)
                .slice(1); // en-tête

            // date du jour
            const now = new Date();
            const jj = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dateToday = `${jj}/${mm}`;

            let choix = liste.find(p => p.date === dateToday);
            if (!choix) choix = liste[Math.floor(Math.random() * liste.length)];

            const el = document.getElementById("proverbe-du-jour");
            if (!el) return;

            el.innerHTML = `
                <h2>💬 Proverbe du jour</h2>
                <p class="proverbe-text">« ${choix.texte} »</p>
                <p class="proverbe-traduction">${choix.traduction}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            const el = document.getElementById("proverbe-du-jour");
            if (el) el.innerHTML = "<p>Erreur de chargement.</p>";
        });
}

document.addEventListener("DOMContentLoaded", chargerDicton);
