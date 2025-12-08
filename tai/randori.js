// -------------------------------------------------------------
// Chargement des données depuis randori.json
// -------------------------------------------------------------
let techniquesData = [];
const DEFAULT_EMBED = "https://www.youtube.com/embed/Yfe5aQdez9Q";

fetch("randori.json")
  .then(res => res.json())
  .then(data => {
    techniquesData = data.techniques || [];
    populateTypeFilter();
    populateTechSelector();
  })
  .catch(err => console.error("Erreur chargement JSON techniques :", err));


// -------------------------------------------------------------
// Populate filtre type
// -------------------------------------------------------------
function populateTypeFilter() {
  const set = new Set();
  techniquesData.forEach(t => { if(t.type_attaque) set.add(t.type_attaque); });
  const sel = document.getElementById("techFilterType");
  set.forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => populateTechSelector(sel.value, document.getElementById("techSearch").value.trim()));
}


// -------------------------------------------------------------
// Populate select des techniques
// -------------------------------------------------------------
function populateTechSelector(filterType = "", query = "") {
  const sel = document.getElementById("techSelect");
  sel.innerHTML = "<option value=''>Choisir une technique</option>";
  techniquesData.forEach(t => {
    if(filterType && t.type_attaque !== filterType) return;
    if(query) {
      const haystack = (t.attaque + " " + (t.objectif||"") + " " + (t.points_cles||"") + " " + (t.erreurs||"")).toLowerCase();
      if(!haystack.includes(query.toLowerCase())) return;
    }
    const o = document.createElement("option");
    o.value = t.attaque;
    o.textContent = t.attaque;
    sel.appendChild(o);
  });
}


// -------------------------------------------------------------
// Trouver une technique par nom
// -------------------------------------------------------------
function findTechniqueByName(name) {
  return techniquesData.find(t => t.attaque === name);
}


// -------------------------------------------------------------
// Convertir lien YouTube pour iframe embed
// -------------------------------------------------------------
function toEmbedUrl(url) {
  if(!url) return DEFAULT_EMBED;
  if(url.includes("youtube.com/embed")) return url;
  const by = url.match(/youtu\.be\/([A-Za-z0-9_-]{5,})/);
  if(by) return `https://www.youtube.com/embed/${by[1]}`;
  const q = url.match(/[?&]v=([A-Za-z0-9_-]{5,})/);
  if(q) return `https://www.youtube.com/embed/${q[1]}`;
  return DEFAULT_EMBED;
}


// -------------------------------------------------------------
// Affichage de la carte technique
// -------------------------------------------------------------
function renderTechniqueCard(t) {
  const container = document.getElementById("techResult");
  if(!t) { container.innerHTML = ""; return; }

  const derouleHtml = (Array.isArray(t.deroule) && t.deroule.length)
    ? `<ul>${t.deroule.map(s => `<li>${s}</li>`).join("")}</ul>`
    : "<em>Aucun déroulé détaillé</em>";

  const videoHtml = `<iframe class="video-frame" src="${toEmbedUrl(t.video_embed || '')}" title="Vidéo démonstration" allowfullscreen></iframe>`;

  container.innerHTML = `
    <div class="result-card" role="region" aria-label="Fiche technique">
      <h3 class="tech-title">${t.attaque}</h3>
      <p class="tech-side"><em>${t.type_attaque || ""}</em></p>
      <p><strong>Atémi préparatoire :</strong> ${t.atemi_preparatoire || ""}</p>
      <p><strong>Objectif :</strong> ${t.objectif || ""}</p>
      <p><strong>Déroulé :</strong> ${derouleHtml}</p>
      <p><strong>Points clés :</strong> ${t.points_cles || ""}</p>
      <p><strong>Erreurs fréquentes :</strong> ${t.erreurs || ""}</p>
      ${videoHtml}
    </div>
  `;
}


// -------------------------------------------------------------
// Sélection aléatoire
// -------------------------------------------------------------
function randomTechnique() {
  if(!techniquesData.length) return null;
  const idx = Math.floor(Math.random() * techniquesData.length);
  return techniquesData[idx];
}

function showRandomPreview(t) {
  const el = document.getElementById("techSelect");
  if(t) {
    el.value = t.attaque;
    renderTechniqueCard(t);
  }
}


// -------------------------------------------------------------
// Événements DOM
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const selTech = document.getElementById("techSelect");
  const filterType = document.getElementById("techFilterType");
  const searchBox = document.getElementById("techSearch");
  const btnRandom = document.getElementById("btnRandomTech");

  selTech.addEventListener("change", e => {
    const t = findTechniqueByName(e.target.value);
    renderTechniqueCard(t);
  });

  searchBox.addEventListener("input", e => populateTechSelector(filterType.value, e.target.value.trim()));

  btnRandom.addEventListener("click", () => {
    const t = randomTechnique();
    if(t) showRandomPreview(t);
  });
});
