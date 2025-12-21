
// ==================== SCRIPT 2 — Enchaînement perso ====================

exercices_assauts.js:219 Uncaught SyntaxError: Unexpected token '}'
randori.js:19 Loaded randori data from randori.json 18 items

function previewAssaut(a) {
  document.getElementById('previewAssautCard').innerHTML = `
    <div><strong>${a.assaut}</strong></div>
    <div style="font-style: italic;">🎯 ${a.objectif}</div>
    <div><strong>Étape 1 :</strong> ${a.deroule[0].texte}</div>
  `;
}

function updateSequencePreview() {
  const zone = document.getElementById('sequenceDisplay');

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
  el.textContent = txt;
  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 3000);
}

// Permet de retirer dynamiquement un assaut
window.removeFromSequence = removeFromSequence;
