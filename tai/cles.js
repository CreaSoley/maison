/* ----------------------------------------------------------
   CHARGEMENT DES EXERCICES
---------------------------------------------------------- */

let exercicesData = [];
let exercicesParTechnique = {};

async function chargerExercices() {
    try {
        const resp = await fetch("randori_exercices.json");
        exercicesData = await resp.json();

        // Regrouper par technique (champ "video")
        exercicesParTechnique = {};
        exercicesData.forEach(ex => {
            const tech = ex.video || "Autre";
            if (!exercicesParTechnique[tech]) exercicesParTechnique[tech] = [];
            exercicesParTechnique[tech].push(ex);
        });

        remplirSelectTechniques();
    } catch (e) {
        console.error("Erreur lors du chargement des exercices :", e);
    }
}

/* ----------------------------------------------------------
   REMPLIR MENU 1 : LISTE DES TECHNIQUES
---------------------------------------------------------- */
function remplirSelectTechniques() {
    const selTech = document.getElementById("selectCleTechnique");
    selTech.innerHTML = '<option value="">Choisir une clé...</option>';

    Object.keys(exercicesParTechnique).forEach(tech => {
        const opt = document.createElement("option");
        opt.value = tech;
        opt.textContent = tech;
        selTech.appendChild(opt);
    });
}

/* ----------------------------------------------------------
   REMPLIR MENU 2 : LISTE DES EXERCICES POUR UNE TECHNIQUE
---------------------------------------------------------- */
function remplirSelectExercices(tech) {
    const selEx = document.getElementById("selectCleExercice");
    selEx.innerHTML = '<option value="">Choisir un exercice...</option>';

    if (!tech || !exercicesParTechnique[tech]) return;

    exercicesParTechnique[tech].forEach(ex => {
        const opt = document.createElement("option");
        opt.value = ex.exercice;
        opt.textContent = `${ex.exercice}. ${ex.titre.trim()}`;
        selEx.appendChild(opt);
    });
}

/* ----------------------------------------------------------
   AFFICHAGE DE LA FICHE EXERCICE
---------------------------------------------------------- */
function afficherExercice(tech, num) {
    const cont = document.getElementById("cleCard");
    cont.innerHTML = "";

    if (!tech || !num) return;

    const ex = exercicesParTechnique[tech].find(e => e.exercice == num);
    if (!ex) return;

    const photo = ex.photo ? ex.photo : "no-image.png";

    cont.innerHTML = `
        <div class="cle-card">

            <div class="cle-row">

                <!-- PHOTO -->
                <div class="cle-photo">
                    <img src="${photo}" alt="photo exercice">
                </div>

                <!-- INFOS -->
                <div class="cle-infos">

                    <h3 class="spicy cle-title">${tech} – Exercice ${ex.exercice}</h3>

                    <p><strong>Titre :</strong> ${ex.titre}</p>
                    <p><strong>Objectif :</strong> ${ex.objectif}</p>
                    <p><strong>Consigne :</strong><br>${ex.consigne.replace(/\n/g, "<br>")}</p>

                    <div class="cle-btns">
                        <button class="btn primary" onclick="imprimerExercice(${ex.exercice}, '${tech}')">🖨 Imprimer</button>
                        ${ex.video_exercice ? `<a class="btn ghost" href="${ex.video_exercice}" target="_blank">🎥 Vidéo</a>` : ""}
                    </div>

                </div>

            </div>

        </div>
    `;
}

/* ----------------------------------------------------------
   IMPRESSION — FICHE DÉDIÉE
---------------------------------------------------------- */
function imprimerExercice(num, tech) {
    const ex = exercicesParTechnique[tech].find(e => e.exercice == num);
    if (!ex) return;

    const photo = ex.photo ? ex.photo : "no-image.png";

    // Génération d'un QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ex.video_exercice)}`;

    // Création d’une fenêtre d’impression
    const win = window.open("", "_blank");

    win.document.write(`
        <html>
        <head>
            <title>Fiche Exercice</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h2 { font-family: 'Spicy', cursive; }

                .photo-print img {
                    max-width: 7cm;
                    max-height: 7cm;
                    object-fit: cover;
                    border-radius: 10px;
                    border: 2px solid #ff9bdd;
                }
                .qr img { width: 4cm; margin-top: 15px; }

            </style>
        </head>
        <body>

            <h2>${tech} – Exercice ${ex.exercice}</h2>

            <div class="photo-print">
                <img src="${photo}">
            </div>

            <p><strong>Titre :</strong> ${ex.titre}</p>
            <p><strong>Objectif :</strong> ${ex.objectif}</p>
            <p><strong>Consigne :</strong><br>${ex.consigne.replace(/\n/g, "<br>")}</p>

            ${ex.video_exercice ? `
                <div class="qr">
                    <p><strong>Vidéo :</strong></p>
                    <img src="${qrUrl}">
                </div>
            ` : ""}

            <script>window.print();</script>
        </body>
        </html>
    `);

    win.document.close();
}

/* ----------------------------------------------------------
   INIT
---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    chargerExercices();

    document.getElementById("selectCleTechnique").addEventListener("change", e => {
        const tech = e.target.value;
        remplirSelectExercices(tech);
        document.getElementById("cleCard").innerHTML = "";
    });

    document.getElementById("selectCleExercice").addEventListener("change", e => {
        const tech = document.getElementById("selectCleTechnique").value;
        const num = e.target.value;
        afficherExercice(tech, num);
    });
});
