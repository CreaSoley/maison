// js/main.js
import { bankData } from "./data.js";
import { startTraining } from "./training.js";

const bank = document.getElementById("bank");
const selectionDiv = document.getElementById("selection");

const beep = document.getElementById("beep");
const ding = document.getElementById("ding");

let selection = [];

function renderBank() {
  bank.innerHTML = "";
  bankData.forEach(uv => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${uv.uv}</h3>`;

    uv.exercises.forEach(name => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = name;
      btn.onclick = () => addExercise(name);
      card.appendChild(btn);
    });

    bank.appendChild(card);
  });
}

function addExercise(name) {
  selection.push({ name, duration: 5 });
  renderSelection();
}

function renderSelection() {
  selectionDiv.innerHTML = "";
  selection.forEach(e => {
    const div = document.createElement("div");
    div.className = "sequence-item";
    div.textContent = e.name;
    selectionDiv.appendChild(div);
  });
}

document.getElementById("startBtn").onclick = () => {
  startTraining(
    selection,
    window.uiHooks,
    { beep, ding }
  );
};

renderBank();
