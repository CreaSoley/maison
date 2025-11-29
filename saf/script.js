let DATA = [];

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  loadData();
});

/* ---------------------------
   Bind UI
----------------------------*/
function bindUI(){
  const btnDisplay = document.getElementById('btnDisplay');
  if (btnDisplay) btnDisplay.addEventListener('click', applyFilters);

  const btnRandom = document.getElementById('btnRandom');
  if (btnRandom) btnRandom.addEventListener('click', pickRandom);

  const qs = document.getElementById('quickSearch');
  if (qs) qs.addEventListener('input', quickSearch);

  const selTech = document.getElementById('selectTechnique');
  if (selTech) selTech.addEventListener('change', ()=>{
    const v = selTech.value;
    if (v) showTechnique(v);
  });

  // Before print: ensure images are visible (useful for desktop print)
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.photo img').forEach(img => {
      if (img) img.style.display = 'block';
    });
  });
}

/* ---------------------------
   Load data
----------------------------*/
function loadData(){
  fetch('data.json')
    .then(r => {
      if (!r.ok) throw new Error('Network response not ok');
      return r.json();
    })
    .then(json => {
      DATA = Array.isArray(json) ? json : (json || []);
      populateSelectors();
      showEmpty();
    })
    .catch(err => {
      console.error('Erreur chargement data.json', err);
      const area = document.getElementById('displayArea');
      if (area) area.innerHTML = '<div class="empty">Impossible de charger les données.</div>';
    });
}

/* ---------------------------
   Populate selectors
----------------------------*/
function populateSelectors(){
  const selTech = document.getElementById('selectTechnique');
  const selLev = document.getElementById('selectLevel');
  if (!selTech || !selLev) return;

  selTech.innerHTML = '<option value="">— aucune —</option>' 
    + DATA.map(t => `<option value="${escapeHtml(t.nom)}">${escapeHtml(t.nom)}</option>`).join('');

  const levs = Array.from(new Set(DATA.map(t => t.niveau || '').filter(Boolean))).sort();
  selLev.innerHTML = '<option value="">— aucun —</option>' 
    + levs.map(l => `<option value="${l}">${escapeHtml(l)}</option>`).join('');
}

/* ---------------------------
   Empty state
----------------------------*/
function showEmpty() {
  const area = document.getElementById('displayArea');
  if (area) area.innerHTML = '<div class="empty">Aucune donnée à afficher.</div>';
}

/* ---------------------------
   Filters / Search
----------------------------*/
function applyFilters(){
  const name = document.getElementById('selectTechnique')?.value;
  const lev = document.getElementById('selectLevel')?.value;

  if (name) { showTechnique(name); return; }

  let list = DATA.slice();
  if (lev) list = list.filter(t => String(t.niveau) === String(lev));

  renderGrid(list);
}

function quickSearch(e){
  const q = (e.target.value || '').toLowerCase().trim();
  if (!q) { showEmpty(); return; }

  const matches = DATA.filter(t => {
    const nom = (t.nom||'').toLowerCase();
    const mat = (t.materiel||'').toLowerCase();
    const
