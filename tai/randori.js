/* ippon.js */

let techniquesData = [];
const DEFAULT_EMBED = "https://www.youtube.com/embed/Yfe5aQdez9Q"; // si aucune vidéo fournie

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
  sel.innerHTML = '<option value="">Choisir une technique</option>';
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

/* helper pour trouver technique par nom */
function findTechniqueByName(name) {
  return techniquesData.find(t => t.attaque === name);
}

/* conversion youtube short -> embed */
function toEmbedUrl(url) {
  if (!url) return DEFAULT_EMBED;
  // si c'est déjà embed
  if (url.includes("youtube.com/embed")) return url;
  // si format youtu.be/ID
  const by = url.match(/youtu\.be\/([A-Za-z0-9_-]{5,})/);
  if (by) return `https://www.youtube.com/embed/${by[1]}`;
  // si full watch?v=
  const q = url.match(/[?&]v=([A-Za-z0-9_-]{5,})/);
  if (q) return `https://www.youtube.com/embed/${q[1]}`;
  // fallback
  return DEFAULT_EMBED;
}

/* render card */
function renderTechniqueCard(t) {
  const container = document.getElementById("techCard");
  if (!t) {
    container.innerHTML = "";
    return;
  }

  const derouleHtml = (Array.isArray(t.deroule) && t.deroule.length)
    ? `<ul class="deroule-list">${t.deroule.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
    : `<em>Aucun déroulé détaillé</em>`;

  const videoUrl = toEmbedUrl(t.video_embed || t.video || "");

  container.innerHTML = `
    <div class="result-card floating-card" role="region" aria-label="Fiche technique">
      <div class="tech-title">
        <span class="material-icons" aria-hidden="true">emoji_objects</span>
        <span>${escapeHtml(t.attaque)}</span>
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:260px;">
          <p><span class="material-icons icon-inline" title="Type">category</span><strong>Type :</strong> <span>${escapeHtml(t.type_attaque||'')}</span></p>

          <p><span class="material-icons icon-inline" title=\"Atemi préparatoire\">local_fire_department</span><strong>Atemi préparatoire :</strong> <span>${escapeHtml(t.atemi_preparatoire||'')}</span></p>

          <p><span class="material-icons icon-inline" title=\"Objectif\">flag</span><strong>Objectif :</strong> <span>${escapeHtml(t.objectif||'')}</span></p>

          <p><span class="material-icons icon-inline" title=\"Déroulé\">format_list_numbered</span><strong>Déroulé :</strong> ${derouleHtml}</p>

          <p><span class="material-icons icon-inline" title=\"Points clés\">tips_and_updates</span><strong>Points clés :</strong> <span>${escapeHtml(t.points_cles||'')}</span></p>

          <p><span class="material-icons icon-inline" title=\"Erreurs\">report_problem</span><strong>Erreurs fréquentes :</strong> <span>${escapeHtml(t.erreurs||'')}</span></p>
        </div>

        <div style="flex:1; min-width:260px;">
          <iframe class="video-frame" src="${videoUrl}" title="Vidéo démonstration" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `;
}

/* utilities */
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* random technique for bandeau */
function randomTechnique() {
  if (!techniquesData.length) return null;
  const idx = Math.floor(Math.random() * techniquesData.length);
  return techniquesData[idx];
}

/* show small preview for random result */
function showRandomPreview(t) {
  const el = document.getElementById("randomResult");
  if (!t) { el.innerHTML = ""; return; }

  el.innerHTML = `
    <div class="result-card floating-card" style="display:flex; gap:14px; align-items:flex-start;">
      <div style="flex:1; min-width:220px;">
        <div style="font-weight:700; font-size:1.1rem;">${escapeHtml(t.attaque)}</div>
        <div style="margin-top:6px;"><span class="material-icons icon-inline">flag</span>${escapeHtml(t.objectif||'')}</div>
        <div style="margin-top:6px;"><small style="color:#666">${escapeHtml(t.type_attaque||'')}</small></div>
      </div>
      <div style="width:320px; min-width:260px;">
        <iframe class="video-frame" src="${toEmbedUrl(t.video_embed||'')}" title="aperçu" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

/* event wiring */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchData();

  const selTech = document.getElementById("selectTech");
  const filterType = document.getElementById("filterType");
  const searchBox = document.getElementById("searchBox");
  const btnRandom = document.getElementById("btnRandom");
  const btnRandomSmall = document.getElementById("btnRandomSmall");

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
      // aussi remplir select et afficher fiche complète
      const sel = document.getElementById("selectTech");
      sel.value = t.attaque;
      renderTechniqueCard(t);
    }
  });

  btnRandomSmall.addEventListener("click", () => {
    const t = randomTechnique();
    if (t) showRandomPreview(t);
  });

  // initial random preview
  const initial = randomTechnique();
  if (initial) showRandomPreview(initial);
});
