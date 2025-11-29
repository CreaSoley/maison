let DATA = [];

/* -----------------------------------------------------------
   ESCAPE HTML
----------------------------------------------------------- */
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  })[m]);
}

/* -----------------------------------------------------------
   RENDU DES CARTES
----------------------------------------------------------- */
function renderCardHtml(t){
  const photoSrc = Array.isArray(t.illustration) ? t.illustration[0] : t.illustration;

  const photoHtml = photoSrc
    ? `<div class="photo"><img src="${photoSrc}" alt="${escapeHtml(t.nom)}"></div>`
    : `<div class="photo"><span style="color:#bbb;font-size:13px">Pas d'image</span></div>`;

  const videoBtn = t.youtube 
    ? `<a class="link-btn" href="${t.youtube}" target="_blank">🎬 Vidéo</a>` : '';

  const galleryBtn = t.galerie 
    ? `<a class="link-btn" href="${t.galerie}" target="_blank">🖼️ Galerie</a>` : '';

  const recetteEco = t.recettes_econo 
    ? `<a class="link-btn" href="${t.recettes_econo}" target="_blank">💧 Recette Écono</a>` : '';

  const recettePremium = t.recettes_premium 
    ? `<a class="link-btn" href="${t.recettes_premium}" target="_blank">🌟 Recette Premium</a>` : '';

  const tuto = t.tutoriel 
    ? `<a class="link-btn" href="${t.tutoriel}" target="_blank">📘 Tutoriel</a>` : '';

  const materielList = (t.materiel||'')
    .split('\n')
    .filter(x => x.trim())
    .map(x => `<li>${escapeHtml(x)}</li>`)
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

      <div class="actions">
        ${videoBtn}
        ${galleryBtn}
        ${recetteEco}
        ${recettePremium}
        ${tuto}

        <button class="print-btn" data-name="${escapeHtml(t.nom)}">🖨️✨ Imprimer</button>
      </div>
    </div>
  `;
}

/* -----------------------------------------------------------
   RENDER LISTE
----------------------------------------------------------- */
function renderList(list){
  const container = document.querySelector('.cards');
  container.innerHTML = list.map(renderCardHtml).join('');

  document.querySelectorAll('.print-btn').forEach(btn => {
    btn.addEventListener('click', () => printCard(btn.dataset.name));
  });
}

/* -----------------------------------------------------------
   PRINT
----------------------------------------------------------- */
function printCard(name){
  const t = DATA.find(x => x.nom === name);
  if (!t) return alert("Technique introuvable.");

  const photoSrc = Array.isArray(t.illustration) ? t.illustration[0] : t.illustration;

  const html = `
  <html>
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(t.nom)}</title>
    <style>
      body{font-family:Inter,Arial;padding:20px;color:#111}
      h1{font-family:Spicy,Inter,Arial;font-size:32px;color:#5b3bd3}
      img{max-width:350px;display:block;margin:10px 0;border-radius:12px}
      pre{white-space:pre-wrap;font-family:inherit}
    </style>
  </head>
  <body>
    <h1>${escapeHtml(t.nom)}</h1>

    ${photoSrc ? `<img src="${photoSrc}">` : ''}

    <p><strong>Trace :</strong> ${escapeHtml(t.trace || '')}</p>

    <p>${escapeHtml(t.description)}</p>

    <h3>Matériel</h3>
    <pre>${escapeHtml(t.materiel || '')}</pre>
  </body>
  </html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

/* -----------------------------------------------------------
   CHARGEMENT + RECHERCHE
----------------------------------------------------------- */
fetch("saf.json")
  .then(r => r.json())
  .then(json => {
    DATA = json;
    renderList(DATA);
  });

document.querySelector('#search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderList(DATA.filter(t =>
    t.nom.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    (t.materiel||"").toLowerCase().includes(q)
  ));
});
