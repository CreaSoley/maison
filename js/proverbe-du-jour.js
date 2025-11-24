// Lecture robuste du CSV Proverbes
function parseCSVLine(ligne) {
const parts = [];
let current = "";
let inQuotes = false;


for (let i = 0; i < ligne.length; i++) {
const char = ligne[i];


if (char === '"') {
inQuotes = !inQuotes;
} else if (char === ',' && !inQuotes) {
parts.push(current.trim());
current = "";
} else {
current += char;
}
}
parts.push(current.trim());


if (parts.length >= 3) {
return {
date: parts[0].trim(),
texte: parts[1].trim().replace(/"/g, ""),
traduction: parts[2].trim().replace(/"/g, "")
};
}
return null;
}


async function chargerProverbe() {
try {
const rep = await fetch('data/proverbes.csv');
const csv = await rep.text();


const lignes = csv.trim().split('\n');
const liste = lignes.slice(1).map(parseCSVLine).filter(v => v);


const now = new Date();
const jj = String(now.getDate()).padStart(2,'0');
const mm = String(now.getMonth()+1).padStart(2,'0');
const today = `${jj}/${mm}`;


let choix = liste.find(p => p.date === today);
if (!choix) choix = liste[Math.floor(Math.random() * liste.length)];


const zone = document.getElementById('proverbe-du-jour');
zone.innerHTML = `
<h2>💬 Proverbe du jour</h2>
<p class="proverbe-text">« ${choix.texte} »</p>
<p class="proverbe-traduction">${choix.traduction}</p>
`;


} catch (err) {
document.getElementById('proverbe-du-jour').innerHTML = "Erreur de chargement.";
}
}


window.addEventListener('DOMContentLoaded', chargerProverbe);
