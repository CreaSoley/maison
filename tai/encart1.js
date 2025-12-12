/********************************************************************
 * UV1 – Kihon (VERSION AVEC DING + LATENCES + VITESSE)
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

  /********************************************************************
   * OUTILS
   ********************************************************************/
  const INITIAL_DELAY_MS = 10000; // 10s après "Lire"
  const DING_TO_SPEECH_DELAY_MS = 1500; // 1.5s après ding

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function playSound(file) {
    try {
      const a = new Audio(file);
      // ne pas await: certains navigateurs bloquent/retardent selon autoplay policies
      a.play().catch(() => {});
      return a;
    } catch {
      return null;
    }
  }

  function playBeep() { playSound("beep.mp3"); }
  function playDing() { playSound("ding.mp3"); }

  function speakJP(text, speed = 1) {
    return new Promise((resolve) => {
      if (!text) return resolve();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ja-JP";
      utter.rate = speed;     // ralentir/accélérer la voix
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.speak(utter);
    });
  }

  function pickRandom(arr, count) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < count && copy.length; i++) {
      const index = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(index, 1)[0]);
    }
    return result;
  }

  async function loadJSON(file) {
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) {
        console.error(`❌ Erreur ${res.status}: impossible de charger ${file}`);
        return null;
      }
      return res.json();
    } catch (e) {
      console.error(`❌ Erreur réseau/JSON pour ${file}`, e);
      return null;
    }
  }

  /********************************************************************
   * DONNÉES EN DUR KIHON COMBAT (fallback)
   ********************************************************************/
  const KCB_FALLBACK = [
    { jp: "Oï Zuki (coup de poing en avançant), niveau jodan, retour à l’arrière." },
    { jp: "Gyaku Zuki chudan (coup de poing direct du bras arrière)" },
    { jp: "Kizami Zuki/Maete Zuki (bras avant) jodan, suivi de Gyaku Zuki (bras arrière) chudan" },
    { jp: "Mae Geri, de la jambe arrière posée derrière, niveau chudan" },
    { jp: "Mawashi Geri, de la jambe arrière posée derrière, niveau jodan ou chudan" },
    { jp: "Mae Geri de la jambe avant avec sursaut, niveau chudan" },
    { jp: "Mawashi Geri, de la jambe avant avec sursaut, niveau jodan ou chudan" }
  ];

  /********************************************************************
   * CHARGEMENT JSON (avec les vraies clés)
   ********************************************************************/
  const ksJson = await loadJSON("kihon_simples.json");
  const KS_DATA = ksJson ? ksJson.kihon : [];

  const kcJson = await loadJSON("kihon_enchainements.json");
  const KC_DATA = kcJson ? kcJson["enchaînements"] : [];

  const kcbJson = await loadJSON("kihon_combat.json");
  let KCB_DATA = kcbJson ? (kcbJson.kihon || kcbJson.combat || []) : [];
  if (!KCB_DATA.length) KCB_DATA = KCB_FALLBACK;

  console.log("KS:", KS_DATA.length, "KC:", KC_DATA.length, "KCB:", KCB_DATA.length);

  /********************************************************************
   * MODULE GÉNÉRIQUE
   ********************************************************************/
  function initModule(config) {
    const {
      countInput, intervalInput, intervalDisplayId,
      speedInput, speedDisplayId,
      btnRandom, btnRead, btnStop,
      outBox, beepIcon,
      data
    } = config;

    const intervalDisplay = document.getElementById(intervalDisplayId);
    const speedDisplay = speedDisplayId ? document.getElementById(speedDisplayId) : null;

    let beepEnabled = true;

    // gestion “stop / relance” propre
    let runId = 0;
    let running = false;

    // init affichages
    if (intervalDisplay) intervalDisplay.textContent = `${intervalInput.value}s`;
    if (speedDisplay && speedInput) speedDisplay.textContent = `${speedInput.value}x`;

    // si pas de data
    if (!data || data.length === 0) {
      outBox.innerHTML = "<div>❌ Données manquantes.</div>";
      btnRandom.disabled = true;
      btnRead.disabled = true;
      return;
    }

    // séquence courante
    let sequence = [];

    // ON/OFF sons (bip + ding)
    beepIcon.addEventListener("click", () => {
      beepEnabled = !beepEnabled;
      beepIcon.classList.toggle("off", !beepEnabled);

      // si on coupe le son, on stoppe aussi une lecture en cours pour éviter confusion
      stopAll();
    });

    function stopAll() {
      runId++;
      running = false;
      speechSynthesis.cancel();
    }

    // sliders
    intervalInput.addEventListener("input", () => {
      if (intervalDisplay) intervalDisplay.textContent = `${intervalInput.value}s`;
    });

    if (speedInput && speedDisplay) {
      speedInput.addEventListener("input", () => {
        speedDisplay.textContent = `${speedInput.value}x`;
      });
    }

    // Changer = uniquement générer + afficher (PAS de lecture / PAS de bip)
    btnRandom.addEventListener("click", () => {
      const count = countInput ? Math.max(1, parseInt(countInput.value || "1", 10)) : 1;
      sequence = pickRandom(data, count);
      outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");
    });

    // Lire
    btnRead.addEventListener("click", async () => {
      if (running) return;

      // si rien n'a été généré : on génère au clic sur Lire
      if (!sequence.length) {
        btnRandom.click();
        if (!sequence.length) return;
      }

      running = true;
      const myRun = ++runId;

      // feedback immédiat (optionnel)
      if (beepEnabled) playBeep();

      // 10s avant la première annonce
      await wait(INITIAL_DELAY_MS);
      if (myRun !== runId) return;

      const intervalMs = Math.max(0, parseInt(intervalInput.value, 10)) * 1000;
      const speed = speedInput ? parseFloat(speedInput.value) : 1;

      for (let i = 0; i < sequence.length; i++) {
        if (myRun !== runId) return;

        // ding avant chaque terme (pour les 3 scripts)
        if (beepEnabled) playDing();

        // latence 1.5s après ding
        await wait(DING_TO_SPEECH_DELAY_MS);
        if (myRun !== runId) return;

        // lecture
        await speakJP(sequence[i].jp, speed);
        if (myRun !== runId) return;

        // intervalle entre éléments (après la fin de la voix)
        if (i < sequence.length - 1) {
          await wait(intervalMs);
          if (myRun !== runId) return;
        }
      }

      // fin
      if (beepEnabled) playBeep();
      running = false;
    });

    // Stop
    btnStop.addEventListener("click", () => {
      stopAll();
    });

    // affichage initial (sans lecture)
    btnRandom.click();
  }

  /********************************************************************
   * ACTIVATION DES 3 MODULES UV1
   ********************************************************************/
  initModule({
    countInput: document.getElementById("ks-count"),
    intervalInput: document.getElementById("ks-interval"),
    intervalDisplayId: "ks-interval-display",
    speedInput: document.getElementById("ks-speed"),
    speedDisplayId: "ks-speed-display",
    btnRandom: document.getElementById("ks-generate"),
    btnRead: document.getElementById("ks-read"),
    btnStop: document.getElementById("ks-stop"),
    outBox: document.getElementById("ks-result"),
    beepIcon: document.getElementById("ks-beep"),
    data: KS_DATA
  });

  initModule({
    countInput: document.getElementById("kc-count"),
    intervalInput: document.getElementById("kc-interval"),
    intervalDisplayId: "kc-interval-display",
    speedInput: document.getElementById("kc-speed"),
    speedDisplayId: "kc-speed-display",
    btnRandom: document.getElementById("kc-generate"),
    btnRead: document.getElementById("kc-read"),
    btnStop: document.getElementById("kc-stop"),
    outBox: document.getElementById("kc-result"),
    beepIcon: document.getElementById("kc-beep"),
    data: KC_DATA
  });

  initModule({
    countInput: document.getElementById("kcb-count"),
    intervalInput: document.getElementById("kcb-interval"),
    intervalDisplayId: "kcb-interval-display",
    speedInput: null,
    speedDisplayId: null,
    btnRandom: document.getElementById("kcb-generate"),
    btnRead: document.getElementById("kcb-read"),
    btnStop: document.getElementById("kcb-stop"),
    outBox: document.getElementById("kcb-result"),
    beepIcon: document.getElementById("kcb-beep"),
    data: KCB_DATA
  });

});
