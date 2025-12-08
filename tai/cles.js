// -------------------------------------------------------------
// Chargement des données depuis randori-exercices.json
// -------------------------------------------------------------
let clesData = [];

fetch("randori-exercices.json")
  .then(res => res.json())
  .then(data => {
    clesData = data;
    remplirFiltresCles();
    remplirSelectCles();
  })
  .catch(err => console.error("Erreur chargement JSON clés :", err));


// -------------------------------------------------------------
// Remplit le filtre de type
// -------------------------------------------------------------
function remplirFiltresCles() {
  const select = document.getElementById("clesFilterType");
  const types = [...new Set(clesData.map(item => item.type))];

  types.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });

  select.addEventListener("change", filtrerCles);
}


// -------------------------------------------------------------
// Remplit la liste déroulante des clés
// -------------------------------------------------------------
function remplirSelectCles(filteredList = null) {
  const select = document.getElementById("clesSelect");
  select.innerHTML = "<option value=''>Choisir une clé</option>";

  const list = filteredList || clesData;

  list.forEach(cle => {
    const opt = document.createElement("option");
    opt.value = cle.id;
    opt.textContent = cle.nom;
    select.appendChild(opt);
  });

  select.addEventListener("change", afficherCle);
}


// -------------------------------------------------------------
// Filtrage des clés par type
// -------------------------------------------------------------
function filtrerCles() {
  const type = document.getElementById("clesFilterType").value;

  if (!type) {
    remplirSelectCles(clesData);
    document.getElementById("clesResult").innerHTML = "";
    return;
  }

  const filtrées = clesData.filter(c => c.type === type);
  remplirSelectCles(filtrées);
  document.getElementById("clesResult").innerHTML = "";
}


// -------------------------------------------------------------
// Affichage de la clé sélectionnée
// -------------------------------------------------------------
function afficherCle() {
  const id = document.getElementById("clesSelect").value;
  if (!id) {
    document.getElementById("clesResult").innerHTML = "";
    return;
  }

  const cle = clesData.find(c => c.id == id);
  if (!cle) return;

  document.getElementById("clesResult").innerHTML = `
    <div class="fiche-cle">
      <h3 class="spicy">${cle.nom}</h3>

      <div class="fiche-layout">
        <div class="fiche-photo">
          <img src="${cle.image}" alt="${cle.nom}">
        </div>

        <div class="fiche-info">
          <p><b>Type :</b> ${cle.type}</p>
          <p><b>Description :</b></p>
          <p>${cle.description || "Aucune description disponible."}</p>
        </div>
      </div>
    </div>
  `;
}


// -------------------------------------------------------------
// Impression de la fiche SEULEMENT pour les clés
// -------------------------------------------------------------
document.getElementById("btnPrintCles").addEventListener("click", () => {
  const card = document.getElementById("clesResult");

  if (!card || card.innerHTML.trim() === "") {
    alert("Veuillez d'abord sélectionner une clé à imprimer.");
    return;
  }

  window.print();
});
