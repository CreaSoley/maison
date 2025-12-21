// ==================== CHARGEMENT DES DONNÉES ====================

let exercicesData = []; // Variable globale pour stocker les données

fetch('exercices_assauts.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur HTTP: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    exercicesData = data;
    console.log("✅ Données chargées :", exercicesData.length, "exercices");
    
    // Optionnel : Lancer un premier aperçu si la liste n'est pas vide
    if(exercicesData.length > 0) {
        // previewAssaut(exercicesData[0]); 
    }
  })
  .catch(error => {
    console.error("❌ Erreur chargement JSON:", error);
    document.body.innerHTML += `<div style="color:red; padding:20px;">ERREUR JSON: ${error}<br>Vérifiez que le fichier exercices_assauts.json est valide.</div>`;
  });
// ==================== SCRIPT 2 — Enchaînement perso ====================

// 1. Variable globale (sera remplie par le fetch)
let exercicesData = [];

// 2. Fonction de chargement (À mettre ici ou en haut)
fetch('exercices_assauts.json')
  .then(res => res.json())
  .then(data => {
    exercicesData = data;
    console.log("Chargement OK", data);
  })
  .catch(err => console.error("Erreur JSON:", err));


// 3. Tes fonctions existantes
function previewAssaut(a) {
  if (!a) return;
  document.getElementById('previewAssautCard').innerHTML = `
    <div><strong>${a.assaut}</strong></div>
    <div style="font-style: italic;">🎯 ${a.objectif}</div>
    <div><strong>Étape 1 :</strong> ${a.deroule[0].texte}</div>
  `;
}

function updateSequencePreview() {
  const zone = document.getElementById('sequenceDisplay');
  if (!zone) return; // Sécurité si l'élément n'existe pas

  if (selectedSequence.length === 0) {
    zone.innerHTML = '';
    zone.classList.remove('active');
    return;
  }

  const output = selectedSequence.map((a, i) => `
    <div class="sequence-item">
      <span>${i + 1}. ${a.assaut}</span>
      <button class="remove-btn" onclick="removeFromSequence(${i})">✕</button>
    </div>
  `).join('');

  zone.innerHTML = `
    <div class="sequence-items">${output}</div>
    <div class="sequence-count">Total : ${selectedSequence.length} assaut(s)</div>
  `;
  zone.classList.add('active');
}

function removeFromSequence(index) {
  selectedSequence.splice(index, 1);
  updateSequencePreview();
}

// ==================== UTILITAIRES ====================
function speak(txt, rate = 1) {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'fr-FR';
    u.rate = rate;
    u.onend = res;
    synth.speak(u);
  });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function showStatus(txt) {
  const el = document.getElementById("sequenceStatus");
  if(el) {
      el.textContent = txt;
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 3000);
  }
}

window.removeFromSequence = removeFromSequence;
