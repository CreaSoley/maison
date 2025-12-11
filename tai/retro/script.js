let ACTIVITIES = [];
const TARGET_DATE = new Date(new Date().getFullYear(), 1, 8); // 8 février

/* ---------- chargement des données ---------- */
async function loadActivities() {
  try {
    const res = await fetch('calendrier.json', { cache: "no-store" });
    if (!res.ok) throw new Error("Fichier calendrier.json introuvable");
    ACTIVITIES = await res.json();
  } catch (e) {
    const fromLS = localStorage.getItem('calendrier_activites');
    if (fromLS) {
      try { ACTIVITIES = JSON.parse(fromLS); }
      catch { ACTIVITIES = []; }
    }
  }
}

/* ---------- calcul jours restants avant le passage ---------- */
function calcTodayNumber() {
  const now = new Date();
  const diffTime = TARGET_DATE - now; // ms
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/* ---------- tracker jours ouverts ---------- */
function markDayOpened(day) {
  const opened = JSON.parse(localStorage.getItem('openedDays') || "[]");
  if (!opened.includes(day)) {
    opened.push(day);
    localStorage.setItem('openedDays', JSON.stringify(opened));
  }
}

function isDayOpened(day) {
  const opened = JSON.parse(localStorage.getItem('openedDays') || "[]");
  return opened.includes(day);
}

/* ---------- format 3 lignes pour le calendrier ---------- */
function format3Lines(dateStr) {
  if (!dateStr) return "";
  const match = dateStr.match(/(\d{1,2})\s*([^\d]+)/);
  let jourNum = 0, moisStr = "";
  if (match) {
    jourNum = parseInt(match[1], 10);
    moisStr = match[2].trim().toLowerCase();
  } else {
    const parts = dateStr.split(' ');
    jourNum = parseInt(parts[0], 10) || 1;
    moisStr = parts[1] || 'février';
  }

  const moisMap = {
    "janvier":0, "février":1, "fevrier":1, "mars":2, "avril":3, "mai":4, "juin":5,
    "juillet":6, "août":7, "aout":7, "septembre":8, "octobre":9, "novembre":10, "décembre":11, "decembre":11
  };
  const moisIndex = moisMap[moisStr] !== undefined ? moisMap[moisStr] : 1;
  const year = new Date().getFullYear();
  const d = new Date(year, moisIndex, jourNum);
  const jours = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
  const jourSemaine = jours[d.getDay()];
  const jourAff = (jourNum === 1) ? "1er" : jourNum;
  return `${jourSemaine}\n${jourAff}\n${moisStr}`;
}

/* ---------- rendu calendrier ---------- */
function initCalendar() {
  const cal = document.getElementById('calendar');
  cal.innerHTML = "";
  const TODAY = new Date();
  
  ACTIVITIES.forEach((act, index) => {
    const div = document.createElement('div');
    div.className = 'door';
    const shortDate = format3Lines(act.jour || `${index+1} février`);
    div.innerHTML = `<div class="label">${shortDate}</div>`;
    
    const actDate = new Date(act.jour ? act.jour.replace(/\s+/g,' ') : '');
    if (!isNaN(actDate) && actDate <= TODAY) div.classList.add('halo');
    if (isDayOpened(index+1)) div.classList.add('opened');

    div.onclick = () => openDay(index+1);
    cal.appendChild(div);
  });
}

/* ---------- modal ---------- */
function openDay(day) {
  const act = ACTIVITIES[day-1] || { jour:`Jour ${day}`, themes:"", type:"", duree_minutes:"", contenu_1:"", contenu_2:"" };
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const text = document.getElementById('modalText');
  const pdfZone = document.getElementById('pdfZone');

  const today = new Date();
  const actDate = new Date(act.jour ? act.jour.replace(/\s+/g,' ') : today);

  if (actDate > today) {
    title.innerText = "Patience…";
    text.innerText = "Cette case ne pourra s’ouvrir que le " + (act.jour || `jour ${day}`) + ".";
    pdfZone.innerHTML = "";
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    return;
  }

  markDayOpened(day);
  const div = document.querySelectorAll('.door')[day-1];
  div.classList.add('opened');

  title.innerText = act.jour || `Jour ${day}`;
  text.innerHTML = `
    <strong>Thèmes :</strong> ${act.themes || ""}<br>
    <strong>Type :</strong> ${act.type || ""}<br>
    <strong>Durée :</strong> ${act.duree_minutes || ""} min<br><br>
    ${act.contenu_1 || ""}<br><br>
    ${act.contenu_2 || ""}
  `;

  pdfZone.innerHTML = act.pdf ? `<a class="pdfBtn" href="${act.pdf}" target="_blank" rel="noreferrer noopener">Clique ici</a>` : "";

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
}

/* ---------- neige ---------- */
function initSnow() {
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
  initCalendar();
  initSnow();
  document.getElementById('closeBtn').addEventListener('click', closeModal);
})();
