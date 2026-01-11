/* ================= CONFIG ================= */
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbx0j_0ec2NhHcNYv8KwPUPM6yV8yG_xXm3A0F03WR5R2mnDtSm1mfzqOA19R4g-sRVikw/exec";

/* ================= DONNÉES ================= */
const EXERCISES = [
 {name:'UV1 : Kihon simples',criteria:['précision','kime','posture']},
 {name:'UV1 : Enchaînements',criteria:['précision','kime','posture']},
 {name:'UV1 : Cibles',criteria:['précision','kime','posture']},
 {name:'UV2 : Taï sabaki',criteria:['fluidité','distance','contrôle']},
 {name:'UV2 : Ippon kumite lent',criteria:['fluidité','distance','contrôle']},
 {name:'UV2 : Ippon kumite examen',criteria:['fluidité','distance','contrôle']},
 {name:'UV3 : Kata lent',criteria:['exactitude','kime','équilibre']},
 {name:'UV3 : Kata examen',criteria:['exactitude','kime','équilibre']},
 {name:'UV3 : Bunkaï',criteria:['exactitude','kime','équilibre']},
 {name:'UV4: Technique de base',criteria:['réalisme','zanchin','protection']},
 {name:'UV5-6 : Self-defense arme',criteria:['réalisme','zanchin','protection']},
 {name:'UV5-6 : Self-defense atemi',criteria:['réalisme','zanchin','protection']},
 {name:'UV5-6 : Self-defense saisie',criteria:['réalisme','zanchin','protection']}
];

let selection=[],currentIndex=0,timer=null,paused=false;
let elapsedGlobalSeconds = 0;
let remainingExercise=0,remainingGlobal=0;


/* ================= OBJECTIFS ================= */
async function fetchObjectivesFromSheet(){
  try{
    const r=await fetch(GOOGLE_API_URL+"?action=fetchObjectives");
    const data=await r.json();
    renderObjectives(data);
  }catch(e){
    document.getElementById("objectifs").innerHTML="Erreur chargement objectifs";
  }
}

function renderObjectives(list){
  const div=document.getElementById("objectifs");
  div.innerHTML="";
  list.forEach(o=>{
    const pct=o.ObjectifHebdo?Math.round((o.Réalisé/o.ObjectifHebdo)*100):0;
    div.innerHTML+=`
      <strong>${o.Exercice}</strong>
      <div class="progress">
        <div class="progress-bar" style="width:${pct}%"></div>
      </div>
      <small>${o.Réalisé}/${o.ObjectifHebdo} min (${pct}%)</small>
    `;
  });
}
async function fetchSessions() {
  const r = await fetch(GOOGLE_API_URL + "?action=fetchSessions");
  const data = await r.json();
  return data;
}

/* ================= UI ================= */
function toggleAccordion(h){
  const c=h.nextElementSibling;
  const a=h.querySelector("span");
  const open=c.style.display==="block";
  c.style.display=open?"none":"block";
  a.textContent=open?"⬇️":"⬆️";
}

function renderBank(){
  bank.innerHTML="";
  EXERCISES.forEach(e=>{
    bank.innerHTML+=`
    <div class="exercise">
      <span>${e.name}</span>
      <button onclick="addExercise('${e.name}')">➕</button>
    </div>`;
  });
}
function populateRadarSelect() {
  const select = document.getElementById("exerciseRadarSelect");
  select.innerHTML = "";

  EXERCISES.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.name;
    opt.textContent = e.name;
    select.appendChild(opt);
  });
}

function addExercise(n){
  selection.push({name:n,duration:10});
  renderSelection();
}

function renderSelection(){
  selectionDiv.innerHTML="";

  let totalSeconds = 0;

  selection.forEach((e,i)=>{
    totalSeconds += e.duration * 60;

    selectionDiv.innerHTML+=`
    <div class="exercise ${i===currentIndex?'active':''}">
      <span>${e.name}</span>
      <input type="range" min="1" max="60" value="${e.duration}"
        oninput="
          selection[${i}].duration=parseInt(this.value);
          renderSelection();
        ">
      <span>${e.duration} min</span>
    </div>`;
  });

  // ✅ affichage immédiat du temps total sélectionné
  timers.textContent = `--:-- | ${fmt(totalSeconds)}`;
}


