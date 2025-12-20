let data = [];
let synth = window.speechSynthesis;
let currentUtter = null;
let stopRequested = false;

// ⚡️ Charger le JSON
fetch('exercices_assauts.json')
  .then(res => res.json())
  .then(json => {
    data = json.exercices;
    populateSelect();
    populateChecklist();
  });

function populateSelect() {
  const select = document.getElementById('selectAssaut');
  const configFilter = document.getElementById('filterConfig').value;

  select.innerHTML = '<option value="">Choisir un assaut</option>';
  data.forEach((ex, i) => {
    if (!configFilter || ex.configuration === configFilter) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = ex.assaut;
      select.appendChild(opt);
    }
  });
}

function populateChecklist() {
  const container = document.getElementById('techniquesList');
  container.innerHTML = "";
  data.forEach((ex, i) => {
    const lbl = document.createElement('label');
    lbl.style.display = "block";
    lbl.innerHTML = `<input type="checkbox" value="${i}"> ${ex.assaut}`;
    container.appendChild(lbl);
  });
}

document.getElementById('filterConfig').addEventListener('change', populateSelect);
document.getElementById('btnAssautRandom').addEventListener('click', () => {
  const filtered = data.filter(e => {
    const config = document.getElementById('filterConfig').value;
    return !config || e.configuration === config;
  });
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  const index = data.indexOf(random);
  document.getElementById('selectAssaut').value = index;
  showAssaut(index);
});

document.getElementById('selectAssaut').addEventListener('change', e => showAssaut(e.target.value));

function showAssaut(index) {
  const ex = data[index];
  if (!ex) return;
  const container = document.getElementById("assautCard");
  container.innerHTML = `
    <div class="fiche-card">
      <div class="fiche-row">
        <div class="fiche-left fiche-photo">
          <img src="${ex.image}" alt="illustration">
        </div>
        <div class="fiche-right">
          <div class="tech-title">${ex.assaut}</div>
          <p><strong>Objectif :</strong> ${ex.objectif}</p>
          <p><strong>Points-clés :</strong><ul>${ex.points_cles.map(p => `<li>${p}</li>`).join('')}</ul></p>
          <p><strong>Erreurs à éviter :</strong><ul>${ex.erreurs_a_eviter.map(p => `<li>${p}</li>`).join('')}</ul></p>
          <p><strong>Déroulé :</strong><ol>${ex.deroule.map(p => `<li>${p}</li>`).join('')}</ol></p>
        </div>
      </div>
    </div>`;
}

// 🔈 Lecture Assaut
document.getElementById('btnPlay1').addEventListener('click', () => {
  const i = document.getElementById('selectAssaut').value;
  if (i === "") return;
  speakAssaut(data[i]);
});

document.getElementById('btnStop1').addEventListener('click', () => {
  stopRequested = true;
  synth.cancel();
});

function speakAssaut(ex) {
  stopRequested = false;
  const rate = parseFloat(document.getElementById('speedRange').value);
  const fullText = `
    ${ex.assaut}. Objectif : ${ex.objectif}.
    Points-clés : ${ex.points_cles.join('. ')}.
    Erreurs à éviter : ${ex.erreurs_a_eviter.join('. ')}.
    Déroulé : ${ex.deroule.join('. ')}.
  `;
  const utter = new SpeechSynthesisUtterance(fullText);
  utter.lang = 'fr-FR';
  utter.rate = rate;
  currentUtter = utter;
  if (!stopRequested) synth.speak(utter);
}

// 📢 Lecture Enchaînement personnalisé
let sequenceTimeouts = [];

document.getElementById('btnPlay2').addEventListener('click', () => {
  stopRequested = false;
  const selected = Array.from(document.querySelectorAll('#techniquesList input:checked')).map(c => data[c.value]);
  if (selected.length === 0) return;

  const interval = parseInt(document.getElementById('intervalControl').value) * 1000;
  const rate = parseFloat(document.getElementById('speedRange').value || 1);
  document.getElementById('btnPlay2').disabled = true;

  // Pré-lancement avec son
  new Audio("bbp.mp3").play();

  setTimeout(() => {
    runSequence(selected, interval, rate);
  }, 5000);
});

function runSequence(list, interval, rate) {
  let i = 0;
  sequenceTimeouts = [];

  function playNext() {
    if (stopRequested || i >= list.length) {
      endSequence();
      return;
    }

    // Notification sonore
    const notif = new Audio("notif.mp3");
    notif.play();

    // Après son → lecture
    notif.onended = () => {
      const assaut = list[i].assaut;
      const utter = new SpeechSynthesisUtterance(assaut);
      utter.lang = 'fr-FR';
      utter.rate = rate;
      synth.speak(utter);
      utter.onend = () => {
        i++;
        const t = setTimeout(playNext, interval);
        sequenceTimeouts.push(t);
      };
    };
  }

  playNext();
}

document.getElementById('btnStop2').addEventListener('click', endSequence);

function endSequence() {
  stopRequested = true;
  synth.cancel();
  document.getElementById('btnPlay2').disabled = false;
  sequenceTimeouts.forEach(clearTimeout);
  
  const interval = parseInt(document.getElementById('intervalControl').value) * 1000;
  setTimeout(() => new Audio("bbp.mp3").play(), interval);
}

// Intervalles
document.getElementById('intervalControl').addEventListener('input', (e) => {
  document.getElementById('intervalValue').innerText = `${e.target.value}s`;
});

// Tabs switch
document.getElementById('tab1').addEventListener('click', () => {
  document.getElementById('ex1-container').style.display = 'block';
  document.getElementById('ex2-container').style.display = 'none';
});
document.getElementById('tab2').addEventListener('click', () => {
  document.getElementById('ex1-container').style.display = 'none';
  document.getElementById('ex2-container').style.display = 'block';
});
