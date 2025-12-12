/* =====================================================
   UV5 & UV6 — RANDORI with filters, duplicates, beep timer
   - both encarts use same data lists
   - beeper independent from reading
   ===================================================== */
(function RANDORI_MODULE(){
  const LIST_ALL = [
    "Saisie de poignet direct","Saisie de poignet opposé","Saisie de poignet haut",
    "Saisie des deux poignets bas","Saisie des deux poignets haut","Saisie d'un poignet à deux mains",
    "Étranglement de face à une main","Étranglement de face à deux mains","Saisie de revers + mawashi tsuki",
    "Saisie de cheveux","Attaque couteau basse ou pique","Attaque couteau circulaire",
    "Attaque couteau revers","Attaque couteau haute","Matraque haute","Matraque revers",
    "Coup de poing direct","Mawashi tsuki gauche","Mawashi tsuki droit","Saisie manche haute","Saisie manche basse"
  ];

  const CAT_A = [
    "Saisie de poignet direct","Saisie de poignet opposé","Saisie de poignet haut",
    "Saisie des deux poignets bas","Saisie des deux poignets haut","Saisie d'un poignet à deux mains",
    "Étranglement de face à une main","Étranglement de face à deux mains","Saisie de revers + mawashi tsuki",
    "Saisie de cheveux","Saisie manche haute","Saisie manche basse"
  ];

  const CAT_B = [
    "Attaque couteau basse ou pique","Attaque couteau circulaire","Attaque couteau revers",
    "Attaque couteau haute","Matraque haute","Matraque revers","Coup de poing direct",
    "Mawashi tsuki gauche","Mawashi tsuki droit"
  ];

  function getBaseFromCat(cat){
    switch(cat){
      case 'A': return CAT_A.slice();
      case 'B': return CAT_B.slice();
      default: return LIST_ALL.slice();
    }
  }

  // common helpers
  function pick(list, count, allowDup){
    if(allowDup){
      const out=[];
      for(let i=0;i<count;i++) out.push(list[Math.floor(Math.random()*list.length)]);
      return out;
    } else {
      const copy = list.slice();
      const out = [];
      while(out.length < count && copy.length>0){
        const idx = Math.floor(Math.random()*copy.length);
        out.push(copy.splice(idx,1)[0]);
      }
      return out;
    }
  }

  // setup each UV (5 and 6) with same behavior
  function setupUV(uid){
    const result = $(uid + '-result');
    const filter = $(uid + '-filter');
    const dup = $(uid + '-duplicates');
    const count = $(uid + '-count');
    const readInterval = $(uid + '-read-interval');
    const readIntervalDisplay = $(uid + '-read-interval-display');

    // beep controls
    const beepSlider = $(uid + '-beep-interval');
    const beepDisplay = $(uid + '-beep-display');
    const beepIcon = $(uid + '-beep-icon');
    const beepStart = $(uid + '-beep-start');
    const beepStop = $(uid + '-beep-stop');

    const btnGenerate = $(uid + '-generate');
    const btnRead = $(uid + '-read');
    const btnStop = $(uid + '-stop');

    if(readInterval && readIntervalDisplay) readIntervalDisplay.textContent = readInterval.value;
    if(beepSlider && beepDisplay) beepDisplay.textContent = beepSlider.value;

    // selection
    let currentSelection = [];

    function refresh(){
      const cat = filter ? filter.value : 'all';
      const allow = dup ? dup.checked : false;
      const n = count ? Math.max(1, parseInt(count.value)||1) : 3;
      const base = getBaseFromCat(cat==='all' ? 'all' : cat);
      currentSelection = pick(base, n, allow);
      if(result) result.innerHTML = currentSelection.map((t,i)=>`<p><b>${i+1}.</b> ${t}</p>`).join('');
      return currentSelection;
    }

    // initial
    refresh();

    // UI events
    if(readInterval){
      readInterval.addEventListener('input', ()=> readIntervalDisplay.textContent = readInterval.value);
    }
    if(beepSlider){
      beepSlider.addEventListener('input', ()=> beepDisplay.textContent = beepSlider.value);
    }

    if(btnGenerate) btnGenerate.addEventListener('click', refresh);

    // reading logic (with ding before each term)
    let reading=false, readTimer=null;
    const ding = new Audio('ding.mp3');
    const beepSound = new Audio('beep.mp3');

    if(btnRead){
      btnRead.addEventListener('click', ()=>{
        if(reading) return;
        if(!currentSelection || currentSelection.length===0) return;
        reading=true;
        let idx=0;
        const intervalMs = (readInterval ? parseInt(readInterval.value) : 15)*1000;

        function next(){
          if(!reading) return;
          if(idx >= currentSelection.length){
            try{ beepSound.play(); } catch(e){}
            reading=false;
            return;
          }
          try{ ding.currentTime=0; ding.play().catch(()=>{}); }catch(e){}
          setTimeout(()=>{
            if(!reading) return;
            speakFR(currentSelection[idx]);
            idx++;
            readTimer = setTimeout(next, intervalMs);
          }, 400);
        }

        // start after 5s (spec)
        readTimer = setTimeout(next, 5000);
      });
    }

    if(btnStop){
      btnStop.addEventListener('click', ()=>{
        reading=false;
        if(readTimer){ clearTimeout(readTimer); readTimer=null; }
        try{ speechSynthesis.cancel(); }catch(e){}
      });
    }

    // beep timer independent
    let beepTimer = null;
    if(beepStart){
      beepStart.addEventListener('click', ()=>{
        if(beepTimer) return;
        beepIcon && (beepIcon.textContent='🔊');
        const ms = (beepSlider ? parseInt(beepSlider.value) : 10) * 1000;
        beepTimer = setInterval(()=>{ try{ ding.currentTime=0; ding.play().catch(()=>{}); }catch(e){} }, ms);
      });
    }
    if(beepStop){
      beepStop.addEventListener('click', ()=>{
        if(beepTimer){ clearInterval(beepTimer); beepTimer=null; }
        beepIcon && (beepIcon.textContent='🔇');
      });
    }

  } // setupUV

  // attach for uv5 & uv6 after DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    setupUV('uv5');
    setupUV('uv6');
  });
