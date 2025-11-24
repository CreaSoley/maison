document.addEventListener("DOMContentLoaded", () => {

    fetch("data/devinettes.csv")
        .then(res => res.text())
        .then(text => {
            const lignes = text.split("\n").slice(1);
            const today = new Date();
            const index = (today.getMonth() * 31 + today.getDate()) % lignes.length;

            const [date, dev, rep] = lignes[index].split(",");

            document.getElementById("devinette-texte").textContent = dev.trim();

            const bouton = document.getElementById("devinette-valider");
            const feedback = document.getElementById("devinette-feedback");

            bouton.addEventListener("click", () => {
                const saisie = document.getElementById("devinette-reponse").value.trim();

                if (saisie === "") {
                    feedback.textContent = "Veuillez saisir une réponse.";
                    feedback.style.color = "red";
                    return;
                }

                if (saisie.toLowerCase() === rep.trim().toLowerCase()) {
                    feedback.textContent = "Bravo ! 🌿 À demain pour une nouvelle devinette.";
                    feedback.style.color = "green";

                    lancerPetales();
                } else {
                    feedback.textContent = "Ce n’est pas la bonne réponse.";
                    feedback.style.color = "red";
                }
            });
        });
});

/* ANIMATION ZEN */
function lancerPetales() {
    for (let i = 0; i < 20; i++) {
        const petal = document.createElement("div");
        petal.classList.add("petal");
        petal.style.left = Math.random() * 100 + "vw";
        petal.style.animationDelay = (Math.random() * 2) + "s";
        document.body.appendChild(petal);

        setTimeout(() => petal.remove(), 6000);
    }
}
