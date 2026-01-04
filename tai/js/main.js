import { renderBank, renderSelection, renderGoals } from './ui.js';
import { selection } from './training.js';
import { loadSelection, saveSelection, loadSessions } from './storage.js';
import { startTraining, toggleFullscreen } from './training.js';

window.addExercise = function(uv,name){
  selection.push({uv,name,duration:5,doneMinutes:0});
  saveSelection(selection);
  renderSelection('selection');
  renderGoals('goals');
};

window.updateDuration = function(i,v){ selection[i].duration = parseInt(v); saveSelection(selection); renderSelection('selection'); };

window.moveUp = function(i){ if(i>0){ [selection[i-1],selection[i]]=[selection[i],selection[i-1]]; saveSelection(selection); renderSelection('selection'); } };
window.moveDown = function(i){ if(i<selection.length-1){ [selection[i+1],selection[i]]=[selection[i],selection[i+1]]; saveSelection(selection); renderSelection('selection'); } };
window.removeExercise = function(i){ selection.splice(i,1); saveSelection(selection); renderSelection('selection'); renderGoals('goals'); };

window.setGoal = function(name,v){ const goals=JSON.parse(localStorage.getItem('tj-goals'))||{}; goals[name]=parseInt(v); localStorage.setItem('tj-goals',JSON.stringify(goals)); renderGoals('goals'); };

window.startSession = function(){
  const sessionName = document.getElementById('sessionName').value || "Séance " + new Date().toLocaleString();
  const overlay = document.getElementById('trainingOverlay');
  const timerEl = document.getElementById('timer');
  const progressBar = document.getElementById('sessionProgress');
  startTraining(selection, sessionName, overlay, timerEl, progressBar);
};

window.toggleFullscreenUI = toggleFullscreen;

window.onload = function(){
  renderBank('bank');
  renderSelection('selection');
  renderGoals('goals');
};
