// ippon.js – GitHub Pages: JSON + séries indépendantes + YouTube URL -> embed

let allTechniques = [];

// Série module 1 (accordéon)
let serieAccordion = "";

// Série modules 2+3 (fiche + surprise)
let serieMain = "";

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
  if (urlStr.includes("youtube.com/embed/")) return urlStr;

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

// ----------------- Populate série selects -----------------
function populateSerieSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  sel.innerHTML = `<option value="">Choisir une série</option>`;
  uniqSeries().forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = `Série ${s}`;
    sel.appendChild(opt);
  });
}

// ----------------- Module 1: Accordéon -----------------
function renderAccordion() {
  const sideSel = document.getElementById("filterSide");
  const list = document.getElementById("accordionList");
  if (!sideSel || !list) return;

  list.innerHTML = "";

  if (!serieAccordion) {
    list.innerHTML = "<p>Choisis d’abord une série (accordéon).</p>";
    return;
  }

  const side = sideSel.value;
  if (!side) return;

  const filtered = techniquesForSerie(serieAccordion).filter(
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
  const selSerieAcc = document.getElementById("selectSerieAccordion");
  const sideSel = document.getElementById("filterSide");
  if (selSerieAcc) {
    selSerieAcc.addEventListener("change", () => {
      serieAccordion = selSerieAcc.value;

      // reset côté + contenu accordéon
      if (sideSel) sideSel.value = "";
      const list = document.getElementById("accordionList");
      if (list) list.innerHTML = "";
    });
  }

  if (sideSel) sideSel.addEventListener("change", renderAccordion);
}

// ----------------- Module 2: Fiche technique -----------------
function populateAttackSelect() {
  const sel = document.getElementById("selectAttack");
  if (!sel) return;

  sel.innerHTML = `<option value="">Choisir une attaque</option>`;
  if (!serieMain) return;

  const techs = techniquesForSerie(serieMain);
  uniqAttaques(techs).forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  });
}

function renderCard() {
  const selAtt = document.getElementById("selectAttack");
  const selSide = document.getElementById("selectSide");
  const out = document.getElementById("resultCard");
  if (!selAtt || !selSide || !out) return;

  out.innerHTML = "";

  if (!serieMain) {
    out.innerHTML = "<p>Choisis d’abord une série (fiche technique).</p>";
    return;
  }

  const att = selAtt.value;
  const side = selSide.value;
  if (!att || !side) return;

  const tech = techniquesForSerie(serieMain).find(
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
  const selSerie = document.getElementById("selectSerie");
  const selAtt = document.getElementById("selectAttack");
  const selSide = document.getElementById("selectSide");

  if (selSerie) {
    selSerie.addEventListener("change", () => {
      serieMain = selSerie.value;

      // reset fiche + surprise
      if (selAtt) selAtt.value = "";
      if (selSide) selSide.value = "";

      populateAttackSelect();

      const out = document.getElementById("resultCard");
      const sur = document.getElementById("surpriseResult");
      if (out) out.innerHTML = "";
      if (sur) sur.innerHTML = "";
    });
  }

  if (selAtt) selAtt.addEventListener("change", renderCard);
  if (selSide) selSide.addEventListener("change", renderCard);
}

// ----------------- Module 3: Surprise -----------------
function renderSurprise() {
  const out = document.getElementById("surpriseResult");
  if (!out) return;

  out.innerHTML = "";

  if (!serieMain) {
    out.innerHTML = "<p>Choisis d’abord une série (surprise).</p>";
    return;
  }

  const techs = techniquesForSerie(serieMain);
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

// ----------------- Load JSON + Init -----------------
async function loadTechniquesFromJson() {
  const res = await fetch("techniques.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossible de charger techniques.json (${res.status})`);
  return await res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    allTechniques = await loadTechniquesFromJson();

    // Remplir les 2 selects série (indépendants)
    populateSerieSelect("selectSerieAccordion");
    populateSerieSelect("selectSerie");

    initAccordionModule();
    initSelectModule();
    initSurprise();

    // Optionnel : présélectionner série 1 pour chacun (si tu veux)
    const series = uniqSeries();
    if (series.length) {
      const selAcc = document.getElementById("selectSerieAccordion");
      const selMain = document.getElementById("selectSerie");
      if (selAcc) selAcc.value = series[0];
      if (selMain) selMain.value = series[0];
      serieAccordion = series[0];
      serieMain = series[0];
      populateAttackSelect();
    }

  } catch (err) {
    console.error(err);
    const accList = document.getElementById("accordionList");
    if (accList) accList.innerHTML = "<p>Erreur: impossible de charger le fichier JSON.</p>";
  }
});
