// js/couleur-du-jour.js

// --- Couleur du jour ---
function genererCouleur() {
    // Génération aléatoire d'une couleur hexadécimale
    const hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    const couleurPreview = document.getElementById("couleur-preview");
    const codeElement = document.getElementById("code");
    
    if (couleurPreview) {
        couleurPreview.style.backgroundColor = hex;
    }
    if (codeElement) {
        codeElement.innerText = "Code HEX : " + hex;
    }
}

// Génère une couleur dès le chargement
document.addEventListener('DOMContentLoaded', genererCouleur);
