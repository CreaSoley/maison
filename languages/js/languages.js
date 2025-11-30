// js/languages.js
// Version robuste : pas de top-level await, gère focus quand on cache un panneau.
// Assure-toi que ce fichier est chargé avec <script type="module"> (ou non, il fonctionne aussi).

document.addEventListener("DOMContentLoaded", () => {
  const flags = Array.from(document.querySelectorAll(".flag-item"));
  const panels = Array.from(document.querySelectorAll(".lang-panel"));

  // Par défaut si JSON est à ../js/data/ depuis languages/ => ajuster si nécessaire
  const DATA_BASE = (() => {
    // si ce fichier est dans /js/ et index dans /languages/, utilisez: '../js/data/'
    // si vous avez mis data dans languages/js/data/ => changez en 'js/data/'
    return "../js/data/"; // adapte selon ton arborescence
  })();

  // attach keyboard + click behavior on flags
  flags.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      activateLang(lang, btn);
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // lancement initial (wrap dans IIFE async pour éviter top-level await issues)
  (async () => {
    const first = flags.length ? flags[0].dataset.lang : null;
    if (first) await activateLang(first, flags[0]);
  })();

  // Active le panneau pour une langue (gère affichage + chargement)
  async function activateLang(lang, flagBtn) {
    for (const p of panels) {
      const idLang = p.id.replace("lang-", "");
      if (idLang === lang) {
        // show this panel
        p.classList.add("active");
        p.style.display = "";
        // remove aria-hidden from the active panel
        p.setAttribute("aria-hidden", "false");

        // move focus into the panel for accessibility (to prevent aria-hidden focus warnings)
        // focus the first interactive element (btn-load-video or first button)
        setTimeout(() => {
          const firstFocusable = p.querySelector("button, a, [tabindex]:not([tabindex='-1'])");
          if (firstFocusable) firstFocusable.focus();
        }, 50);

        if (!p.dataset.loaded) {
          await populatePanel(p, lang);
          p.dataset.loaded = "1";
        }
      } else {
        // before hiding check if panel contains activeElement
        if (p.contains(document.activeElement)) {
          // move focus back to the flag button (if provided) or to body
          try {
            if (flagBtn && typeof flagBtn.focus === "function") {
              flagBtn.focus();
            } else {
              document.body.focus();
            }
          } catch (err) {
            // ignore
          }
        }
        p.classList.remove("active");
        p.style.display = "none";
        p.setAttribute("aria-hidden", "true");
      }
    }
  }

  async function populatePanel(panelEl, lang) {
    try {
      // Remarque : adapte DATA_BASE si ton dossier data est ailleurs
      const [stories, recipes, mots, resources] = await Promise.all([
        fetch(DATA_BASE + "stories.json").then(r => r.ok ? r.json() : {}),
        fetch(DATA_BASE + "recipes.json").then(r => r.ok ? r.json() : {}),
        fetch(DATA_BASE + "mots.json").then(r => r.ok ? r.json() : {}),
        fetch(DATA_BASE + "resources.json").then(r => r.ok ? r.json() : {}),
      ]);

      // boutons video
      const btns = panelEl.querySelectorAll(".btn-load-video");
      btns.forEach((btn, idx) => {
        // remove previous listeners if any by cloning node
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => {
          const type = newBtn.dataset.type;
          // trouver le placeholder associé : on prend le .video-placeholder le plus proche dans la même mini-card
          const miniCard = newBtn.closest(".mini-card");
          const placeholder = miniCard ? miniCard.querySelector(".video-placeholder") : null;
          const pool = (type === "stories") ? (stories[lang] || []) : (recipes[lang] || []);
          if (!pool || pool.length === 0) {
            if (placeholder) placeholder.innerHTML = "<p>Pas de vidéo disponible.</p>";
            return;
          }
          const index = seededIndexForToday(pool.length);
          const vid = pool[index];
          loadVideoInPlaceholder(placeholder, vid);
        });
      });

      // nouveaux mots
      panelEl.querySelectorAll(".btn-new-mots").forEach(btn => {
        btn.addEventListener("click", () => fillMots(panelEl, mots, lang));
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
    if (!placeholderEl) return;
    placeholderEl.innerHTML = "";
    // vid.embed ou vid.embedUrl ou vid.embed (supporte embed clé)
    const src = vid.embed || vid.src || vid.embedUrl || "";
    if (!src) {
      placeholderEl.innerHTML = "<p>Vidéo introuvable.</p>";
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = vid.title || "Vidéo";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "");
    iframe.style.width = "100%";
    iframe.style.border = "0";
    // set a fixed min height
    iframe.style.minHeight = "160px";
    placeholderEl.appendChild(iframe);
    placeholderEl.dataset.loaded = "true";
  }

  function fillMots(panelEl, motsJson, lang) {
    const listEl = panelEl.querySelector(".mots-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    const pool = (motsJson && motsJson[lang]) ? motsJson[lang] : [];
    if (!pool.length) {
      listEl.innerHTML = "<li>Aucun mot disponible pour l'instant.</li>";
      return;
    }
    const selected = pickNRandom(pool, 3, seededIndexForToday(pool.length));
    selected.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span><strong>${escapeHtml(item.word)}</strong></span><span style="opacity:0.8">${escapeHtml(item.translation || "")}</span>`;
      listEl.appendChild(li);
    });
  }

  function fillResources(panelEl, resourcesJson, lang) {
    const listEl = panelEl.querySelector(".resources-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    const pool = (resourcesJson && resourcesJson[lang]) ? resourcesJson[lang] : [];
    if (!pool.length) {
      listEl.innerHTML = "<li>Aucune ressource pour l'instant.</li>";
      return;
    }
    pool.forEach(r => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${escapeAttr(r.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)}</a>`;
      listEl.appendChild(li);
    });
  }

  // helpers
  function seededIndexForToday(max) {
    const d = new Date();
    const seed = d.getFullYear()*1000 + (d.getMonth()+1)*50 + d.getDate();
    return seedRandomIndex(seed, Math.max(1, max));
  }
  function seedRandomIndex(seed, max) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  }
  function pickNRandom(arr, n, startIndex = 0) {
    const res = [];
    const len = arr.length;
    for (let i = 0; i < Math.min(n, len); i++) {
      const idx = (startIndex + i) % len;
      res.push(arr[idx]);
    }
    return res;
  }
  function escapeHtml(s){ return String(s || "").replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

}); // DOMContentLoaded end