function clearSelection(){selection=[];renderSelection()}

  function navigateJournal(offset) {
  const d = new Date(journalCurrentDate);
  d.setDate(d.getDate() + offset);
  journalCurrentDate = d.toISOString().slice(0,10);
  document.getElementById("journalDate").value = journalCurrentDate;
  loadJournal();
}

/* ================= SESSION ================= */
const ding=new Audio("ding.mp3");
const beep=new Audio("beep.mp3");

function speak(t){speechSynthesis.speak(new SpeechSynthesisUtterance(t))}

// ==================== SYNTHÈSE ====================
function startSession(){
  if(!selection.length) return;
  startBtn.disabled=true;
  remainingGlobal = selection.reduce((s,e)=>s+e.duration*60,0);
  speak("Bonjour, commençons l'entraînement !");
  setTimeout(()=>runExerciseWithSpeech(0),2000);
}

function runExerciseWithSpeech(i){
  if(i>=selection.length){endSession(); return;}
  currentIndex=i;
  renderSelection();
  const ordinals=["premier","deuxième","troisième","quatrième","cinquième","sixième","septième","huitième","neuvième","dixième"];
  speak(`${ordinals[i]||i+1} exercice, ${selection[i].name}`);
  remainingExercise = selection[i].duration*60;

  timer = setInterval(()=>{
    if(!paused){
      remainingExercise--;
      remainingGlobal--;
      elapsedGlobalSeconds++;

      updateTimers(); updateProgress();
      if(remainingExercise===10) speak("10 secondes");
      if(remainingExercise<=0){
        clearInterval(timer);
        if(i<selection.length-1){
          ding.play();
          setTimeout(()=>runExerciseWithSpeech(i+1),500);
        } else {
          beep.play();
          setTimeout(()=>endSessionSpeech(),3000);
        }
      }
    }
  },1000);
}

function endSessionSpeech(){
  speak("Fin de l'entraînement, place à l'auto-évaluation");
  evaluationModal.style.display="flex";
  renderEvaluation();
  renderNotesByExercise(); // ✅ AJOUT ICI
}


