<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Lecture aléatoire de mots</title>

<style>
body {
  font-family: Arial, sans-serif;
  max-width: 650px;
  margin: 40px auto;
}
button {
  padding: 10px 20px;
  margin: 10px 5px;
  font-size: 16px;
}
input {
  padding: 5px;
  font-size: 16px;
}
</style>
</head>

<body>

<h2>Lecture audio aléatoire de mots</h2>

<label>Intervalle entre chaque mot (en secondes) :</label>
<input type="number" id="interval" value="3" min="1" step="0.5">
<br><br>

<button onclick="startReading()">▶️ Démarrer</button>
<button onclick="stopReading()">⛔ Stop</button>

<p id="status"></p>

<script>
const words = [
    "Saisie de poignet direct",
    "Saisie de poignet opposé",
    "Saisie de poignet haut",
    "Saisie des deux poignets bas",
    "Saisie des deux poignets haut",
    "Saisie d'un poignet à deux mains",
    "Étranglement de face à une main",
    "Étranglement de face à deux mains",
    "Saisie de revers + mawashi tsuki",
    "Saisie de cheveux",
    "Attaque couteau basse ou pique",
    "Attaque couteau circulaire",
    "Attaque couteau revers",
    "Matraque haute",
    "Matraque revers",
    "Coup de poing direct",
    "Mawashi tsuki gauche",
    "Mawashi tsuki droit",
    "Saisie manche haute",
    "Saisie manche basse"
];

let reading = false;
let timer = null;

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    speechSynthesis.speak(utterance);
}

function startReading() {
    if (reading) return;
    reading = true;
    document.getElementById("status").innerText = "Lecture en cours...";

    function loop() {
        if (!reading) return;

        const randomWord = words[Math.floor(Math.random() * words.length)];
        speak(randomWord);

        const interval = parseFloat(document.getElementById("interval").value) * 1000;
        timer = setTimeout(loop, interval);
    }

    loop();
}

function stopReading() {
    reading = false;
    clearTimeout(timer);
    speechSynthesis.cancel();
    document.getElementById("status").innerText = "Lecture arrêtée.";
}
</script>

</body>
</html>
