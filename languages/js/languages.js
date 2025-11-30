// languages/js/languages.js
// MODULE ES (top-level await autorisé)

const DATA_BASE = "data/"; // JSON dans /languages/js/data/

document.addEventListener("DOMContentLoaded", () => {
    const flags = document.querySelectorAll(".flag-item");
    const panels = document.querySelectorAll(".lang-panel");

    flags.forEach(btn => {
        btn.addEventListener("click", () => activateLang(btn.dataset.lang));
    });

    // Active la première langue au chargement
    const first = document.querySelector(".flag-item").dataset.lang;
    activateLang(first);

    async function activateLang(lang) {
        panels.forEach(p => {
            const id = p.id.replace("lang-", "");

            if (id === lang) {
                p.classList.add("active");
                p.style.display = "";
                p.removeAttribute("aria-hidden");

                if (!p.dataset.loaded) {
                    await populatePanel(p, lang);
                    p.dataset.loaded = "1";
                }
            } else {
                // Évite l’erreur ARIA → retirer focus des descendants
                p.querySelectorAll("button, a, input, iframe").forEach(el => el.blur());

                p.classList.remove("active");
                p.style.display = "none";
                p.setAttribute("aria-hidden", "true");
            }
        });
    }

    async function populatePanel(panelEl, lang) {
        panelEl.innerHTML = `
            <h2>${lang.toUpperCase()}</h2>

            <section>
                <h3>Vidéo du jour</h3>
                <button class="btn-load-video" data-type="stories">Voir une histoire</button>
                <button class="btn-load-video" data-type="recipes">Voir une recette</button>
                <div class="video-placeholder"></div>
            </section>

            <section>
                <h3>Nouveaux mots</h3>
                <button class="btn-new-mots">Rafraîchir</button>
                <ul class="mots-list"></ul>
            </section>

            <section>
                <h3>Ressources utiles</h3>
                <ul class="resources-list"></ul>
            </section>
        `;

        try {
            const [stories, recipes, mots, resources] = await Promise.all([
                fetch(DATA_BASE + "stories.json").then(r => r.json()),
                fetch(DATA_BASE + "recipes.json").then(r => r.json()),
                fetch(DATA_BASE + "mots.json").then(r => r.json()),
                fetch(DATA_BASE + "resources.json").then(r => r.json()),
            ]);

            // Boutons vidéos
            panelEl.querySelectorAll(".btn-load-video").forEach(btn => {
                btn.addEventListener("click", () => {
                    const type = btn.dataset.type;
                    const placeholder = panelEl.querySelector(".video-placeholder");

                    const list =
                        type === "stories" ? stories[lang] || [] :
                        type === "recipes" ? recipes[lang] || [] : [];

                    if (!list.length) {
                        placeholder.innerHTML = "<p>Aucune vidéo disponible.</p>";
                        return;
                    }

                    const index = seededIndex(list.length);
                    loadVideo(placeholder, list[index]);
                });
            });

            // Nouveaux mots
            panelEl.querySelector(".btn-new-mots").addEventListener("click", () => {
                fillMots(panelEl, mots, lang);
            });

            fillMots(panelEl, mots, lang);
            fillResources(panelEl, resources, lang);

        } catch (err) {
            console.error("Erreur JSON :", err);
            panelEl.innerHTML += "<p>Erreur lors du chargement des données.</p>";
        }
    }

    function loadVideo(placeholder, video) {
        placeholder.innerHTML = `
            <iframe src="${video.embed}"
                title="${video.title || "Vidéo"}"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer">
            </iframe>
        `;
    }

    function fillMots(panelEl, data, lang) {
        const list = panelEl.querySelector(".mots-list");
        const pool = data[lang] || [];

        if (!pool.length) {
            list.innerHTML = "<li>Aucun mot disponible.</li>";
            return;
        }

        list.innerHTML = "";
        const selected = pick3(pool);

        selected.forEach(item => {
            list.innerHTML += `<li><strong>${item.word}</strong> — ${item.translation}</li>`;
        });
    }

    function fillResources(panelEl, data, lang) {
        const list = panelEl.querySelector(".resources-list");
        const pool = data[lang] || [];

        if (!pool.length) {
            list.innerHTML = "<li>Aucune ressource pour l'instant.</li>";
            return;
        }

        list.innerHTML = "";
        pool.forEach(r => {
            list.innerHTML += `<li><a href="${r.href}" target="_blank">${r.title}</a></li>`;
        });
    }

    // Utils
    function seededIndex(max) {
        const seed = new Date().getDate();
        return seed % max;
    }

    function pick3(arr) {
        return arr.slice(0, 3);
    }
});