/* ================= TIMER / PROGRESS ================= */
function updateTimers(){ timers.textContent=`${fmt(remainingExercise)} | ${fmt(remainingGlobal)}` }
function updateProgress(){
  const total=selection.reduce((s,e)=>s+e.duration*60,0);
  const done=total-remainingGlobal;
  globalProgress.style.width=`${Math.round(done/total*100)}%`;
}
function pauseResume(){ paused=!paused; pauseBtn.textContent=paused?"Reprendre":"Pause"; pauseBtn.classList.toggle("active",paused); }
function stopSession(){
  clearInterval(timer);
  endSessionSpeech();
}
function fmt(s){ return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0") }

/* ================= GOOGLE SHEET ================= */
function sendSessionToSheet(){
  const totalPlanned = selection.reduce((s,e)=>s+e.duration*60,0);
  const ratio = totalPlanned ? elapsedGlobalSeconds / totalPlanned : 0;

  selection.forEach(ex=>{
    const realSeconds = Math.round(ex.duration * 60 * ratio);
    const realMinutes = Math.max(1, Math.round(realSeconds / 60));

    const params = new URLSearchParams({
      action:"addSession",
      exercice: ex.name,
      duree: realMinutes
    });

    fetch(GOOGLE_API_URL + "?" + params.toString());
  });
}

/* ================= ÉVALUATION ================= */
function renderEvaluation(){
  evaluation.innerHTML="";
  selection.forEach(e=>{
    const def=EXERCISES.find(x=>x.name===e.name);
    if(!def) return;
    evaluation.innerHTML+=`<h4>${e.name}</h4>`;
    def.criteria.forEach(c=>{
  evaluation.innerHTML += `
    <div style="margin-bottom:10px">
      <label style="font-size:13px;font-weight:600">
        ${c} : <span id="val-${e.name}-${c}">3</span>/5
      </label>
      <input
        type="range"
        min="1"
        max="5"
        value="3"
        step="1"
        style="width:100%"
        data-exercice="${e.name}"
        data-critere="${c}"
        oninput="document.getElementById('val-${e.name}-${c}').textContent=this.value"
      >
    </div>
  `;
});

  });
}
function renderNotesByExercise() {
  const container = document.getElementById("notesByExercise");
  container.innerHTML = "";

  selection.forEach(ex => {
    const block = document.createElement("div");
    block.className = "note-block";

    block.innerHTML = `
      <h4>${ex.name}</h4>
      <textarea
        data-exercice="${ex.name}"
        placeholder="Ressenti, points à améliorer..."
      ></textarea>
    `;

    container.appendChild(block);
  });
}


/* ================= PDF ================= */
async function generatePDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y=10;

  pdf.setFontSize(16);
  pdf.text("Bilan hebdomadaire Tai-Jitsu",10,y); y+=10;

  // Objectifs
  const r = await fetch(GOOGLE_API_URL+"?action=fetchObjectives");
  const goals = await r.json();
  pdf.setFontSize(12);
  pdf.text("Objectifs hebdomadaires",10,y); y+=6;
  goals.forEach(g=>{
    const pct = Math.round((g.Réalisé/g.ObjectifHebdo)*100);
    pdf.text(`${g.Exercice} : ${pct}%`,10,y);
    pdf.rect(10,y+2,100,4);
    pdf.rect(10,y+2,pct,4,"F");
    y+=10;
  });

  // Notes 7 derniers jours
  const e = await fetch(GOOGLE_API_URL+"?action=fetchEvaluations");
  const evals = await e.json();
  pdf.addPage(); y=10;
  pdf.text("Notes – 7 derniers jours",10,y); y+=8;
  evals.slice(-7).forEach(ev=>{
    pdf.text(`${ev.Date} – ${ev.Exercice}`,10,y);
    y+=5;
    pdf.text(ev.Notes || "",12,y);     // ✅ texte auto-évaluation
    y+=8;
  });

  pdf.save("bilan_tai_jitsu.pdf");
}

/* ================= SAVE ÉVALUATION ================= */
async function saveEvaluation() {

  sendSessionToSheet(); // durées réelles

  // 🔑 récupérer les notes par exercice
  const notesByExercise = {};
  document
    .querySelectorAll("#notesByExercise textarea")
    .forEach(t => {
      const ex = t.dataset.exercice;
      if (t.value.trim()) {
        notesByExercise[ex] = t.value.trim();
      }
    });

  // 🔑 récupérer critères
  const dataByExercise = {};
  document
    .querySelectorAll("#evaluation input[type=range]")
    .forEach(r => {
      const ex = r.dataset.exercice;
      const crit = r.dataset.critere;
      if (!ex || !crit) return;

      dataByExercise[ex] ??= {};
      dataByExercise[ex][crit] = Number(r.value);
    });

  // 🔑 envoi par exercice
  for (const ex in dataByExercise) {
    await fetch(GOOGLE_API_URL + "?" + new URLSearchParams({
      action: "addEvaluation",
      exercice: ex,
      criteres: JSON.stringify(dataByExercise[ex]),
      notes: notesByExercise[ex] || ""
    }));
  }

  location.reload();
}

/* ================= STATS ================= */
let exerciseChartObj = null; // référence du graphique

