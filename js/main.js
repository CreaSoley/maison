async function chargerProverbe() {
const response = await fetch('proverbes.csv');
const text = await response.text();
const lignes = text.split(/\r?\n/).slice(1);
const aujourd = new Date();
const cle = aujourd.getDate().toString().padStart(2,'0') + '/' + (aujourd.getMonth()+1).toString().padStart(2,'0');
const ligne = lignes.find(l => l.startsWith(cle));
if (ligne) {
const [_, prov, trad] = ligne.split(',');
document.getElementById('proverbe').innerHTML = `<h2>Proverbe du jour</h2><p>${prov}<br><em>${trad}</em></p>`;
}
}


async function activiteAleatoire() {
const response = await fetch('activites.csv');
const text = await response.text();
const lignes = text.split(/\r?\n/).slice(1);
const choix = lignes[Math.floor(Math.random()*lignes.length)];
if (choix) {
document.getElementById('activite').innerHTML = `<h2>Idée d'activité</h2><p>${choix}</p>`;
}
}


chargerProverbe();
activiteAleatoire();
