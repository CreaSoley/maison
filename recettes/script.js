const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHntlP8qAseSjxxISs_fyoV12Ie8JZPXelkOWpXemy_HRCEYzs7UliTG2nTushmYjWH2gOYIknEczq/pub?gid=813880666&single=true&output=csv"; // <--- IMPORTANT

let recettes = [];

// Charger CSV
fetch(CSV_URL)
  .then(res => res.text())
  .then(data => {
    recettes = parseCSV(data);
    renderRecettes(recettes);
    remplirFiltres(recettes);
  });

// Convertit CSV → objets JS
function parseCSV(csv) {
  const lines = csv.split("\n").map(l => l.trim());
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const cols = line.split(",");
    let obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = cols[i] ? cols[i].replace(/^"|"$/g, "") : "";
    });

    return obj;
  });
}

// -------------------------------
// RENDER DES RECETTES
// -------------------------------
function renderRecettes(list) {
  const area = document.getElementById("displayArea");
  area.innerHTML = "";

  if (list.length === 0) {
    area.innerHTML = "<p style='text-align:center;color:#888'>Aucune recette trouvée</p>";
    return;
  }

  list.forEach(r => {
    const div = document.createElement("div");
    div.className = "card";

    // ingrédients → séparés par retour à la ligne
    const ingredients = r.ingredients ? r.ingredients.split("\\n").map(i => `<li>${i}</li>`).join("") : "";

    // étapes → idem
    const etapes = r.etapes ? r.etapes.split("\\n").map(i => `<li>${i}</li>`).join("") : "";

    div.innerHTML = `
      ${r.image ? `<img src="${r.image}" alt="">` : ""}
      <div class="card-title">${r.titre}</div>

      <div class="card-section-title">Catégorie</div>
      <p>${r.categorie}</p>

      <div class="card-section-title">Ingrédients</div>
      <ul>${ingredients}</ul>

      <div class="card-section-title">Étapes</div>
      <ol>${etapes}</ol>

      <div class="card-buttons">
        <button class="btn btn-gradient" onclick="window.print()">🖨️ Imprimer</button>
        <button class="btn btn-gradient" onclick="shareWhatsApp('${r.titre}')">📲 WhatsApp</button>
      </div>
    `;

    area.appendChild(div);
  });
}

// -------------------------------
// WHATSAPP SHARE
// -------------------------------
function shareWhatsApp(titre) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("Je te partage une recette : " + titre);
  window.open(`https://wa.me/?text=${text}%20${url}`);
}

// -------------------------------
// RECHERCHE RAPIDE
// -------------------------------
document.getElementById("quickSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = recettes.filter(r =>
    r.titre.toLowerCase().includes(q) ||
    r.ingredients.toLowerCase().includes(q)
  );
  renderRecettes(filtered);
});

// -------------------------------
// FILTRES
// -------------------------------
function remplirFiltres(recettes) {
  const selectCat = document.getElementById("filterCategory");
  const cats = [...new Set(recettes.map(r => r.categorie))];

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    selectCat.appendChild(opt);
  });
}

document.getElementById("filterCategory").addEventListener("change", e => {
  const cat = e.target.value;
  const res = cat ? recettes.filter(r => r.categorie === cat) : recettes;
  renderRecettes(res);
});

// -------------------------------
// BOUTON SURPRISE
// -------------------------------
document.getElementById("btnRandom").addEventListener("click", () => {
  const r = recettes[Math.floor(Math.random() * recettes.length)];
  renderRecettes([r]);
});
