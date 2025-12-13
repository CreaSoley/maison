let techniques = [];

fetch("tjkihon.json")
  .then(res => res.json())
  .then(data => {
    techniques = data;
    populateCategories();
    // On n'affiche rien au début
    displayList([]);
  })
  .catch(err => console.error("Erreur chargement JSON:", err));

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
   AFFICHAGE DE LA LISTE DE RECHERCHE
---------------------------------- */
function displayList(list) {
  const box = document.getElementById("kihonList");
  box.innerHTML = "";

  // Si la liste est vide (et que l'input est vide), on cache la boîte
  if (list.length === 0) return;

  // Création d'une petite liste stylée "Kawaii"
  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = "0";

  list.forEach(t => {
    const li = document.createElement("li");
    li.style.background = "#fff";
    li.style.padding = "10px";
    li.style.marginBottom = "5px";
    li.style.borderRadius = "10px";
    li.style.borderLeft = "5px solid var(--accent)";
    li.style.cursor = "pointer";
    li.style.fontSize = "0.9rem";
    li.textContent = t.nom;
    
    li.addEventListener("click", () => {
        showTechnique(t);
        box.innerHTML = ""; // Vide la liste après sélection
    });
    ul.appendChild(li);
  });
  box.appendChild(ul);
}

/* Recherche */
document.getElementById("searchKihon").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  if(q.length < 2) { 
      displayList([]); 
      return; 
  }
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
  document.getElementById("kihonList").innerHTML = ""; // Nettoie la recherche
});

/* Affichage détaillé */
function showTechnique(t) {
  const resultDiv = document.getElementById("kihonResult");
  resultDiv.classList.remove("hidden");

  document.getElementById("techNom").textContent = t.nom;
  document.getElementById("techCat").textContent = "🥋 " + t.categorie;
  document.getElementById("techDesc").innerHTML = t.description.replace(/\n/g, "<br>");

  // Gestion de la Photo
  const img = document.getElementById("techPhoto");
  if (t.photo && t.photo !== "") {
    img.src = t.photo;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  // Gestion de la Vidéo
  const video = document.getElementById("techVideo");
  if (t.video && t.video !== "") {
    // Conversion URL YouTube si nécessaire
    let videoUrl = t.video;
    if(videoUrl.includes("watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/");
    }
    video.src = videoUrl;
    video.style.display = "block";
  } else {
    video.src = "";
    video.style.display = "none";
  }

  // Scroll automatique vers le résultat sur mobile
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
