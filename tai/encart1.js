/* encart1.js — UV1 Kihon (corrigé)
   - récupère les éléments après DOM ready
   - sliders pilotent réellement l'intervalle entre lectures
   - fallback JSON handling
   - stop fonctionne
*/

(function(){
  // data
  let KS_DATA = [];
  let KC_DATA = [];
  const KCB_LIST = [
    "Mae Geri, de la jambe arrière posée derrière, niveau chudan",
    "Mawashi Geri, de la jambe arrière posée derrière, niveau jodan ou chudan",
    "Mae Geri de la jambe avant avec sursaut, niveau chudan",
    "Mawashi Geri, de la jambe avant avec sursaut, niveau jodan ou chudan",
    "Gyaku Zuki chudan",
    "Kizami Zuki/Maete Zuki suivi de Gyaku Zuki",
    "Oï Zuki jodan, retour arrière"
  ];

  // UI handles (will be set on DOMContentLoaded)
  let ksCount, ksInterval, ksIntervalDisplay, ksGenerateBtn, ksReadBtn, ksStopBtn, ksResult;
  let kcCount, kcInterval, kcIntervalDisplay, kcGenerateBtn, kcReadBtn, kcStopBtn, kcResult;
  let kcbInterval, kcbIntervalDisplay, kcbGenerateBtn, kcbReadBtn, kcbStopBtn, kcbResult;

  // small helpers
  const ding = new Audio("ding.mp3");
  function playDingThen(cb, after=3000){
    try{ ding.currentTime = 0; ding.play().catch(()=>{}); }catch(e){}
    setTimeout(cb, after);
  }

  function speakJP(text, rate=0.7){
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = rate;
      speechSynthesis.speak(u);
    }catch(e){
      console.warn("speakJP error", e);
    }
  }
  function speakFR(text, rate=0.95){
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR";
      u.rate = rate;
      speechSynthesis.speak(u);
    }catch(e){}
  }

  // readers (generic per-list reader)
  function Reader() {
    this.reading = false;
    this.timer = null;
  }
  Reader.prototype.start = function(list, speakFn, intervalMs){
    if(this.reading) return;
    if(!Array.isArray(list) || list.length===0) return;
    this.reading = true;
    let i = 0;
    const self = this;

    // run step (ding -> speak -> wait interval -> next)
    function step(){
      if(!self.reading) return;
      if(i >= list.length){
        self.reading = false;
        return;
      }
      playDingThen(()=>{
        if(!self.reading) return;
        speakFn(list[i]);
        i++;
        self.timer = setTimeout(step, intervalMs);
      }, 3000);
    }

    // initial delay before first ding (spec had 5s)
    self.timer = setTimeout(step, 5000);
  };
  Reader.prototype.stop = function(){
    this.reading = false;
    if(this.timer) { clearTimeout(this.timer); this.timer = null; }
    try{ speechSynthesis.cancel(); }catch(e){}
  };

  const ksReader = new Reader();
  const kcReader = new Reader();
  const kcbReader = new Reader();

  // load JSON helpers
  async function fetchJson(path){
    try{
      const r = await fetch(path);
      if(!r.ok) throw new Error("not found");
      return await r.json();
    }catch(e){
      return null;
    }
  }

  // KIHON simples
  async function ksLoad(){
    const j = await fetchJson("kihon_simples.json");
    if(j && Array.isArray(j.kihon) && j.kihon.length) KS_DATA = j.kihon;
    else {
      console.warn("kihon_simples.json missing or invalid — using fallback.");
      KS_DATA = [
        {romaji:"Gedan Barai", jp:"下段払い"},
        {romaji:"Jodan Age Uke", jp:"上段上げ受け"},
        {romaji:"Soto Ude Uke", jp:"外腕受け"}
      ];
    }
    // initial generate if desired
    ksGenerate();
  }
  function ksGenerate(){
    const n = Math.max(1, parseInt(ksCount.value) || 3);
    const sel = [];
    for(let i=0;i<n;i++){
      sel.push(KS_DATA[Math.floor(Math.random()*KS_DATA.length)]);
    }
    ksResult.innerHTML = sel.map((x,i)=>`<p><b>${i+1}.</b> ${x.romaji}<br><i>${x.jp}</i></p>`).join("");
    ksGenerate._sel = sel;
  }
  function ksRead(){
    const sel = ksGenerate._sel || [];
    if(!sel.length) return;
    // unlock speech on desktop
    unlockSpeech().then(()=>{
      const intervalMs = Math.max(1000, parseInt(ksInterval.value)||5) * 1000;
      ksReader.start(sel, (item)=> speakJP(item.jp, 0.7), intervalMs);
    });
  }
  function ksStop(){ ksReader.stop(); }

  // ENCHAINEMENTS
  async function kcLoad(){
    const j = await fetchJson("kihon_enchainements.json");
    if(j && Array.isArray(j.enchaînements) && j.enchaînements.length) KC_DATA = j.enchaînements;
    else {
      console.warn("kihon_enchainements.json missing or invalid — using fallback.");
      KC_DATA = [
        {fr:"Gedan Barai, Gyaku Tsuki, Mae Geri", jp:"下段払い、逆突き、前蹴り"},
        {fr:"Jodan Age Uke, Oi Tsuki, Mae Geri", jp:"上段上げ受け、追い突き、前蹴り"}
      ];
    }
    kcGenerate();
  }
  function kcGenerate(){
    const n = Math.max(1, parseInt(kcCount.value) || 2);
    const sel=[];
    for(let i=0;i<n;i++){
      sel.push(KC_DATA[Math.floor(Math.random()*KC_DATA.length)]);
    }
    kcResult.innerHTML = sel.map((x,i)=>`<p><b>${i+1}.</b> ${x.fr}<br><i>${x.jp}</i></p>`).join("");
    kcGenerate._sel = sel;
  }
  function kcRead(){
    const sel = kcGenerate._sel || [];
    if(!sel.length) return;
    unlockSpeech().then(()=>{
      const intervalMs = Math.max(1000, parseInt(kcInterval.value)||60) * 1000;
      kcReader.start(sel, (item)=> speakJP(item.jp, 0.7), intervalMs);
    });
  }
  function kcStop(){ kcReader.stop(); }

  // TECHNIQUES COMBAT (FR)
  function kcbGenerate(){
    const sel = [...KCB_LIST].sort(()=>0.5-Math.random()).slice(0,3);
    kcbResult.innerHTML = sel.map((t,i)=>`<p><b>${i+1}.</b> ${t}</p>`).join("");
    kcbGenerate._sel = sel;
  }
  function kcbRead(){
    const sel = kcbGenerate._sel || [];
    if(!sel.length) return;
    const intervalMs = Math.max(1000, parseInt(kcbInterval.value)||60)*1000;
    kcbReader.start(sel, (item)=> speakFR(item, 0.9), intervalMs);
  }
  function kcbStop(){ kcbReader.stop(); }

  // wire DOM elements and events on ready
  document.addEventListener("DOMContentLoaded", ()=>{

    // get elements (must exist — if not, warn and skip)
    ksCount = document.getElementById("ks-count");
    ksInterval = document.getElementById("ks-interval");
    ksIntervalDisplay = document.getElementById("ks-interval-display");
    ksGenerateBtn = document.getElementById("ks-generate");
    ksReadBtn = document.getElementById("ks-read");
    ksStopBtn = document.getElementById("ks-stop");
    ksResult = document.getElementById("ks-result");

    kcCount = document.getElementById("kc-count");
    kcInterval = document.getElementById("kc-interval");
    kcIntervalDisplay = document.getElementById("kc-interval-display");
    kcGenerateBtn = document.getElementById("kc-generate");
    kcReadBtn = document.getElementById("kc-read");
    kcStopBtn = document.getElementById("kc-stop");
    kcResult = document.getElementById("kc-result");

    kcbInterval = document.getElementById("kcb-interval");
    kcbIntervalDisplay = document.getElementById("kcb-interval-display");
    kcbGenerateBtn = document.getElementById("kcb-generate");
    kcbReadBtn = document.getElementById("kcb-read");
    kcbStopBtn = document.getElementById("kcb-stop");
    kcbResult = document.getElementById("kcb-result");

    // safety checks
    if(!ksCount || !ksInterval || !ksIntervalDisplay || !ksGenerateBtn || !ksReadBtn || !ksStopBtn || !ksResult){
      console.warn("encart1: some KS elements are missing in DOM — skipping KS wiring.");
    } else {
      ksIntervalDisplay.textContent = ksInterval.value + "s";
      ksInterval.addEventListener("input", ()=> ksIntervalDisplay.textContent = ksInterval.value + "s");
      ksGenerateBtn.addEventListener("click", ksGenerate);
      ksReadBtn.addEventListener("click", ksRead);
      ksStopBtn.addEventListener("click", ksStop);
    }

    if(!kcCount || !kcInterval || !kcIntervalDisplay || !kcGenerateBtn || !kcReadBtn || !kcStopBtn || !kcResult){
      console.warn("encart1: some KC elements are missing in DOM — skipping KC wiring.");
    } else {
      kcIntervalDisplay.textContent = kcInterval.value + "s";
      kcInterval.addEventListener("input", ()=> kcIntervalDisplay.textContent = kcInterval.value + "s");
      kcGenerateBtn.addEventListener("click", kcGenerate);
      kcReadBtn.addEventListener("click", kcRead);
      kcStopBtn.addEventListener("click", kcStop);
    }

    if(!kcbInterval || !kcbIntervalDisplay || !kcbGenerateBtn || !kcbReadBtn || !kcbStopBtn || !kcbResult){
      console.warn("encart1: some KCB elements are missing in DOM — skipping KCB wiring.");
    } else {
      kcbIntervalDisplay.textContent = kcbInterval.value + "s";
      kcbInterval.addEventListener("input", ()=> kcbIntervalDisplay.textContent = kcbInterval.value + "s");
      kcbGenerateBtn.addEventListener("click", kcbGenerate);
      kcbReadBtn.addEventListener("click", kcbRead);
      kcbStopBtn.addEventListener("click", kcbStop);
    }

    // load data
    ksLoad();
    kcLoad();
    kcbGenerate(); // initial

  }); // DOMContentLoaded

})(); // IIFE end
