/**
 * FARM FIGHTER IV — Procedural 1990s Arcade Sound & Music Engine (Web Audio API)
 * Zero external audio assets required; instant playback on desktop & mobile.
 */

const MUTE_STORAGE_KEY = 'stf_farmfighter4_muted';

class ArcadeAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.isPlayingMusic = false;

    try {
      this.muted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    } catch (_e) {
      this.muted = false;
    }
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, this.muted ? 'true' : 'false');
    } catch (_e) {}
    if (this.muted) {
      this.stopMusic();
    }
    return this.muted;
  }

  playTone(freq, type = 'square', duration = 0.1, vol = 0.15, slideFreq = null, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), now);
    if (slideFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), now + duration);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playNoise(duration = 0.12, vol = 0.2, filterFreq = 1200, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }

  playUiSelect() {
    this.playTone(520, 'square', 0.06, 0.1, 780);
  }

  playUiConfirm() {
    this.playTone(440, 'square', 0.07, 0.14);
    this.playTone(660, 'square', 0.08, 0.14, 880, 0.06);
  }

  playVsClash() {
    this.playNoise(0.28, 0.28, 1800);
    this.playTone(140, 'sawtooth', 0.35, 0.22, 55);
    this.playTone(587.33, 'square', 0.18, 0.16, 880, 0.05);
  }

  playRoundBell() {
    this.playTone(880, 'triangle', 0.35, 0.22);
    this.playTone(1320, 'sine', 0.35, 0.15);
    this.playTone(880, 'triangle', 0.4, 0.22, null, 0.16);
  }

  playNormalHit() {
    this.playNoise(0.09, 0.22, 1600);
    this.playTone(190, 'triangle', 0.09, 0.22, 70);
  }

  playHeavyHit() {
    this.playNoise(0.18, 0.32, 1100);
    this.playTone(150, 'sawtooth', 0.18, 0.28, 45);
  }

  playBlock() {
    this.playTone(920, 'square', 0.06, 0.14, 420);
    this.playNoise(0.05, 0.1, 2800);
  }

  playJump() {
    this.playTone(180, 'sine', 0.14, 0.12, 460);
  }

  playAnimalCry(fighterId) {
    switch (fighterId) {
      case 'cluck_norris':
        // Rooster bawk-bawk-CROW!
        this.playTone(620, 'sawtooth', 0.07, 0.16, 820, 0);
        this.playTone(680, 'sawtooth', 0.07, 0.16, 940, 0.08);
        this.playTone(880, 'sawtooth', 0.26, 0.18, 520, 0.16);
        break;
      case 'moo_tai':
        // Deep resonant MOOOO + cowbell
        this.playTone(135, 'sawtooth', 0.34, 0.22, 98, 0);
        this.playTone(800, 'square', 0.11, 0.14, 790, 0.08);
        break;
      case 'ham_solo':
        // Pig oink-snort + carnival mallet boing
        this.playTone(240, 'sawtooth', 0.1, 0.18, 420, 0);
        this.playTone(320, 'triangle', 0.16, 0.18, 160, 0.1);
        break;
      case 'billy_the_kid':
        // Vibrato goat bleat BAAA!
        this.playTone(390, 'sawtooth', 0.08, 0.16, 440, 0);
        this.playTone(430, 'sawtooth', 0.08, 0.16, 380, 0.08);
        this.playTone(420, 'sawtooth', 0.14, 0.16, 460, 0.16);
        break;
      case 'woolverine':
        // Metallic SNIKT + electric baa
        this.playNoise(0.08, 0.18, 4200, 0);
        this.playTone(1200, 'sawtooth', 0.1, 0.16, 2200, 0.02);
        this.playTone(310, 'square', 0.18, 0.15, 260, 0.11);
        break;
      case 'marey_poppins':
        // Refined horse whinny / neigh + rhythmic clip-clop
        this.playTone(660, 'sawtooth', 0.12, 0.16, 920, 0);
        this.playTone(840, 'triangle', 0.22, 0.18, 580, 0.12);
        this.playTone(320, 'square', 0.04, 0.12, 280, 0.26);
        this.playTone(360, 'square', 0.04, 0.12, 310, 0.32);
        break;
      case 'dalai_llama':
        // Resonant zen Tibetan singing bowl gong + enlightened spit swoosh
        this.playTone(216, 'sine', 0.45, 0.22, 216, 0);
        this.playTone(432, 'triangle', 0.35, 0.14, 432, 0.04);
        this.playNoise(0.08, 0.16, 2600, 0.12);
        this.playTone(520, 'sine', 0.15, 0.16, 280, 0.2);
        break;
      case 'quackie_chan':
      default:
        // Rapid martial-arts QUACK-QUACK!
        this.playTone(540, 'sawtooth', 0.08, 0.18, 340, 0);
        this.playTone(610, 'sawtooth', 0.1, 0.18, 380, 0.09);
        break;
    }
  }

  playDoNotPressSiren() {
    // Dramatic klaxon siren + explosion
    this.playTone(440, 'sawtooth', 0.22, 0.24, 880, 0);
    this.playTone(440, 'sawtooth', 0.22, 0.24, 880, 0.24);
    this.playNoise(0.45, 0.34, 850, 0.35);
    this.playTone(110, 'sawtooth', 0.45, 0.3, 38, 0.35);
  }

  playKO() {
    this.playNoise(0.45, 0.36, 900, 0);
    this.playTone(220, 'sawtooth', 0.5, 0.28, 55, 0);
    this.playTone(165, 'triangle', 0.55, 0.25, 45, 0.12);
  }

  playVictoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 'square', 0.16, 0.15, null, idx * 0.11);
    });
  }

  announce(text) {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      let speech = String(text);
      // Phonetically normalize K.O. / KO into 'Kay-Oh' so mobile TTS engines
      // (iOS Safari / Android) speak each letter cleanly instead of reading it as the word 'coe'
      speech = speech.replace(/\bK\.?O\.?/gi, 'Kay-Oh');
      speech = speech.replace(/[!?.#*^~]/g, ' ').trim().replace(/\s+/g, ' ');

      if (!speech) return;

      const utt = new SpeechSynthesisUtterance(speech);
      utt.pitch = 0.88;
      utt.rate = 1.15;
      utt.volume = 0.95;

      // Ensure English voice matching if multiple system languages exist
      const voices = window.speechSynthesis.getVoices?.();
      if (voices && voices.length > 0) {
        const enVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
        if (enVoice) {
          utt.voice = enVoice;
        }
      }

      window.speechSynthesis.speak(utt);
    } catch (_) {
      // Graceful fallback if speech synthesis is unavailable or restricted
    }
  }

  startMusic() {
    if (this.muted || this.isPlayingMusic) return;
    this.init();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    this.musicStep = 0;
    const bassPattern = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    const leadPattern = [440, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25];

    this.musicTimer = setInterval(() => {
      if (this.muted || !this.isPlayingMusic) return;
      const step = this.musicStep % bassPattern.length;
      const bFreq = bassPattern[step];
      const lFreq = leadPattern[step];

      this.playTone(bFreq, 'triangle', 0.15, 0.05);
      if (lFreq > 0 && this.musicStep % 2 === 0) {
        this.playTone(lFreq, 'square', 0.11, 0.03);
      }
      this.musicStep++;
    }, 190);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audio = new ArcadeAudioEngine();
