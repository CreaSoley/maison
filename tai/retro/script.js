let ACTIVITIES = [];
let currentIndex = 0;
const TARGET_DATE = new Date(new Date().getFullYear(),1,8);

const STATUS_SCORE = { green:1, orange:0.5, red:0 };

async function loadActivities(){
  const res = await fetch('calendrier.json');
  ACTIVITIES = await res.json();
}

function getData(day){
  return JSON.parse(localStorage.getItem('day_'+day) || '{}');
}

function saveData(day,data){
  localStorage.setItem('day_'+day, JSON.stringify(data));
}

function initCountdown(){
  const el = document.getElementById('countdown');
  setInterval(()=>{
    const diff = TARGET_DATE - new Date();
    if(diff<=0){ el.textContent="C’est aujourd’hui le passage de grade !"; return;}
    el.textContent=`J-${Math.floor(diff/86400000)}`;
  },1000);
}

function showDoor(i){
  currentIndex=i;
  const a = ACTIVITIES[i];
  const d = getData(i);
  const c = document.getElementById('doorContainer');

  c.className='door-container '+(d.status||'');
  c.innerHTML=`
    <div class="door-overlay">Cliquez pour découvrir la séance du jour</div>
    <div class="jour">${a.jour} ${d.status ? (d.status==='green'?'✔':d.status==='orange'?'◐':'✖'):''}</div>
    <div class="texte">${a.contenu_1}\n\n${a.contenu_2}</div>

    <div class="status-buttons">
      <button onclick="setStatus('green')">✔</button>
      <button onclick="setStatus('orange')">◐</button>
      <button onclick="setStatus('red')">✖</button>
    </div>

    <textarea placeholder="Journal personnel...">${d.note||''}</textarea>
  `;

  const overlay=c.querySelector('.door-overlay');
  overlay.onclick=()=>{
    overlay.classList.add('hidden');
    c.classList.add('reveal');
  };

  c.querySelector('textarea').oninput=e=>{
    d.note=e.target.value;
    saveData(i,d);
  };

  updateTracker();
  updateWeeklyAverage();
}

function setStatus(s){
  const d=getData(currentIndex);
  d.status=s;
  saveData(currentIndex,d);
  showDoor(currentIndex);
}

function updateTracker(){
  const t=document.getElementById('tracker');
  t.innerHTML='';
  ACTIVITIES.forEach((_,i)=>{
    const d=getData(i);
    const div=document.createElement('div');
    div.className='day '+(d.status||'');
    div.onclick=()=>showDoor(i);
    t.appendChild(div);
  });
}

function updateWeeklyAverage(){
  let sum=0,count=0;
  for(let i=Math.max(0,currentIndex-6);i<=currentIndex;i++){
    const d=getData(i);
    if(d.status){ sum+=STATUS_SCORE[d.status]; count++; }
  }
  if(!count)return;
  const avg=sum/count;
  document.getElementById('weeklyAverage').textContent =
    avg>=0.8?'Semaine : ✔ excellente':
    avg>=0.4?'Semaine : ◐ correcte':'Semaine : ✖ difficile';
}

document.getElementById('prevBtn').onclick=()=>currentIndex>0&&showDoor(currentIndex-1);
document.getElementById('nextBtn').onclick=()=>currentIndex<ACTIVITIES.length-1&&showDoor(currentIndex+1);

(async()=>{
  await loadActivities();
  initCountdown();
  showDoor(0);
})();
