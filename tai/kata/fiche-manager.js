// ======================================================
// SCRIPT POUR LA GESTION DES FICHES DE SUIVI
// ======================================================
document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // CONFIGURATION ET ÉTAT
    // ======================================================
    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPqEcA-8CaCPXLFy2tt9WjFIxp04AED3iGzzC31vNT577rHk7csMaEdo6C9QSk0fvTNbvcc26kMLSu/pub?output=csv";
    let allKatas = [];
    let currentKata = null;

    // ======================================================
    // RÉFÉRENCES AUX ÉLÉMENTS DU DOM
    // ======================================================
    const kataSelector = document.getElementById('kataSelector');
    const kataCardDisplay = document.getElementById('kataCardDisplay');

    // ======================================================
    // CHARGEMENT DES DONNÉES (PapaParse)
    // ======================================================
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("PapaParse a terminé. Données brutes :", results.data); // LOG POUR DÉBOGAGE

            allKatas = results.data.map(k => ({
                nom_kata: (k["nom_kata"] || "").trim(),
                etapes_kata: (k["etapes_kata"] || "").trim(),
                shema_kata: (k["shema_kata"] || "").trim()
            })).filter(k => k.nom_kata);

            console.log("Katas nettoyés et filtrés :", allKatas); // LOG POUR DÉBOGAGE

            populateKataSelector();
            
            // Sélectionner et afficher la première fiche par défaut
            if (allKatas.length > 0) {
                kataSelector.value = allKatas[0].nom_kata;
                kataSelector.dispatchEvent(new Event('change'));
            } else {
                kataSelector.innerHTML = '<option value="">Aucune fiche trouvée</option>';
                kataCardDisplay.innerHTML = '<p>Aucune fiche à afficher. Veuillez en ajouter une via le formulaire.</p>';
            }
        },
        error: function(err) {
            console.error("Erreur PapaParse:", err); // LOG POUR DÉBOGAGE
            kataSelector.innerHTML = '<option value="">Erreur de chargement</option>';
            kataCardDisplay.innerHTML = '<p>Une erreur est survenue lors du chargement des fiches.</p>';
        }
    });

    // ======================================================
    // PEUPLEMENT DU SÉLECTEUR
    // ======================================================
    function populateKataSelector() {
        kataSelector.innerHTML = '<option value="">-- Choisir une fiche --</option>';
        allKatas.forEach(kata => {
            const option = document.createElement('option');
            option.value = kata.nom_kata;
            option.textContent = kata.nom_kata;
            kataSelector.appendChild(option);
        });
    }

    // ======================================================
    // AFFICHAGE DE LA FICHE SÉLECTIONNÉE
    // ======================================================
    kataSelector.addEventListener('change', (e) => {
        const selectedName = e.target.value;
        if (!selectedName) {
            kataCardDisplay.innerHTML = '';
            currentKata = null;
            return;
        }

        currentKata = allKatas.find(k => k.nom_kata === selectedName);
        if (currentKata) {
            renderKataCard(currentKata);
        }
    });

    // ... (le début du fichier fiche-manager.js est inchangé) ...

function renderKataCard(kata) {
    // L'image est maintenant en haut, avec `object-fit: contain` pour ne pas être coupée
    const imageHtml = kata.shema_kata
        ? `<img src="${escapeHtml(kata.shema_kata)}" alt="Schéma ${escapeHtml(kata.nom_kata)}" class="kata-fiche-image" onerror="this.style.display='none'">`
        : '';

    kataCardDisplay.innerHTML = `
        <article class="kata-fiche-card">
            ${imageHtml}
            <!-- Le titre en "spicy" juste en dessous de l'image -->
            <h3 class="kata-fiche-title spicy">${escapeHtml(kata.nom_kata)}</h3>
            
            <!-- Conteneur en deux colonnes -->
            <div class="kata-fiche-body">
                <!-- Colonne de gauche : Contrôles -->
                <div class="kata-fiche-controls">
                    <!-- Le régulateur est en premier -->
                    <div class="slider-container">
                        <label for="speedRateFiche">Vitesse :</label>
                        <input type="range" id="speedRateFiche" min="0.5" max="2" value="1" step="0.1">
                        <span id="speedValueFiche">1.0x</span>
                    </div>
                    <!-- Puis les autres boutons -->
                    <div class="button-group">
                        <button id="btnPlay" class="btn-fiche btn-pdf">
                            <span class="material-icons">play_arrow</span> Lecture
                        </button>
                        <button id="btnPause" class="btn-fiche btn-pdf" disabled>
                            <span class="material-icons">pause</span> Pause
                        </button>
                        <button id="btnStop" class="btn-fiche btn-pdf">
                            <span class="material-icons">stop</span> Stop
                        </button>
                        <button id="btnPdf" class="btn-fiche btn-pdf">
                            <span class="material-icons">picture_as_pdf</span> PDF
                        </button>
                        <button id="btnWhatsapp" class="btn-fiche btn-whatsapp">
                            <span class="material-icons">share</span> WhatsApp
                        </button>
                    </div>
                </div>
                
                <!-- Colonne de droite : Déroulé -->
                <div class="kata-fiche-steps-container">
                    <pre class="kata-fiche-steps">${escapeHtml(kata.etapes_kata)}</pre>
                </div>
            </div>
        </article>
    `;
    attachFicheEventListeners();
}
    
    // ======================================================
    // GESTION DE LA SYNTHÈSE VOCALE (TTS)
    // ======================================================
    let speechUtterance = null;

