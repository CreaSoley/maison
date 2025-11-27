// script.js — logique front-end (chargement JSON, recherche, filtres, aléatoire, impression)

let DATA = { techniques: [], categories: [], levels: [] };

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  loadAll();
});

function bindUI(){
  document.getElementById('btnDisplay').addEventListener('click', onDisplayClick);
  document.getElementById('quickSearchTop').addEventListener('input', onQuickTop);
  document.getElementById('btnRandomTop').addEventListener('click', pickRandom);
  document.getElementById('selectTechnique').addEventListener('change', ()=>{
    const v = document.getElementById('selectTechnique').value;
    if(v) showTechnique(v);
  });
}

async function loadAll(){
  try {
    const res = await fetch('data.json', {cache: 'no-store'});
    const json = await res.json();
    DATA.techniques = (json || []).map(normalizeEntry);
    DATA.categories = Array.from(new Set(DATA.techniques.map(t => (t.categorie||'').toString()))).filter(Boolean).sort();
    DATA.levels = Array.from(new Set(DATA.techniques.map(t => (t.niveau||'').toString()))).filter(Boolean).sort();
    populateSelectors();
    document.getElementById('displayArea').innerHTML = document.getElementById('emptyState').outerHTML;
  } catch(err){
    console.error(err);
    document.getElementById('displayArea').innerHTML = '<div class="empty">Impossible de charger les données.</div>';
  }
}

function normalizeEntry(t){
  // ensure fields exist and youtubeList
  const e = Object.assign({
    nom: '', categorie: '', description:'', niveau:'', materiel:'', youtube:'', photos:'', galerie:''
  }, t);

  // youtubeList: split commas if present
  const y = (e.youtube || '').toString().trim();
  e.youtubeList = y ? y.split(/\s*[;,]\s*|\s+/).filter(Boolean) : [];

  return e;
}

function populateSelectors(){
  const selTech = document.getElementById('selectTechnique');
  const selCat = document.getElementById('selectCategory');
  const selLev = document.getElementById('selectLevel');

  selTech.innerHTML = '<option value="">— aucune —</option>' + DATA.techniques.map(t => `<option value="${escapeHtml(t.nom)}">${escapeHtml(t.nom)}</option>`).join('');
  selCat.innerHTML = '<option value="">— aucune —</option>' + DATA.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  selLev.innerHTML = '<option value="">— aucun —</option>' + DATA.levels.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');
}

// Display logic
function onDisplayClick(){
  const chosenName = document.getElementById('selectTechnique').value;
  const chosenCat = document.getElementById('selectCategory').value;
  const chosenLev = document.getElementById('selectLevel').value;

  if (chosenName){
    showTechnique(chosenName);
    return;
  }

  let matches = DATA.techniques;
  if (chosenCat) matches = matches.filter(t => String(t.categorie) === String(chosenCat));
  if (chosenLev) matches = matches.filter(t => String(t.niveau) === String(chosenLev));

  renderGrid(matches);
}

function renderGrid(list){
  const area = document.getElementById('displayArea');
  if (!list || list.length === 0) {
    area.innerHTML = '<div class="empty">Aucun résultat</div>';
    return;
  }
  hideEmpty();
  const html = `<div class="grid">${list.map(t => renderCardHtml(t)).join('')}</div>`;
  area.innerHTML = html;
}

