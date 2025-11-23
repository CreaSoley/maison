// js/techniques-aleatoires.js

// Variable globale pour l'URL de votre script Google Apps
const URL_GAS_TECHNIQUES = "https://script.google.com/macros/s/AKfycbwfuW9f0s7Q0ckX6qjgXrMWyDjrQGzw4hlPOLVcVwEliMh1vWEqTgzqeBWZgC-pyjpF/exec"; 
// ⚠️ ASSUREZ-VOUS QUE L'URL CI-DESSUS EST BIEN LA VÔTRE !

async function choisirTechnique() {
    const affichage = document.getElementById("resultat-technique");
    affichage.innerHTML = "⏳ Chargement...";

    // Réinitialiser les éléments dynamiques (image) pour éviter les doublons
    let img = document.getElementById("preview-technique");
    if (img) img.style.display = 'none';
    
    try {
        const res = await fetch(URL_GAS_TECHNIQUES);
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const data = await res.json();
        
        // --- Parsing des données ---
        const niveauText = data.niveau || '';
        const badgesNiveau = niveauText
            .split(',')
            .map(n => n.trim())
            .filter(n => n) 
            .map(n => `<span class="badge">${n}</span>`)
            .join(" ");

        // 1. Affichage du texte
        affichage.innerHTML = `
            <strong style="font-size:1.3em; display:block; margin-bottom: 5px;">${data.technique || 'Technique non définie'}</strong>
            ${badgesNiveau}
            <em style="font-size:0.95em; color:#555; display:block; margin-top:5px;">“${data.description || 'Description manquante'}”</em>
            <p>🖌️ Matériel : ${data.materiel || 'Non spécifié'}</p>
        `;

        // 2. Image Handling: On crée ou met à jour l'élément <img>
        if (data.oeuvre) {
            img = document.getElementById("preview-technique");
            if (!img) {
                img = document.createElement("img");
                img.id = "preview-technique";
                img.alt = data.technique;
                // On insère l'image avant la fin du bloc d'affichage
                affichage.appendChild(img);
            }
            img.src = data.oeuvre;
            img.style.display = 'block';
        }

        // 3. Lien YouTube
        if (data.lien && data.chaine) {
            let lienEl = document.getElementById("lien-video-tech");
            if (!lienEl) {
                lienEl = document.createElement("a");
                lienEl.id = "lien-video-tech";
                lienEl.className = "youtube-link";
                lienEl.target = "_blank";
                lienEl.rel = "noopener";
                affichage.appendChild(lienEl);
            }
            lienEl.href = data.lien;
            lienEl.textContent = `▶️ ${data.chaine}`;
            lienEl.style.display = "inline-block";
        }
        
    } catch (err) {
        console.error("Erreur de chargement de la technique :", err);
        affichage.innerHTML = `<p style="color:red;">❌ Erreur : Impossible de charger une technique (${err.message}).</p>`;
    }
}
// Lance la technique au chargement de la page
document.addEventListener('DOMContentLoaded', choisirTechnique);
