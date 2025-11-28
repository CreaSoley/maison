/* ----------------------------------------------------------
   CONFIGURATION
----------------------------------------------------------- */
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHntlP8qAseSjxxISs_fyoV12Ie8JZPXelkOWpXemy_HRCEYzs7UliTG2nTushmYjWH2gOYIknEczq/pub?gid=813880666&single=true&output=csv";

let recettes = [];

/* ----------------------------------------------------------
   CHARGEMENT CSV
----------------------------------------------------------- */
async function loadCSV() {
  const response = await fetch(CSV_URL);
  const text = await response.text();

  // Convertir en lignes
  const rows = text.split("\n").map(r => r.trim());
  
  // Lire en-têtes
  const headers = rows[0].split(",");

  // Convertir en objets
  recettes = rows.slice(1).map(row => {
    const values = row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // CSV sécurisé
    const obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] ? values[i].replace(/^"|"$/g, "") : "";
    });

    return obj;
  });

  fillCategoryFilter();
  displayRecettes(recettes);
}

/* ----------------------------------------------------------
   REMPLIR FILTRE CATÉGORIES
----------------------------------------------------------- */
function fillCategoryFilter() {
  const select = document.getElementById("filterCategory");
  const categories = [...new Set(recettes.map(r => r["Catégorie"]))].sort();

  categories.forEach(cat => {
    if (cat.trim() !== "") {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    }
  });
}

/* ----------------------------------------------------------
   AFFICHAGE DES RECETTES
----------------------------------------------------------- */
function displayRecettes(list) {
  const area = document.getElementById("displayArea");
  area.innerHTML = "";

  if (!list.length) {
    area.innerHTML = `<p style="text-align:center;margin-top:20px;color:#888">Aucune recette trouvée.</p>`;
    return;
  }

  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "recette-card";

    const imageHTML = r["Photo"]
      ? `<img src="${r["Photo"]}" class="recette-img" alt="Photo de ${r["Titre"]}">`
      : `<div class="no-img">Aucune image</div>`;

    card.innerHTML = `
      ${imageHTML}

      <h2 class="recette-title">${r["Titre"]}</h2>
      <p><strong>Catégorie :</strong> ${r["Catégorie"]}</p>
      <p><strong>Nombre de personnes :</strong> ${r["Nombre de personnes"]}</p>

      <h3>Ingrédients</h3>
      <p>${r["Ingrédients"].replace(/\n/g, "<br>")}</p>

      <h3>Matériel</h3>
      <p>${r["Matériel"].replace(/\n/g, "<br>")}</p>

      <h3>Étapes</h3>
      <p>${r["Étapes"].replace(/\n/g, "<br>")}</p>

      <div class="recette-buttons">
        <button class="btn-print" onclick="printRecette('${r["Titre"]}')">🖨️ Imprimer</button>
        <button class="btn-whatsapp" onclick="shareWhatsApp('${encodeURIComponent(r["Titre"])}')">📱 WhatsApp</button>
      </div>
    `;

    area.appendChild(card);
  });
}

/* ----------------------------------------------------------
   IMPRIMER UNE RECETTE
----------------------------------------------------------- */
function printRecette(titre) {
  window.print();
}

/* ----------------------------------------------------------
   PARTAGE WHATSAPP
----------------------------------------------------------- */
function shareWhatsApp(titre) {
  const url = `https://wa.me/?text=Voici une recette : ${titre}`;
  window.open(url, "_blank");
}

/* ----------------------------------------------------------
   RECHERCHE RAPIDE
----------------------------------------------------------- */
document.getElementById("quickSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();

  const filtered = recettes.filter(r =>
    r["Titre"].toLowerCase().includes(q) ||
    r["Ingrédients"].toLowerCase().includes(q) ||
    r["Catégorie"].toLowerCase().includes(q)
  );

  displayRecettes(filtered);
});

/* ----------------------------------------------------------
   FILTRE PAR CATÉGORIE
----------------------------------------------------------- */
document.getElementById("filterCategory").addEventListener("change", (e) => {
  const cat = e.target.value;

  if (!cat) {
    displayRecettes(recettes);
    return;
  }

  const filtered = recettes.filter(r => r["Catégorie"] === cat);
  displayRecettes(filtered);
});

/* ----------------------------------------------------------
   BOUTON SURPRISE
----------------------------------------------------------- */
document.getElementById("btnRandom").addEventListener("click", () => {
  if (recettes.length === 0) return;
  const r = recettes[Math.floor(Math.random() * recettes.length)];
  displayRecettes([r]);
});

/* ----------------------------------------------------------
   LANCEMENT
----------------------------------------------------------- */
loadCSV();
