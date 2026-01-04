export const beep = new Audio('beep.mp3');
export const ding = new Audio('ding.mp3');

export function speak(text, callback) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'fr-FR';
  utter.onend = callback;
  speechSynthesis.speak(utter);
}

export function playBeep() { beep.play(); }
export function playDing() { ding.play(); }
