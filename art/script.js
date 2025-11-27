let DATA = [];

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  loadData();
});

function bindUI(){
  document.getElementById('btnDisplay').addEventListener('click', applyFilters);
  document.getElementById('btnRandom').addEventListener('click', pickRandom);
  document.getElementById('quickSearch').addEventListener('input', quickSearch);
  document.getElementById('selectTechnique').addEventListener('change', ()=>{
    const v = document.getElementById('selectTechnique').value;
    if (v) showTechnique(v);
  });
}

function loadData(){
  fetch('data.json')
    .then(r => r.json())
    .then(json => {
      DATA = json || [];
      populateSelectors();
      showEmpty();
    })
    .catch(err => {
      console.error('Erreur chargement data.json', err);
      document.getElementById('displayArea').innerHTML = '<div class="empty">Impossible de charger les données.</div>';
    });
}

function populateSelectors(){
  const selTech = document.getElementById('selectTechnique');
  const selCat = document.getElementById('selectCategory');
  const selLev = document.getElementById('selectLevel');

  selTech.innerHTML = '<option value="">— aucune —</option>' + DATA.map(t => `<option value="${escapeHtml(t.nom)}">${escapeHtml(t.nom)}</option>`).join('');

  const cats = Array.from(new Set(DATA.map(t => t.categorie || '').filter(Boolean))).sort();
  selCat.innerHTML = '<option value="">— aucune —</option>' + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  const levs = Array.from(new Set(DATA.map(t => t.niveau || '').filter(Boolean))).sort();
  selLev.innerHTML = '<option value="">— aucun —</option>' + levs.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');
}

/* Filters */
function applyFilters(){
  const name = document.getElementById('selectTechnique').value;
  const cat = document.getElementById('selectCategory').value;
  const lev = document.getElementById('selectLevel').value;

  if (name) { showTechnique(name); return; }

  let list = DATA.slice();
  if (cat) list = list.filter(t => String(t.categorie) === String(cat));
  if (lev) list = list.filter(t => String(t.niveau) === String(lev));

  renderGrid(list);
}

function quickSearch(e){
  const q = (e.target.value || '').toLowerCase().trim();
  if (!q) { showEmpty(); return; }
  const matches = DATA.filter(t => {
    const nom = (t.nom||'').toString().toLowerCase();
    const mat = (t.materiel||'').toString().toLowerCase();
    return nom.includes(q) || mat.includes(q);
  });
  renderGrid(matches);
}

function pickRandom(){
  if (!DATA.length) return alert('Aucune technique disponible');
  const r = DATA[Math.floor(Math.random()*DATA.length)];
  document.getElementById('selectTechnique').value = r.nom;
  showTechnique(r.nom);
}

/* Render grid / card */
function renderGrid(list){
  const area = document.getElementById('displayArea');
  if (!list || list.length === 0){
    area.innerHTML = '<div class="card">Aucun résultat.</div>';
    return;
  }
  area.innerHTML = `<div class="grid">${list.map(t => renderCardHtml(t)).join('')}</div>`;
}

function showTechnique(name){
  const t = DATA.find(x => String(x.nom) === String(name));
  if (!t) { document.getElementById('displayArea').innerHTML = '<div class="card">Technique introuvable</div>'; return; }
  document.getElementById('displayArea').innerHTML = `<div class="card">${renderCardHtml(t)}</div>`;
}

function renderCardHtml(t){
  const photoHtml = t.photos ? `<div class="photo"><img src="${escapeHtml(t.photos)}" alt="${escapeHtml(t.nom)}"></div>` : `<div class="photo"><span style="color:#bbb;font-size:13px">Pas d'image</span></div>`;
  const videoBtn = t.youtube ? `<a class="link-btn" href="${escapeHtml(t.youtube)}" target="_blank" rel="noopener">🎬 Vidéo</a>` : '';
  const galleryBtn = t.galerie ? `<a class="link-btn" href="${escapeHtml(t.galerie)}" target="_blank" rel="noopener">🖼️ Galerie</a>` : '';

  const materielList = (t.materiel||'').toString().split('\n').filter(x=>x.trim()).map(x=>`<li>${escapeHtml(x.trim())}</li>`).join('');

  return `
    ${photoHtml}
    <div style="flex:1">
      <h3>${escapeHtml(t.nom)}</h3>
      <div class="meta">${escapeHtml(t.categorie)} • ${escapeHtml(t.niveau)}</div>

      <p style="margin-top:10px">${escapeHtml(t.description)}</p>

      <p style="margin-top:8px"><strong>Matériel :</strong></p>
      <ul>${materielList || '<li>Aucun renseignement</li>'}</ul>

      <div style="margin-top:10px">${videoBtn} ${galleryBtn}</div>

      <div class="actions">
        <button class="print-btn" data-name="${escapeHtml(t.nom)}">🖨️✨ Imprimer</button>
      </div>
    </div>
  `;
}

/* print (delegated handler) */
document.addEventListener('click', function(e){
  const p = e.target.closest('.print-btn');
  if (p){
    const name = p.getAttribute('data-name');
    printCard(name);
  }
});

/* Print window */
function printCard(name){
  const t = DATA.find(x => String(x.nom) === String(name));
  if (!t) return alert('Technique introuvable');

  const html = `
  <html>
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(t.nom)}</title>
    <style>
      body{font-family:Inter,Arial; padding:20px; color:#111}
      h1{font-family:Spicy,Inter,Arial; font-size:28px; color:#5b3bd3}
      img{max-width:320px; display:block; margin:10px 0; border-radius:10px}
      pre{white-space:pre-wrap; font-family:inherit}
    </style>
  </head>
  <body>
    <h1>${escapeHtml(t.nom)}</h1>
    <div><strong>Catégorie :</strong> ${escapeHtml(t.categorie)}</div>
    <div><strong>Niveau :</strong> ${escapeHtml(t.niveau)}</div>
    ${ t.photos ? `<img src="${escapeHtml(t.photos)}" alt="${escapeHtml(t.nom)}">` : '' }
    <p>${escapeHtml(t.description)}</p>
    <h3>Matériel</h3>
    <pre>${escapeHtml(t.materiel || '')}</pre>
  </body>
  </html>
  `;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

/* Utilities */
function escapeHtml(s){
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,"&#39;");
}
