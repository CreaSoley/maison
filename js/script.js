// js/script.js
// Script général du site (NE PAS DUPLIQUER les fonctions des autres JS)

document.addEventListener("DOMContentLoaded", () => {

    // — Optionnel : Charger activité du mois
    if (window.afficherActivite) {
        afficherActivite();
    }

    // — Optionnel : Embedding Google Apps Script (si tu gardes la webapp)
    const appsScriptURL = "https://script.google.com/macros/s/AKfycbzoFRgG1z7veVxYyKIrqTpw9kiFdz_PK9pmo65vSf9qx2OLE2WHR_F-2J1FQJo1jeYDdA/exec";
    const cont = document.getElementById("resultat-defi");

    if (cont) {
        const iframe = document.createElement("iframe");
        iframe.src = appsScriptURL;
        iframe.style.width = "100%";
        iframe.style.height = "480px";
        iframe.style.border = "0";
        cont.appendChild(iframe);
    }

    // — Animation zen globale
    if (window.lancerAnimationZen) {
        lancerAnimationZen();
    }
});
