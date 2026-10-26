// Web Audio API procedural sound synthesizer for Diwali celebration
// Zero external asset dependency - 100% reliable, zero-latency, realistic audio

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicNode = null;
    this.musicPlaying = false;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  // Helper: create white noise buffer
  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 1. Phuljhadi (Handheld Sparkler) Sizzle & Crackle
  playPhuljhadiSparkle() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.25);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4500 + Math.random() * 2000, t);
      filter.Q.setValueAtTime(8, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.25);

      // Micro metallic chime
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + Math.random() * 800, t);
      oscGain.gain.setValueAtTime(0.03, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Audio fallback silent
    }
  }

  // 2. Anar (Flowerpot Fountain) Continuous Roar & Spark Fizz
  playAnarFountain() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 0.4;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 600, t);
      filter.frequency.linearRampToValueAtTime(3200 + Math.random() * 800, t + duration);
      filter.Q.setValueAtTime(4, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + duration);
    } catch {}
  }

  // 3. Chakri (Ground Spinner) High Whistle & Swirl
  playChakriWhistle() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 800 + Math.random() * 300;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }

  // 4. Rocket Launch Whoosh
  playRocketLaunch() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 0.85;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(1900, t + duration);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(3500, t + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.02, t + duration);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
      noise.start(t);
      noise.stop(t + duration);
    } catch {}
  }

  // 5. Classic Fireworks Aerial Peony Burst / Big Bang
  playFireworkBang(pitch = 1.0, power = 1.0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Heavy Sub-bass boom
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);

      oscGain.gain.setValueAtTime(0.5 * power, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);

      // Noise crackle explosion
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.7);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.linearRampToValueAtTime(200, t + 0.7);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * power, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.7);
    } catch {}
  }

  // 6. Sutli Bomb - Super Loud Ground Bomb
  playSutliBomb() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Sub-bass thump
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(120, t);
      sub.frequency.exponentialRampToValueAtTime(20, t + 0.8);

      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(t);
      sub.stop(t + 0.85);

      // Distorted crack
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.9);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(2, t);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.7, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.9);
    } catch {}
  }

  // 7. Ladi (1000 Garland) Rapid Sharp Pop
  playLadiPop() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350 + Math.random() * 250, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.06);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.06);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.2, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.07);
    } catch {}
  }

  // 8. Temple Bell (Authentic Brass Pooja Bell Chime)
  playTempleBell() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const harmonics = [1174, 1760, 2349, 3136];
      harmonics.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const decay = 1.8 - idx * 0.3;
        const volume = 0.15 / (idx + 1);

        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + decay);
      });
    } catch {}
  }

  // 9. Golden Coin / Shagun Chime
  playCoinSound() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(987.77, t); // B5
      osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      osc2.frequency.setValueAtTime(1318.51, t);
      osc2.frequency.setValueAtTime(1975.53, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.45);
      osc2.start(t);
      osc2.stop(t + 0.45);
    } catch {}
  }

  // 10. Diya Lighting Auspicious Flame Sound
  playDiyaLight() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.25); // E5
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch {}
  }

  // 11. Crowd Cheer / Festive Exclamation
  playCrowdCheer() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(1.2);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, t);
      filter.Q.setValueAtTime(1.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 1.25);
    } catch {}
  }

  // 12. Indian Festive Ambient Drone & Melodic Chords (Toggleable)
  toggleFestiveMusic() {
    this.init();
    if (this.musicPlaying) {
      if (this.musicInterval) clearInterval(this.musicInterval);
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      }
      this.musicPlaying = false;
      return false;
    }

    this.musicPlaying = true;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    // Tanpura Drone frequencies (Sa, Pa, High Sa - C#, G#, C#)
    const droneFreqs = [138.59, 207.65, 277.18];
    droneFreqs.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();
    });

    // Gentle sitar-like rag notes generator
    const ragaNotes = [277.18, 311.13, 349.23, 415.3, 466.16, 554.37, 622.25];
    this.musicInterval = setInterval(() => {
      if (!this.musicPlaying || this.isMuted || !this.ctx) return;
      const note = ragaNotes[Math.floor(Math.random() * ragaNotes.length)];
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start(t);
      osc.stop(t + 1.25);
    }, 1800);

    return true;
  }

  // 13. Air Gun Shot (Carnival Balloon Game)
  playAirGunShot() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.12);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.12);
    } catch {}
  }

  // 14. Balloon Pop Sound
  playBalloonPop() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.06);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.3, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.07);
    } catch {}
  }

  // 15. Dholak / Dhol Festive Rhythmic Beat
  playDholakBeat(isBass = true) {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isBass) {
        // Dhol Dagga (Low resonance boom)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      } else {
        // Dhol Thapi (Crisp slap)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.1);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch {}
  }

  // 16. Wheel Spin Tick
  playWheelTick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    } catch {}
  }

  // 17. Divine Bow String Release (Twang & Arrow Flight)
  playBowShot(pitchMultiplier = 1.0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pitch = Math.min(1.8, Math.max(0.85, pitchMultiplier));

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(140 * pitch, t + 0.12 / pitch);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14 / pitch);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15 / pitch);
    } catch {}
  }

  // 18. Sparkler Blaster Gun Shot (Pistol/Laser blast)
  playGunShot(pitchMultiplier = 1.0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const pitch = Math.min(1.8, Math.max(0.85, pitchMultiplier));
      // Laser / blaster tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(120 * pitch, t + 0.07 / pitch);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08 / pitch);

      // Noise pop
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.05);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.25, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05 / pitch);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      noise.connect(nGain);
      nGain.connect(this.ctx.destination);

      osc.start(t);
      noise.start(t);
      osc.stop(t + 0.09 / pitch);
      noise.stop(t + 0.07 / pitch);
    } catch {}
  }

  // 19. Ravan Effigy Impact (Explosive Crackle on Ravan Hit)
  playRavanHit() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 800, t);
      filter.Q.setValueAtTime(5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.12);
    } catch {}
  }

  // 20. Ravan Arena Gate Pass (Resonant Regal Gong & Entry Chime)
  playGatePass() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [220, 440, 660, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 1.2);
        const amp = 0.14 / (idx + 1);
        gain.gain.setValueAtTime(amp, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.25);
      });
    } catch {}
  }

  // 21. Kala Naag Snake Cracker - Sizzling Chemical Ash Hiss & Smoke Sputter
  playHissingSmoke() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 0.35;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200 + Math.random() * 800, t);
      filter.frequency.linearRampToValueAtTime(1400 + Math.random() * 400, t + duration);
      filter.Q.setValueAtTime(6, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + duration);

      // Low ember sizzle hum
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      oscGain.gain.setValueAtTime(0.025, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {}
  }

  // 22. Mayur Pankh Peacock Fountain - Multi-Tonal Harmonic Royal Fountain Roar
  playPeacockFountain() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 0.5;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(4500, t + duration);
      filter.Q.setValueAtTime(5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + duration);

      // Peacock jewel chime chord
      const chords = [1200, 1600, 2400];
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + Math.random() * 50, t);
        og.gain.setValueAtTime(0.03 / (idx + 1), t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(og);
        og.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {}
  }

  // 23. Triranga UFO Chakri - Levitating High-Frequency Doppler Whir
  playUFOWhir() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      const baseFreq = 950 + Math.random() * 200;
      osc1.frequency.setValueAtTime(baseFreq, t);
      osc1.frequency.linearRampToValueAtTime(baseFreq * 1.8, t + 0.12);
      osc1.frequency.linearRampToValueAtTime(baseFreq * 0.85, t + 0.28);

      osc2.frequency.setValueAtTime(baseFreq * 0.5, t);
      osc2.frequency.linearRampToValueAtTime(baseFreq * 0.9, t + 0.15);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.Q.setValueAtTime(3, t);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.32);
      osc2.stop(t + 0.32);
    } catch {}
  }

  // 24. Dhamaka Bullet Bomb - Twin-Phase High-Voltage Concussion Blast
  playBulletBomb() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Phase 1: High metallic snap crack
      const snapNoise = this.ctx.createBufferSource();
      snapNoise.buffer = this.createNoiseBuffer(0.1);
      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(2400, t);
      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.5, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      snapNoise.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapNoise.start(t);
      snapNoise.stop(t + 0.09);

      // Phase 2: Electric sub-bass punch (40ms delayed)
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(190, t + 0.03);
      sub.frequency.exponentialRampToValueAtTime(35, t + 0.45);
      subGain.gain.setValueAtTime(0.65, t + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(t + 0.03);
      sub.stop(t + 0.52);

      // Distorted electric sizzle
      const sizzle = this.ctx.createBufferSource();
      sizzle.buffer = this.createNoiseBuffer(0.4);
      const sFilter = this.ctx.createBiquadFilter();
      sFilter.type = 'bandpass';
      sFilter.frequency.setValueAtTime(1100, t + 0.02);
      const sGain = this.ctx.createGain();
      sGain.gain.setValueAtTime(0.4, t + 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      sizzle.connect(sFilter);
      sFilter.connect(sGain);
      sGain.connect(this.ctx.destination);
      sizzle.start(t + 0.02);
      sizzle.stop(t + 0.42);
    } catch {}
  }

  // 25. Mahabali Atom Bomb - Giant Earth-Shaking Sub-Bass Concussion Detonation
  playAtomBomb() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Ultra-deep 50Hz sub-bass shockwave
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(95, t);
      sub.frequency.exponentialRampToValueAtTime(18, t + 1.1);

      subGain.gain.setValueAtTime(0.95, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(t);
      sub.stop(t + 1.15);

      // Massive explosive crackle roar
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(1.1);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.linearRampToValueAtTime(150, t + 1.1);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.75, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 1.15);
    } catch {}
  }

  // 26. Mirchi Pop-Pop Snappers - Rapid Crispy Friction Clicks & Pops
  playPopPopSnaps() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // 2-3 quick micro pops
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const offset = i * (0.025 + Math.random() * 0.035);
        const pt = t + offset;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450 + Math.random() * 300, pt);
        osc.frequency.exponentialRampToValueAtTime(80, pt + 0.04);
        gain.gain.setValueAtTime(0.25, pt);
        gain.gain.exponentialRampToValueAtTime(0.001, pt + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(pt);
        osc.stop(pt + 0.05);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.04);
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.2, pt);
        ng.gain.exponentialRampToValueAtTime(0.001, pt + 0.04);
        noise.connect(ng);
        ng.connect(this.ctx.destination);
        noise.start(pt);
        noise.stop(pt + 0.05);
      }
    } catch {}
  }

  // 27. Seeti Whistling Rocket - High Piercing Screech Whistle & Crackle Bloom
  playWhistlingRocketLaunch() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 1.1;

      // Piercing acoustic whistle glide
      const whistle = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(950, t);
      whistle.frequency.exponentialRampToValueAtTime(3600, t + duration);

      wGain.gain.setValueAtTime(0.18, t);
      wGain.gain.linearRampToValueAtTime(0.28, t + duration * 0.8);
      wGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whistle.connect(wGain);
      wGain.connect(this.ctx.destination);
      whistle.start(t);
      whistle.stop(t + duration);

      // Rocket flame jet rush
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(2800, t + duration);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.15, t);
      nGain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + duration);
    } catch {}
  }

  // 28. Swarna Varsha 12-Shot Cake - Aerial Mortar Thump & Cascading Weeping Willow Chimes
  playGoldenWillow() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;

      // Heavy mortar aerial boom
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(130, t);
      boom.frequency.exponentialRampToValueAtTime(25, t + 0.6);
      boomGain.gain.setValueAtTime(0.55, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start(t);
      boom.stop(t + 0.7);

      // Shimmering golden kamuro willow chimes (staggered sparkling bells)
      const willowNotes = [1760, 2093, 2637, 3136];
      willowNotes.forEach((freq, idx) => {
        const delay = 0.08 + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);
        g.gain.setValueAtTime(0.05 / (idx + 1), t + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.45);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.5);
      });
    } catch {}
  }

  // 29. Rang-Birangi Rainbow Mashaal - Roaring Multi-Color Jet Flame & Shimmer
  playColorTorch() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 0.3;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200 + Math.random() * 1200, t);
      filter.Q.setValueAtTime(7, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + duration);

      // Magical high harmonic sparkle chime
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200 + Math.random() * 800, t);
      og.gain.setValueAtTime(0.035, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(og);
      og.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch {}
  }

  // Steaming hot tea pouring sound with rising resonance
  playChaiPour() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      const duration = 1.1;

      // Noise source for pouring liquid stream
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, t);
      // Frequency rises as the cup fills up with hot tea!
      filter.frequency.exponentialRampToValueAtTime(1650, t + duration);
      filter.Q.setValueAtTime(4.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + duration);

      // Ceramic / clay cup clink at the end
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t + duration * 0.85);
      og.gain.setValueAtTime(0.04, t + duration * 0.85);
      og.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(og);
      og.connect(this.ctx.destination);
      osc.start(t + duration * 0.85);
      osc.stop(t + duration);
    } catch {}
  }

  // Tea sip and contented ahh sound
  playChaiSip() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      const duration = 0.45;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + duration);
      filter.Q.setValueAtTime(6, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + duration);

      // Gentle warm chime of satisfaction
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t + 0.15); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.35); // E5
      og.gain.setValueAtTime(0.03, t + 0.15);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
      osc.connect(og);
      og.connect(this.ctx.destination);
      osc.start(t + 0.15);
      osc.stop(t + 0.5);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
