document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // SCRIPT DU TIRAGE ALÉATOIRE (CONSERVÉ)
    // ======================================================
    const kataList = [
        "Kata Escargot",
        "Kata Métronome",
        "Kata Speedy",
        "Kata Jour J",
        "Focus Transition",
        "Version Bunkaï"
    ];

    const btnRandom = document.getElementById("btnKataRandom");
    const kataResult = document.getElementById("kataResult");

    btnRandom.addEventListener("click", () => {
        const randomIndex = Math.floor(Math.random() * kataList.length);
        kataResult.textContent = kataList[randomIndex];
    });


    // ======================================================
    // SCRIPT MÉTRONOME AVANCÉ (COMPLET)
    // ======================================================
    let isPlaying = false;
    let intervalId = null;
    let currentBeat = -1;
    
    const bpmSlider = document.getElementById('bpmSlider');
    const bpmValue = document.getElementById('bpmValue');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const lcdDisplay = document.getElementById('lcdDisplay');
    const patternGrid = document.getElementById('patternGrid');
    
    let rhythmPattern = [true, false, false, false]; // Par défaut : 4/4

    function initializePatternGrid() {
        patternGrid.innerHTML = '';
        rhythmPattern.forEach((isActive, index) => {
            const beatBtn = document.createElement('button');
            beatBtn.className = 'beat-btn';
            beatBtn.textContent = index + 1;
            if (isActive) {
                beatBtn.classList.add('active');
            }
            beatBtn.addEventListener('click', () => toggleBeat(index));
            patternGrid.appendChild(beatBtn);
        });
    }

    function toggleBeat(index) {
        rhythmPattern[index] = !rhythmPattern[index];
        const beatBtns = patternGrid.querySelectorAll('.beat-btn');
        if (rhythmPattern[index]) {
            beatBtns[index].classList.add('active');
        } else {
            beatBtns[index].classList.remove('active');
        }
    }

    function playTick() {
        const beatBtns = patternGrid.querySelectorAll('.beat-btn');
        beatBtns.forEach(btn => btn.classList.remove('current'));
        
        currentBeat = (currentBeat + 1) % rhythmPattern.length;
        
        beatBtns[currentBeat].classList.add('current');

        const frequency = rhythmPattern[currentBeat] ? 1000 : 600;
        playClickSound(frequency);
        
        updateDisplay();
    }

    function playClickSound(frequency) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    function startMetronome() {
        if (isPlaying) return;
        isPlaying = true;
        const bpm = parseInt(bpmSlider.value);
        const interval = 60000 / bpm;

        intervalId = setInterval(playTick, interval);
        playBtn.innerHTML = '<span class="material-icons">pause</span>';
    }

    function stopMetronome() {
        if (!isPlaying) return;
        isPlaying = false;
        clearInterval(intervalId);
        currentBeat = -1;
        playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        updateDisplay();
        patternGrid.querySelectorAll('.beat-btn').forEach(btn => btn.classList.remove('current'));
    }

    function updateDisplay() {
        const bpm = bpmSlider.value;
        const beat = currentBeat + 1;
        lcdDisplay.textContent = `${bpm} | ${beat}`;
    }

    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopMetronome();
        } else {
            startMetronome();
        }
    });

    stopBtn.addEventListener('click', stopMetronome);

    bpmSlider.addEventListener('input', () => {
        bpmValue.textContent = bpmSlider.value;
        updateDisplay();
        if (isPlaying) {
            stopMetronome();
            startMetronome();
        }
    });

    // Initialisation au chargement de la page
    initializePatternGrid();
    updateDisplay();

});