function renderCardHtml(t){
  const photoHtml = t.photos ? `<div class="photo"><img src="${escapeHtml(t.photos)}" alt="${escapeHtml(t.nom)}" onerror="this.src='placeholder.png'"></div>` : `<div class="photo"><img src="placeholder.png" alt="placeholder"></div>`;

  const youtubeBtns = (t.youtubeList || []).map((u,i) => `<a class="link-btn video-btn" href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer"><span class="material-icons">play_circle</span>&nbsp;Vidéo ${i+1}</a>`).join(' ');
  const galleryBtn = t.galerie ? `<a class="link-btn gallery-btn" href="${escapeHtml(t.galerie)}" target="_blank" rel="noopener noreferrer"><span class="material-icons">photo_library</span>&nbsp;Galerie</a>` : '';

  const actionsHtml = `
    <div class="actions">
      <button class="btn-action btn-pdf" onclick='printCard("${escapeJs(t.nom)}")'>
        <span class="material-icons">print</span>&nbsp;Imprimer
      </button>
      <button class="btn-action" style="background:var(--primary)" onclick='showTechnique("${escapeJs(t.nom)}")'>
        <span class="material-icons">open_in_new</span>&nbsp;Afficher
      </button>
    </div>`;

  return `<div class="card">
    ${photoHtml}
    <div style="flex:1">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <h3>${escapeHtml(t.nom)}</h3>
          <div class="meta">${escapeHtml(t.categorie)} • ${escapeHtml(t.niveau)}</div>
        </div>
      </div>

      <p style="margin-top:12px">${escapeHtml(t.description)}</p>
      <p style="margin-top:6px"><strong>Matériel :</strong><br>${formatMaterialHtml(t.materiel)}</p>

      <div style="margin-top:10px">${youtubeBtns} ${galleryBtn}</div>

      ${actionsHtml}
    </div>
  </div>`;
}

function showTechnique(name){
  const t = DATA.techniques.find(x => String(x.nom) === String(name));
  if (!t) {
    document.getElementById('displayArea').innerHTML = '<div class="empty">Technique introuvable</div>';
    return;
  }
  hideEmpty();
  const area = document.getElementById('displayArea');
  area.innerHTML = `<div class="grid"><div class="card">${renderCardHtml(t)}</div></div>`;
}

// QUICK SEARCH (nom + materiel)
function onQuickTop(e){
  const q = (e.target.value || '').toLowerCase().trim();
  if (!q) { document.getElementById('displayArea').innerHTML = document.getElementById('emptyState').outerHTML; return; }
  const matches = DATA.techniques.filter(t => {
    return (String(t.nom||'').toLowerCase().includes(q) || String(t.materiel||'').toLowerCase().includes(q));
  });
  renderGrid(matches);
}

function showEmpty(){ document.getElementById('displayArea').innerHTML = document.getElementById('emptyState').outerHTML; }
function hideEmpty(){ const es = document.getElementById('emptyState'); if(es) es.style.display='none'; }

// RANDOM PICK
function pickRandom(){
  if (!DATA.techniques || DATA.techniques.length === 0) { alert('Aucune technique'); return; }
  const cat = document.getElementById('selectCategory').value;
  const lev = document.getElementById('selectLevel').value;
  let pool = DATA.techniques;
  if (cat) pool = pool.filter(t => String(t.categorie) === String(cat));
  if (lev) pool = pool.filter(t => String(t.niveau) === String(lev));
  if (pool.length === 0) { alert('Aucune technique correspondante'); return; }
  const random = pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('selectTechnique').value = random.nom;
  showTechnique(random.nom);
}

// PRINT
function printCard(name){
  const t = DATA.techniques.find(x => String(x.nom) === String(name));
  if(!t) return alert("Technique introuvable");

  const html = `
    <html>
    <head>
      <title>Impression — ${escapeHtml(t.nom)}</title>
      <meta charset="utf-8" />
      <style>
        body{font-family:Arial;padding:20px;color:#111}
        h1{margin-bottom:6px}
        .meta{color:#555;margin-bottom:10px}
        img{max-width:360px;border-radius:8px;display:block;margin:12px 0}
        .materiel{white-space:pre-wrap}
      </style>
    </head>
    <body>
      <h1>${escapeHtml(t.nom)}</h1>
      <div class="meta">${escapeHtml(t.categorie)} • ${escapeHtml(t.niveau)}</div>
      ${t.photos ? `<img src="${escapeHtml(t.photos)}" alt="">` : ''}
      <div>${escapeHtml(t.description)}</div>
      <h3>Matériel</h3>
      <div class="materiel">${escapeHtml(t.materiel).replace(/\n/g,'<br>')}</div>
    </body>
    </html>
  `;
  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

// UTIL
function escapeHtml(s){ if (s===null||s===undefined) return ''; return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function escapeJs(s){ if (s===null||s===undefined) return ''; return String(s).replace(/'/g,"\\'").replace(/\"/g,'\\"'); }

function formatMaterialHtml(s){
  if(!s) return '';
  // expected bullets '• ' lines
  return escapeHtml(s).replace(/\n/g,'<br>');
}
