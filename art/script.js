/* =====================================
   GLOBAL
===================================== */
let DATA = [];

/* =====================================
   INIT
===================================== */
document.addEventListener("DOMContentLoaded", () => {
  bindUI();
  loadData();  // <-- version correcte
});

/* =====================================
   UI BINDINGS
===================================== */
function bindUI() {
  document.getElementById("btnDisplay").addEventListener("click", applyFilters);
  document.getElementById("btnRandom").addEventListener("click", pickRandom);
  document.getElementById("quickSearch").addEventListener("input", quickSearch);

  document.getElementById("selectTechnique").addEventListener("change", () => {
    const v = document.getElementById("selectTechnique").value;
    if (v) showTechnique(v);
  });
}

/* =====================================
   LOAD DATA.JSON  (VERSION CORRECTE)
===================================== */
async function loadData() {
  try {
    const response = await fetch("./data.json");  // <-- chemin FIXÉ et RELATIF
    if (!response.ok) throw new Error("data.json introuvable");

    DATA = await response.json();
    populateSelectors();
    showEmpty();

  } catch (err) {
    console.error("Erreur chargement JSON :", err);
    document.getElementById("displayArea").innerHTML =
      '<div class="empty">Impossible de charger les données.</div>';
  }
}

/* =====================================
   POPULATE SELECTS
===================================== */
function populateSelectors() {
  const selTech = document.getElementById("selectTechnique");
  const selCat = document.getElementById("selectCategory");
  const selLev = document.getElementById("selectLevel");

  selTech.innerHTML =
    '<option value="">— aucune —</option>' +
    DATA.map(t => `<option value="${escapeHtml(t.nom)}">${escapeHtml(t.nom)}</option>`).join("");

  const cats = [...new Set(DATA.map(t => t.categorie || "").filter(Boolean))].sort();
  selCat.innerHTML =
    '<option value="">— aucune —</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  const levs = [...new Set(DATA.map(t => t.niveau || "").filter(Boolean))].sort();
  selLev.innerHTML =
    '<option value="">— aucun —</option>' +
    levs.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
}

/* =====================================
   FILTERS
===================================== */
function applyFilters() {
  const name = document.getElementById("selectTechnique").value;
  const cat = document.getElementById("selectCategory").value;
  const lev = document.getElementById("selectLevel").value;

  if (name) {
    showTechnique(name);
    return;
  }

  let list = [...DATA];
  if (cat) list = list.filter(t => S