async function showAverageByExercise() {
  const from = fromDateChart.value ? new Date(fromDateChart.value) : null;
  const to = toDateChart.value ? new Date(toDateChart.value) : null;

  const r = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const data = await r.json();

  const sum = {};
  const count = {};

  data.forEach(ev => {
    const d = new Date(ev.Date);
    if (from && d < from) return;
    if (to && d > to) return;

    const criteres = JSON.parse(ev.Critères);
    let total = 0;
    let n = 0;

    for (const c in criteres) {
      total += criteres[c];
      n++;
    }

    if (!n) return;

    sum[ev.Exercice] = (sum[ev.Exercice] || 0) + total / n;
    count[ev.Exercice] = (count[ev.Exercice] || 0) + 1;
  });

  const labels = Object.keys(sum);
  const averages = labels.map(l => (sum[l] / count[l]).toFixed(2));

  drawBarChart(labels, averages, "Moyenne par exercice");
}
async function showAverageByCriteria() {
  const from = fromDateChart.value ? new Date(fromDateChart.value) : null;
  const to = toDateChart.value ? new Date(toDateChart.value) : null;

  const r = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const data = await r.json();

  const sum = {};
  const count = {};

  data.forEach(ev => {
    const d = new Date(ev.Date);
    if (from && d < from) return;
    if (to && d > to) return;

    const criteres = JSON.parse(ev.Critères);

    for (const c in criteres) {
      sum[c] = (sum[c] || 0) + criteres[c];
      count[c] = (count[c] || 0) + 1;
    }
  });

  const labels = Object.keys(sum);
  const averages = labels.map(l => (sum[l] / count[l]).toFixed(2));

  drawBarChart(labels, averages, "Moyenne par critère");
}

function drawBarChart(labels, data, title) {
  const canvas = document.getElementById("exerciseChart");
  const ctx = canvas.getContext("2d");

  canvas.style.display = "block";
  if (exerciseChartObj) exerciseChartObj.destroy();

  exerciseChartObj = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: "#84fab0"
      }]
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          anchor: "end",
          align: "top",
          formatter: v => v
        }
      },
      scales: {
        y: {
          min: 0,
          max: 5
        }
      }
    }
  });
}

function hideExerciseChart() {
  if (exerciseChartObj) exerciseChartObj.destroy();
  document.getElementById("exerciseChart").style.display = "none";
}
  async function showUVEvolution() {
  const uv = prompt("Quelle UV ? (ex : UV1, UV2, UV3)");
  if (!uv) return;

  const from = fromDateChart.value ? new Date(fromDateChart.value) : null;
  const to = toDateChart.value ? new Date(toDateChart.value) : null;

  const r = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const data = await r.json();

  // Regroupement par date
  const byDate = {};

  data.forEach(ev => {
    if (!ev.Exercice.startsWith(uv)) return;

    const d = new Date(ev.Date);
    if (from && d < from) return;
    if (to && d > to) return;

    const day = ev.Date.slice(0, 10); // YYYY-MM-DD
    const crit = JSON.parse(ev.Critères);

    byDate[day] ??= { sum: 0, count: 0 };

    for (const c in crit) {
      byDate[day].sum += crit[c];
      byDate[day].count++;
    }
  });

  const labels = Object.keys(byDate).sort();
  const values = labels.map(d =>
    (byDate[d].sum / byDate[d].count).toFixed(2)
  );

  if (!labels.length) {
    alert("Aucune donnée pour cette UV sur la période.");
    return;
  }

  drawUVEvolutionChart(labels, values, uv);
}

