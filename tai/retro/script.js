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
  const res = await fetch('calendrier.json', { cache: "no-store" });
  ACTIVITIES = await res.json();
}

/* -------- tracker -------- */
function markDayOpened(i) {
  const o = JSON.parse(localStorage.getItem("openedDays") || "[]");
  if (!o.includes(i)) o.push(i);
  localStorage.setItem("openedDays", JSON.stringify(o));
}
function isDayOpened(i) {
  return JSON.parse(localStorage.getItem("openedDays") || "[]").includes(i);
}
function updateTracker() {
  const t = document.getElementById("tracker");
  t.innerHTML = "";
  ACTIVITIES.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "day" + (isDayOpened(i + 1) ? " opened" : "");
    t.appendChild(d);
  });
}

/* -------- countdown -------- */
function initCountdown() {
  const el = document.getElementById("countdown");
  function update() {
    const diff = TARGET_DATE - new Date();
    if (diff <= 0) {
      el.innerText = "C'est aujourd'hui le passage de grade !";
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    el.innerText = `Jours restants : ${d} | ${h}h ${m}m ${s}s`;
  }
  update();
  setInterval(update, 1000);
}

/* -------- date parsing -------- */
function getActDate(act) {
  const m = act.jour.match(/(\d{1,2})/);
  const day = m ? parseInt(m[1], 10) : 1;
  const month =
    act.jour.toLowerCase().includes("décembre") ? 11 :
      act.jour.toLowerCase().includes("février") ? 1 : 0;
  return new Date(new Date().getFullYear(), month, day);
}

/* -------- journal -------- */
function getJournal(i) {
  const journal = JSON.parse(localStorage.getItem("journals") || "{}");
  return journal[i] || "";
}

function setJournal(i, content) {
  const journal = JSON.parse(localStorage.getItem("journals") || "{}");
  journal[i] = content;
  localStorage.setItem("journals", JSON.stringify(journal));
}

/* -------- afficher la card -------- */
function showDoor(i) {
  currentIndex = i;
  const act = ACTIVITIES[i];
  const container = document.getElementById("doorContainer");
  container.classList.remove("reveal");

  const journal = getJournal(i);

  container.innerHTML = `
    <div class="door-overlay">Cliquez pour découvrir la séance du jour</div>
    <div class="jour">${act.jour}</div>
    <div class="texte">
      ${act.contenu_1}<br><br>
      ${act.contenu_2}
    </div>
    <div class="completion">
      <label for="completion">État de réalisation :</label>
      <select id="completion" onchange="saveCompletion(${i})">
        <option value="0" ${act.completion === 0 ? 'selected' : ''}>✖ Non fait</option>
        <option value="1" ${act.completion === 1 ? 'selected' : ''}>◐ En cours</option>
        <option value="2" ${act.completion === 2 ? 'selected' : ''}>✔ Terminé</option>
      </select>
    </div>
    <div class="journal">
      <textarea id="journalInput" placeholder="Écrivez votre journal ici...">${journal}</textarea>
      <button onclick="saveJournal(${i})">Enregistrer</button>
    </div>
  `;

  const overlay = container.querySelector(".door-overlay");
  const actDate = getActDate(act);
  const today = new Date();

  if (actDate <= today) {
    container.onclick = () => {
      overlay.classList.add("hidden");
      container.classList.add("reveal");
      markDayOpened(i + 1);
      updateTracker();
      openSound.play();
      container.onclick = null;
    };
  } else {
    overlay.innerText = `Disponible le ${act.jour}`;
    container.onclick = null;
  }

  displayCompletionStatus(i);
}

/* -------- état de réalisation (vert/orange/rouge) -------- */
function displayCompletionStatus(i) {
  const act = ACTIVITIES[i];
  const completion = act.completion;
  const container = document.getElementById("doorContainer");
  const statusElement = container.querySelector('.completion-status');

  let color = 'gray';
  let symbol = '✖';
  if (completion === 2) {
    color = 'green';
    symbol = '✔';
  } else if (completion === 1) {
    color = 'orange';
    symbol = '◐';
  }

  container.querySelector(".completion-status").innerText = symbol;
  container.querySelector(".completion-status").style.color = color;
}

/* -------- calcul de la moyenne hebdomadaire -------- */
function calculateWeeklyAverage() {
  let completed = 0;
  let total = 0;
  const today = new Date();
  ACTIVITIES.forEach((act, i) => {
    const actDate = getActDate(act);
    if (actDate <= today) {
      total++;
      if (act.completion === 2) {
        completed++;
      }
    }
  });
  return (completed / total) * 100;
}

/* -------- navigation -------- */
function initNavigation() {
  document.getElementById("prevBtn").onclick = () => {
    let i = currentIndex - 1;
    while (i >= 0 && !isDayOpened(i + 1)) i--;
    if (i >= 0) showDoor(i);
  };
  document.getElementById("nextBtn").onclick = () => {
    let i = currentIndex + 1;
    while (i < ACTIVITIES.length && !isDayOpened(i + 1)) i++;
    if (i < ACTIVITIES.length) showDoor(i);
  };
}

/* -------- init -------- */
(async function () {
  await loadActivities();
  initCountdown();
  updateTracker();
  initNavigation();
  showDoor(0);
})();
