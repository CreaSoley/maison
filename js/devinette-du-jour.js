document.addEventListener("DOMContentLoaded", chargerDevinette);

function chargerDevinette() {
    const zone = document.querySelector("#devinette-du-jour");

    fetch("https://script.google.com/macros/s/AKfycbzoFRgG1z7veVxYyKIrqTpw9kiFdz_PK9pmo65vSf9qx2OLE2WHR_F-2J1FQJo1jeYDdA/exec")
        .then(response => {
            if (!response.ok) throw new Error("Réponse non valide");
            return response.json();
        })
        .then(data => {
            zone.innerHTML = `
                <p><strong>${data.question}</strong></p>
                <button class="btn" id="btn-devinette">Voir la réponse</button>
                <p id="devinette-reponse" style="display:none;margin-top:10px;">
                    ${data.reponse}
                </p>
            `;

            document.getElementById("btn-devinette").addEventListener("click", () => {
                document.getElementById("devinette-reponse").style.display = "block";
            });
        })
        .catch(err => {
            console.error("Erreur devinette :", err);
            zone.innerHTML = `<p style="color:red;">Impossible de charger la devinette.</p>`;
        });
}
