let exercicesData = [];
let groupedByKey = {};

document.addEventListener("DOMContentLoaded", () => {
    loadExercices();
});

function loadExercices() {
    fetch("randori_exercices.json")
        .then(r => r.json())
        .then(data => {
            exercicesData = data;
            groupByKey();
            populateKeys();
        })
        .catch(err => console.error("Erreur JSON clés :", err));
}

/* --- GROUPE PAR CLÉ ARTICULAIRE --- */
function groupByKey() {
    groupedByKey = {};

    exercicesData.forEach(ex => {
        const key = ex.video.trim();  // "Kote gaeshi", "Ude gatame", etc.

        if (!groupedByKey[key]) groupedByKey[key] = [];
        groupedByKey[key].push(ex);
    });
}

/* --- REMPLIT LE MENU "Choisir une clé" --- */
function populateKeys() {
    const selectCle = document.getElementById("selectCle");
    selectCle.innerHTML = `<option value="">Choisir une clé</option>`;

    Object.keys(groupedByKey).forEach(keyName => {
        const opt = document.createElement("option");
        opt.value = keyName;
        opt.textContent = keyName;
        selectCle.appendChild(opt);
    });

    selectCle.addEventListener("change", () => {
        populateExercices(selectCle.value);
        document.getElementById("cleCard").innerHTML = "";
    });
}

/* --- REMPLIT LE MENU EXERCICES --- */
function populateExercices(key) {
    const selectExercice = document.getElementById("selectExercice");

    selectExercice.innerHTML = `<option value="">Choisir un exercice</option>`;

    if (!groupedByKey[key]) return;

    groupedByKey[key].forEach((ex, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = `${ex.exercice}. ${ex.titre.trim()}`;
        selectExercice.appendChild(opt);
    });

    selectExercice.addEventListener("change", () => {
        const index = selectExercice.value;
        if (index !== "") {
            displayExercice(groupedByKey[key][index]);
        }
    });
}

/* --- AFFICHAGE 50/50 DE LA FICHE --- */
function displayExercice(ex) {
    const container = document.getElementById("cleCard");

    const photo = ex.photo ? ex.photo : "";
    const video = ex.video_exercice ? ex.video_exercice : "";
    const qrContent = ex.qr ? ex.qr : "";

    container.innerHTML = `
        <div class="fiche-row">

            <!-- GAUCHE : PHOTO -->
            <div class="fiche-left">
                ${photo ? `<img src="${photo}" class="fiche-photo">` : "<div>Aucune image</div>"}
            </div>

            <!-- DROITE : INFORMATIONS -->
            <div class="fiche-right">
                <div class="fiche-card">
                    <h3 class="spicy tech-title">${ex.video} — Ex ${ex.exercice}</h3>

                    <p><strong>Titre :</strong> ${ex.titre}</p>

                    <p><strong>Objectif :</strong> ${ex.objectif}</p>

                    <p><strong>Consigne :</strong><br>${ex.consigne.replace(/\n/g, "<br>")}</p>

                    <div class="btn-row" style="margin-top:15px;">
                        <button class="btn ghost" onclick="window.print()">🖨 Imprimer</button>
                        ${video ? `<a href="${video}" target="_blank" class="btn primary">▶ Vidéo</a>` : ""}
                    </div>

                    <div class="qr-zone">
                        <canvas id="qrCanvas"></canvas>
                    </div>
                </div>
            </div>

        </div>
    `;

    /* --- QR CODE --- */
    if (qrContent !== "") {
        generateQR(qrContent);
    }
}

/* --- GENERATION DU QR CODE --- */
function generateQR(text) {
    const canvas = document.getElementById("qrCanvas");
    if (!canvas) return;

    // QRCode.js must be included in the HTML
    new QRious({
        element: canvas,
        value: text,
        size: 150
    });
}
