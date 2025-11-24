// js/proverbe-du-jour.js
async function chargerProverbe() {
    const cible = document.getElementById("proverbe-text");
    if (!cible) return console.warn("Element #proverbe-text introuvable dans le DOM.");

    try {
        const resp = await fetch("data/proverbes.csv");
        if (!resp.ok) throw new Error("Impossible de charger data/proverbes.csv");

        const text = await resp.text();

        // split lignes (gère CRLF et LF)
        const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

        if (rawLines.length === 0) {
            cible.textContent = "Fichier de proverbes vide.";
            return;
        }

        // Détecter si première ligne est un header (ex. commence par "Date" ou "Proverbe")
        let startIndex = 0;
        const firstToken = rawLines[0].split(",")[0].toLowerCase();
        if (/date|proverbe|traduction/.test(firstToken)) startIndex = 1;

        // Construire tableau d'entrées en parsant CSV (handles quoted fields)
        const entries = [];
        const csvLineRegex = /("([^"]*(?:""[^"]*)*)"|[^,]+)(?=,|$)/g;

        for (let i = startIndex; i < rawLines.length; i++) {
            const line = rawLines[i];
            const matches = line.match(csvLineRegex);
            if (!matches || matches.length < 2) continue;

            // Nettoyage : retirer guillemets extérieurs et "" -> "
            const clean = parts => parts.map(p => p.replace(/^"(.*)"$/,'$1').replace(/""/g, '"').trim());

            const parts = clean(matches);
            // On attend au moins [date, proverbe]; traduction optionnelle
            const date = parts[0] || "";
            const proverbe = parts[1] || "";
            const traduction = parts[2] || "";
            entries.push({ date, proverbe, traduction });
        }

        // Date du jour jj/mm
        const now = new Date();
        const jj = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const todayKey = `${jj}/${mm}`;

        // Chercher exact match
        let found = entries.find(e => e.date === todayKey);

        // fallback : si pas trouvé, choisir aléatoire
        if (!found && entries.length > 0) {
            found = entries[Math.floor(Math.random() * entries.length)];
        }

        if (found) {
            const proverbeEscaped = found.proverbe;
            const traductionEscaped = found.traduction;
            cible.innerHTML = `<strong>« ${proverbeEscaped} »</strong>` 
                               + (traductionEscaped ? `<br><em>${traductionEscaped}</em>` : "");
        } else {
            cible.textContent = "Aucun proverbe disponible.";
        }
    } catch (err) {
        console.error("Erreur chargerProverbe:", err);
        cible.textContent = "Erreur de chargement du proverbe.";
    }
}

document.addEventListener("DOMContentLoaded", chargerProverbe);
