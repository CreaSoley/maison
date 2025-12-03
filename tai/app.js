let techniques = [];

fetch("tjkihon.json")
  .then(res => res.json())
  .then(data => {
    techniques = data;
    populateCategories();
    // NE PAS afficher les techniques par défaut
    displayList([]);
  });

function populateCategories() {
  const select = document.getElementById("filterCategorie");
  const cats = [...new Set(techniques.map(t => t.categorie))];

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

/* ---------------------------------
   AFFICHAGE LISTE
---------------------------------- */

function displayList(list) {
  const box = document.getElementById("kihonList");
  box.innerHTML = "";

  if (list.length === 0) return;

  list.forEach(t => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.textContent = t.nom;
    div.addEventListener("click", () => showTechnique(t));
    box.appendChild(div);
  });
}

/* Recherche */
document.getElementById("searchKihon").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = techniques.filter(t => t.nom.toLowerCase().includes(q));
  displayList(filtered);
});

/* Filtre catégorie */
document.getElementById("filterCategorie").addEventListener("change", e => {
  const cat = e.target.value;
  const filtered = cat ? techniques.filter(t => t.categorie === cat) : [];
  displayList(filtered);
});

/* Surprise */
document.getElementById("btnRandomKihon").addEventListener("click", () => {
  if (techniques.length === 0) return;
  const t = techniques[Math.floor(Math.random() * techniques.length)];
  showTechnique(t);
});

/* Affichage détaillé */
function showTechnique(t) {
  document.getElementById("kihonResult").classList.remove("hidden");

  document.getElementById("techNom").textContent = t.nom;
  document.getElementById("techCat").textContent = "Catégorie : " + t.categorie;
  document.getElementById("techDesc").innerHTML = t.description.replace(/\n/g, "<br>");
  document.getElementById("techPhoto").src = t.photo;
  document.getElementById("techVideo").src = t.video;
}
