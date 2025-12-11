let ACTIVITIES = [];
const TARGET_DATE = new Date(new Date().getFullYear(), 1, 8); // 8 février
const today = new Date();
const openSound = document.getElementById('openSound');

/* ---------- chargement JSON ---------- */
async function loadActivities() {
  try {
    const res = await fetch('calendrier.json', {cache:"no-store"});
    if(!res.ok) throw new Error();
    ACTIVITIES = await res.json();
  } catch(e){
    ACTIVITIES = []; 
  }
}

/* ---------- tracker localStorage ---------- */
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

/* ---------- compte à rebours ---------- */
function initCountdown(){
  const countdownEl = document.getElementById('countdown');
  function update(){
    const now = new Date();
    const diff = TARGET_DATE - now;
    if(diff<=0){
      countdownEl.innerText = "Aujourd'hui c'est le jour du passage !";
      return;
    }
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    countdownEl.innerText = `Jours restants : ${d} | ${h}h ${m}m ${s}s`;
  }
  update();
  setInterval(update,1000);
}

/* ---------- afficher la case du jour ---------- */
function showTodayDoor(){
  const container = document.getElementById('doorContainer');
  container.innerHTML = "";
  
  const dayIndex = ACTIVITIES.findIndex(act=>{
    const actDate = new Date(act.jour);
    return actDate.toDateString() === today.toDateString();
  });
  
  const act = ACTIVITIES[dayIndex] || {jour:`Jour inconnu`, contenu_1:"", contenu_2:"", themes:"", type:"", duree_minutes:""};
  
  markDayOpened(dayIndex+1);
  openSound.play();
  
  container.innerHTML = `
    <div class="jour">${act.jour}</div>
    <div class="texte">
      <strong>Thèmes :</strong> ${act.themes}<br>
      <strong>Type :</strong> ${act.type}<br>
      <strong>Durée :</strong> ${act.duree_minutes} min<br><br>
      ${act.contenu_1}<br><br>
      ${act.contenu_2}
    </div>
  `;
}

/* ---------- tracker bas de page ---------- */
function initTracker(){
  const tracker = document.getElementById('tracker');
  tracker.innerHTML = "";
  ACTIVITIES.forEach((_,i)=>{
    const div = document.createElement('div');
    div.className = "day" + (isDayOpened(i+1)?" opened":"");
    tracker.appendChild(div);
  });
}

/* ---------- init global ---------- */
(async function(){
  await loadActivities();
  initCountdown();
  showTodayDoor();
  initTracker();
})();
