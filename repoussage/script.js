// script.js - calendrier statique + modal + neige
let ACTIVITIES = {};
let TODAY = 1;

/* ---------- chargement des données ---------- */
async function loadActivities() {
  try {
    const res = await fetch('calendrier.json', {cache: "no-store"});
    if (!res.ok) throw new Error("Fichier calendrier.json introuvable");
    ACTIVITIES = await res.json();
  } catch (e) {
    // si pas de fichier, tenter localStorage (admin)
    const fromLS = localStorage.getItem('calendrier_activites');
    if (fromLS) {
      try { ACTIVITIES = JSON.parse(fromLS); }
      catch { ACTIVITIES = {}; }
    } else {
      // fallback : générer 24 cases vides
      for (let i=1;i<=24;i++) ACTIVITIES[String(i)] = { date: `${i} décembre`, fairy: `Contenu du jour ${i}`, pdf: ""};
    }
  }
}

/* ---------- calcul Aujourd'hui (1..24) ---------- */
function calcTodayNumber(){
  const today = new Date();
  const month = today.getMonth() + 1; // 1..12
  const day = today.getDate();

  if (month < 12) return 1;
  if (month > 12 || day > 24) return 24;
  return day;
}

/* ---------- format 3 lignes (jours FR) ---------- */
function format3Lines(dateStr){
  // Attendu exemple : "Lundi 1 décembre" ou "1 décembre"
  if (!dateStr) return dateStr || "";
  // extraire chiffre & mois
  const match = dateStr.match(/(\d{1,2})\s*([^\d]+)/);
  let jourNum = 0, moisStr = "";
  if (match) {
    jourNum = parseInt(match[1],10);
    moisStr = match[2].trim().toLowerCase();
  } else {
    // fallback: dateStr contains number at start?
    const parts = dateStr.split(' ');
    jourNum = parseInt(parts[0],10) || 1;
    moisStr = parts[1] || 'décembre';
  }

  // mois -> index
  const moisMap = {
    "janvier":0, "février":1, "fevrier":1, "mars":2, "avril":3, "mai":4, "juin":5,
    "juillet":6, "août":7, "aout":7, "septembre":8, "octobre":9, "novembre":10, "décembre":11, "decembre":11
  };
  const moisIndex = (moisMap[moisStr] !== undefined) ? moisMap[moisStr] : 11;
  const year = new Date().getFullYear();
  const d = new Date(year, moisIndex, jourNum);
  const jours = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
  const jourSemaine = jours[d.getDay()];
  const jourAff = (jourNum === 1) ? "1er" : jourNum;
  return `${jourSemaine}\n${jourAff}\n${moisStr}`;
}

/* ---------- rendu calendrier ---------- */
function initCalendar(){
  const cal = document.getElementById('calendar');
  cal.innerHTML = "";
  for (let d=1; d<=24; d++){
    const act = ACTIVITIES[String(d)] || {date: `${d} décembre`, fairy: "", pdf:""};
    const shortDate = format3Lines(act.date || `${d} décembre`);
    const div = document.createElement('div');
    div.className = 'door';
    if (d <= TODAY) div.classList.add('halo');
    div.innerHTML = `<div class="label">${shortDate}</div>`;
    div.onclick = () => openDay(d);
    cal.appendChild(div);
  }
}

/* ---------- modal ---------- */
function openDay(day){
  const act = ACTIVITIES[String(day)] || {date:`${day} décembre`, fairy:"", pdf:""};
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const text = document.getElementById('modalText');
  const pdfZone = document.getElementById('pdfZone');

  if (day > TODAY){
    title.innerText = "Patience…";
    text.innerText = "Cette case ne pourra s’ouvrir que le " + (act.date || (`${day} décembre`)) + ".";
    pdfZone.innerHTML = "";
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    return;
  }

  title.innerText = act.date || `${day} décembre`;
  text.innerText = act.fairy || "Aucun contenu pour l'instant.";
  pdfZone.innerHTML = "";

  if (act.pdf){
    // rendre un lien "safe" si besoin
    const safe = act.pdf.replace('/open?','/uc?');
    pdfZone.innerHTML = `<a class="pdfBtn" href="${safe}" target="_blank" rel="noreferrer noopener">Clique ici</a>`;
  }

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
}

document.getElementById?.('closeBtn')?.addEventListener?.('click', closeModal);

/* fallback attach because old browsers */
window.addEventListener('click', (e)=>{
  const modal = document.getElementById('modal');
  if (!modal) return;
  if (e.target === modal) closeModal();
});

/* ---------- neige (canvas) ---------- */
function initSnow(){
  const snow = document.getElementById('snowCanvas');
  if (!snow) return;
  const ctx = snow.getContext('2d');
  let flakes = [];

  function resize(){
    snow.width = window.innerWidth;
    snow.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i=0;i<120;i++){
    flakes.push({ x: Math.random()*snow.width, y: Math.random()*snow.height, r: 0.8+Math.random()*2.4, s: 0.4+Math.random()*1.6 });
  }

  function step(){
    ctx.clearRect(0,0,snow.width,snow.height);
    ctx.fillStyle = "white";
    for (const f of flakes){
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
      ctx.fill();
      f.y += f.s;
      f.x += Math.sin(f.y*0.01) * 0.7;
      if (f.y > snow.height + 5){
        f.y = -10;
        f.x = Math.random()*snow.width;
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

/* ---------- init global ---------- */
(async function(){
  await loadActivities();
  TODAY = calcTodayNumber();
  initCalendar();
  initSnow();

  // bouton fermer (après DOM ready)
  document.getElementById('closeBtn').addEventListener('click', closeModal);
})();
