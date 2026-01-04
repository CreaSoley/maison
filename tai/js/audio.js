// js/audio.js
export function speak(text, onEnd = null) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    if (onEnd) u.onend = onEnd;
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn("Synthèse vocale indisponible", e);
    if (onEnd) onEnd();
  }
}

export function safePlay(audio) {
  if (!audio) return;
  try {
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {
    console.warn("Audio bloqué", e);
  }
}