async function showRadarByExercise() {
  const exercice = document.getElementById("exerciseRadarSelect").value;
  const from = fromDateChart.value ? new Date(fromDateChart.value) : null;
  const to = toDateChart.value ? new Date(toDateChart.value) : null;

  const r = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const data = await r.json();

  const sum = {};
  const count = {};

  data.forEach(ev => {
    if (ev.Exercice !== exercice) return;

    const d = new Date(ev.Date);
    if (from && d < from) return;
    if (to && d > to) return;

    const criteres = JSON.parse(ev.Critères);
    for (const c in criteres) {
      sum[c] = (sum[c] || 0) + criteres[c];
      count[c] = (count[c] || 0) + 1;
    }
  });

  const labels = Object.keys(sum);
  if (!labels.length) {
    alert("Aucune donnée pour cet exercice sur la période.");
    return;
  }

  const averages = labels.map(l => (sum[l] / count[l]).toFixed(2));

  drawRadarChart(labels, averages, exercice);
}
function drawRadarChart(labels, data, title) {
  const canvas = document.getElementById("exerciseChart");
  const ctx = canvas.getContext("2d");

  canvas.style.display = "block";
  if (exerciseChartObj) exerciseChartObj.destroy();

  exerciseChartObj = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        fill: true,
        backgroundColor: "rgba(132,250,176,0.3)",
        borderColor: "#84fab0",
        pointBackgroundColor: "#fa709a"
      }]
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}
async function showRadarByUV() {
  const from = fromDateChart.value ? new Date(fromDateChart.value) : null;
  const to = toDateChart.value ? new Date(toDateChart.value) : null;

  const uv = prompt("Quelle UV ? (ex : UV1, UV2, UV3, UV4, UV5-6)");
  if (!uv) return;

  const r = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const data = await r.json();

  const sum = {};
  const count = {};

  data.forEach(ev => {
    if (!ev.Exercice.startsWith(uv)) return;

    const d = new Date(ev.Date);
    if (from && d < from) return;
    if (to && d > to) return;

    const criteres = JSON.parse(ev.Critères);
    for (const c in criteres) {
      sum[c] = (sum[c] || 0) + criteres[c];
      count[c] = (count[c] || 0) + 1;
    }
  });

  const labels = Object.keys(sum);
  if (!labels.length) {
    alert("Aucune donnée pour cette UV sur la période.");
    return;
  }

  const averages = labels.map(l => (sum[l] / count[l]).toFixed(2));

  drawRadarChart(labels, averages, `UV ${uv}`);
}
async function compareUVRadar() {
  const from = fromDateChart.value ? new Date(fromDateChart.value) : null;
  const to = toDateChart.value ? new Date(toDateChart.value) : null;

  const input = prompt("UV à comparer (ex : UV1,UV2,UV3)");
  if (!input) return;

  const uvList = input.split(",").map(u => u.trim());

  const r = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const data = await r.json();

  const uvData = {};
  const allCriteria = new Set();

  data.forEach(ev => {
    const uv = uvList.find(u => ev.Exercice.startsWith(u));
    if (!uv) return;

    const d = new Date(ev.Date);
    if (from && d < from) return;
    if (to && d > to) return;

    const crit = JSON.parse(ev.Critères);

    uvData[uv] ??= { sum: {}, count: {} };

    for (const c in crit) {
      uvData[uv].sum[c] = (uvData[uv].sum[c] || 0) + crit[c];
      uvData[uv].count[c] = (uvData[uv].count[c] || 0) + 1;
      allCriteria.add(c);
    }
  });

  const labels = Array.from(allCriteria);

  if (!labels.length) {
    alert("Aucune donnée pour ces UV sur la période.");
    return;
  }

  const datasets = uvList.map((uv, i) => {
    const dataUV = uvData[uv];
    if (!dataUV) return null;

    const values = labels.map(c =>
      dataUV.sum[c]
        ? (dataUV.sum[c] / dataUV.count[c]).toFixed(2)
        : 0
    );

    return {
      label: uv,
      data: values,
      fill: true
    };
  }).filter(Boolean);

  drawMultiRadar(labels, datasets);
}
let radarChartObj = null;

function drawMultiRadar(labels, datasets) {
  const ctx = document.getElementById("exerciseChart").getContext("2d");
  document.getElementById("exerciseChart").style.display = "block";

  if (radarChartObj) radarChartObj.destroy();

  radarChartObj = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        legend: { position: "top" }
      }
    }
  });
}
let uvEvolutionChart = null;

