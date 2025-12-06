let techniquesData = [];
const DEFAULT_EMBED = "https://www.youtube.com/embed/Yfe5aQdez9Q";

async function fetchData() {
  try {
    const resp = await fetch("randori.json");
    const json = await resp.json();
    techniquesData = json.techniques || [];
    populateTypeFilter();
    populateTechSelector();
  } catch (e) {
    console.error("Erreur chargement JSON", e);
    document.getElementById("techCard").innerHTML = "<p>Impossible de charger les techniques.</p>";
  }
}

function populateTypeFilter() {
  const set = new Set();
  techniquesData.forEach(t => {
    if (t.type_attaque) set.add(t.type_attaque);
  });
  const sel = document.getElementById("filterType");
  set.forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

function populateTechSelector(filterType = "", query = "") {
  const sel = document.getElementById("selectTech");
  sel.innerHTML = '<option value="">Choisir une attaque</option>';
  techniquesData.forEach(t => {
    if (filterType && t.type_attaque !== filterType) return;
    if (query) {
      const q = query.toLowerCase();
      const haystack = (t.attaque + " " + (t.objectif||"") + " " + (t.points_cles||"") + " " + (t.erreurs||"")).toLowerCase();
      if (!haystack.includes(q)) return;
    }
    const o = document.createElement("option");
    o.value = t.attaque;
    o.textContent = t.attaque;
    sel.appendChild(o);
  });
}

function findTechniqueByName(name) {
  return techniquesData.find(t => t.attaque === name);
}

function toEmbedUrl(url) {
  if (!url) return DEFAULT_EMBED;
  if (url.includes("youtube.com/embed")) return url;
  const by = url.match(/youtu\.be\/([A-Za-z0-9_-]{5,})/);
  if (by) return `https://www.youtube.com/embed/${by[1]}`;
  const q = url.match(/[?&]v=([A-Za-z0-9_-]{5,})/);
  if (q) return `https://www.youtube.com/embed/${q[1]}`;
  return DEFAULT_EMBED;
}

function renderTechniqueCard(t) {
  const container = document.getElementById("techCard");
  if (!t) { container.innerHTML = ""; return; }

  const derouleHtml = (Array.isArray(t.deroule) && t.deroule.length)
    ? `<ul class="deroule-list">${t.deroule.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
    : `<em>Aucun déroulé détaillé</em>`;

  const videoHtml = `<iframe class="video-frame" src="${toEmbedUrl(t.video_embed || '')}" title="Vidéo démonstration" allowfullscreen></iframe>`;

  container.innerHTML = `
    <div class="result-card">
      <div class="tech-title">${escapeHtml(t.attaque)}</div>
      <div class="tech-side">${escapeHtml(t.type_attaque||'')}</div>
      <p><strong>Atemi préparatoire :</strong> ${escapeHtml(t.atemi_preparatoire||'')}</p>
      <p><strong>Objectif :</strong> ${escapeHtml(t.objectif||'')}</p>
      <p><strong>Déroulé :</strong> ${derouleHtml}</p>
      <p><strong>Points clés :</strong> ${escapeHtml(t.points_cles||'')}</p>
      <p><strong>Erreurs fréquentes :</strong> ${escapeHtml(t.erreurs||'')}</p>
      ${videoHtml}
    </div>
  `;
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function randomTechnique() {
  if (!techniquesData.length) return null;
  const idx = Math.floor(Math.random() * techniquesData.length);
  return techniquesData[idx];
}

function showRandomPreview(t) {
  const el = document.getElementById("randomResult");
  if (!t) { el.innerHTML = ""; return; }
  el.textContent = t.attaque;
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchData();

  const selTech = document.getElementById("selectTech");
  const filterType = document.getElementById("filterType");
  const searchBox = document.getElementById("searchBox");
  const btnRandom = document.getElementById("btnRandom");

  selTech.addEventListener("change", (e) => {
    const name = e.target.value;
    if (!name) { renderTechniqueCard(null); return; }
    const t = findTechniqueByName(name);
    renderTechniqueCard(t);
  });

  filterType.addEventListener("change", (e) => {
    populateTechSelector(e.target.value, searchBox.value.trim());
    renderTechniqueCard(null);
  });

  searchBox.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    populateTechSelector(filterType.value, q);
    renderTechniqueCard(null);
  });

  btnRandom.addEventListener("click", () => {
    const t = randomTechnique();
    if (t) {
      showRandomPreview(t);
      selTech.value = t.attaque;
      renderTechniqueCard(t);
    }
  });

  const initial = randomTechnique();
  if (initial) showRandomPreview(initial);
});
