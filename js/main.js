console.log("🔧 main.js chargé (version sans météo)");


// --- UTILITAIRE PARSE CSV ---
function parseCSV(text) {
const lignes = text.split(/
?
/).filter(l => l.trim() !== "");
return lignes.slice(1).map(l => {
const parts = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
return parts.map(p => p.replace(/(^\"|\"$)/g, '').trim());
});
}


// --- PROVERBE DU JOUR ---
async function chargerProverbe() {
console.log("📜 Chargement du proverbe...");
try {
const response = await fetch('data/proverbes.csv');
const text = await response.text();
const rows = parseCSV(text);
const aujourd = new Date();
const cle = aujourd.getDate().toString().padStart(2,'0') + '/' + (aujourd.getMonth()+1).toString().padStart(2,'0');
console.log("🔎 Recherche clé:", cle);
const ligne = rows.find(r => r[0] === cle);
if (!ligne) {
document.getElementById('proverbe').innerHTML = `<p>Aucun proverbe pour aujourd'hui.</p>`;
return;
}
const [date, prov, trad] = ligne;
document.getElementById('proverbe').innerHTML = `
<h2>Proverbe du jour</h2>
<p>${prov}<br><em>${trad}</em></p>
`;
} catch (e) {
console.error("❌ Erreur chargement proverbe :", e);
}
}


// --- ACTIVITÉ ALÉATOIRE ---
async function activiteAleatoire() {
console.log("🎲 Chargement activité...");
try {
const response = await fetch('data/activites.csv');
const text = await response.text();
const rows = parseCSV(text);
const choix = rows[Math.floor(Math.random()*rows.length)];
if (!choix) return;
const [activite, categorie, niveau, couleur] = choix;
console.log("🎯 Activité tirée:", choix);
const bloc = document.getElementById('activite');
bloc.style.borderLeft = `10px solid ${couleur}`;
bloc.innerHTML = `
<h2>Activité aléatoire</h2>
<p><strong>${activite}</strong></p>
<p>Catégorie : ${categorie}</p>
<p>Niveau : ${niveau}</p>
<p>Couleur : <span style="color:${couleur}">${couleur}</span></p>
`;
} catch (e) {
console.error("❌ Erreur activité :", e);
}
}


// --- GENERATEUR DE COULEUR ---
function couleurAleatoire() {
const couleur = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`;
const noms = ['Vert pomme','Aubergine','Rouge carmin','Bleu nuit','Sable chaud','Olive douce'];
const nom = noms[Math.floor(Math.random()*noms.length)];
const div = document.getElementById('couleur');
if (!div) return;
div.innerHTML = `
<h2>Couleur du moment</h2>
<div style="width:80px;height:80px;border-radius:10px;background:${couleur}"></div>
<p>${couleur} — ${nom}</p>`;
}


// --- INIT ---
chargerProverbe();
activiteAleatoire();
couleurAleatoire();
