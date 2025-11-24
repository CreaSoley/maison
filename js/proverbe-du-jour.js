// js/proverbe-du-jour.js
// Charge data/proverbes.csv (format: Date,Proverbe,Traduction)
// Injecte uniquement le texte + la traduction dans #proverbe-du-jour
(function(){
  // parser CSV robuste (gère guillemets)
  function parseCSVLine(line) {
    const parts = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { parts.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    parts.push(cur.trim());
    return parts;
  }

  async function chargerProverbe() {
    try {
      const res = await fetch('data/proverbes.csv');
      if (!res.ok) throw new Error('proverbes.csv non trouvé');
      const txt = await res.text();
      const lines = txt.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) return;

      const rows = lines.slice(1).map(parseCSVLine).filter(r => r.length >= 3)
        .map(cols => {
          // cols[0]=Date (jj/mm ou jj/mm/aaaa), cols[1]=Proverbe, cols[2]=Traduction
          const dateRaw = cols[0].trim();
          const d = dateRaw.split('/');
          let date_jj_mm = dateRaw;
          if (d.length >= 2) date_jj_mm = `${String(d[0]).padStart(2,'0')}/${String(d[1]).padStart(2,'0')}`;
          return { date: date_jj_mm, texte: cols[1].replace(/"/g,'').trim(), traduction: cols[2].replace(/"/g,'').trim() };
        });

      const now = new Date();
      const today = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;

      let choix = rows.find(r => r.date === today);
      if (!choix) choix = rows[Math.floor(Math.random()*rows.length)];

      const container = document.getElementById('proverbe-du-jour');
      if (!container) return;

      // Injecte uniquement le contenu (on suppose que le titre "Proverbe du jour" est déjà dans HTML)
      container.innerHTML = `
        <p class="proverbe-text">« ${choix.texte} »</p>
        ${choix.traduction ? `<p class="proverbe-traduction">${choix.traduction}</p>` : ''}
      `;
    } catch (err) {
      console.error('Erreur chargement proverbes:', err);
      const container = document.getElementById('proverbe-du-jour');
      if (container) container.innerHTML = `<p>Erreur de chargement du proverbe.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', chargerProverbe);
})();
