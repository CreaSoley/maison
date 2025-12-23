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

    // --- SIMULATION DES DONNÉES FUTURES ---
    // À l'avenir, ces données viendront de votre Google Sheet.
    // La clé est le nom du kata, et la valeur contient le déroulé.
    const katasDetails = {
        "Kata Escargot": "Déplacement lent vers l'avant. Blocage montant. Frappe poing avant. Retour en position initiale.",
        "Kata Métronome": "Enchaînement de 4 coups de poing sur un rythme constant. Un pas après chaque coup. Pivots et répétition.",
        "Kata Speedy": "Série de déplacements rapides en zigzag. Esquives basses. Contre-attaque avec une paume de main.",
        "Kata Jour J": "Position de garde. Avancée avec un balayage. Projection de l'adversaire imaginaire. Contrôle au sol.",
        "Focus Transition": "Passage de la position debout à la position au sol. Technique de clé de bras. Levé et retour en garde.",
        "Version Bunkaï": "Application pratique. Blocage d'un coup droit. Saisie du bras. Projection de hanche. Finition."
    };


    const btnRandom = document.getElementById("btnKataRandom");
    const kataResult = document.getElementById("kataResult");

    btnRandom.addEventListener("click", () => {
        const randomIndex = Math.floor(Math.random() * kataList.length);
        kataResult.textContent = kataList[randomIndex];
    });


    // ======================================================
    // NOUVEAU SCRIPT : LECTEUR DE CARTE (Text-to-Speech)
    // ======================================================
    const btnSpeak = document.getElementById('btnSpeak');
    const btnStopSpeak = document.getElementById('btnStopSpeak');
    const speedRateSlider = document.getElementById('speedRate');
    const speedValueSpan = document.getElementById('speedValue');
    
    // Met à jour l'affichage de la vitesse
    speedRateSlider.addEventListener('input', () => {
        speedValueSpan.textContent = parseFloat(speedRateSlider.value).toFixed(1) + 'x';
    });

    btnSpeak.addEventListener('click', () => {
        const kataName = kataResult.textContent;
        if (kataName === '-') {
            alert("Veuillez d'abord faire un tirage aléatoire !");
            return;
        }

        // Récupérer le déroulé depuis notre objet de données simulées
        const details = katasDetails[kataName];
        if (!details) {
            alert("Détail non trouvé pour ce kata.");
            return;
        }

        // Annule toute lecture en cours avant de commencer une nouvelle
        window.speechSynthesis.cancel();

        const speechRate = parseFloat(speedRateSlider.value);
        
        // --- Gestion de la séquence avec pause ---
        const intro = `aujourd'hui nous allons travailler le kata ${kataName}. commençons.`;
        const deroule = details;

        const utteranceIntro = new SpeechSynthesisUtterance(intro);
        utteranceIntro.lang = 'fr-FR';
        utteranceIntro.rate = speechRate;

        utteranceIntro.onend = () => {
            // Une fois l'intro terminée, attendre 1 seconde
            setTimeout(() => {
                const utteranceDeroule = new SpeechSynthesisUtterance(deroule);
                utteranceDeroule.lang = 'fr-FR';
                utteranceDeroule.rate = speechRate;
                window.speechSynthesis.speak(utteranceDeroule);
            }, 1000); // Pause de 1000ms (1 seconde)
        };

        window.speechSynthesis.speak(utteranceIntro);
    });

    btnStopSpeak.addEventListener('click', () => {
        window.speechSynthesis.cancel();
    });


    // ======================================================
    // NOUVEAU SCRIPT : MÉTRONOME AVANCÉ
    // ======================================================
    let isPlaying = false;
    let intervalId = null;
    let currentBeat = -1; // Commence à -1 pour que le premier tick soit le temps 0
    
    const bpmSlider = document.getElementById('bpmSlider');
    const bpmValue = document.getElementById('bpmValue');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const lcdDisplay = document.getElementById('lcdDisplay');
    const patternGrid = document.getElementById('patternGrid');
    
    let rhythmPattern = [true, false, false, false]; // Par défaut : 4/4 avec seul le premier temps fort

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
