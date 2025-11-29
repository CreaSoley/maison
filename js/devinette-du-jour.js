async function chargerDevinette() {
    try {
        const res = await fetch("js/devinettes.json");
        if (!res.ok) throw new Error("Fichier devinettes introuvable");

        const devinettes = await res.json();
        if (!devinettes.length) throw new Error("Aucune devinette trouvée");

        const d = new Date();
        const debutAnnee = new Date(d.getFullYear(), 0, 0);
        const diff = d - debutAnnee;
        const unJour = 1000 * 60 * 60 * 24;
        const jourAnnee = Math.floor(diff / unJour);

        const index = seedRandomIndex(jourAnnee, devinettes.length);
        const devinette = devinettes[index];

        const texteEl = document.getElementById("texte-devinette");
        const input = document.getElementById("reponse-devinette");
        const resultat = document.getElementById("devinette-resultat");

        texteEl.textContent = devinette.enigme;
        input.value = "";
        input.dataset.reponse = (devinette.reponse || "").trim().toLowerCase();
        resultat.textContent = "";

    } catch (err) {
        console.error("⛔ Erreur devinette :", err);
        document.getElementById("texte-devinette").textContent =
            "Erreur de chargement.";
    }
}

function seedRandomIndex(seed, max) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
}

function validerDevinette() {
    const input = document.getElementById("reponse-devinette");
    const resultat = document.getElementById("devinette-resultat");

    const attendu = (input.dataset.reponse || "").trim().toLowerCase();
    const fourni = input.value.trim().toLowerCase();

    if (fourni === "") {
        resultat.textContent = "Veuillez saisir une réponse.";
        resultat.style.color = "red";
        return;
    }

    if (fourni === attendu) {
        resultat.textContent = "🎉 Bravo ! À demain pour une autre devinette !";
        resultat.style.color = "green";
        lancerPluieZen();
    } else {
        resultat.textContent = "❌ Ce n’est pas la bonne réponse.";
        resultat.style.color = "red";
    }
}

function lancerPluieZen() {
    for (let i = 0; i < 20; i++) {
        const leaf = document.createElement("div");
        leaf.classList.add("leaf");
        leaf.style.left = Math.random() * 100 + "vw";
        leaf.style.animationDuration = (3 + Math.random() * 3) + "s";
        document.body.appendChild(leaf);

        setTimeout(() => leaf.remove(), 6000);
    }
}

document.addEventListener("DOMContentLoaded", chargerDevinette);
