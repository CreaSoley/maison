// randori.js - encart 2 (techniques randori)
// tries randori.json then randori_exercices.json

let techniquesData = [];
const DEFAULT_EMBED = "https://www.youtube.com/embed/Yfe5aQdez9Q";

async function loadRandori() {
  const candidates = ["randori.json", "randori.json"];
  for (const url of candidates) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`not ok ${url}`);
      const json = await resp.json();
      // Accept either { techniques: [...] } or an array
      techniquesData = Array.isArray(json) ? json : (json.techniques || []);
      if (techniquesData && techniquesData.length) {
        populateTypeFilter();
        populateTechSelector();
        console.log("Loaded randori data from", url, techniquesData.length, "items");
        return;
      }
    } catch (e) {
      console.warn("Could not load", url, e);
    }
  }
  console.error("No randori JSON found.");
}

function populateTypeFilter() {
  const sel = document.getElementById("filterType");
  if (!sel) return;
  sel.innerHTML = '<option value="">Filtrer par type</option>';
  const types = new Set();
  techniquesData.forEach(t => { if (t.type_attaque) types.add(t.type_attaque); });
  types.forEach(tp => {
    const o = document.createElement("option");
    o.value = tp;
    o.textContent = tp;
    sel.appendChild(o);
  });
  sel.onchange = () => populateTechSelector(sel.value, document.getElementById("searchBox").value.trim());
}

function populateTechSelector(filterType = "", query = "") {
  const sel = document.getElementById("selectTech");
  if (!sel) return;
  sel.innerHTML = '<option value="">Choisir une technique</option>';
  techniquesData.forEach(t => {
    if (filterType && t.type_attaque !== filterType) return;
    if (query) {
      const hay = `${t.attaque} ${t.objectif||''} ${t.points_cles||''} ${t.erreurs||''}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return;
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
  // fallback: try to extract id-like fragment or use default
  return DEFAULT_EMBED;
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function renderTechnique(t) {
  const container = document.getElementById("techCard");
  if (!container) return;
  if (!t) { container.innerHTML = ""; return; }

  const deroule = (Array.isArray(t.deroule) && t.deroule.length) ? `<ul class="deroule-list">${t.deroule.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ul>` : "<em>Aucun déroulé</em>";
  const embed = toEmbedUrl(t.video_embed || "");
  container.innerHTML = `
    <div class="result-card">
      <div class="tech-row">
        <div class="tech-left">
          <div class="tech-card-left fiche-card">
            <h3 class="tech-title">${escapeHtml(t.attaque)}</h3>
            <div class="tech-side">${escapeHtml(t.type_attaque||'')}</div>
            <p><strong>Atémi préparatoire :</strong> ${escapeHtml(t.atemi_preparatoire||'')}</p>
            <p><strong>Objectif :</strong> ${escapeHtml(t.objectif||'')}</p>
            <p><strong>Déroulé :</strong><br>${deroule}</p>
            <p><strong>Points clés :</strong> ${escapeHtml(t.points_cles||'')}</p>
            <p><strong>Erreurs fréquentes :</strong> ${escapeHtml(t.erreurs||'')}</p>
          </div>
        </div>
        <div class="tech-right">
          <div class="tech-card-right fiche-card">
            <iframe src="${embed}" title="Vidéo démonstration" allowfullscreen style="width:100%;height:100%;min-height:260px;border-radius:8px;border:none;"></iframe>
          </div>
        </div>
      </div>
    </div>
  `;
}

function randomTechnique() {
  if (!techniquesData.length) return null;
  return techniquesData[Math.floor(Math.random()*techniquesData.length)];
}

document.addEventListener("DOMContentLoaded", () => {
  loadRandori();

  const selTech = document.getElementById("selectTech");
  const filterType = document.getElementById("filterType");
  const searchBox = document.getElementById("searchBox");
  const btnRand = document.getElementById("btnRandom");

  if (selTech) selTech.onchange = () => renderTechnique(findTechniqueByName(selTech.value));
  if (filterType) filterType.onchange = () => { populateTechSelector(filterType.value, searchBox.value.trim()); document.getElementById("techCard").innerHTML = ""; };
  if (searchBox) searchBox.oninput = () => populateTechSelector(filterType.value, searchBox.value.trim());
  if (btnRand) btnRand.onclick = () => {
    const t = randomTechnique();
    if (t) {
      const sel = document.getElementById("selectTech");
      if (sel) sel.value = t.attaque;
      renderTechnique(t);
      const randResult = document.getElementById("randomResult");
      if (randResult) randResult.textContent = `Technique sélectionnée : ${t.attaque}`;
    }
  };
});
