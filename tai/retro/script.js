let ACTIVITIES = [];
let currentIndex = 0;

// 🔧 CORRECTION : Date fixe pour février 2026 à 00:00:00 (heure locale)
const TARGET_DATE = new Date(2026, 1, 8, 0, 0, 0);

const openSound = document.getElementById('openSound');

/* ---------- chargement JSON ---------- */
async function loadActivities() {
  try {
    // 🔧 Ajout d'un timestamp pour éviter le cache GitHub Pages
    const res = await fetch(`calendrier.json?t=${Date.now()}`, {cache:"no-store"});
    if(!res.ok) throw new Error();
    ACTIVITIES = await res.json();
  } catch(e){
    ACTIVITIES = [];
    console.error("Erreur chargement JSON:", e);
  }
}

/* ---------- tracker ---------- */
function markDayOpened(day){
  const opened = JSON.parse(localStorage.getItem('openedDays')||"[]");
  if(!opened.includes(day)){
    opened.push(day);
    localStorage.setItem('openedDays', JSON.stringify(opened));
  }
}

function isDayOpened(day){
  const opened = JSON.parse(localStorage.getItem('openedDays')||"[]");
  return opened.includes(day);
}

function updateTracker(){
  const tracker = document.getElementById('tracker');
  tracker.innerHTML = "";
  ACTIVITIES.forEach((_,i)=>{
    const div = document.createElement('div');
    div.className = "day" + (isDayOpened(i+1)?" opened":"");
    div.addEventListener('click', ()=>{
      if(isDayOpened(i+1)) showDoor(i);
    });
    tracker.appendChild(div);
  });
}

/* ---------- compte à rebours CORRIGÉ ---------- */
function initCountdown(){
  const countdownEl = document.getElementById('countdown');
  
  function update(){
    const now = new Date();
    const diff = TARGET_DATE - now;
    
    // 🔧 CORRECTION : Gestion des 3 cas
    if(diff > 0){
      // Avant l'événement
      const d = Math.floor(diff/(1000*60*60*24));
      const h = Math.floor((diff/(1000*60*60))%24);
      const m = Math.floor((diff/(1000*60))%60);
      const s = Math.floor((diff/1000)%60);
      countdownEl.innerText = `Jours restants : ${d} | ${h}h ${m}m ${s}s`;
      countdownEl.style.color = "white"; // Couleur normale
    } else if(diff > -86400000){
      // Le jour J (moins de 24h après minuit)
      countdownEl.innerText = "C'est aujourd'hui le passage de grade !";
      countdownEl.style.color = "#c49b66"; // Accent pour le jour J
    } else {
      // Après l'événement
      countdownEl.innerText = "L'événement est terminé !";
      countdownEl.style.color = "#ff6b6b"; // Couleur différente
    }
  }
  
  update();
  setInterval(update, 1000);
}

/* ---------- trouver index du jour ---------- */
function findTodayIndex(){
  const today = new Date();
  return ACTIVITIES.findIndex(act=>{
    const match = act.jour.match(/(\d{1,2})\s+[^\d]+$/);
    if(!match) return false;
    const actDay = parseInt(match[1],10);
    const actMonth = act.jour.toLowerCase().includes("décembre") ? 11 :
                     act.jour.toLowerCase().includes("février") ? 1 : today.getMonth();
    return actDay === today.getDate() && actMonth === today.getMonth();
  });
}

/* ---------- afficher la carte ---------- */
function showDoor(index){
  if(index<0 || index>=ACTIVITIES.length) return;
  currentIndex = index;

  const act = ACTIVITIES[index] || {jour:`Jour inconnu`, contenu_1:"", contenu_2:"", themes:"", type:"", duree_minutes:""};
  const today = new Date();
  const match = act.jour.match(/(\d{1,2})\s+[^\d]+$/);
  const actDay = match ? parseInt(match[1],10) : 1;
  const actMonth = act.jour.toLowerCase().includes("décembre") ? 11 :
                   act.jour.toLowerCase().includes("février") ? 1 : today.getMonth();
  const actDate = new Date(today.getFullYear(), actMonth, actDay);

  const container = document.getElementById('doorContainer');
  container.classList.remove('reveal');
  container.innerHTML = `
    <div class="door-overlay">Cliquez pour découvrir la séance du jour</div>
    <div class="jour">${act.jour}</div>
    <div class="texte">
      <strong>Thèmes :</strong> ${act.themes}\n
      <strong>Type :</strong> ${act.type}\n
      <strong>Durée :</strong> ${act.duree_minutes} min\n\n
      ${act.contenu_1}\n\n
      ${act.contenu_2}
    </div>
  `;

  const overlay = container.querySelector('.door-overlay');
  if(actDate<=today){
    overlay.addEventListener('click', function reveal(){
      overlay.classList.add('hidden');
      container.classList.add('reveal');
      markDayOpened(index+1);
      updateTracker();
      openSound.play();
      overlay.removeEventListener('click', reveal);
    });
  } else {
    overlay.innerText = `Cette case ne peut être ouverte que le ${act.jour}.`;
  }
}

/* ---------- navigation entre jours ouverts ---------- */
function initNavigation(){
  document.getElementById('prevBtn').addEventListener('click', ()=>{
    let i = currentIndex-1;
    while(i>=0 && !isDayOpened(i+1)) i--;
    if(i>=0) showDoor(i);
  });
  document.getElementById('nextBtn').addEventListener('click', ()=>{
    let i = currentIndex+1;
    while(i<ACTIVITIES.length && !isDayOpened(i+1)) i++;
    if(i<ACTIVITIES.length) showDoor(i);
  });
}

/* ---------- init ---------- */
(async function(){
  await loadActivities();
  initCountdown();
  updateTracker();
  initNavigation();
  const todayIndex = findTodayIndex();
  showDoor(todayIndex>=0?todayIndex:0);
})();
