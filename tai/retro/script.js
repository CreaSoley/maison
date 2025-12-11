let ACTIVITIES = [];
let currentIndex = 0;
const TARGET_DATE = new Date(new Date().getFullYear(), 1, 8); // 8 février
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
function resetTracker(){
  localStorage.setItem('openedDays', JSON.stringify([]));
}

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
      countdownEl.innerText = "C'est aujourd'hui le passage de grade !";
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

/* ---------- trouver index du jour ---------- */
function findTodayIndex(){
  const today = new Date();
  const dayNum = today.getDate();
  const monthNum = today.getMonth();

  return ACTIVITIES.findIndex(act=>{
    const match = act.jour.match(/(\d{1,2})\s+[^\d]+$/);
    if(!match) return false;
    const actDay = parseInt(match[1],10);
    const actMonth = act.jour.toLowerCase().includes("décembre") ? 11 :
                     act.jour.toLowerCase().includes("février") ? 1 : monthNum;
    return actDay === dayNum && actMonth === monthNum;
  });
}

/* ---------- afficher une case ---------- */
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
      <strong>Thèmes :</strong> ${act.themes}<br>
      <strong>Type :</strong> ${act.type}<br>
      <strong>Durée :</strong> ${act.duree_minutes} min<br><br>
      ${act.contenu_1}<br><br>
      ${act.contenu_2}
    </div>
  `;

  const overlay = container.querySelector('.door-overlay');

  // si la date est passée, permettre de dévoiler
  if(actDate<=today){
    overlay.addEventListener('click', function reveal(){
      overlay.classList.add('hidden');
      container.classList.add('reveal');
      markDayOpened(index+1);
      openSound.play();
      updateTracker();
      overlay.removeEventListener('click', reveal);
    });
  } else {
    overlay.innerText = `Cette case ne peut être ouverte que le ${act.jour}.`;
  }
}

/* ---------- tracker ---------- */
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

/* ---------- init ---------- */
(async function(){
  await loadActivities();
  resetTracker(); // remet le tracker à zéro
  initCountdown();
  const todayIndex = findTodayIndex();
  showDoor(todayIndex>=0?todayIndex:0);
})();
