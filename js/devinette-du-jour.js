/* ============================================================
   📜 Devinette du jour depuis JSON (aléatoire mais fixe)
============================================================ */

async function chargerDevinette() {
    try {
        const res = await fetch("data/devinettes.json");
        if (!res.ok) throw new Error("Fichier devinettes introuvable");

        const devinettes = await res.json();
        if (!devinettes.length) throw new Error("Aucune devinette trouvée");

        // Calculer le jour de l'année (1-366)
        const d = new Date();
        const debutAnnee = new Date(d.getFullYear(), 0, 0);
        const diff = d - debutAnnee;
        const unJour = 1000 * 60 * 60 * 24;
        const jourAnnee = Math.floor(diff / unJour);

        // Générer un "seed" simple à partir du jour pour tirer aléatoirement
        const index = seedRandomIndex(jourAnnee, devinettes.length);
        const devinette = devinettes[index];

        // Afficher l'énigme et stocker la réponse
        const texteEl = document.getElementById("texte-devinette");
        const input = document.getElementById("reponse-devinette");
        const resultat = document.getElementById("devinette-resultat");

        texteEl.textContent = devinette.enigme;
        input.value = "";
        input.dataset.reponse = (devinette.reponse || "").trim().toLowerCase();

        // Vider le message résultat
        resultat.textContent = "";

    } catch (err) {
        console.error("⛔ Erreur devinette :", err);
        document.getElementById("texte-devinette").textContent =
            "Erreur de chargement.";
    }
}

/* ============================================================
   🤔 Fonction pour tirer un index pseudo-aléatoire basé sur un seed
============================================================ */

function seedRandomIndex(seed, max) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
}

/* ============================================================
   🤔 Vérification réponse utilisateur
============================================================ */

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
        resultat.textC
