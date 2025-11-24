async function chargerDevinette() {
    try {
        const res = await fetch("data/devinettes.csv");
        const texte = await res.text();
        const lignes = texte.split("\n").slice(1);

        const d = new Date();
        const cle = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        let trouve = false;

        for (let ligne of lignes) {
            if (!ligne.trim()) continue;

            const parts = ligne.split(",");
            if (parts.length < 3) continue;

            const [date, dev, rep] = parts;

            if (date.trim() === cle) {
                document.getElementById("texte-devinette").textContent = dev.trim();
                document.getElementById("reponse-devinette").dataset.reponse = rep.trim().toLowerCase();
                trouve = true;
            }
        }

        if (!trouve) {
            document.getElementById("texte-devinette").textContent =
                "Aucune devinette aujourd’hui.";
        }

    } catch (err) {
        console.error("⛔ Erreur devinette :", err);
    }
}

/* Vérifier la réponse */
function validerDevinette() {
    const zone = document.getElementById("reponse-devinette");
    const resultat = document.getElementById("devinette-resultat");

    const attendu = zone.dataset.reponse;
    const fourni = zone.value.trim().toLowerCase();

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

/* ============================================================
   🌿 Animation ZEN — pluie de feuilles
============================================================ */
function lancerPluieZen() {
    for (let i = 0; i < 20; i++) {
        const leaf = document.createElement("div");
        leaf.classList.add("leaf");

        leaf.style.left = Math.random() * 100 + "vw";
        leaf.style.animationDuration = (3 + Math.random() * 3) + "s";
        leaf.style.opacity = 0.8;

        document.body.appendChild(leaf);

        setTimeout(() => leaf.remove(), 6000);
    }
}
