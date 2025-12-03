// Chargement du JSON
let techniques = [];

fetch("tjkihon.json")
  .then(res => res.json())
  .then(data => {
    techniques = data;
    populateCategories(data);
    displayRandom(); // affichage initial
  });

// Remplir menu catégories
function populateCategories(data) {
  const select = document.getElementById("filterCategorie");
  const categories = [...new Set(data.map(t => t.categorie))];

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// Affichage d’une technique
function displayTechnique(tech) {
  const area = document.getElementById("kihonResult");

  area.innerHTML = `
    <div class="card">
      <h3>${tech.nom}</h3>
      <p><strong>Catégorie :</strong> ${tech.categorie}</p>
      <p>${tech.description.replace(/\n/g, "<br>")}</p>

      <img src="${tech.photo}" alt="${tech.nom}" class="photo">

      <iframe width="100%" height="200"
        src="${tech.video}"
        title="Vidéo"
        frameborder="0"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

// Recherche par texte
document.getElementById("searchKihon").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const found = techniques.find(t => t.nom.toLowerCase().includes(q));

  if (found) displayTechnique(found);
});

// Filtre catégorie
document.getElementById("filterCategorie").addEventListener("change", (e) => {
  const cat = e.target.value;
  const filtered = cat ? techniques.filter(t => t.categorie === cat) : techniques;

  if (filtered.length > 0) displayTechnique(filtered[0]);
});

// Bouton surprise
document.getElementById("btnRandomKihon").addEventListener("click", displayRandom);

function displayRandom() {
  if (techniques.length === 0) return;
  const randomTech = techniques[Math.floor(Math.random() * techniques.length)];
  displayTechnique(randomTech);
}
