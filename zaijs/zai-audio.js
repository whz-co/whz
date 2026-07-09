// ============================================================
// ZAKHOURANI AI - AUDIO SYSTEM
// ============================================================
let audioCtx = null;

const AudioSystem = {
    init() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    },

    beep(freq = 800, vol = 0.04, dur = 0.1) {
        if (!ZAI_CONFIG.soundEnabled) return;
        try {
            const ctx = this.init();
            if (!ctx || ctx.state !== 'running') return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.value = vol;
            osc.start();
            osc.stop(ctx.currentTime + dur);
        } catch (e) {}
    },

    click() { this.beep(1000, 0.03, 0.04); },
    
    send() {
        this.beep(800, 0.05, 0.08);
        setTimeout(() => this.beep(1000, 0.04, 0.06), 50);
    },
    
    success() {
        this.beep(800, 0.06, 0.08);
        setTimeout(() => this.beep(1200, 0.05, 0.08), 70);
    },
    
    claim() {
        this.beep(523, 0.07, 0.12);
        setTimeout(() => this.beep(659, 0.06, 0.12), 120);
    }
};

document.addEventListener('click', () => AudioSystem.init(), { once: true });
document.addEventListener('touchstart', () => AudioSystem.init(), { once: true });
