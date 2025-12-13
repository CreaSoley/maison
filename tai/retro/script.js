let ACTIVITIES = [];
let currentIndex = 0;
const openSound = document.getElementById('openSound');

/* -------- date cible corrigée -------- */
function getNextFeb8() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 1, 8, 0, 0, 0);
  if (target <= now) target = new Date(now.getFullYear() + 1, 1, 8, 0, 0, 0);
  return target;
}
const TARGET_DATE = getNextFeb8();

/* -------- JSON -------- */
async function loadActivities() {
  const res = await fetch('calendrier.json', { cache:"no-store" });
  ACTIVITIES = await res.json();
}

/* -------- tracker -------- */
function markDayOpened(i){
  const o = JSON.parse(localStorage.getItem("openedDays")||"[]");
  if(!o.includes(i)) o.push(i);
  localStorage.setItem("openedDays", JSON.stringify(o));
}
function isDayOpened(i){
  return JSON.parse(localStorage.getItem("openedDays")||"[]").includes(i);
}
function updateTracker(){
  const t = document.getElementById("tracker");
  t.innerHTML="";
  ACTIVITIES.forEach((_,i)=>{
    const d = document.createElement("div");
    d.className = "day"+(isDayOpened(i+1)?" opened":"");
    t.appendChild(d);
  });
}

/* -------- countdown -------- */
function initCountdown(){
  const el = document.getElementById("countdown");
  function update(){
    const diff = TARGET_DATE - new Date();
    if(diff<=0){
      el.innerText = "C'est aujourd'hui le passage de grade !";
      return;
    }
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    el.innerText = `Jours restants : ${d} | ${h}h ${m}m ${s}s`;
  }
  update();
  setInterval(update,1000);
}

/* -------- date parsing -------- */
function getActDate(act){
  const m = act.jour.match(/(\d{1,2})/);
  const day = m ? parseInt(m[1],10) : 1;
  const month =
    act.jour.toLowerCase().includes("décembre") ? 11 :
    act.jour.toLowerCase().includes("février") ? 1 : 0;
  return new Date(new Date().getFullYear(), month, day);
}

/* -------- affichage -------- */
function showDoor(i){
  currentIndex = i;
  const act = ACTIVITIES[i];
  const container = document.getElementById("doorContainer");
  container.classList.remove("reveal");

  container.innerHTML = `
    <div class="door-overlay">Cliquez pour découvrir la séance du jour</div>
    <div class="jour">${act.jour}</div>
    <div class="texte">
${act.contenu_1}

${act.contenu_2}
    </div>
  `;

  const overlay = container.querySelector(".door-overlay");
  const actDate = getActDate(act);
  const today = new Date();

  if(actDate <= today){
    container.onclick = () => {
      overlay.classList.add("hidden");
      container.classList.add("reveal");
      markDayOpened(i+1);
      updateTracker();
      openSound.play();
      container.onclick = null;
    };
  } else {
    overlay.innerText = `Disponible le ${act.jour}`;
    container.onclick = null;
  }
}

/* -------- navigation -------- */
function initNavigation(){
  document.getElementById("prevBtn").onclick = ()=>{
    let i=currentIndex-1;
    while(i>=0 && !isDayOpened(i+1)) i--;
    if(i>=0) showDoor(i);
  };
  document.getElementById("nextBtn").onclick = ()=>{
    let i=currentIndex+1;
    while(i<ACTIVITIES.length && !isDayOpened(i+1)) i++;
    if(i<ACTIVITIES.length) showDoor(i);
  };
}

/* -------- init -------- */
(async function(){
  await loadActivities();
  initCountdown();
  updateTracker();
  initNavigation();
  showDoor(0);
})();
