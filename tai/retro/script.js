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
  const date = new Date(new Date().getFullYear(), 1, day, 0, 0, 0);
  return date;
}

/* ================= COMPARAISON DE DATES ================= */
function isDatePassed(date) {
  const today = new Date();
  // Réinitialiser à minuit pour comparaison correcte
  today.setHours(0, 0, 0, 0);
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
  tracker.innerHTML = "";
  ACTIVITIES.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "day" + (opened.includes(i) ? " opened" : "");
    
    // Ajouter la couleur du statut au tracker
    const status = getStore("status", {})[i];
    if (status) {
      d.classList.add(status);
    }
    
    tracker.appendChild(d);
  });
}

/* ================= CARD ================= */
function showDay(i) {
  currentIndex = i;
  const act = ACTIVITIES[i];
  const actDate = getActDate(act);
  const isPassed = isDatePassed(actDate);

  cardDate.innerText = act.jour;
  cardContent.innerText = `${act.contenu_1}\n\n${act.contenu_2}`;

  const journals = getStore("journals", {});
  journalInput.value = journals[i] || "";

  // Gérer les couleurs de statut
  const status = getStore("status", {})[i];
  card.classList.remove("green", "orange", "red");
  if (status) {
    card.classList.add(status);
  }

  if (isPassed) {
    // Le jour est passé ou c'est aujourd'hui - DÉVERROUILLÉ
    card.classList.remove("locked");
    card.style.pointerEvents = "auto";
    
    const opened = getStore("openedDays", []);
    if (opened.includes(i)) {
      // Déjà ouvert
      overlay.style.display = "none";
      card.classList.add("open");
    } else {
      // Pas encore ouvert
      overlay.style.display = "flex";
      overlay.innerText = "Cliquez pour découvrir la séance du jour";
      card.onclick = () => openDay(i);
    }
  } else {
    // Le jour n'est pas encore arrivé - VERROUILLÉ
    card.classList.add("locked");
    card.style.pointerEvents = "none";
    card.classList.remove("open");
    
    overlay.style.display = "flex";
    overlay.style.opacity = "1";
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
  if (openSound) {
    openSound.play().catch(() => {}); // Éviter les erreurs si l'audio n'existe pas
  }
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

/* ================= WEEKLY ================= */
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

  weeklyAverageEl.innerText =
    `Moyenne hebdomadaire : ${Math.round((sum / count) * 100)}%`;
}

/* ================= NAV ================= */
document.getElementById("prevBtn").onclick = () => {
  let i = currentIndex - 1;
  const opened = getStore("openedDays", []);
  
  while (i >= 0 && !opened.includes(i)) {
    i--;
  }
  
  if (i >= 0) {
    showDay(i);
  }
};

document.getElementById("nextBtn").onclick = () => {
  let i = currentIndex + 1;
  const opened = getStore("openedDays", []);
  
  while (i < ACTIVITIES.length && !opened.includes(i)) {
    // Vérifier que le jour n'est pas dans le futur
    const actDate = getActDate(ACTIVITIES[i]);
    if (!isDatePassed(actDate)) {
      // Si le jour est dans le futur, arrêter la recherche
      break;
    }
    i++;
  }
  
  if (i < ACTIVITIES.length) {
    showDay(i);
  }
};

/* ================= INIT ================= */
(async function () {
  await loadActivities();
  initCountdown();
  updateTracker();
  showDay(0);
  updateWeeklyAverage();
})();
