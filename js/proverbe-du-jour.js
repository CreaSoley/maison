// --- 4. Proverbe du jour (Adapté pour ignorer l'année) ---

function parseCSVLine(ligne) {
    // Adapter le parsing pour votre format (date, proverbe, origine)
    // Le code de parsing reste le même pour extraire les colonnes
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

    if (parts.length >= 3) {
        // Extraction et formatage des données
        let dateWithYear = parts[0].trim(); // ex: 01/01/2024
        const auteur = parts[parts.length - 1].trim().replace(/"/g, '');
        const texte = parts.slice(1, parts.length - 1).join(',').replace(/"/g, '').trim();

        // Si la date est au format jj/mm/aaaa, on extrait seulement jj/mm
        const dateParts = dateWithYear.split('/');
        let date_jj_mm = dateWithYear;

        if (dateParts.length >= 2) {
            // Prend jj et mm
            date_jj_mm = `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}`;
        }
        
        return { date: date_jj_mm, texte, auteur };
    }
    return null;
}

function chargerDicton() {
    // Le chemin est relatif à index.html
    fetch('data/proverbes.csv')
      .then(r => r.text())
      .then(csv => {
        const lignes = csv.trim().split('\n');
        
        const tousLesProverbes = lignes
            .map(parseCSVLine)
            .filter(item => item !== null)
            .slice(1); // On retire l'en-tête CSV
        
        // Récupérer la date du jour au format jj/mm UNIQUEMENT
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const dateDuJour_jj_mm = `${day}/${month}`; // ex: 01/01

        // Cherche le proverbe dont le jj/mm correspond
        let choix = tousLesProverbes.find(p => p.date === dateDuJour_jj_mm);

        if (!choix && tousLesProverbes.length > 0) {
          // Si pas de date du jour trouvée, choisir un aléatoire
          choix = tousLesProverbes[Math.floor(Math.random() * tousLesProverbes.length)];
        }

        const element = document.getElementById("proverbe-du-jour");
        if (choix && element) {
            element.innerHTML = `
              <h2>💬 Proverbe du jour</h2>
              <p class="proverbe-text">« ${choix.texte} »</p>
              <p class="proverbe-origin">— ${choix.auteur}</p>
            `;
        } else if (element) {
            element.innerHTML = `<h2>💬 Proverbe du jour</h2><p>Aucun proverbe trouvé.</p>`;
        }
      })
      .catch(error => {
        console.error("Erreur de chargement des proverbes:", error);
        const el = document.getElementById("proverbe-du-jour");
        if(el) el.innerHTML = `<h2>💬 Proverbe du jour</h2><p>Erreur de chargement.</p>`;
      });
}

document.addEventListener('DOMContentLoaded', chargerDicton);