// ... (le début du fichier fiche-manager.js est inchangé) ...

function attachFicheEventListeners() {
    const btnPlay = document.getElementById('btnPlay');
    const btnPause = document.getElementById('btnPause');
    const btnStop = document.getElementById('btnStop');
    const btnPdf = document.getElementById('btnPdf');
    const btnWhatsapp = document.getElementById('btnWhatsapp');
    const speedRateSlider = document.getElementById('speedRateFiche');
    const speedValueSpan = document.getElementById('speedValueFiche');

    if (!btnPlay) return;

    // Gestion de la vitesse (inchangée)
    speedRateSlider.addEventListener('input', () => {
        speedValueSpan.textContent = parseFloat(speedRateSlider.value).toFixed(1) + 'x';
        // Note: le réglage de vitesse en cours de lecture est complexe, 
        // il s'appliquera à la prochaine lecture.
    });

    btnPlay.addEventListener('click', () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            btnPause.disabled = false;
            btnPlay.disabled = true;
        } else {
            if (!currentKata) return;
            
            window.speechSynthesis.cancel(); // Stoppe toute lecture précédente
            
            const speechRate = parseFloat(speedRateSlider.value);

            // --- NOUVELLE SÉQUENCE DE LECTURE ---
            
            // 1. Phrase d'introduction
            const intro = `"aujourd'hui nous allons travailler le kata ${currentKata.nom_kata}"`;
            const utteranceIntro = new SpeechSynthesisUtterance(intro);
            utteranceIntro.lang = 'fr-FR';
            utteranceIntro.rate = speechRate;

            utteranceIntro.onend = () => {
                // 2. Pause de 2 secondes après l'intro
                setTimeout(() => {
                    const start = "commençons";
                    const utteranceStart = new SpeechSynthesisUtterance(start);
                    utteranceStart.lang = 'fr-FR';
                    utteranceStart.rate = speechRate;

                    utteranceStart.onend = () => {
                        // 3. Pause de 1 seconde après "commençons"
                        setTimeout(() => {
                            // 4. Lecture du déroulé
                            const utteranceSteps = new SpeechSynthesisUtterance(currentKata.etapes_kata);
                            utteranceSteps.lang = 'fr-FR';
                            utteranceSteps.rate = speechRate;

                            utteranceSteps.onend = () => {
                                // Réinitialise les boutons à la fin de TOUTE la lecture
                                btnPause.disabled = true;
                                btnPlay.disabled = false;
                            };
                            
                            window.speechSynthesis.speak(utteranceSteps);

                        }, 1000); // Pause de 1 seconde
                    };
                    
                    window.speechSynthesis.speak(utteranceStart);

                }, 2000); // Pause de 2 secondes
            };

            // Désactive le bouton play et active le pause dès le début
            btnPause.disabled = false;
            btnPlay.disabled = true;
            
            window.speechSynthesis.speak(utteranceIntro);
        }
    });

    btnPause.addEventListener('click', () => {
        window.speechSynthesis.pause();
        btnPause.disabled = true;
        btnPlay.disabled = false;
    });

    btnStop.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        btnPause.disabled = true;
        btnPlay.disabled = false;
    });

    // Gestion PDF et WhatsApp (inchangées)
    btnPdf.addEventListener('click', () => {
        window.print();
    });

    btnWhatsapp.addEventListener('click', () => {
        if (!currentKata) return;
        const text = `Voici mon kata : ${currentKata.nom_kata}\n\n${currentKata.etapes_kata.substring(0, 200)}...`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });
}

// ... (le reste du fichier fiche-manager.js est inchangé) ...

    // ======================================================
    // UTILITAIRE
    // ======================================================
    function escapeHtml(s) {
        if (!s) return "";
        return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    }
});
