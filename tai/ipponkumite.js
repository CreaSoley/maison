// ippon.js – GitHub Pages friendly: JSON + choix série + URL YouTube -> embed

let allTechniques = [];
let currentSerie = "";

// ----------------- YouTube helpers -----------------
function parseTimeToSeconds(t) {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return parseInt(t, 10);

  let seconds = 0;
  const m = t.match(/(\d+)m/);
  const s = t.match(/(\d+)s/);
  if (m) seconds += parseInt(m[1], 10) * 60;
  if (s) seconds += parseInt(s[1], 10);
  return seconds;
}

function toYouTubeEmbed(urlStr) {
  if (!urlStr) return "";
  if (urlStr.includes("youtube.com/embed/")) return urlStr; // déjà embed

  try {
    const u = new URL(urlStr);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      const t = u.searchParams.get("t");
      const start = parseTimeToSeconds(t);
      return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ""}`;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        const t = u.searchParams.get("t");
        const start = parseTimeToSeconds(t);
        if (!id) return urlStr;
        return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ""}`;
      }

      // youtube.com/shorts/<id>
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/shorts/")[1]?.split("/")[0];
        if (!id) return urlStr;
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    return urlStr;
  } catch {
    return urlStr;
  }
}

// ----------------- Data helpers -----------------
function uniqSeries() {
  return Array.from(new Set(allTechniques.map(t => String(t.serie))))
    .sort((a, b) => Number(a) - Number(b));
}

function techniquesForSerie(serie) {
  return allTechniques.filter(t => String(t.serie) === String(serie));
}

function uniqAttaques(techs) {
  return Array.from(new Set(techs.map(t => t.attaque)));
}

// ----------------- Populate UI -----------------
function populateSerieSelect() {
  const sel = document.getElementById("selectSerie");
  if (!sel) return;

  sel.innerHTML = `<option value="">Choisir une série</option>`;
  uniqSeries().forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = `Série ${s}`;
    sel.appendChild(opt);
  });
}

function populateAttackSelect() {
  const sel = document.getElementById("selectAttack");
  if (!sel) return;

  sel.innerHTML = `<option value="">Choisir une attaque</option>`;
  if (!currentSerie) return;

  const techs = techniquesForSerie(currentSerie);
  uniqAttaques(techs).forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  });
}

// ----------------- Module 1: Accordéon -----------------
function renderAccordion() {
  const sideSel = document.getElementById("filterSide");
  const list = document.getElementById("accordionList");
  if (!sideSel || !list) return;

  list.innerHTML = "";

  if (!currentSerie) {
    list.innerHTML = "<p>Choisis d’abord une série.</p>";
    return;
  }

  const side = sideSel.value;
  if (!side) return;

  const filtered = techniquesForSerie(currentSerie).filter(
    t => (t.cote || "").toLowerCase() === side.toLowerCase()
  );

  if (!filtered.length) {
    list.innerHTML = "<p>Aucune technique trouvée pour ce côté.</p>";
    return;
  }

  filtered.forEach((t) => {
    const wrapper = document.createElement("div");
    wrapper.className = "ippon-accordion";

    const header = document.createElement("div");
    header.className = "ippon-acc-header";
    header.textContent = t.attaque;
    header.setAttribute("role", "button");
    header.tabIndex = 0;

    const content = document.createElement("div");
    content.className = "ippon-acc-content";
    content.style.display = "none";
    content.innerHTML = `
      <p><strong>Tai sabaki :</strong> <span class="result-text">${t["tai sabaki"] ?? ""}</span></p>
      <p><strong>Blocage :</strong> <span class="result-text">${t.blocage ?? ""}</span></p>
      <p><strong>Défense :</strong> <span class="result-text">${t.defense ?? ""}</span></p>
    `;

    header.addEventListener("click", () => {
      content.style.display = content.style.display === "block" ? "none" : "block";
    });
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") header.click();
    });

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    list.appendChild(wrapper);
  });
}

function initAccordionModule() {
  const sideSel = document.getElementById("filterSide");
  if (!sideSel) return;
  sideSel.addEventListener("change", renderAccordion);
}

