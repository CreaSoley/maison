let ACTIVITIES = [];
let currentIndex = 0;

const card = document.getElementById("card");
const overlay = card.querySelector(".overlay");
const cardDate = document.getElementById("cardDate");
const cardContent = document.getElementById("cardContent");
const journalInput = document.getElementById("journal");
const tracker = document.getElementById("tracker");
const weeklyAverageEl = document.getElementById("weeklyAverage");
const openSound = document.getElementById("openSound");

/* ================= DATE CIBLE ================= */
function getNextFeb8() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 1, 8, 0, 0, 0);
  if (target <= now) target = new Date(now.getFullYear() + 1, 1, 8);
  return target;
}
const TARGET_DATE = getNextFeb8();

/* ================= COUNTDOWN ================= */
function initCountdown() {
  const el = document.getElementById("countdown");
  function update() {
    const diff = TARGET_DATE - new Date();
    if (diff <= 0) {
      el.innerText = "C'est aujourd'hui le passage de grade !";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    el.innerText = `Jours restants : ${d} | ${h}h ${m}m ${s}s`;
  }
  update();
  setInterval(update, 1000);
}

/* ================= JSON ================= */
async function loadActivities() {
  const res = await fetch("calendrier.json", { cache: "no-store" });
  ACTIVITIES = await res.json();
}

/* ================= DATES ================= */
function getActDate(act) {
  const match = act.jour.match(/(\d{1,2})/);
  const day = match ? parseInt(match[1], 10) : 1;
  // on utilise le même mois que le jour du jour (février dans le projet d'origine)
  const date = new Date(new Date().getFullYear(), 1, day, 0, 0, 0);
  return date;
}

/* ================= DATE UTILS ================= */
function getTodayMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
function isDatePassed(date) {
  const today = getTodayMidnight();
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate <= today;
}

/* ================= STORAGE ================= */
function getStore(key, def) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
}
function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ================= TRACKER ================= */
function updateTracker() {
  const opened = getStore("openedDays", []);
  const statuses = getStore("status", {});

  tracker.innerHTML = "";

  ACTIVITIES.forEach((act, i) => {
    const dayEl = document.createElement("div");
    dayEl.className = "day";

    if (opened.includes(i)) dayEl.classList.add("opened");

    const dayStatus = statuses[i];
    if (dayStatus && opened.includes(i)) dayEl.classList.add(dayStatus);

    dayEl.dataset.index = i;

    if (opened.includes(i)) {
      dayEl.style.cursor = "pointer";
      dayEl.onclick = () => {
        const actDate = getActDate(act);
        if (isDatePassed(actDate)) showDay(i);
      };
    }

    dayEl.title = `Jour ${i + 1}${dayStatus ? ` - Statut: ${dayStatus}` : ""}`;
    tracker.appendChild(dayEl);
  });
}

/* ================= FIND TODAY'S ACTIVITY ================= */
function getTodayIndex() {
  const todayDay = new Date().getDate();               // jour du mois (1‑31)
  // on parcourt les activités et on compare le jour extrait du champ "jour"
  for (let i = 0; i < ACTIVITIES.length; i++) {
    const match = ACTIVITIES[i].jour.match(/(\d{1,2})/);
    const actDay = match ? parseInt(match[1], 10) : 1;
    if (actDay === todayDay) return i;
  }
  return 0; // fallback : aucun matching → on montre le premier
}

/* ================= CARD ================= */
function showDay(i) {
  currentIndex = i;
  const act = ACTIVITIES[i];
  const actDate = getActDate(act);
  const isPassed = isDatePassed(actDate);

  // ------- contenu de la carte -------
  cardDate.innerText = act.jour;
  cardContent.innerText = `${act.contenu_1}\n\n${act.contenu_2}`;

  const journals = getStore("journals", {});
  journalInput.value = journals[i] || "";

  const statuses = getStore("status", {});
  const currentStatus = statuses[i];
  card.classList.remove("green", "orange", "red");
  if (currentStatus) card.classList.add(currentStatus);

  // ------- gestion du overlay -------
  overlay.style.display = "flex";          // on s’assure qu’il est visible
  overlay.style.opacity = "1";

  if (isPassed) {
    // activité déjà passée → on peut la déverrouiller
    card.classList.remove("locked");
    card.style.pointerEvents = "auto";

    const opened = getStore("openedDays", []);
    if (opened.includes(i)) {
      // déjà ouvert → on retire le overlay et on montre le contenu
      overlay.style.display = "none";
      card.classList.add("open");
    } else {
      // pas encore ouvert → on laisse le texte d’instructions
      overlay.innerText = "Cliquez pour découvrir la séance du jour";
      card.onclick = () => openDay(i);
    }
  } else {
    // activité future → on bloque la carte
    card.classList.add("locked");
    card.style.pointerEvents = "none";
    overlay.innerText = `Disponible le ${act.jour}`;
    card.onclick = null;
  }
}

/* ================= OPEN ================= */
function openDay(i) {
  const opened = getStore("openedDays", []);
  if (!opened.includes(i)) {
    opened.push(i);
    setStore("openedDays", opened);
  }
  overlay.style.display = "none";
  card.classList.add("open");
  updateTracker();
  if (openSound) openSound.play().catch(() => {});
}

/* ================= STATUS ================= */
document.querySelectorAll(".status button").forEach(btn => {
  btn.onclick = () => {
    const s = getStore("status", {});
    s[currentIndex] = btn.dataset.status;
    setStore("status", s);
    showDay(currentIndex);
    updateTracker();
    updateWeeklyAverage();
  };
});

/* ================= JOURNAL ================= */
journalInput.addEventListener("input", () => {
  const j = getStore("journals", {});
  j[currentIndex] = journalInput.value;
  setStore("journals", j);
});

/* ================= WEEKLY AVERAGE ================= */
function updateWeeklyAverage() {
  const s = getStore("status", {});
  const values = { green: 1, orange: 0.5, red: 0 };
  let sum = 0, count = 0;
  Object.values(s).forEach(v => {
    sum += values[v] ?? 0;
    count++;
  });
  if (count === 0) {
    weeklyAverageEl.innerText = "";
    return;
  }
  weeklyAverageEl.innerText = `Moyenne hebdomadaire : ${Math.round((sum / count) * 100)}%`;
}

/* ================= NAV ================= */
document.getElementById("prevBtn").onclick = () => {
  let i = currentIndex - 1;
  const opened = getStore("openedDays", []);
  while (i >= 0 && !opened.includes(i)) i--;
  if (i >= 0) showDay(i);
};

document.getElementById("nextBtn").onclick = () => {
  let i = currentIndex + 1;
  const opened = getStore("openedDays", []);
  while (i < ACTIVITIES.length && !opened.includes(i)) {
    const actDate = getActDate(ACTIVITIES[i]);
    if (!isDatePassed(actDate)) break;
    i++;
  }
  if (i < ACTIVITIES.length) showDay(i);
};

/* ================= INIT ================= */
(async function () {
  await loadActivities();
  initCountdown();
  updateTracker();

  // <-- 1️⃣  On récupère l’indice de l’activité du jour
  const todayIdx = getTodayIndex();

  // <-- 2️⃣  On montre cette carte, mais elle reste cachée (overlay visible)
  showDay(todayIdx);

  updateWeeklyAverage();
})();
