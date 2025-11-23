// js/meteo-poetique.js
function getPoeticWeather(weatherCode) {
    const codes = {
        0: { emoji: "✨", mood: "Clarté cristalline. Parfait pour les lignes nettes." },
        1: { emoji: "💭", mood: "À peine nuageux. L'hésitation ouvre la porte à l'intuition." },
        2: { emoji: "☁️", mood: "Nuages doux. Explore les ombres et les mélanges subtils." },
        3: { emoji: "🌫️", mood: "Ciel lourd. Ambiance idéale pour les textures brutes." },
        45: { emoji: "💨", mood: "Brouillard. Travaillez les dégradés flous et le mystère." },
        51: { emoji: "💧", mood: "Bruine légère. Laisse couler l'eau, explore l'aquarelle." },
        61: { emoji: "🌧️", mood: "Pluie légère. Les lavis s'imposent, accepte les bavures." },
        63: { emoji: "☔", mood: "Pluie modérée. Journée d'introspection, crée au chaud." }
    };
    return codes[weatherCode] || { emoji: "❓", mood: "Temps inconnu. Fais confiance à ta météo intérieure." };
}

function chargerMeteoPoetique() {
    const meteoElement = document.getElementById("meteo");
    if (!meteoElement) return;

    // Géolocalisation
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchMeteo(lat, lon, meteoElement);
            },
            (error) => {
                console.error("Géolocalisation refusée:", error);
                // Utilise Paris par défaut en cas d'erreur
                fetchMeteo(48.85, 2.35, meteoElement);
            }
        );
    } else {
        // Navigateur ne supporte pas la géolocalisation
        fetchMeteo(48.85, 2.35, meteoElement); // Paris par défaut
    }
}

function fetchMeteo(lat, lon, element) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`)
        .then(r => {
            if (!r.ok) throw new Error('Erreur réseau');
            return r.json();
        })
        .then(data => {
            const temp = data.current.temperature_2m.toFixed(1);
            const wc = data.current.weather_code;
            const poetic = getPoeticWeather(wc);
            element.innerHTML = `
                <strong style="font-size: 1.2em;">${poetic.emoji} ${poetic.mood}</strong><br>
                <small>Il fait ${temp}°C près de vous.</small>
            `;
        })
        .catch(() => {
            element.innerText = "Météo poétique non disponible.";
        });
}

document.addEventListener('DOMContentLoaded', chargerMeteoPoetique);
