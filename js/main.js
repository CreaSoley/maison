// --- PROVERBE DU JOUR ---
async function chargerProverbe() {
const response = await fetch('data/proverbes.csv');
const text = await response.text();
const lignes = text.split(/
?
/).slice(1);
const aujourd = new Date();
const cle = aujourd.getDate().toString().padStart(2,'0') + '/' + (aujourd.getMonth()+1).toString().padStart(2,'0');
const ligne = lignes.find(l => l.startsWith(cle));
if (!ligne) return;
const parts = ligne.split(',');
const prov = parts[1];
const trad = parts.slice(2).join(',');
document.getElementById('proverbe').innerHTML = `<h2>Proverbe du jour</h2><p>${prov}<br><em>${trad}</em></p>`;
}


// --- ACTIVITÉ ALÉATOIRE AVEC COULEUR ---
async function activiteAleatoire() {
const response = await fetch('data/activites.csv');
const text = await response.text();
const lignes = text.split(/
?
/).slice(1);
const line = lignes[Math.floor(Math.random()*lignes.length)];
if (!line) return;
const [activite, categorie, niveau, couleur] = line.split(',');
const bloc = document.getElementById('activite');
bloc.style.borderLeft = `10px solid ${couleur}`;
bloc.innerHTML = `
<h2>Activité aléatoire</h2>
<p><strong>${activite}</strong></p>
<p>Catégorie : ${categorie}</p>
<p>Niveau : ${niveau}</p>
<p>Couleur : <span style="color:${couleur}">${couleur}</span></p>
`;
}


// --- WIDGET METEO (API open-meteo, animations simples) ---
async function chargerMeteo() {
const url = "https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current_weather=true";
const r = await fetch(url);
const data = await r.json();
const meteo = data.current_weather;
const icon = meteo.weathercode < 3 ? '☀️' : meteo.weathercode < 50 ? '⛅' : '🌧️';
document.getElementById('meteo-widget').innerHTML = `
<div class="meteo-box">
<div class="meteo-icon">${icon}</div>
<div>
<h2>${meteo.temperature}°C</h2>
<p>${meteo.windspeed} km/h</p>
</div>
</div>`;
}


// --- GENERATEUR DE COULEUR ALEATOIRE ---
function couleurAleatoire() {
const couleur = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`;
const noms = ['Vert pomme','Aubergine','Rouge carmin','Bleu nuit','Sable chaud','Olive douce'];
const nom = noms[Math.floor(Math.random()*noms.length)];
document.getElementById('couleur').innerHTML = `
<h2>Couleur du jour</h2>
<div style="width:80px;height:80px;border-radius:10px;background:${couleur}"></div>
<p>${couleur} — ${nom}</p>`;
}


chargerProverbe();
couleurAleatoire();
