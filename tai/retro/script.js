let ACTIVITIES=[];
let currentIndex=0;

function getNextFeb8(){
  const now=new Date();
  let target=new Date(now.getFullYear(),1,8,0,0,0);
  if(target<=now) target=new Date(now.getFullYear()+1,1,8,0,0,0);
  return target;
}
const TARGET_DATE=getNextFeb8();

const openSound=document.getElementById("openSound");

async function loadActivities(){
  const res=await fetch("calendrier.json",{cache:"no-store"});
  ACTIVITIES=await res.json();
}

function getData(){
  return JSON.parse(localStorage.getItem("taiData")||"{}");
}
function saveData(data){
  localStorage.setItem("taiData",JSON.stringify(data));
}

function initCountdown(){
  const el=document.getElementById("countdown");
  setInterval(()=>{
    const diff=TARGET_DATE-new Date();
    if(diff<=0){ el.innerText="C'est aujourd'hui le passage de grade !"; return;}
    const d=Math.floor(diff/86400000);
    el.innerText=`Jours restants : ${d}`;
  },1000);
}

function showDoor(i){
  currentIndex=i;
  const act=ACTIVITIES[i];
  const data=getData();
  const state=data[i]?.state||"";

  const container=document.getElementById("doorContainer");
  container.className=`door-container ${state}`;
  container.innerHTML=`
    <div class="door-overlay">Cliquez pour découvrir la séance du jour</div>
    <div class="jour">${act.jour} ${state==="success"?"✔":state==="partial"?"◐":state==="fail"?"✖":""}</div>
    <div class="texte">${act.contenu_1}\n\n${act.contenu_2}</div>
  `;

  const overlay=container.querySelector(".door-overlay");
  overlay.onclick=()=>{
    overlay.classList.add("hidden");
    container.classList.add("reveal");
    openSound.play();
  };

  document.getElementById("journal").value=data[i]?.journal||"";
  updateTracker();
  updateWeeklyAverage();
}

document.querySelectorAll(".status-buttons button").forEach(btn=>{
  btn.onclick=()=>{
    const data=getData();
    data[currentIndex]=data[currentIndex]||{};
    data[currentIndex].state=btn.dataset.status;
    saveData(data);
    showDoor(currentIndex);
  };
});

document.getElementById("journal").addEventListener("input",e=>{
  const data=getData();
  data[currentIndex]=data[currentIndex]||{};
  data[currentIndex].journal=e.target.value;
  saveData(data);
});

function updateTracker(){
  const t=document.getElementById("tracker");
  t.innerHTML="";
  const data=getData();
  ACTIVITIES.forEach((_,i)=>{
    const d=document.createElement("div");
    d.className=`day ${data[i]?.state||""}`;
    d.onclick=()=>showDoor(i);
    t.appendChild(d);
  });
}

function updateWeeklyAverage(){
  const data=getData();
  const values={success:1,partial:0.5,fail:0};
  let sum=0,count=0;
  Object.values(data).forEach(d=>{
    if(d.state){ sum+=values[d.state]; count++; }
  });
  const avg=count?Math.round((sum/count)*100):0;
  document.getElementById("weeklyAverage").innerText=
    `Moyenne de la semaine : ${avg}%`;
}

document.getElementById("prevBtn").onclick=()=>showDoor(Math.max(0,currentIndex-1));
document.getElementById("nextBtn").onclick=()=>showDoor(Math.min(ACTIVITIES.length-1,currentIndex+1));

(async()=>{
  await loadActivities();
  initCountdown();
  showDoor(0);
})();
