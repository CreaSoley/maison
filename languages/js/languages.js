// js/languages.js
document.addEventListener("DOMContentLoaded", () => {
  const flags = document.querySelectorAll(".flag-item");
  const panels = document.querySelectorAll(".lang-panel");

  // mapping langue -> clé dans JSON
  const LANGS = {
    en: "en",
    de: "de",
    es: "es",
    lsf: "lsf"
  };

  // événement pour changer de langue
  flags.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      switchTo(lang);
    });
  });

  // par défaut : anglais (ou active première)
  const firstLang = document.querySelector(".flag-item").dataset.lang;
  switchTo(firstLang);

  async function switchTo(lang) {
    panels.forEach(p => {
      const id = p.id.replace("lang-","");
      if (id === lang) {
        p.classList.add("active");
        p.style.display = ""; // restore
        p.setAttribute("aria-hidden","false");
        if (!p.dataset.loaded) {
          await populatePanel(p, lang);
          p.dataset.loaded = "1";
        }
      } else {
        p.classList.remove("active");
        p.style.display = "none";
        p.setAttribute("aria-hidden","true");
      }
    });
  }

  async function populatePanel(panelEl, lang) {
    // charger 4 fichiers JSON : stories, recipes, mots, ressources
    try {
      const [stories, recipes, mots, resources] = await Promise.all([
        fetch(`js/data/stories.json`).then(r => r.json()),
        fetch(`js/data/recipes.json`).then(r => r.json()),
        fetch(`js/data/mots.json`).then(r => r.json()),
        fetch(`js/data/resources.json`).then(r => r.json()),
      ]);

      // initialiser boutons vidéo
      const btns = panelEl.querySelectorAll(".btn-load-video");
      btns.forEach(btn => {
        btn.addEventListener("click", () => {
          const type = btn.dataset.type; // 'stories' ou 'recipes'
          const placeholder = btn.closest(".lang-grid").querySelectorAll(".video-placeholder")[ Array.from(btn.closest(".lang-grid").children).indexOf(btn.closest(".mini-card")) ];
          // Pick item
          const pool = (type === "stories") ? stories[lang] || [] : recipes[lang] || [];
          if (!pool || pool.length === 0) {
            placeholder.innerHTML = `<p>Pas de vidéo disponible.</p>`;
            return;
          }
          const index = seededIndexForToday(pool.length);
          const vid = pool[index];
          loadVideoInPlaceholder(placeholder, vid);
        });
      });

      // boutons nouveaux mots
      panelEl.querySelectorAll(".btn-new-mots").forEach(btn => {
        btn.addEventListener("click", () => {
          fillMots(panelEl, mots, lang);
        });
      });

      // remplir la première fois
      fillMots(panelEl, mots, lang);
      fillResources(panelEl, resources, lang);

    } catch (err) {
      console.error("Erreur chargement données :", err);
      panelEl.querySelectorAll(".video-placeholder").forEach(ph => ph.innerHTML = "<p>Erreur de chargement.</p>");
    }
  }

  function loadVideoInPlaceholder(placeholderEl, vid) {
    // vid doit contenir : { embed: "https://www.youtube.com/embed/ID", title: "..."}
    // ne pas autoplay : on n'ajoute pas de param autoplay=1
    placeholderEl.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "video-frame";
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", vid.embed);
    iframe.setAttribute("title", vid.title || "Vidéo");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy","no-referrer");
    // sandbox si tu veux restreindre : iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    wrap.appendChild(iframe);
    placeholderEl.appendChild(wrap);
    placeholderEl.dataset.loaded = "true";
  }

  function fillMots(panelEl, motsJson, lang) {
    const listEl = panelEl.querySelector(".mots-list");
    listEl.innerHTML = "";
    const pool = motsJson[lang] || [];
    if (pool.length === 0) {
      listEl.innerHTML = "<li>Aucun mot disponible pour l'instant.</li>";
      return;
    }
    // Choisir 3 mots aléatoires (sans répétition)
    const selected = pickNRandom(pool, 3, seededIndexForToday(pool.length));
    selected.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.word}</strong> — <em>${item.translation || ""}</em>`;
      listEl.appendChild(li);
    });
  }

  function fillResources(panelEl, resourcesJson, lang) {
    const listEl = panelEl.querySelector(".resources-list");
    listEl.innerHTML = "";
    const pool = resourcesJson[lang] || [];
    if (!pool.length) {
      listEl.innerHTML = "<li>Aucune ressource pour l'instant.</li>";
      return;
    }
    pool.forEach(r => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${r.href}" target="_blank" rel="noopener noreferrer">${r.title}</a>`;
      listEl.appendChild(li);
    });
  }

  // UTILITAIRES

  // index pseudo-aléatoire stable par jour : basé sur la date pour rotation quotidienne
  function seededIndexForToday(max) {
    const d = new Date();
    const seed = Math.floor(d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate());
    return seedRandomIndex(seed, max);
  }

  function seedRandomIndex(seed, max) {
    // simple PRNG
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  }

  // pick N unique random items; startIndex used as offset to vary day-by-day
  function pickNRandom(arr, n, startIndex = 0) {
    const res = [];
    const len = arr.length;
    for (let i = 0; i < Math.min(n, len); i++) {
      const idx = (startIndex + i) % len;
      res.push(arr[idx]);
    }
    return res;
  }

});

