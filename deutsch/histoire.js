async function chargerHistoire() {
    const container = document.getElementById("histoire-container");

    try {
        const response = await fetch("lsfhistoires.json");
        const data = await response.json();

        // clé du jour
        const today = new Date().toISOString().slice(0, 10);
        let index = localStorage.getItem("histoire-index");

        if (!index || localStorage.getItem("histoire-date") !== today) {
            index = Math.floor(Math.random() * data.length);
            localStorage.setItem("histoire-index", index);
            localStorage.setItem("histoire-date", today);
        }

        const item = data[index];

        container.innerHTML = `
            <h4>${item.titre}</h4>
            <iframe 
                width="100%" 
                height="200" 
                src="${item.video}" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
        `;
    } catch (error) {
        container.innerHTML = "<p>Erreur lors du chargement.</p>";
    }
}

chargerHistoire();
