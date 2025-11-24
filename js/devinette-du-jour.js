document.addEventListener("DOMContentLoaded", chargerDevinette);

function chargerDevinette() {
    const zone = document.querySelector("#devinette-du-jour");

    fetch("https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhxfxbN0_3pRPksQcLKJiog3wh6_k8VdeifnsBGwnpKQ9knLw5gCXPe4c4DMDteZV9vFvPf4UBacG3YDTRYdKEVc7Rue54juM5LFxUba6vRpOv1xDP2PxoiVu3ynOsUhUvarfO9pOsEH4bgN_du7UuWTczLbD0bofg7uv3mwyv4v_g71OLbU-8IyR9hIpenLSlxXX9aIRYf738jSR2WemZxJbVv9cyRFKMctVZnKZJiCgjIP5cxOE73c-nRawN4R6g4KifnFk3-V6PmJ1YoDNw-ZmI1vIShwEN3ASGh&lib=MuiZkSlYENgyCkMBX3NcyJwTqGYO7_w4Z")
        .then(response => {
            if (!response.ok) throw new Error("Réponse non valide");
            return response.json();
        })
        .then(data => {
            zone.innerHTML = `
                <p><strong>${data.question}</strong></p>
                <button class="btn" id="btn-devinette">Voir la réponse</button>
                <p id="devinette-reponse" style="display:none;margin-top:10px;">
                    ${data.reponse}
                </p>
            `;

            document.getElementById("btn-devinette").addEventListener("click", () => {
                document.getElementById("devinette-reponse").style.display = "block";
            });
        })
        .catch(err => {
            console.error("Erreur devinette :", err);
            zone.innerHTML = `<p style="color:red;">Impossible de charger la devinette.</p>`;
        });
}
