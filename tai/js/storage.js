export function loadSelection() {
  return JSON.parse(localStorage.getItem('tj-selection')) || [];
}
export function saveSelection(selection) {
  localStorage.setItem('tj-selection', JSON.stringify(selection));
}

export function loadSessions() {
  return JSON.parse(localStorage.getItem('tj-sessions')) || {};
}
export function saveSessions(sessions) {
  localStorage.setItem('tj-sessions', JSON.stringify(sessions));
}

export function loadGoals() {
  return JSON.parse(localStorage.getItem('tj-goals')) || {};
}
export function saveGoals(goals) {
  localStorage.setItem('tj-goals', JSON.stringify(goals));
}
