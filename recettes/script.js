/* ======================================================
   CONFIG
   ====================================================== */
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHntlP8qAseSjxxISs_fyoV12Ie8JZPXelkOWpXemy_HRCEYzs7UliTG2nTushmYjWH2gOYIknEczq/pub?gid=813880666&single=true&output=csv";

let recettes = [];

/* ======================================================
   LOAD CSV (PapaParse)
   ====================================================== */
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    recettes = results.data.map(r => sanitizeRecord(r));
    populateCategoryFilter();
    renderRecettes(recettes);
  },
  error: function(err){
    console.error("Erreur PapaParse", err);
    document.getElementById("displayArea").innerHTML = "<p style='color:#900'>Erreur de chargement des recettes.</p>";
  }
});

/* clean keys/values, ensure fields exist */
function sanitizeRecord(r){
  return {
    Horodateur: (r["Horodateur"] || "").trim(),
    Titre: (r["Titre"] || "").trim(),
    Catégorie: (r["Catégorie"] || "").trim(),
    Ingrédients: (r["Ingrédients"] || "").trim(),
    Matériel: (r["Matériel"] || "").trim(),
    "Nombre de personnes": (r["Nombre de personnes"] || "").trim(),
    Étapes: (r["Étapes"] || "").trim(),
    Photo: (r["Photo"] || "").trim()
  };
}

/* ======================================================
   RENDER
   ====================================================== */
function renderRecettes(list){
  const area = document.getElementById("displayArea");
  area.innerHTML = "";
  if(!list.length){
    area.innerHTML = "<p style='text-align:center;color:#666'>Aucune recette trouvée.</p>";
    return;
  }

  list.forEach((r, idx) => {
    const card = document.createElement("article");
    card.className = "recette-card";

    const imgHTML = r.Photo
      ? `<img src="${escapeHtml(r.Photo)}" alt="Photo ${escapeHtml(r.Titre)}" class="recette-img" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="no-img">Aucune image</div>`;

    card.innerHTML = `
      ${imgHTML}
      <div class="recette-content">
        <h2 class="recette-title">${escapeHtml(r.Titre)}</h2>
        <p><strong>Catégorie :</strong> ${escapeHtml(r.Catégorie)}</p>
        <p><strong>Nombre de personnes :</strong> ${escapeHtml(r["Nombre de personnes"])}</p>

        <div class="recette-sub">Ingrédients</div>
        <p>${nl2br(escapeHtml(r.Ingrédients))}</p>

        <div class="recette-sub">Matériel</div>
        <p>${nl2br(escapeHtml(r.Matériel))}</p>

        <div class="recette-sub">Étapes</div>
        <p>${nl2br(escapeHtml(r.Étapes))}</p>

        <div class="recette-buttons">
          <button class="btn-print" onclick="printRecette(${idx})">🖨️ Imprimer</button>
          <button class="btn-whatsapp" onclick="shareWhatsApp(${idx})">📱 WhatsApp</button>
        </div>
      </div>
    `;

    area.appendChild(card);
  });
}

/* ======================================================
   FUNCS UTILITAIRES
   ====================================================== */
function escapeHtml(s){
  if(!s) return "";
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function nl2br(s){
  return (s||"").replace(/\r\n|\r|\n/g,"<br>");
}

/* ======================================================
   CATEGORY FILTER
   ====================================================== */
function populateCategoryFilter(){
  const sel = document.getElementById("filterCategory");
  const cats = Array.from(new Set(recettes.map(r => r["Catégorie"]).filter(Boolean))).sort();
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

/* ======================================================
   SEARCH
   ====================================================== */
document.getElementById("quickSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = recettes.filter(r => {
    return (r.Titre||"").toLowerCase().includes(q) ||
           (r.Ingrédients||"").toLowerCase().includes(q) ||
           (r.Catégorie||"").toLowerCase().includes(q);
  });
  renderRecettes(filtered);
});

/* ======================================================
   CATEGORY CHANGE
   ====================================================== */
document.getElementById("filterCategory").addEventListener("change", (e) => {
  const val = e.target.value;
  if(!val) return renderRecettes(recettes);
  renderRecettes(recettes.filter(r => r.Catégorie === val));
});

/* ======================================================
   SURPRISE (random)
   ====================================================== */
document.getElementById("btnRandom").addEventListener("click", () => {
  if(!recettes.length) return;
  const pick = recettes[Math.floor(Math.random()*recettes.length)];
  renderRecettes([pick]);
});

/* ======================================================
   PRINT SINGLE RECIPE (nicely formatted)
   ====================================================== */
function printRecette(index){
  const r = recettes[index];
  if(!r) return;
  const win = window.open("", "_blank", "width=800,height=900");
  const html = `
    <html>
      <head>
        <title>${escapeHtml(r.Titre)}</title>
        <style>
          body{ font-family: Georgia, 'Times New Roman', serif; padding:24px; color:#111; }
          h1{ font-size:24px; margin-bottom:8px; }
          img{ max-width:100%; height:auto; border-radius:8px; margin-bottom:12px; }
          h2{ font-size:18px; margin-top:12px; color:#333; }
          p{ white-space:pre-wrap; }
          .meta{ color:#666; margin-bottom:8px; }
        </style>
      </head>
      <body>
        ${ r.Photo ? `<img src="${escapeHtml(r.Photo)}" alt="">` : '' }
        <h1>${escapeHtml(r.Titre)}</h1>
        <div class="meta"><strong>Catégorie :</strong> ${escapeHtml(r.Catégorie)} &nbsp;•&nbsp; <strong>Pour :</strong> ${escapeHtml(r["Nombre de personnes"])}</div>

        <h2>Ingrédients</h2>
        <p>${nl2br(escapeHtml(r.Ingrédients))}</p>

        <h2>Matériel</h2>
        <p>${nl2br(escapeHtml(r.Matériel))}</p>

        <h2>Étapes</h2>
        <p>${nl2br(escapeHtml(r.Étapes))}</p>

        <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 100); }</script>
      </body>
    </html>
  `;
  win.document.write(html);
  win.document.close();
}

/* ======================================================
   WHATSAPP SHARE (per recipe)
   ====================================================== */
function shareWhatsApp(index){
  const r = recettes[index];
  if(!r) return;
  const text = `Recette: ${r.Titre}%0ACatégorie: ${r.Catégorie}%0AIngrédients:%0A${encodeURIComponent(r.Ingrédients)}%0AVoir la page: ${encodeURIComponent(window.location.href)}`;
  const url = `https://wa.me/?text=${text}`;
  window.open(url,'_blank');
}
