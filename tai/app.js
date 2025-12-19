
let techniques = [];

fetch("tjkihon.json")
  .then(res => res.json())
  .then(data => {
    techniques = data;
    populateCategories();
    displayList([]); // Vide au départ
  })
  .catch(err => console.error("Erreur chargement JSON:", err));

function populateCategories() {
  const select = document.getElementById("filterCategorie");
  if (!select) return;
  const cats = [...new Set(techniques.map(t => t.categorie))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

/* -----------------------------------------------------------
   RECHERCHE RAPIDE & AFFICHAGE INSTANTANÉ
----------------------------------------------------------- */

const searchInput = document.getElementById("searchKihon");
const kihonList = document.getElementById("kihonList");

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  // 1. Si l'entrée est vide, on cache tout
  if (query.length === 0) {
    displayList([]);
    document.getElementById("kihonResult").classList.add("hidden");
    return;
  }

  // 2. Filtrage des techniques
  const filtered = techniques.filter(t => 
    t.nom.toLowerCase().includes(query) || 
    t.categorie.toLowerCase().includes(query)
  );

  // 3. Affichage de la liste de suggestions
  displayList(filtered);

  // 4. COMPORTEMENT "AUTO-SELECT" :
  // Si un seul résultat correspond parfaitement ou s'il n'en reste qu'un seul
  if (filtered.length === 1) {
    showTechnique(filtered[0]);
  } 
  // Ou si le premier résultat correspond exactement au nom saisi
  else if (filtered.length > 1 && filtered[0].nom.toLowerCase() === query) {
    showTechnique(filtered[0]);
  }
});

function displayList(list) {
  kihonList.innerHTML = "";
  
  // On limite l'affichage à 5 suggestions pour ne pas encombrer l'écran
  const maxSuggestions = list.slice(0, 5);

  if (maxSuggestions.length === 0 || (list.length === 1 && document.getElementById("searchKihon").value.toLowerCase() === list[0].nom.toLowerCase())) {
    return; // Ne rien afficher si vide ou si déjà sélectionné automatiquement
  }

  const container = document.createElement("div");
  container.className = "suggestions-container"; 
  // Style rapide en ligne pour l'intégration immédiate
  container.style.cssText = "background:white; border-radius:15px; border:2px solid var(--pink-2); margin-top:5px; overflow:hidden; box-shadow:var(--card-shadow);";

  maxSuggestions.forEach(t => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.style.cssText = "padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--pink-1); font-size:0.9rem; transition:0.2s;";
    item.innerHTML = `<strong>${t.nom}</strong> <small style="color:var(--accent)">(${t.categorie})</small>`;
    
    item.addEventListener("mouseover", () => item.style.backgroundColor = "var(--pink-1)");
    item.addEventListener("mouseout", () => item.style.backgroundColor = "transparent");
    
    item.addEventListener("click", () => {
      showTechnique(t);
      searchInput.value = t.nom; // Remplit la barre avec le nom complet
      kihonList.innerHTML = ""; // Vide les suggestions
    });
    container.appendChild(item);
  });

  kihonList.appendChild(container);
}

/* -----------------------------------------------------------
   AFFICHAGE DÉTAILLÉ
----------------------------------------------------------- */

function showTechnique(t) {
  const resultDiv = document.getElementById("kihonResult");
  resultDiv.classList.remove("hidden");

  document.getElementById("techNom").textContent = t.nom;
  document.getElementById("techCat").textContent = "🥋 " + t.categorie;
  document.getElementById("techDesc").innerHTML = t.description.replace(/\n/g, "<br>");

  // Photo
  const img = document.getElementById("techPhoto");
  if (t.photo && t.photo !== "") {
    img.src = t.photo;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  // Vidéo (avec conversion embed automatique)
  const video = document.getElementById("techVideo");
  if (t.video && t.video !== "") {
    let url = t.video.replace("watch?v=", "embed/");
    // Support pour les liens courts youtu.be
    url = url.replace("youtu.be/", "www.youtube.com/embed/");
    video.src = url;
    video.style.display = "block";
  } else {
    video.style.display = "none";
    video.src = "";
  }
}

// Bouton Surprise
document.getElementById("btnRandomKihon").addEventListener("click", () => {
  const t = techniques[Math.floor(Math.random() * techniques.length)];
  showTechnique(t);
  kihonList.innerHTML = "";
  searchInput.value = "";
});