// ----------------- Module 2: Fiche technique -----------------
function renderCard() {
  const selAtt = document.getElementById("selectAttack");
  const selSide = document.getElementById("selectSide");
  const out = document.getElementById("resultCard");
  if (!selAtt || !selSide || !out) return;

  out.innerHTML = "";

  if (!currentSerie) {
    out.innerHTML = "<p>Choisis d’abord une série.</p>";
    return;
  }

  const att = selAtt.value;
  const side = selSide.value;
  if (!att || !side) return;

  const tech = techniquesForSerie(currentSerie).find(
    t => t.attaque === att && (t.cote || "").toLowerCase() === side.toLowerCase()
  );

  if (!tech) {
    out.innerHTML = "<p>Aucune fiche correspondante.</p>";
    return;
  }

  const embed = toYouTubeEmbed(tech.video);

  out.innerHTML = `
    <div class="result-card">
      <div class="tech-title">${tech.attaque}</div>
      <div class="tech-side">${tech.cote}</div>

      <p><strong class="result-title">Tai sabaki :</strong> <span class="result-text">${tech["tai sabaki"] ?? ""}</span></p>
      <p><strong class="result-title">Blocage :</strong> <span class="result-text">${tech.blocage ?? ""}</span></p>
      <p><strong class="result-title">Défense :</strong> <span class="result-text">${tech.defense ?? ""}</span></p>

      ${embed ? `
        <iframe
          class="video-frame"
          src="${embed}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>` : ""
      }
    </div>
  `;
}

function initSelectModule() {
  const selAtt = document.getElementById("selectAttack");
  const selSide = document.getElementById("selectSide");
  if (!selAtt || !selSide) return;

  selAtt.addEventListener("change", renderCard);
  selSide.addEventListener("change", renderCard);
}

// ----------------- Module 3: Surprise -----------------
function renderSurprise() {
  const out = document.getElementById("surpriseResult");
  if (!out) return;

  out.innerHTML = "";

  if (!currentSerie) {
    out.innerHTML = "<p>Choisis d’abord une série.</p>";
    return;
  }

  const techs = techniquesForSerie(currentSerie);
  if (!techs.length) {
    out.innerHTML = "<p>Aucune technique dans cette série.</p>";
    return;
  }

  const t = techs[Math.floor(Math.random() * techs.length)];
  const embed = toYouTubeEmbed(t.video);

  out.innerHTML = `
    <div class="result-card">
      <div>
        <div class="tech-title">${t.attaque}</div>
        <div class="tech-side">${t.cote}</div>
        <p><strong class="result-title">Tai sabaki :</strong> <span class="result-text">${t["tai sabaki"] ?? ""}</span></p>
        <p><strong class="result-title">Blocage :</strong> <span class="result-text">${t.blocage ?? ""}</span></p>
        <p><strong class="result-title">Défense :</strong> <span class="result-text">${t.defense ?? ""}</span></p>
      </div>

      ${embed ? `
        <iframe
          class="video-frame"
          src="${embed}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>` : ""
      }
    </div>
  `;
}

function initSurprise() {
  const btn = document.getElementById("btnSurprise");
  if (!btn) return;
  btn.addEventListener("click", renderSurprise);
}

// ----------------- Série: change handler -----------------
function initSerieModule() {
  const selSerie = document.getElementById("selectSerie");
  if (!selSerie) return;

  selSerie.addEventListener("change", () => {
    currentSerie = selSerie.value;

    // reset UI dépendante
    const filterSide = document.getElementById("filterSide");
    const selectSide = document.getElementById("selectSide");
    const selectAttack = document.getElementById("selectAttack");

    if (filterSide) filterSide.value = "";
    if (selectSide) selectSide.value = "";
    if (selectAttack) selectAttack.value = "";

    populateAttackSelect();

    // clear outputs
    const outCard = document.getElementById("resultCard");
    const outSurprise = document.getElementById("surpriseResult");
    const accList = document.getElementById("accordionList");
    if (outCard) outCard.innerHTML = "";
    if (outSurprise) outSurprise.innerHTML = "";
    if (accList) accList.innerHTML = "";
  });
}

// ----------------- Load JSON + Init -----------------
async function loadTechniquesFromJson() {
  // Si ton techniques.json est dans un sous-dossier, adapte le chemin ici.
  const res = await fetch("ipponkumite.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossible de charger ipponkumite.json (${res.status})`);
  return await res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    allTechniques = await loadTechniquesFromJson();

    populateSerieSelect();
    initSerieModule();

    initAccordionModule();
    initSelectModule();
    initSurprise();

    // auto-sélection de la première série (optionnel)
    const selSerie = document.getElementById("selectSerie");
    const series = uniqSeries();
    if (selSerie && series.length) {
      selSerie.value = series[0];
      selSerie.dispatchEvent(new Event("change"));
    }
  } catch (err) {
    console.error(err);
    const accList = document.getElementById("accordionList");
    if (accList) accList.innerHTML = "<p>Erreur: impossible de charger le fichier JSON.</p>";
  }
});
