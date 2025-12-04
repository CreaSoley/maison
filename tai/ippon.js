// ippon.js – version corrigée pour correspondre aux IDs du HTML fourni
// - corrige les IDs (filterSide, accordionList, selectAttack, selectSide, resultCard, surpriseResult)
// - remplit automatiquement la liste des attaques dans le select
// - crée les accordéons dans #accordionList
// - affiche la fiche détaillée dans #resultCard
// - affiche surprise dans #surpriseResult

const techniques = [
  { attaque: "Oi Tsuki Jodan", cote: "droite", esquive: "Tai sabaki diagonal extérieur, léger pivot de hanche", blocage: "jodan age-uke en avançant", defense: "contrôle du poignet → empi uchi au plexus", video: "https://www.youtube.com/embed/Rp1drfqOMKY" },
  { attaque: "Oi Tsuki Jodan", cote: "gauche", esquive: "decrire esquive", blocage: "jodan age uke avec rotation du buste.", defense: "tate tsuki chudan puis mae geri chudan (position contrôlée).", video: "https://www.youtube.com/embed//W1C3zZQ4KtQ" },
  { attaque: "Oi Tsuki Chudan", cote: "droite", esquive: "exterieur gauche", blocage: "ngashi uke → saisie poignet", defense: "uraken tsuki", video: "https://www.youtube.com/embed/ynE0eX2jpXc" },
  { attaque: "Oi Tsuki Chudan", cote: "gauche", esquive: "Pas intérieur rapide vers la droite (tai sabaki intérieur).", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/L18tYBdkTdg" },
  { attaque: "Mae Geri", cote: "droite", esquive: "déplacement extérieur gauche", blocage: "blocage gedan barai déviant", defense: "yoko geri gedan creux genou", video: "https://www.youtube.com/embed/rq67slGGZAw" },
  { attaque: "Mae Geri", cote: "droite", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/mq8B1Xq9050" },
  { attaque: "Mawashi Geri", cote: "droite", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/UK4E4PgYw-g" },
  { attaque: "Mawashi Geri", cote: "gauche", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/d-YZ8euC_YQ?" },
  { attaque: "Yoko geri", cote: "droite", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/d-YZ8euC_YQ?" },
  { attaque: "Yoko geri", cote: "gauche", esquive: "decrire esquive", blocage: "decrire blocage", defense: "décrire défense", video: "https://www.youtube.com/embed/oSPe3ER_YdQ" }
];

// Helpers
function uniqAttaques() {
  const s = new Set();
  techniques.forEach(t => s.add(t.attaque));
  return Array.from(s);
}

// Module: Remplir selectAttack
function populateAttackSelect() {
  const sel = document.getElementById('selectAttack');
  if (!sel) return;
  const attaques = uniqAttaques();
  attaques.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  });
}

// Module 1: accordéon par côté (filterSide -> accordionList)
function initAccordionModule() {
  const sideSel = document.getElementById('filterSide');
  const list = document.getElementById('accordionList');
  if (!sideSel || !list) return;

  sideSel.addEventListener('change', () => {
    const side = sideSel.value;
    list.innerHTML = '';
    if (!side) return;

    const filtered = techniques.filter(t => t.cote.toLowerCase() === side.toLowerCase());
    if (filtered.length === 0) {
      list.innerHTML = '<p>Aucune technique trouvée pour ce côté.</p>';
      return;
    }

    filtered.forEach((t, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ippon-accordion';

      // header button (technique) – en spicy via CSS
      const header = document.createElement('div');
      header.className = 'ippon-acc-header';
      header.textContent = t.attaque;
      header.setAttribute('role', 'button');
      header.tabIndex = 0;

      // content
      const content = document.createElement('div');
      content.className = 'ippon-acc-content arial';

      // structure with bold titles (Arial bold) and normal Arial for values
      content.innerHTML = `
        <p><strong>Tai sabaki :</strong> <span class="result-text">${t.esquive}</span></p>
        <p><strong>Blocage :</strong> <span class="result-text">${t.blocage}</span></p>
        <p><strong>Défense :</strong> <span class="result-text">${t.defense}</span></p>
      `;

      // toggle
      header.addEventListener('click', () => {
        const isOpen = content.style.display === 'block';
        content.style.display = isOpen ? 'none' : 'block';
      });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') header.click();
      });

      wrapper.appendChild(header);
      wrapper.appendChild(content);
      list.appendChild(wrapper);
    });
  });
}

// Module 2: sélectionner attaque + côté -> fiche détaillée
function initSelectModule() {
  const selAtt = document.getElementById('selectAttack');
  const selSide = document.getElementById('selectSide');
  const out = document.getElementById('resultCard');
  if (!selAtt || !selSide || !out) return;

  function render() {
    const att = selAtt.value;
    const side = selSide.value;
    if (!att || !side) {
      out.innerHTML = '';
      return;
    }

    const tech = techniques.find(t => t.attaque === att && t.cote.toLowerCase() === side.toLowerCase());
    if (!tech) {
      out.innerHTML = '<p>Aucune fiche correspondante.</p>';
      return;
    }

    out.innerHTML = `
      <div class="result-card">
        <div class="tech-title">${tech.attaque}</div>
        <div class="tech-side">${tech.cote}</div>

        <p><strong class="result-title">Tai sabaki :</strong></p>
        <p class="result-text">${tech.esquive}</p>

        <p><strong class="result-title">Blocage :</strong></p>
        <p class="result-text">${tech.blocage}</p>

        <p><strong class="result-title">Défense :</strong></p>
        <p class="result-text">${tech.defense}</p>

        <iframe class="video-frame" src="${tech.video}" frameborder="0" allowfullscreen></iframe>
      </div>
    `;
  }

  selAtt.addEventListener('change', render);
  selSide.addEventListener('change', render);
}

// Module 3: Surprise
function initSurprise() {
  const btn = document.getElementById('btnSurprise');
  const out = document.getElementById('surpriseResult') || document.getElementById('surpriseOutput') || document.getElementById('surpriseOutput');
  if (!btn || !out) return;

  btn.addEventListener('click', () => {
    const t = techniques[Math.floor(Math.random() * techniques.length)];
    out.innerHTML = `
      <div class="result-card">
        <div class="tech-title">${t.attaque}</div>
        <div class="tech-side">${t.cote}</div>

        <p><strong class="result-title">Tai sabaki :</strong></p>
        <p class="result-text">${t.esquive}</p>

        <p><strong class="result-title">Blocage :</strong></p>
        <p class="result-text">${t.blocage}</p>

        <p><strong class="result-title">Défense :</strong></p>
        <p class="result-text">${t.defense}</p>

        <iframe class="video-frame" src="${t.video}" frameborder="0" allowfullscreen></iframe>
      </div>
    `;
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  populateAttackSelect();
  initAccordionModule();
  initSelectModule();
  initSurprise();
});
