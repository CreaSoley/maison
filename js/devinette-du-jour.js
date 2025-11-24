/* ============================================================
   📌 Parseur CSV compatible guillemets
============================================================ */
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            inQuotes = !inQuotes; // bascule
        } else if (ch === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

/* ============================================================
   📜 Devinette du jour
============================================================ */

async function chargerDevinette() {
    try {
        const res = await fetch("data/devinettes.csv");
        if (!res.ok) throw new Error("Fichier devinettes introuvable");

        const texte = await res.text();
        const lignes = texte.split(/\r?\n/).slice(1).filter(l => l.trim() !== "");

        // date du jour JJ/MM
        const d = new Date();
        const cle = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        let trouvé = false;

        for (let ligne of lignes) {
            const parts = parseCSVLine(ligne);

            if (parts.length < 3) continue;

            const date = parts[0].trim();
            const dev = parts[1].replace(/^"|"$/g, "").trim(); // retire les guillemets
            const rep = parts[2].trim().toLowerCase();

            if (date === cle) {
                document.getElementById("texte-devinette").textContent = dev;
                document.getElementById("reponse-devinette").dataset.reponse = rep;
                trouvé = true;
                break;
            }
        }

        if (!trouvé) {
            document.getElementById("texte-devinette").textContent =
                "Aucune devinette aujourd’hui.";
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
        document.body.appendChild(leaf);

        setTimeout(() => leaf.remove(), 6000);
    }
}

/* ============================================================
   🚀 Lancement auto
============================================================ */

document.addEventListener("DOMContentLoaded", chargerDevinette);
