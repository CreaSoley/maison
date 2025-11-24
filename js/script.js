// =========================
// Devinette du jour (Webapp futur)
// =========================
const devinettes = [
"Je parle toutes les langues mais je n’ai pas de bouche. Qui suis‑je ? (Réponse : l’écho)",
"Je grandis sans être vivant. Qui suis‑je ? (Réponse : un cristal)",
"Plus je suis grande, moins on me voit. Qui suis‑je ? (Réponse : l'obscurité)"
];


function chargerDevinette() {
const pick = devinettes[Math.floor(Math.random() * devinettes.length)];
document.querySelector('#devinette-du-jour p').textContent = pick;
}


// =========================
// Activité du jour depuis CSV
// =========================
async function chargerActivite() {
const response = await fetch('data/activites.csv');
const text = await response.text();
const lignes = text.trim().split('\n').slice(1);


const items = lignes.map(l => {
const [activite, categorie, niveau, couleur] = l.split(',');
return { activite, categorie, niveau, couleur };
});


const choix = items[Math.floor(Math.random() * items.length)];


document.getElementById('couleur-box').style.background = choix.couleur;
document.getElementById('activite-texte').textContent = `« ${choix.activite} »`;
document.getElementById('activite-categorie').textContent = choix.categorie;
document.getElementById('activite-niveau').textContent = choix.niveau;
}


// Start
window.addEventListener('DOMContentLoaded', () => {
chargerDevinette();
chargerActivite();
});