function drawUVEvolutionChart(labels, data, uv) {
  const canvas = document.getElementById("exerciseChart");
  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");
  if (uvEvolutionChart) uvEvolutionChart.destroy();

  uvEvolutionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Évolution ${uv}`,
        data,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        legend: { display: true },
        datalabels: {
          align: "top",
          formatter: v => v
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}
let journalChartObj = null;

let journalRadarChart = null;

  let journalCurrentDate = null;

async function loadJournalCard(dateOverride = null) {
  console.log("📔 loadJournalCard appelée");
  console.log("journalPage =", document.getElementById("journalPage"));

  const input = document.getElementById("journalDate");

  // 📌 date active
  journalCurrentDate = dateOverride || input.value;
  if (!journalCurrentDate) {
    alert("Choisis une date");
    return;
  }

  input.value = journalCurrentDate;

  // Affiche la navigation
  document.querySelector(".journal-nav").style.display = "flex";

  // 🗓️ Titre lisible
  const title = document.getElementById("journalDateTitle");
  const d = new Date(journalCurrentDate);
  title.textContent = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // 📥 Données
  const rSess = await fetch(GOOGLE_API_URL + "?action=fetchSessions");
  const sessions = await rSess.json();

  const rEval = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const evaluations = await rEval.json();

  const daySessions = sessions.filter(ev =>
    ev.Date && ev.Date.startsWith(journalCurrentDate)
  );

  const dayEvals = evaluations.filter(ev =>
    ev.Date && ev.Date.startsWith(journalCurrentDate)
  );

  const container = document.getElementById("journalPage");
  container.innerHTML = "";

  if (!daySessions.length && !dayEvals.length) {
    container.innerHTML = "<em>Aucune donnée pour cette date.</em>";
    document.getElementById("journalRadar").style.display = "none";
    return;
  }

  /* ===== Durées cumulées ===== */
  const durations = {};
  daySessions.forEach(ev => {
    durations[ev.Exercice] =
      (durations[ev.Exercice] || 0) + Number(ev.Duree || 0);
  });

  const durDiv = document.createElement("div");
  durDiv.style.fontFamily = "Arial, sans-serif";
  durDiv.style.marginBottom = "12px";
  durDiv.innerHTML = "<strong>Durées cumulées par exercice :</strong><br>";

  for (const ex in durations) {
    durDiv.innerHTML += `${ex} : ${durations[ex]} min<br>`;
  }

  container.appendChild(durDiv);

  /* ===== Notes par exercice ===== */
  const notesByExercise = {};

  dayEvals.forEach(ev => {
    if (ev.Notes && ev.Notes.trim()) {
      notesByExercise[ev.Exercice] ??= [];
      notesByExercise[ev.Exercice].push(ev.Notes);
    }
  });

  if (Object.keys(notesByExercise).length) {
    const nTitle = document.createElement("div");
    nTitle.textContent = "Carnet de bord";
    nTitle.style.fontFamily = "Fredoka, Arial, sans-serif";
    nTitle.style.fontWeight = "600";
    nTitle.style.margin = "16px 0 10px";
    container.appendChild(nTitle);

    for (const ex in notesByExercise) {
      const exTitle = document.createElement("div");
      exTitle.innerHTML = `📝 <strong>${ex}</strong>`;
      exTitle.style.margin = "14px 0 6px";
      container.appendChild(exTitle);

      notesByExercise[ex].forEach(note => {
        const p = document.createElement("p");
        p.textContent = note;
        p.style.fontFamily = "JBCursive, cursive";
        p.style.fontSize = "20px";
        p.style.lineHeight = "1.6";
        p.style.background = "#fff9e6";
        p.style.padding = "12px";
        p.style.borderRadius = "14px";
        p.style.marginBottom = "8px";
        container.appendChild(p);
      });
    }
  }

  /* ===== Radar ===== */
  const sum = {}, count = {};
  dayEvals.forEach(ev => {
    const crit = JSON.parse(ev.Critères || "{}");
    for (const c in crit) {
      sum[c] = (sum[c] || 0) + crit[c];
      count[c] = (count[c] || 0) + 1;
    }
  });

  const labels = Object.keys(sum);
  const averages = labels.map(c => +(sum[c] / count[c]).toFixed(2));

  const canvas = document.getElementById("journalRadar");
  canvas.style.display = labels.length ? "block" : "none";

  if (journalRadarChart) journalRadarChart.destroy();

  if (labels.length) {
    journalRadarChart = new Chart(canvas.getContext("2d"), {
      type: "radar",
      data: {
        labels,
        datasets: [{
          label: "Moyenne du jour",
          data: averages,
          backgroundColor: "rgba(250,112,154,0.3)",
          borderColor: "#fa709a",
          pointBackgroundColor: "#fa709a"
        }]
      },
      options: {
        scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } }
      }
    });
  }
}

function navigateJournal(offset) {
  if (!journalCurrentDate) return;

  const d = new Date(journalCurrentDate);
  d.setDate(d.getDate() + offset);

  const iso = d.toISOString().slice(0, 10);
  loadJournalCard(iso);
}

/* ==================== PDF CARNET ==================== */
async function generateJournalPDF() {
  const date = document.getElementById("journalDate").value;
  if (!date) return alert("Choisis une date");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 10;

  // 1️⃣ Récupérer sessions et évaluations
  const rSess = await fetch(GOOGLE_API_URL + "?action=fetchSessions");
  const sessions = await rSess.json();
  const rEval = await fetch(GOOGLE_API_URL + "?action=fetchEvaluations");
  const evaluations = await rEval.json();

  const daySessions = sessions.filter(ev => ev.Date.startsWith(date));
  const dayEvals = evaluations.filter(ev => ev.Date.startsWith(date));

  if (!daySessions.length && !dayEvals.length) return alert("Aucune donnée pour cette date");

  // 2️⃣ Titre
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Carnet d’entraînement", 10, y); y += 8;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(date, 10, y); y += 10;

  // 3️⃣ Durées cumulées par exercice
  const durations = {};
  daySessions.forEach(ev => {
    durations[ev.Exercice] = (durations[ev.Exercice] || 0) + Number(ev.Duree || 0);
  });

  pdf.setFont("helvetica", "bold");
  pdf.text("Durées cumulées par exercice :", 10, y); y += 6;
  pdf.setFont("helvetica", "normal");
  Object.entries(durations).forEach(([k, v]) => {
    pdf.text(`- ${k} : ${v} min`, 12, y);
    y += 6;
  });

  // 4️⃣ Notes du jour
  const notesByExercise = {};

dayEvals.forEach(ev => {
  if (ev.Notes && ev.Notes.trim()) {
    notesByExercise[ev.Exercice] ??= [];
    notesByExercise[ev.Exercice].push(ev.Notes);
  }
});

if (Object.keys(notesByExercise).length) {
  y += 4;
  pdf.setFont("helvetica", "bold");
  pdf.text("Carnet de bord :", 10, y);
  y += 6;

  for (const ex in notesByExercise) {
    pdf.setFont("helvetica", "bold");
    pdf.text(ex, 12, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    notesByExercise[ex].forEach(note => {
      pdf.text(note, 14, y, { maxWidth: 170 });
      y += pdf.getTextDimensions(note, { maxWidth: 170 }).h + 4;
    });

    y += 4;
  }
}

  // 5️⃣ Moyennes par critère
  const sum = {}, count = {};
  dayEvals.forEach(ev => {
    const crit = JSON.parse(ev.Critères || "{}");
    for (const c in crit) {
      sum[c] = (sum[c] || 0) + crit[c];
      count[c] = (count[c] || 0) + 1;
    }
  });

  const labels = Object.keys(sum);
  if (labels.length) {
    const averages = labels.map(c => +(sum[c]/count[c]).toFixed(2));
    y += 4;
    pdf.setFont("helvetica", "bold");
    pdf.text("Moyennes par critère :", 10, y); y += 6;
    pdf.setFont("helvetica", "normal");
    labels.forEach((c, i) => {
      pdf.text(`- ${c} : ${averages[i]}`, 12, y);
      y += 6;
    });
  }

  pdf.save(`Carnet_${date}.pdf`);
}

/* ================= INIT ================= */
const bank=document.getElementById("bank");
const selectionDiv=document.getElementById("selection");
const timers=document.getElementById("timers");
const globalProgress=document.getElementById("globalProgress");
const startBtn=document.getElementById("startBtn");
const pauseBtn=document.getElementById("pauseBtn");
const evaluation=document.getElementById("evaluation");
const evaluationModal=document.getElementById("evaluationModal");

window.addEventListener("DOMContentLoaded", () => {
  renderBank();
  fetchObjectivesFromSheet();
  flatpickr("#fromDateChart", { dateFormat: "Y-m-d" });
  flatpickr("#toDateChart", { dateFormat: "Y-m-d" });
  populateRadarSelect();

  // ✅ Enregistrer le plugin DataLabels
  Chart.register(ChartDataLabels);
});
