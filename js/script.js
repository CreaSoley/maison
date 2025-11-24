// js/script.js
// Initialise la page : charge activités (data/activites.csv) et embarque la webapp devinette dans #resultat-defi

(function(){
  // parser CSV (robuste)
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

  async function loadActivites(path = 'data/activites.csv') {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('activites.csv non trouvé');
      const text = await res.text();
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) return [];

      const rows = lines.slice(1).map(parseCSVLine).map(cols => ({
        activite: (cols[0]||'').replace(/"/g,'').trim(),
        categorie: (cols[1]||'').replace(/"/g,'').trim(),
        niveau: (cols[2]||'').replace(/"/g,'').trim(),
        couleur: (cols[3]||'').replace(/"/g,'').trim()
      }));
      return rows;
    } catch (err) {
      console.error('Erreur loadActivites:', err);
      return [];
    }
  }

  // Affiche une activité aléatoire (sans pastille couleur)
  async function afficherActivite() {
    const liste = await loadActivites();
    const cont = document.getElementById('couleur-du-jour') || document.getElementById('activite-jour') || null;
    if (!cont) return;
    if (!liste || liste.length === 0) {
      cont.innerHTML = `<p>Aucune activité disponible.</p>`;
      return;
    }
    // Choix : aléatoire (ou by date if you prefer)
    const choix = liste[Math.floor(Math.random() * liste.length)];

    cont.innerHTML = `
      <p class="activite-texte">« ${choix.activite} »</p>
      <p><strong>Catégorie :</strong> ${choix.categorie || '—'}</p>
      <p><strong>Niveau :</strong> ${choix.niveau || '—'}</p>
    `;
  }

  // Intégrer la webapp devinette (Google Apps Script exec) dans #resultat-defi
  function embedDevinetteWebapp(url) {
    const cont = document.getElementById('resultat-defi') || document.getElementById('devinette-embed') || null;
    if (!cont) return;

    // sécurité : si tu préfères fetch et insérer HTML, on peut, mais généralement Apps Script renvoie HTML,
    // ici on embed via iframe for simplicity (works if CORS/embedding allowed by the script deployment).
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '480px';
    iframe.style.border = '0';
    iframe.setAttribute('title','Devinette du jour');
    cont.innerHTML = ''; // clear
    cont.appendChild(iframe);
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    afficherActivite();

    // Replace this with your real Apps Script URL (you gave: https://script.google.com/macros/..../exec)
    const appsScriptURL = 'https://script.google.com/macros/s/AKfycbzoFRgG1z7veVxYyKIrqTpw9kiFdz_PK9pmo65vSf9qx2OLE2WHR_F-2J1FQJo1jeYDdA/exec';
    embedDevinetteWebapp(appsScriptURL);
  });
/* fonctions proverbe */
/* fonctions devinette */
/* fonctions defi */
/* fonctions animation zen */

/* ============================================================
   🌿 LANCEMENT À CHARGEMENT PAGE
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    chargerProverbe();
    chargerDevinette();
    chargerDefi();
});

})();
