// js/activites-loader.js
// Helper : parsing CSV robust (gère guillemets) et renvoie tableau d'objets { activite, categorie, niveau, couleur }
export async function loadActivitesCSV(path = 'data/activites.csv') {
  // parse line robust
  function parseLine(line) {
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

  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} non trouvé`);
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  const rows = lines.slice(1).map(parseLine).map(cols => {
    // Expect: Activité,Catégorie,Niveau,Couleur
    return {
      activite: (cols[0] || '').replace(/"/g,'').trim(),
      categorie: (cols[1] || '').replace(/"/g,'').trim(),
      niveau: (cols[2] || '').replace(/"/g,'').trim(),
      couleur: (cols[3] || '').replace(/"/g,'').trim()
    };
  });

  return rows;
}
