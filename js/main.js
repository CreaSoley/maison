console.log("🔧 main.js chargé");


// --- UTILITAIRE PARSE CSV ---
function parseCSV(text) {
const lignes = text.split(/
?
/).filter(l => l.trim() !== "");
const data = lignes.slice(1).map(l => {
const parts = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
return parts.map(p => p.replace(/(^\"|\"$)/g, '').trim());
});
return data;
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
console.warn("⚠️ Aucune ligne trouvée pour", cle);
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


// --- ACTIVITÉ ALÉATOIRE AVEC COULEUR ---
async function activiteAleatoire() {
console.log("🎲 Chargement activité...");
try {
const response = await fetch('data/activites.csv');
const text = await response.text();
const rows = parseCSV(text);


console.log("📦 Activités chargées:", rows);


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


// --- WIDGET METEO ---
async function chargerMeteo() {
console.log("⛅ Chargement météo...");
try {
const url = "https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current_weather=true";
if (document.getElementById('couleur')) couleurAleatoire();
