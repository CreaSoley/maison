// randori.js
// Encadré 2 — Techniques Randori (affichage complet A)
// Essaie randori.json puis randori_exercices.json si indisponible

let techniquesData = [];
const DEFAULT_EMBED = "https://www.youtube.com/embed/Yfe5aQdez9Q";

async function loadRandoriData() {
  const candidates = ["randori.json", "randori_exercices.json"];
  for (const url of candidates) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("not ok");
      const json = await resp.json();
      // si structure { techniques: [...] } on prend techniques, sinon si tableau on prend directement
      techniquesData = Array.isArray(json) ? json : (json.techniques || []);
      console.log(`Loaded randori data from ${url} — ${techniquesData.length} items`);
      populateTypeFilter();
      populateTechSelector();
      return;
    } catch (err) {
      console.warn(`Could not load ${url}:`, err);
    }
  }
  console.error("Aucun JSON randori trouvé.");
}

function populateTypeFilter() {
  const set = new Set();
  techniquesData.forEach(t => { if (t.type_attaque) set.add(t.type_attaque); });
  const sel = document.getElementById("filterType");
  if (!sel) return;
  // vider puis remplir
  sel.innerHTML = '<option value="">Filtrer par type</option>';
  set.forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

function populateTechSelector(filterType = "", query = "") {
  const sel = document.getElementById("selectTech");
  if (!sel) return;
  sel.innerHTML = "<option value=''>Choisir une technique</option>";
  techniquesData.forEach(t => {
    if (filterType && t.type_attaque !== filterType) return;
    if (query) {
      const haystack = (t.attaque + " " + (t.objectif||"") + " " + (t.points_cles||"") + " " + (t.erreurs||"")).toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return;
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
  // parfois l'utilisateur met un lien youtube "https://youtu.be/..." without id capture — fallback:
  return DEFAULT_EMBED;
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Render full card with two-column layout: left = info, right = video
function renderTechniqueCard(t) {
  const container = document.getElementById("techCard");
  if (!container) return;
  if (!t) { container.innerHTML = ""; return; }

  const derouleHtml = (Array.isArray(t.deroule) && t.deroule.length)
    ? `<ul class="deroule-list">${t.deroule.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
    : "<em>Aucun déroulé détaillé</em>";

  const embed = toEmbedUrl(t.video_embed || "");
  container.innerHTML = `
    <div class="result-card" role="region" aria-label="Fiche technique">
      <div class="tech-row">
        <div class="tech-info">
          <h3 class="tech-title">${escapeHtml(t.attaque)}</h3>
          <div class="tech-side">${escapeHtml(t.type_attaque||'')}</div>

          <p><strong>Atémi préparatoire :</strong> ${escapeHtml(t.atemi_preparatoire||'')}</p>
          <p><strong>Objectif :</strong> ${escapeHtml(t.objectif||'')}</p>
          <p><strong>Déroulé :</strong><br>${derouleHtml}</p>
          <p><strong>Points clés :</strong> ${escapeHtml(t.points_cles||'')}</p>
          <p><strong>Erreurs fréquentes :</strong> ${escapeHtml(t.erreurs||'')}</p>
        </div>

        <div class="tech-video">
          <iframe src="${embed}" title="Vidéo démonstration" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `;
}

// random
function randomTechnique() {
  if (!techniquesData.length) return null;
  const idx = Math.floor(Math.random() * techniquesData.length);
  return techniquesData[idx];
}

document.addEventListener("DOMContentLoaded", () => {
  loadRandoriData();

  const selTech = document.getElementById("selectTech");
  const filterType = document.getElementById("filterType");
  const searchBox = document.getElementById("searchBox");
  const btnRandom = document.getElementById("btnRandom");

  if (selTech) {
    selTech.addEventListener("change", (e) => {
      const t = findTechniqueByName(e.target.value);
      renderTechniqueCard(t);
    });
  }

  if (filterType) {
    filterType.addEventListener("change", () => {
      populateTechSelector(filterType.value, searchBox ? searchBox.value.trim() : "");
      if (document.getElementById("techCard")) document.getElementById("techCard").innerHTML = "";
    });
  }

  if (searchBox) {
    searchBox.addEventListener("input", (e) => {
      populateTechSelector(filterType ? filterType.value : "", e.target.value.trim());
      if (document.getElementById("techCard")) document.getElementById("techCard").innerHTML = "";
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener("click", () => {
      const t = randomTechnique();
      if (t) {
        const sel = document.getElementById("selectTech");
        if (sel) sel.value = t.attaque;
        renderTechniqueCard(t);
      }
    });
  }

  // initial populate done by loadRandoriData when data arrives
});
