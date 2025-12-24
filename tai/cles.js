// cles.js - encart 1 (keys exercises)
// expects randori_exercices.json (array)

let exercicesData = [];
let groupedByKey = {};

document.addEventListener("DOMContentLoaded", () => {
  initCles();
});

async function initCles() {
  try {
    const resp = await fetch("randori_exercices.json");
    if (!resp.ok) throw new Error("fetch failed");
    exercicesData = await resp.json();

    // group by "video" field (name of the key)
    groupedByKey = {};
    exercicesData.forEach(ex => {
      const key = (ex.video || "Autre").trim();
      if (!groupedByKey[key]) groupedByKey[key] = [];
      groupedByKey[key].push(ex);
    });

    populateKeySelect();
  } catch (err) {
    console.error("Erreur chargement randori_exercices.json:", err);
  }
}

function populateKeySelect() {
  const sel = document.getElementById("selectCle");
  if (!sel) return;
  sel.innerHTML = '<option value="">Choisir une clé</option>';
  Object.keys(groupedByKey).forEach(k => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = k;
    sel.appendChild(o);
  });

  sel.addEventListener("change", () => {
    const chosen = sel.value;
    populateExerciseSelect(chosen);
    document.getElementById("cleCard").innerHTML = "";
  });
}

function populateExerciseSelect(key) {
  const sel = document.getElementById("selectExercice");
  sel.innerHTML = '<option value="">Choisir un exercice</option>';
  if (!key || !groupedByKey[key]) return;
  groupedByKey[key].forEach((ex, idx) => {
    const o = document.createElement("option");
    o.value = idx; // index into grouped array
    o.textContent = `${ex.exercice}. ${ex.titre ? ex.titre.trim() : ""}`;
    sel.appendChild(o);
  });

  sel.onchange = () => {
    const keyVal = document.getElementById("selectCle").value;
    const idx = sel.value;
    if (idx === "") return;
    const ex = groupedByKey[keyVal][idx];
    renderCleCard(ex, keyVal);
  };
}

function renderCleCard(ex, keyName) {
  const container = document.getElementById("cleCard");
  container.innerHTML = "";

  // build left (photo) and right (infos)
  const leftHtml = ex.photo
    const leftHtml = ex.photo
    ? `<div class="fiche-left">
         <div class="fiche-photo">
           <img src="${escapeHtml(ex.photo)}" alt="" class="kawaii-img">
         </div>
       </div>`
    : `<div class="fiche-left"><div class="fiche-photo"><div style="padding:20px;color:#888">Pas d'image</div></div></div>`;

  const rightHtml = `
    <div class="fiche-right">
      <div class="fiche-card">
        <div class="cle-title tech-title">${escapeHtml(keyName)} — Ex ${escapeHtml(ex.exercice)}</div>
        <p><strong>Titre :</strong> ${escapeHtml(ex.titre || "")}</p>
        <p><strong>Objectif :</strong> ${escapeHtml(ex.objectif || "")}</p>
        <p><strong>Consigne :</strong><br>${escapeHtml(ex.consigne || "").replace(/\n/g,"<br>")}</p>

        <div class="btn-row">
          <button id="printBtn" class="btn primary">🖨️ Imprimer</button>
          ${ex.video_exercice ? `<a class="btn ghost" href="${escapeHtml(ex.video_exercice)}" target="_blank" rel="noopener">🎥 Vidéo</a>` : ""}
        </div>

        <div class="qr-zone">
          <canvas id="qrCanvas" width="150" height="150"></canvas>
        </div>
      </div>
    </div>`;

  const ficheRow = document.createElement("div");
  ficheRow.className = "fiche-row";
  ficheRow.innerHTML = leftHtml + rightHtml;
  container.appendChild(ficheRow);

  // generate QR on the canvas (use QRious)
  const canvas = document.getElementById("qrCanvas");
  if (canvas && typeof QRious === "function") {
    const value = ex.video_exercice || ex.qr || "";
    if (value) {
      const qr = new QRious({ element: canvas, value: value, size: 150 });
    } else {
      // clear
      const ctx = canvas.getContext && canvas.getContext("2d");
      if (ctx) { ctx.clearRect(0,0,canvas.width,canvas.height); }
    }
  }

  // attach print handler that ensures QR & image ready
  const btn = document.getElementById("printBtn");
  if (btn) {
    btn.onclick = () => printCle(ex, keyName);
  }
}

function printCle(ex, keyName) {
  // Build dataURL for QR from existing canvas (if any)
  const canvas = document.getElementById("qrCanvas");
  let qrDataUrl = "";
  if (canvas) {
    try { qrDataUrl = canvas.toDataURL("image/png"); } catch (e) { qrDataUrl = ""; }
  }

  // Photo data (may be remote)
  const photoSrc = ex.photo || "";

  // Create print window content with both image tags so preview shows images
  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fiche - ${escapeHtml(keyName)} Ex ${escapeHtml(ex.exercice)}</title>
      <style>
        body { font-family: Arial; padding: 18px; color: #222; }
        h1 { font-family: "Spicy", cursive; color: #ff4fb8; }
        .row { display:flex; gap:20px; align-items:flex-start; }
        .left { min-width: 7cm; max-width: 7cm; }
        .left img { width:100%; height:auto; object-fit:cover; border-radius:8px; border:2px solid #ffd1ea; }
        .right { flex:1; }
        .qr { margin-top:12px; }
        @media print {
          body { margin:0; }
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(keyName)} — Ex ${escapeHtml(ex.exercice)}</h1>
      <div class="row">
        <div class="left">${photoSrc ? `<img id="photoPrint" src="${escapeHtml(photoSrc)}">` : `<div style="width:100%;height:7cm;background:#f5f5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#aaa">Pas d'image</div>`}</div>
        <div class="right">
          <p><strong>Titre :</strong> ${escapeHtml(ex.titre||"")}</p>
          <p><strong>Objectif :</strong> ${escapeHtml(ex.objectif||"")}</p>
          <p><strong>Consigne :</strong><br>${escapeHtml(ex.consigne||"").replace(/\n/g,"<br>")}</p>
          ${qrDataUrl ? `<div class="qr"><p><strong>Vidéo (QR)</strong></p><img id="qrPrint" src="${qrDataUrl}" alt="qr"></div>` : ""}
        </div>
      </div>

      <script>
        // wait images to load before printing
        (function(){
          const imgs = Array.from(document.images);
          let count = imgs.length;
          if (count === 0) { window.print(); return; }
          const done = () => { count--; if (count<=0) setTimeout(()=>window.print(),120); };
          imgs.forEach(i => {
            if (i.complete) done();
            else { i.addEventListener('load', done); i.addEventListener('error', done); }
          });
        })();
      </script>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  if (!w) { alert("Impossible d'ouvrir la fenêtre d'impression. Vérifie le bloqueur de popups."); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
