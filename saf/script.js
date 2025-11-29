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
    const desc = (t.description||'').toLowerCase();
    return nom.includes(q) || mat.includes(q) || desc.includes(q);
  });

  renderGrid(matches);
}

/* ---------------------------
   Random picker
----------------------------*/
function pickRandom(){
  if (!DATA.length) return alert('Aucune technique disponible');
  const r = DATA[Math.floor(Math.random()*DATA.length)];
  document.getElementById('selectTechnique').value = r.nom;
  showTechnique(r.nom);
}

/* ---------------------------
   Render grid / single
----------------------------*/
function renderGrid(list){
  const area = document.getElementById('displayArea');
  if (!area) return;
  if (!list || list.length === 0){
    area.innerHTML = '<div class="card">Aucun résultat.</div>';
    return;
  }
  area.innerHTML = `<div class="grid">${list.map(t => renderCardHtml(t)).join('')}</div>`;

  // attach print handlers (delegation could be used, but keep simple)
  document.querySelectorAll('.print-btn').forEach(btn => {
    btn.removeEventListener('click', onPrintClick);
    btn.addEventListener('click', onPrintClick);
  });
}

function showTechnique(name){
  const t = DATA.find(x => String(x.nom) === String(name));
  if (!t) { 
    const area = document.getElementById('displayArea');
    if (area) area.innerHTML = '<div class="card">Technique introuvable</div>'; 
    return; 
  }
  const area = document.getElementById('displayArea');
  if (area) area.innerHTML = `<div class="card">${renderCardHtml(t)}</div>`;
  document.querySelectorAll('.print-btn').forEach(btn => {
    btn.removeEventListener('click', onPrintClick);
    btn.addEventListener('click', onPrintClick);
  });
}

/* ---------------------------
   Render a single card HTML
   (uses t.illustration as string or array)
----------------------------*/
function renderCardHtml(t){

  const photoSrc = Array.isArray(t.illustration) ? t.illustration[0] : t.illustration;

  const photoHtml = photoSrc
    ? `<div class="photo"><img class="card-img" src="${photoSrc}" alt="${escapeHtml(t.nom)}"></div>`
    : `<div class="photo"><span style="color:#bbb;font-size:13px">Pas d'image</span></div>`;

  const videoBtn = t.youtube 
    ? `<a class="link-btn" href="${t.youtube}" target="_blank" rel="noopener">🎬 Vidéo</a>` : '';

  const galleryBtn = t.galerie 
    ? `<a class="link-btn" href="${t.galerie}" target="_blank" rel="noopener">🖼️ Galerie</a>` : '';

  const recetteEco = t.recettes_econo 
    ? `<a class="link-btn" href="${t.recettes_econo}" target="_blank" rel="noopener">💧 Recette Écono</a>` : '';

  const recettePremium = t.recettes_premium 
    ? `<a class="link-btn" href="${t.recettes_premium}" target="_blank" rel="noopener">🌟 Recette Premium</a>` : '';

  const tuto = t.tutoriel 
    ? `<a class="link-btn" href="${t.tutoriel}" target="_blank" rel="noopener">📘 Tutoriel</a>` : '';

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

/* ---------------------------
   Print handling
----------------------------*/
function onPrintClick(e){
  const name = e.currentTarget.getAttribute('data-name');
  printCard(name);
}

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
      img{max-width:100%; display:block; margin:10px 0; border-radius:10px}
      pre{white-space:pre-wrap; font-family:inherit}
      @media print {
        img{max-width:100%; height:auto}
      }
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
  // ensure images are visible before print
  try {
    w.document.querySelectorAll('img').forEach(img => img.style.display = 'block');
  } catch (err) { /* ignore */ }
  w.print();
}

/* ---------------------------
   Utils
----------------------------*/
function escapeHtml(s){
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,"&#39;");
}
