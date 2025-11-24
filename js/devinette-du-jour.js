async function chargerDevinette() {
    const url = "https://script.google.com/macros/s/AKfycbzoFRgG1z7veVxYyKIrqTpw9kiFdz_PK9pmo65vSf9qx2OLE2WHR_F-2J1FQJo1jeYDdA/exec"; // 🔥 Remplace-moi

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.querySelector("#devinette-du-jour").innerHTML = `
            <strong>${data.question}</strong><br>
            <em>${data.indice ? "Indice : " + data.indice : ""}</em>
        `;
    } catch (err) {
        console.error("Erreur devinette :", err);
        document.querySelector("#devinette-du-jour").textContent =
            "Impossible de charger la devinette.";
    }
}

document.addEventListener("DOMContentLoaded", chargerDevinette);
