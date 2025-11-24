/* ============================================================
   📜 Devinette du jour
============================================================ */

async function chargerDevinette() {
    try {
        const res = await fetch("data/devinettes.csv");
        if (!res.ok) throw new Error("Fichier devinettes introuvable");

        const texte = await res.text();

        // Gérer \n et \r\n + ignorer lignes vides
        const lignes = texte.split(/\r?\n/).slice(1).filter(l => l.trim() !== "");

        // Date du jour : JJ/MM
        const d = new Date();
        const cle = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        let trouve = false;

        for (let ligne of lignes) {
            const parts = ligne.split(",");

            if (parts.length < 3) continue;

            const date = parts[0].trim();
            const devinette = parts[1].trim();
            const reponse = parts.slice(2).join(",").trim().toLowerCase(); // gère les virgules

            if (date === cle) {
                document.getElementById("texte-devinette").textContent = devinette;
                document.getElementById("reponse-devinette").dataset.reponse = reponse;
                trouve = true;
                break;
            }
        }

        if (!trouve) {
            document.getElementById("texte-devinette").textContent =
                "Aucune devinette pour aujourd’hui.";
        }

    } catch (err) {
        console.error("⛔ Erreur devinette :", err);
        document.getElementById("texte-devinette").textContent =
            "Erreur de chargement.";
    }
}

/* ============================================================
   🤔 Vérification réponse utilisateur
============================================================ */

function validerDevinette() {
    const input = document.getElementById("reponse-devinette");
    const resultat = document.getElementById("devinette-resultat");

    const attendu = (input.dataset.reponse || "").trim().toLowerCase();
    const fourni = input.value.trim().toLowerCase();

    // Aucune réponse saisie
    if (fourni === "") {
        resultat.textContent = "Veuillez saisir une réponse.";
        resultat.style.color = "red";
        return;
    }

    // Correct 🎉
    if (fourni === attendu) {
        resultat.textContent = "🎉 Bravo ! À demain pour une autre devinette !";
        resultat.style.color = "green";

        lancerPluieZen(); // animation zen
    }

    // Incorrect ❌
    else {
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

/* ============================================================
   🚀 Chargement auto
============================================================ */

document.addEventListener("DOMContentLoaded", chargerDevinette);
