let DATA = [];

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  bindUI();
});

// 🔹 Charger le JSON
function loadData() {
  fetch("data.json")
    .then(res => res.json())
    .then(json => {
      DATA = json;

      populateSelectors();
      showEmpty();
    });
}

function bindUI() {
  document.getElementById("btnDisplay").onclick = applyFilters;
  document.getElementById("btnRandom").onclick = pickRandom;
  document.getElementById("quickSearch").oninput = quickSearch;

  document.getElementById("selectTechnique").onchange = () => {
    const v = document.getElementById("selectTechnique").value;
    if (v) showTechnique(v);
  };
}

// 🔹 Sélecteurs
function populateSelectors() {
  const selTech = document.getElementById("selectTechnique");
  const selCat = document.getElementById("selectCategory");
  const selLev = document.getElementById("selectLevel");

  selTech.innerHTML = `<option value="">— aucune —</option>` +
    DATA.map(t => `<option value="${t.nom}">${t.nom}</option>`).join("");

  const cats = [...new Set(DATA.map(t => t.categorie))].sort();
  selCat.innerHTML = `<option value="">— aucune —</option>` +
    cats.map(c => `<option>${c}</option>`).join("");

  const levs = [...new Set(DATA.map(t => t.niveau))].sort();
  selLev.innerHTML = `<option value="">— aucun —</option>` +
    levs.map(l => `<option>${l}</option>`).join("");
}

// 🔹 Actions
function applyFilters() {
  const name = document.getElementById("selectTechnique").value;
  const cat = document.getElementById("selectCategory").value;
  const lev = document.getElementById("selectLevel").value;

  if (name) return showTechnique(name);

  let list = DATA;
  if (cat) list = list.filter(t => t.categorie === cat);
  if (lev) list = list.filter(t => t.niveau === lev);

  renderGrid(list);
}

function quickSearch(e) {
  const q = e.target.value.toLowerCase().trim();
  if (!q) return showEmpty();

  const matches = DATA.filter(t =>
    t.nom.toLowerCase().includes(q) ||
    t.materiel.toLowerCase().includes(q)
  );
  renderGrid(matches);
}

function pickRandom() {
  if (!DATA.length) return;
  const r = DATA[Math.floor(Math.random() * DATA.length)];
  showTechnique(r.nom);
}

function showEmpty() {
  document.getElementById("displayArea").innerHTML =
    document.getElementById("emptyState").outerHTML;
}

function renderGrid(list) {
  const area = document.getElementById("displayArea");

  if (!list.length) {
    area.innerHTML = `<div class="card">Aucun résultat.</div>`;
    return;
  }

  area.innerHTML = `
    <div class="grid">
      ${list.map(t => renderCard(t)).join("")}
    </div>
  `;
}

function showTechnique(name) {
  const t = DATA.find(x => x.nom === name);
  if (!t)
    return (document.getElementById("displayArea").innerHTML =
      `<div class="card">Technique introuvable</div>`);

  document.getElementById("displayArea").innerHTML = `
    <div class="card">
      ${renderCard(t)}
    </div>
  `;
}

// 🔹 Carte
function renderCard(t) {
  const photo = t.photos
    ? `<img src="${t.photos}" />`
    : `<span style="color:#bbb;font-size:13px">Pas d’image</span>`;

  const videoButtons = t.youtube
    ? `<a class="link-btn video-btn" href="${t.youtube}" target="_blank">
         <span class="material-icons">play_circle</span> Vidéo
       </a>`
    : "";

  const galleryButton = t.galerie
    ? `<a class="link-btn gallery-btn" href="${t.galerie}" target="_blank">
         <span class="material-icons">photo_library</span> Galerie
       </a>`
    : "";

  // Matériel → liste à puces
  const materielList = t.materiel
    .split("\n")
    .filter(x => x.trim() !== "")
    .map(x => `<li>• ${x.trim()}</li>`)
    .join("");

  return `
    <div class="photo">${photo}</div>
    <div style="flex:1">
      <h3>${t.nom}</h3>
      <div class="meta">${t.categorie} • ${t.niveau}</div>

      <p style="margin-top:10px">${t.description}</p>

      <p><strong>Matériel :</strong></p>
      <ul>${materielList}</ul>

      <div style="margin-top:10px">${videoButtons} ${galleryButton}</div>

      <div class="actions">
        <button class="print-btn" onclick="printCard('${t.nom}')">
          <span class="material-icons">print</span> Imprimer
        </button>
      </div>
    </div>
  `;
}

// 🔹 Impression
function printCard(name) {
  const t = DATA.find(x => x.nom === name);
  if (!t) return;

  const html = `
    <html>
    <head>
      <title>${t.nom}</title>
      <style>
        body { font-family:Arial; padding:20px; }
        img { max-width:300px; }
      </style>
    </head>
    <body>
      <h1>${t.nom}</h1>
      <div><strong>Catégorie :</strong> ${t.categorie}</div>
      <div><strong>Niveau :</strong> ${t.niveau}</div><br>

      ${t.photos ? `<img src="${t.photos}" />` : ""}

      <p>${t.description}</p>

      <h3>Matériel :</h3>
      <pre>${t.materiel}</pre>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.print();
}
