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
  const selLev = document.getElementById('selectLevel');

  selTech.innerHTML = '<option value="">— aucune —</option>' 
    + DATA.map(t => `<option value="${t.nom}">${escapeHtml(t.nom)}</option>`).join('');

  const levs = Array.from(new Set(DATA.map(t => t.niveau || '').filter(Boolean))).sort();
  selLev.innerHTML = '<option value="">— aucun —</option>' 
    + levs.map(l => `<option value="${l}">${escapeHtml(l)}</option>`).join('');
}

/* Affiche message vide */
function showEmpty() {
  document.getElementById('displayArea').innerHTML = '<div class="empty">Aucune donnée à afficher.</div>';
}

/* Filters */
function applyFilters(){
  const name = document.getElementById('selectTechnique').value;
  const lev = document.getElementById('selectLevel').value;

  if (name) { showTechnique(name); return; }

  let list = DATA.slice();
  if (lev) list = list.filter(t => String(t.niveau) === String(lev));

  renderGrid(list);
}

/* Recherche rapide */
function quickSearch(e){
  const q = (e.target.value || '').toLowerCase().trim();
  if (!q) { showEmpty(); return; }

  const matches = DATA.filter(t => {
    const nom = (t.nom||'').toLowerCase();
    const mat = (t.materiel||'').toLowerCase();
    const desc = (t.description||'').toLowerCase();
    return nom.includes(q) || mat.includes(q) || desc.includes(q);
  });

  renderGrid(matches);
}

/* Technique aléatoire */
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
  if (!t) { 
    document.getElementById('displayArea').innerHTML = '<div class="card">Technique introuvable</div>'; 
    return; 
  }
  document.getElementById('displayArea').innerHTML = `<div class="card">${renderCardHtml(t)}</div>`;
}

/* Construction HTML d’une carte */
function renderCardHtml(t){

  /* PHOTO depuis "illustration" */
  const photoSrc = Array.isArray(t.illustration) ? t.illustration[0] : t.illustration;

  const photoHtml = photoSrc
    ? `<div class="photo"><img src="${photoSrc}" alt="${escapeHtml(t.nom)}"></div>`
    : `<div class="photo"><span style="color:#bbb;font-size:13px">Pas d'image</span></div>`;

  const videoBtn = t.youtube 
    ? `<a class="link-btn" href="${t.youtube}" target="_blank" rel="noopener">🎬 Vidéo</a>` : '';

  const galleryBtn = t.galerie 
    ? `<a class="link-btn" href="${t.galerie}" target="_blank" rel="noopener">🖼️ Galerie</a>` : '';

  const recetteEco = t.recettes_econo 
    ? `<a class="link-btn" href="${t.recettes_econo}" target="_blank">💧 Recette Écono</a>` : '';

  const recettePremium = t.recettes_premium 
    ? `<a class="link-btn" href="${t.recettes_premium}" target="_blank">🌟 Recette Premium</a>` : '';

  const tuto = t.tutoriel 
    ? `<a class="link-btn" href="${t.tutoriel}" target="_blank">📘 Tutoriel</a>` : '';

  const materielList = (t.materiel||'')
      .toString()
      .split('\n')
      .filter(x => x.trim())
      .map(x => `<li>${escapeHtml(x.trim())}</li>`)
      .join('');

  return `
    ${photoHtml}
    <div style="flex:1">
      <h3>${escapeHtml(t.nom)}</h3>
      <div class="meta">${escapeHtml(t.niveau)}</div>

      <p style="margin-top:10px">${escapeHtml(t.description)}</p>

      <p style="margin-top:8px"><strong>Trace :</strong> ${escapeHtml(t.trace || '')}</p>

      <p style="margin-top:8px"><strong>Matériel :</strong></p>
      <ul>${materielList || '<li>Aucun renseignement</li>'}</ul>

      <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px;">
        ${videoBtn} 
        ${galleryBtn} 
        ${recetteEco}
        ${recettePremium}
        ${tuto}
      </div>

      <div class="actions">
        <button class="print-btn" data-name="${escapeHtml(t.nom)}">🖨️✨ Imprimer</button>
      </div>
    </div>
  `;
}

/* Impression */
document.addEventListener('click', function(e){
  const p = e.target.closest('.print-btn');
  if (p){
    const name = p.getAttribute('data-name');
    printCard(name);
  }
});

function printCard(name){
  const t = DATA.find(x => String(x.nom) === String(name));
  if (!t) return alert('Technique introuvable');

  const photoSrc = Array.isArray(t.illustration) ? t.illustration[0] : t.illustration;

  const html = `
  <html>
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(t.nom)}</title>
    <style>
      body{font-family:Inter,Arial; padding:20px; color:#111}
      h1{font-family:Spicy,Inter,Arial; font-size:32px; color:#5b3bd3}
      img{max-width:350px; display:block; margin:10px 0; border-radius:10px}
      pre{white-space:pre-wrap; font-family:inherit}
    </style>
  </head>
  <body>
    <h1>${escapeHtml(t.nom)}</h1>

    ${ photoSrc ? `<img src="${photoSrc}" alt="${escapeHtml(t.nom)}">` : '' }

    ${ t.trace ? `<p><strong>Trace :</strong> ${escapeHtml(t.trace)}</p>` : '' }

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

/* Utils */
function escapeHtml(s){
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,"&#39;");
}

