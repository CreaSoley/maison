// cles.js
// Encadré 1 — Clés articulaires (option A: photo if exists else nothing)
// Fichier attendu: randori_exercices.json (array)

let exercicesData = [];
let exercicesParTechnique = {};

async function chargerExercicesCles() {
  try {
    const resp = await fetch("randori_exercices.json");
    exercicesData = await resp.json();
    // regroupement par champ "video" (nom de la clé)
    exercicesParTechnique = {};
    exercicesData.forEach(ex => {
      const tech = ex.video || "Autre";
      if (!exercicesParTechnique[tech]) exercicesParTechnique[tech] = [];
      exercicesParTechnique[tech].push(ex);
    });
    remplirSelectTechniques();
  } catch (e) {
    console.error("Erreur chargement randori_exercices.json :", e);
  }
}

function remplirSelectTechniques() {
  const selTech = document.getElementById("selectCleTechnique");
  if (!selTech) return;
  selTech.innerHTML = '<option value="">Choisir une clé...</option>';
  Object.keys(exercicesParTechnique).forEach(tech => {
    const opt = document.createElement("option");
    opt.value = tech;
    opt.textContent = tech;
    selTech.appendChild(opt);
  });
}

function remplirSelectExercices(tech) {
  const selEx = document.getElementById("selectCleExercice");
  if (!selEx) return;
  selEx.innerHTML = '<option value="">Choisir un exercice...</option>';
  if (!tech || !exercicesParTechnique[tech]) return;
  exercicesParTechnique[tech].forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.exercice;
    opt.textContent = `${ex.exercice}. ${ex.titre ? ex.titre.trim() : ""}`;
    selEx.appendChild(opt);
  });
}

function afficherExercice(tech, num) {
  const cont = document.getElementById("cleCard");
  if (!cont) return;
  cont.innerHTML = "";
  if (!tech || !num) return;

  const ex = (exercicesParTechnique[tech] || []).find(e => e.exercice == num);
  if (!ex) return;

  // Option A: show photo if present, else nothing (no video)
  const hasPhoto = ex.photo && ex.photo.trim().length > 0;
  const photoHtml = hasPhoto ? `<div class="cle-photo"><img src="${ex.photo}" alt="${escapeHtml(ex.titre||'Photo')}"></div>` : "";

  cont.innerHTML = `
    <div class="cle-card">
      <div class="cle-row">
        <div class="cle-left">
          ${photoHtml}
        </div>

        <div class="cle-right">
          <h3 class="cle-title spicy">${escapeHtml(tech)} — Ex ${ex.exercice}</h3>
          <p><strong>Titre :</strong> ${escapeHtml(ex.titre||'')}</p>
          <p><strong>Objectif :</strong> ${escapeHtml(ex.objectif||'')}</p>
          <p><strong>Consigne :</strong><br>${escapeHtml(ex.consigne||'').replace(/\n/g, "<br>")}</p>

          <div class="cle-btns">
            <button class="btn primary" id="printClesBtn">🖨️ Imprimer</button>
            ${ex.video_exercice ? `<a class="btn ghost" href="${ex.video_exercice}" target="_blank" rel="noopener">🎥 Vidéo</a>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  // attach print handler
  const btn = document.getElementById("printClesBtn");
  if (btn) {
    btn.addEventListener("click", () => imprimerExerciceReliable(ex, tech));
  }
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Impression fiable : on ouvre une fenêtre, on injecte contenu + QR image, on attend le chargement de l'image QR et on print
function imprimerExerciceReliable(ex, tech) {
  const win = window.open("", "_blank");
  if (!win) return alert("Impossible d'ouvrir la fenêtre d'impression (bloqueur de popups?).");

  const qrUrl = ex.video_exercice ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ex.video_exercice)}` : "";

  // Build HTML for print window
  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fiche ${escapeHtml(tech)} - Ex ${ex.exercice}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
        h1 { font-family: 'Spicy', cursive; font-size: 1.6rem; color: #ff5fc1; }
        .row { display:flex; gap:20px; align-items:flex-start; }
        .photo { max-width: 7cm; max-height: 7cm; }
        .photo img { width:100%; height:auto; object-fit:cover; border-radius:8px; border:2px solid #ff9bdd; }
        .infos { flex:1; }
        .qr { margin-top: 12px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(tech)} — Exercice ${ex.exercice}</h1>
      <div class="row">
        ${ex.photo ? `<div class="photo"><img src="${ex.photo}" alt="photo"></div>` : ''}
        <div class="infos">
          <p><strong>Titre :</strong> ${escapeHtml(ex.titre||'')}</p>
          <p><strong>Objectif :</strong> ${escapeHtml(ex.objectif||'')}</p>
          <p><strong>Consigne :</strong><br>${escapeHtml(ex.consigne||'').replace(/\n/g, '<br>')}</p>
          ${qrUrl ? `<div class="qr"><p><strong>Vidéo :</strong></p><img id="qrImg" src="${qrUrl}" alt="qr"></div>` : ''}
        </div>
      </div>

      <script>
        // Wait for the QR image to load before printing (if present)
        (function(){
          const img = document.getElementById('qrImg');
          function doPrint() {
            setTimeout(() => { window.print(); }, 200); // small delay to ensure rendering
          }
          if (!img) {
            // no qr: print right away
            doPrint();
          } else {
            if (img.complete && img.naturalHeight !== 0) {
              doPrint();
            } else {
              img.addEventListener('load', doPrint);
              img.addEventListener('error', doPrint);
            }
          }
        })();
      </script>
    </body>
    </html>
  `;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  // loader
  chargerExercicesCles();

  const selTech = document.getElementById("selectCleTechnique");
  const selEx = document.getElementById("selectCleExercice");

  if (selTech) {
    selTech.addEventListener("change", (e) => {
      const tech = e.target.value;
      remplirSelectExercices(tech);
      document.getElementById("cleCard").innerHTML = "";
    });
  }

  if (selEx) {
    selEx.addEventListener("change", (e) => {
      const tech = document.getElementById("selectCleTechnique").value;
      const num = e.target.value;
      afficherExercice(tech, num);
    });
  }
});
