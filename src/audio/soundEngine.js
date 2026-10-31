// Web Audio API procedural sound synthesizer for Diwali celebration
// Zero external asset dependency - 100% reliable, zero-latency, realistic audio

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicNode = null;
    this.musicPlaying = false;
    this.ambientGain = null;

    // Real Music: Festive Background Audio
    this.festiveAudio = null;
    this.currentFestiveTrackIdx = 0;
    this.festiveVolume = 0.55;

    // Real Music: Yo Yo Honey Singh DJ Stage / Dance Floor Audio
    this.djAudio = null;
    this.currentHoneySinghTrackId = 'blueeyes';
    this.djTargetVol = 0.0;
    this.djFadeTimeout = null;
    this.casaTupkaInitialized = false;
    this.casaTupkaRunning = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.initAudioElements();
  }

  initAudioElements() {
    if (typeof window === 'undefined') return;

    if (!this.festiveAudio) {
      this.festiveAudio = new Audio();
      this.festiveAudio.loop = true;
      this.festiveAudio.preload = 'auto';
      const fTrack = this.getCurrentFestiveTrack();
      if (fTrack?.audioUrl) {
        this.festiveAudio.src = fTrack.audioUrl;
      }
      this.festiveAudio.volume = this.isMuted ? 0 : this.festiveVolume;
    }

    if (!this.djAudio) {
      this.djAudio = new Audio();
      this.djAudio.loop = true;
      this.djAudio.preload = 'auto';
      const dTrack = this.getCurrentHoneySinghTrack();
      if (dTrack?.audioUrl) {
        this.djAudio.src = dTrack.audioUrl;
      }
      this.djAudio.volume = 0;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.festiveAudio) {
      this.festiveAudio.volume = this.isMuted ? 0 : this.festiveVolume;
    }
    if (this.djAudio) {
      this.djAudio.volume = this.isMuted ? 0 : (this.djTargetVol || 0);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    if (this.casaTupkaGain && this.ctx) {
      this.casaTupkaGain.gain.setValueAtTime(this.isMuted ? 0 : (this.casaTupkaTargetVol || 0) * 0.28, this.ctx.currentTime);
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

  // 12. Real Festive Diwali Background Music & Playlist Controller
  getFestiveTracks() {
    return FESTIVE_DIWALI_TRACKS;
  }

  getCurrentFestiveTrack() {
    return FESTIVE_DIWALI_TRACKS[this.currentFestiveTrackIdx % FESTIVE_DIWALI_TRACKS.length] || FESTIVE_DIWALI_TRACKS[0];
  }

  setFestiveTrack(idxOrId) {
    this.init();
    let idx = 0;
    if (typeof idxOrId === 'number') {
      idx = Math.max(0, Math.min(FESTIVE_DIWALI_TRACKS.length - 1, idxOrId));
    } else {
      const foundIdx = FESTIVE_DIWALI_TRACKS.findIndex((t) => t.id === idxOrId);
      if (foundIdx !== -1) idx = foundIdx;
    }
    this.currentFestiveTrackIdx = idx;
    const track = FESTIVE_DIWALI_TRACKS[idx];

    if (this.festiveAudio) {
      const wasPlaying = !this.festiveAudio.paused;
      this.festiveAudio.src = track.audioUrl;
      this.festiveAudio.currentTime = 0;
      if (wasPlaying || this.musicPlaying) {
        this.festiveAudio.volume = this.isMuted ? 0 : this.festiveVolume;
        this.festiveAudio.play().catch(() => {});
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('festiveTrackChanged', { detail: track })
      );
    }
    return track;
  }

  nextFestiveTrack() {
    const nextIdx = (this.currentFestiveTrackIdx + 1) % FESTIVE_DIWALI_TRACKS.length;
    return this.setFestiveTrack(nextIdx);
  }

  toggleFestiveMusic() {
    this.init();
    if (this.musicPlaying) {
      if (this.festiveAudio) {
        this.festiveAudio.pause();
      }
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      }
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      this.musicPlaying = false;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('festiveMusicStateChanged', { detail: { isPlaying: false } })
        );
      }
      return false;
    }

    this.musicPlaying = true;
    if (this.festiveAudio) {
      const track = this.getCurrentFestiveTrack();
      if (!this.festiveAudio.src || !this.festiveAudio.src.includes(track.audioUrl)) {
        this.festiveAudio.src = track.audioUrl;
      }
      this.festiveAudio.volume = this.isMuted ? 0 : this.festiveVolume;
      const playPromise = this.festiveAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[SoundEngine] Festive music autoplay waiting for user interaction:', err);
        });
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('festiveMusicStateChanged', {
          detail: { isPlaying: true, track: this.getCurrentFestiveTrack() }
        })
      );
    }

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

  // 18b. Gun Fight Countdown Beep (5, 4, 3, 2, 1, FIGHT!)
  playCountdownBeep(isFinal = false) {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isFinal ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 520, t);
      if (isFinal) {
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.35);
      }
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.45 : 0.22));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + (isFinal ? 0.45 : 0.22));
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

  // =============================================================
  // YO YO HONEY SINGH - MULTI-TRACK DJ MUSIC ENGINE
  // Procedural Web Audio API Synthesizer for 6 Iconic Hits:
  // 1. Casa Tupka (105 BPM Dembow Anthem)
  // 2. Blue Eyes (128 BPM Electro Club Banger)
  // 3. Brown Rang (95 BPM Immortal Desi Hip-Hop)
  // 4. Dope Shope (98 BPM Desi Club Bounce)
  // 5. Love Dose (102 BPM Melodic R&B Romance)
  // 6. Angreji Beat (126 BPM High-Voltage Bhangra Electro)
  // Spatial Audio: Silent outside (>155px), full blast on dance floor!
  // =============================================================
  initCasaTupkaEngine() {
    if (this.casaTupkaInitialized) return;
    this.init();
    this.casaTupkaInitialized = true;
    this.casaTupkaTargetVol = 0.0;
  }

  getHoneySinghTracks() {
    return HONEY_SINGH_TRACKS;
  }

  getCurrentHoneySinghTrack() {
    const trackId = this.currentHoneySinghTrackId || 'blueeyes';
    return HONEY_SINGH_TRACKS.find((t) => t.id === trackId) || HONEY_SINGH_TRACKS[0];
  }

  setHoneySinghTrack(trackId) {
    const found = HONEY_SINGH_TRACKS.find((t) => t.id === trackId);
    if (!found) return;

    this.currentHoneySinghTrackId = trackId;
    this.initAudioElements();

    if (this.djAudio) {
      const wasPlaying = !this.djAudio.paused;
      this.djAudio.src = found.audioUrl;
      this.djAudio.currentTime = 0;
      if (wasPlaying || this.djTargetVol > 0.01) {
        this.djAudio.volume = this.isMuted ? 0 : Math.max(0.1, this.djTargetVol || 0.85);
        this.djAudio.play().catch(() => {});
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('honeySinghTrackChanged', { detail: found })
      );
    }
    return found;
  }

  nextHoneySinghTrack() {
    const curr = this.getCurrentHoneySinghTrack();
    const idx = HONEY_SINGH_TRACKS.findIndex((t) => t.id === curr.id);
    const nextIdx = (idx + 1) % HONEY_SINGH_TRACKS.length;
    return this.setHoneySinghTrack(HONEY_SINGH_TRACKS[nextIdx].id);
  }

  playDjTrackManually() {
    this.init();
    this.initAudioElements();
    if (!this.djAudio) return;

    const track = this.getCurrentHoneySinghTrack();
    if (!this.djAudio.src || !this.djAudio.src.includes(track.audioUrl)) {
      this.djAudio.src = track.audioUrl;
    }
    this.djTargetVol = 0.85;
    this.djAudio.volume = this.isMuted ? 0 : 0.85;
    return this.djAudio.play().catch(() => {});
  }

  pauseDjTrackManually() {
    if (this.djAudio) {
      this.djAudio.pause();
    }
  }

  isDjTrackPlaying() {
    return this.djAudio ? !this.djAudio.paused : false;
  }

  getDjAudioCurrentTime() {
    return this.djAudio ? this.djAudio.currentTime : 0;
  }

  getDjAudioDuration() {
    return this.djAudio && !isNaN(this.djAudio.duration) ? this.djAudio.duration : 0;
  }

  seekDjAudio(timeSec) {
    if (this.djAudio && !isNaN(timeSec)) {
      this.djAudio.currentTime = Math.max(0, Math.min(this.djAudio.duration || 300, timeSec));
    }
  }

  updateCasaTupkaSpatial(targetVolume = 0.0) {
    if (!this.casaTupkaInitialized) this.initCasaTupkaEngine();
    this.initAudioElements();

    const effectiveVol = this.isMuted ? 0 : Math.max(0, Math.min(1.0, targetVolume));
    this.djTargetVol = effectiveVol;

    if (this.djAudio) {
      if (effectiveVol > 0.01) {
        if (this.djFadeTimeout) {
          clearTimeout(this.djFadeTimeout);
          this.djFadeTimeout = null;
        }
        this.djAudio.volume = effectiveVol;
        if (this.djAudio.paused) {
          const track = this.getCurrentHoneySinghTrack();
          if (!this.djAudio.src || !this.djAudio.src.includes(track.audioUrl)) {
            this.djAudio.src = track.audioUrl;
          }
          this.djAudio.play().catch(() => {});
        }

        // Auto-duck festive background music when dancing on the DJ floor!
        if (this.festiveAudio && this.musicPlaying && !this.isMuted) {
          this.festiveAudio.volume = Math.max(0.04, this.festiveVolume * (1 - effectiveVol * 0.85));
        }
      } else {
        // Smoothly fade out when walking away from DJ floor
        if (!this.djAudio.paused && !this.djFadeTimeout) {
          this.djFadeTimeout = setTimeout(() => {
            if (this.djTargetVol <= 0.01 && this.djAudio && !this.djAudio.paused) {
              this.djAudio.pause();
            }
            this.djFadeTimeout = null;
          }, 1500);
        }

        // Restore festive background volume
        if (this.festiveAudio && this.musicPlaying && !this.isMuted) {
          this.festiveAudio.volume = this.festiveVolume;
        }
      }
    }

    // Keep procedural fallback for legacy
    if (this.casaTupkaGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.casaTupkaGain.gain.cancelScheduledValues(t);
      this.casaTupkaGain.gain.linearRampToValueAtTime(effectiveVol * 0.1, t + 0.08);
    }
  }

  startCasaTupkaLoop() {
    if (this.casaTupkaRunning || !this.ctx) return;
    this.casaTupkaRunning = true;
    this.casaTupkaStep = 0;

    const track = this.getCurrentHoneySinghTrack();
    // 16th note step duration in ms = (60000 / BPM) / 4
    const stepDurationMs = (60000 / track.bpm) / 4;

    this.casaTupkaInterval = setInterval(() => {
      if (!this.casaTupkaRunning || !this.ctx || this.isMuted) return;

      const t = this.ctx.currentTime;
      const step = this.casaTupkaStep % 64;
      const barStep = step % 16;
      const currentTrack = this.getCurrentHoneySinghTrack();

      // 1. Drums by track rhythm style
      switch (currentTrack.rhythmStyle) {
        case 'electro4x4': // Blue Eyes (128 BPM EDM)
          if (barStep === 0 || barStep === 4 || barStep === 8 || barStep === 12) {
            this.synthesizeCasaTupkaKick(t);
          }
          if (barStep === 4 || barStep === 12) {
            this.synthesizeCasaTupkaSnare(t);
          }
          if (barStep % 2 === 0) {
            this.synthesizeCasaTupkaHat(t, barStep % 4 === 2);
          }
          break;

        case 'hiphop95': // Brown Rang (95 BPM Hip-Hop)
          if (barStep === 0 || barStep === 10) {
            this.synthesizeCasaTupkaKick(t);
          }
          if (barStep === 4 || barStep === 12) {
            this.synthesizeCasaTupkaSnare(t);
          }
          if (step % 2 === 0) {
            this.synthesizeCasaTupkaHat(t, false);
          }
          break;

        case 'club98': // Dope Shope (98 BPM Club bounce)
          if (barStep === 0 || barStep === 8) {
            this.synthesizeCasaTupkaKick(t);
          }
          if (barStep === 4 || barStep === 12) {
            this.synthesizeCasaTupkaSnare(t);
          }
          if (step % 2 === 0) {
            this.synthesizeCasaTupkaHat(t, barStep === 14);
          }
          break;

        case 'rnb102': // Love Dose (102 BPM R&B)
          if (barStep === 0 || barStep === 6 || barStep === 10) {
            this.synthesizeCasaTupkaKick(t);
          }
          if (barStep === 4 || barStep === 12) {
            this.synthesizeCasaTupkaSnare(t);
          }
          if (step % 2 === 0) {
            this.synthesizeCasaTupkaHat(t, barStep === 6);
          }
          break;

        case 'bhangra126': // Angreji Beat (126 BPM Bhangra electro)
          if (barStep === 0 || barStep === 3 || barStep === 8 || barStep === 11) {
            this.synthesizeCasaTupkaKick(t);
          }
          if (barStep === 4 || barStep === 12) {
            this.synthesizeCasaTupkaSnare(t);
          }
          if (barStep === 6 || barStep === 14) {
            this.synthesizeCasaTupkaHat(t, true); // Open hat accent
          } else if (step % 2 === 0) {
            this.synthesizeCasaTupkaHat(t, false);
          }
          break;

        case 'dembow': // Casa Tupka (105 BPM Reggaeton)
        default:
          if (barStep === 0 || barStep === 8) {
            this.synthesizeCasaTupkaKick(t);
          }
          if (barStep === 6 || barStep === 12) {
            this.synthesizeCasaTupkaSnare(t);
          }
          if (step % 2 === 0) {
            this.synthesizeCasaTupkaHat(t, barStep === 4 || barStep === 14);
          }
          break;
      }

      // 2. Punchy Sub-Bassline
      const bassFreq = currentTrack.bassNotes[step];
      if (bassFreq > 0) {
        this.synthesizeCasaTupkaBass(t, bassFreq);
      }

      // 3. Lead Hook Melody
      const leadFreq = currentTrack.leadNotes[step];
      if (leadFreq > 0) {
        this.synthesizeCasaTupkaLead(t, leadFreq);
      }

      // 4. Party Air Horn on Step 0 of each 64-step loop!
      if (step === 0) {
        this.synthesizePartyAirHorn(t);
      }

      // 5. Honey Singh "Yo Yo!" voice stab on step 48
      if (step === 48) {
        this.synthesizeYoYoVoiceStab(t);
      }

      this.casaTupkaStep++;
    }, stepDurationMs);
  }

  stopCasaTupkaLoop() {
    if (this.casaTupkaInterval) {
      clearInterval(this.casaTupkaInterval);
      this.casaTupkaInterval = null;
    }
    this.casaTupkaRunning = false;
    this.casaTupkaStep = 0;
  }

  // Punchy 808 Reggaeton / EDM Kick Drum
  synthesizeCasaTupkaKick(t) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.16);

      gain.gain.setValueAtTime(0.75, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.casaTupkaGain);
      osc.start(t);
      osc.stop(t + 0.24);
    } catch {}
  }

  // Crisp Dembow / Club Snare / Rimshot
  synthesizeCasaTupkaSnare(t) {
    try {
      // Noise component
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.12);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.Q.setValueAtTime(3.0, t);

      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.45, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      noise.connect(filter);
      filter.connect(ng);
      ng.connect(this.casaTupkaGain);
      noise.start(t);
      noise.stop(t + 0.12);

      // Tonal body
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.08);
      og.gain.setValueAtTime(0.35, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(og);
      og.connect(this.casaTupkaGain);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }

  // Hi-Hat
  synthesizeCasaTupkaHat(t, isOpen = false) {
    try {
      const dur = isOpen ? 0.14 : 0.045;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(dur);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isOpen ? 0.18 : 0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.casaTupkaGain);
      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  // Sub-Bass
  synthesizeCasaTupkaBass(t, freq) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.48, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.casaTupkaGain);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  // Brassy Club Lead Synth
  synthesizeCasaTupkaLead(t, freq) {
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.004, t); // slight detune for fat club lead

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.casaTupkaGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.2);
      osc2.stop(t + 0.2);
    } catch {}
  }

  // Classic Dancehall Air Horn Drop
  synthesizePartyAirHorn(t) {
    try {
      const freqs = [466.16, 554.37, 698.46]; // Bb4, C#5, F5
      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.98, t + 0.35);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.casaTupkaGain);
        osc.start(t);
        osc.stop(t + 0.42);
      });
    } catch {}
  }

  // "Yo Yo!" Synthesized Voice / Scratch Chirp
  synthesizeYoYoVoiceStab(t) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(620, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.setValueAtTime(6.0, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.casaTupkaGain);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {}
  }
}

// =============================================================
// REAL FESTIVE DIWALI MUSIC CATALOGUE
// =============================================================
export const FESTIVE_DIWALI_TRACKS = [
  {
    id: 'aayee_hai_diwali',
    title: 'Aayee Hai Diwali',
    hindiTitle: 'आई है दिवाली',
    artist: 'Traditional / Bollywood Hit',
    tagline: 'Suno Ji Ghar Aaye • Grand Festive Celebration',
    emoji: '🪔',
    audioUrl: '/audio/aayee_hai_diwali.mp3'
  },
  {
    id: 'aayi_diwali_deeponwali',
    title: 'Aayi Diwali Deeponwali',
    hindiTitle: 'आई दिवाली दीपोंवाली',
    artist: 'Traditional Deepotsav Melodies',
    tagline: 'Har Ghar Deep Jalaaye • Auspicious Lights',
    emoji: '✨',
    audioUrl: '/audio/aayi_diwali_deeponwali.mp3'
  },
  {
    id: 'happy_diwali',
    title: 'Happy Diwali Utsav',
    hindiTitle: 'हैप्पी दिवाली उत्सव',
    artist: 'Festive Celebration',
    tagline: 'Mela Fireworks & Crackers Celebration Beat',
    emoji: '🎆',
    audioUrl: '/audio/happy_diwali.mp3'
  }
];

// =============================================================
// YO YO HONEY SINGH HIT TRACKS CATALOGUE (REAL MP3 AUDIO)
// =============================================================
export const HONEY_SINGH_TRACKS = [
  {
    id: 'blueeyes',
    title: 'Blue Eyes',
    hindiTitle: 'ब्लू आईज',
    year: '2013 / All-Time Hit',
    bpm: 128,
    style: 'Electro Dance EDM',
    emoji: '💙',
    tagline: 'Blue eyes hypnotise teri kardi ai mennu! 💣',
    audioUrl: '/audio/blue_eyes.mp3',
    rhythmStyle: 'electro4x4',
    lyrics: [
      '💙 YO YO: "Blue eyes hypnotise teri kardi ai mennu!" 🕶️',
      '🔥 "I swear chhoti dress mein bomb lagdi mainu!" 💣',
      '✨ "Bomb lagdi mainu, bomb lagdi mainu!" 🎶',
      '🕺 "Ghar deyan nu keh de tu ki aaj nahio aana!" 🔊',
      '🎤 "Yo Yo Honey Singh! Blue Eyes Anthem!" 🎧'
    ],
    leadNotes: [
      369.99, 0, 440.0, 0, 493.88, 0, 440.0, 0, 369.99, 0, 329.63, 0, 293.66, 0, 329.63, 0,
      369.99, 369.99, 0, 440.0, 493.88, 0, 440.0, 0, 369.99, 0, 329.63, 0, 293.66, 0, 0, 0,
      587.33, 0, 554.37, 0, 493.88, 0, 440.0, 0, 493.88, 0, 440.0, 0, 369.99, 0, 329.63, 0,
      369.99, 0, 440.0, 0, 493.88, 0, 587.33, 0, 554.37, 0, 493.88, 0, 440.0, 0, 369.99, 0
    ],
    bassNotes: [
      73.42, 0, 73.42, 0, 73.42, 0, 73.42, 0, 61.74, 0, 61.74, 0, 61.74, 0, 61.74, 0,
      49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0, 55.0, 0, 55.0, 0, 55.0, 0, 55.0, 0,
      73.42, 0, 73.42, 0, 73.42, 0, 73.42, 0, 61.74, 0, 61.74, 0, 61.74, 0, 61.74, 0,
      49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0, 55.0, 0, 55.0, 0, 55.0, 0, 55.0, 0
    ]
  },
  {
    id: 'brownrang',
    title: 'Brown Rang',
    hindiTitle: 'ब्राउन रंग',
    year: '2011 / Immortal',
    bpm: 95,
    style: 'Desi Hip-Hop / R&B',
    emoji: '👑',
    tagline: 'Kudiye ni tere brown rang ne munde patt te! 🏙️',
    audioUrl: '/audio/brown_rang.mp3',
    rhythmStyle: 'hiphop95',
    lyrics: [
      '👑 YO YO: "Kudiye ni tere brown rang ne!" 💃',
      '🔥 "Munde patt te ni saare mere town de!" 🏙️',
      '✨ "Koyi labhdi ae shaan, koyi labhdi ae gaddi!" 🚘',
      '🕶️ "White skin pe itna na itraao, Brown Rang is King!" 👑',
      '🎤 "Yo Yo Honey Singh! Brown Rang Classic!" 🪔'
    ],
    leadNotes: [
      329.63, 0, 392.0, 0, 440.0, 0, 493.88, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 0, 0,
      392.0, 0, 440.0, 0, 493.88, 0, 587.33, 0, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 0,
      329.63, 329.63, 0, 392.0, 440.0, 440.0, 0, 392.0, 0, 329.63, 0, 293.66, 0, 329.63, 0, 0,
      329.63, 0, 392.0, 0, 440.0, 0, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 329.63, 0, 0
    ],
    bassNotes: [
      41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0, 32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0,
      36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0, 30.87, 0, 30.87, 0, 30.87, 0, 30.87, 0,
      41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0, 32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0,
      36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0
    ]
  },
  {
    id: 'angrejibeat',
    title: 'Angreji Beat',
    hindiTitle: 'अंग्रेजी बीट',
    year: '2012 / Cocktail',
    bpm: 126,
    style: 'Punjabi Bhangra Electro',
    emoji: '⚡',
    tagline: 'Angreji beat te nachdi patlo • Khadke Glassi! 🥂',
    audioUrl: '/audio/angreji_beat.mp3',
    rhythmStyle: 'bhangra126',
    lyrics: [
      '🥁 YO YO: "Khadke glassi tere naa te!" 🥂',
      '💃 "Angreji beat te nachdi patlo!" ⚡',
      '🔥 "Pura mela nachega Yo Yo di beat te!" 🪔',
      '✨ "Nach nach kudiye tu floor phod de!" 💥',
      '🎤 "Yo Yo Honey Singh! Angreji Beat Power!" 🎧'
    ],
    leadNotes: [
      392.0, 0, 493.88, 0, 587.33, 587.33, 0, 523.25, 0, 493.88, 0, 440.0, 0, 392.0, 0, 0,
      392.0, 392.0, 0, 493.88, 0, 587.33, 0, 659.25, 0, 587.33, 0, 493.88, 0, 392.0, 0, 0,
      587.33, 587.33, 0, 659.25, 0, 587.33, 0, 493.88, 0, 440.0, 0, 493.88, 0, 392.0, 0, 0,
      493.88, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 0, 392.0, 392.0, 0, 0, 0, 0, 0
    ],
    bassNotes: [
      49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0,
      32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0, 36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0,
      49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0,
      32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0, 49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0
    ]
  },
  {
    id: 'dopeshope',
    title: 'Dope Shope',
    hindiTitle: 'डोप शोप',
    year: '2011 / Club Banger',
    bpm: 98,
    style: 'Desi Club Bounce',
    emoji: '🕶️',
    tagline: 'Munda dharhi chadhai phirda, kudi dope shope! 🔊',
    audioUrl: '/audio/dope_shope.mp3',
    rhythmStyle: 'club98',
    lyrics: [
      '💥 YO YO: "Munda dharhi chadhai phirda!" 🕶️',
      '🔊 "Kudi dope shope maareya karo!" 💃',
      '🔥 "22 saal di hoyi aa kudi, lagdi model waang!" 🌟',
      '🏎️ "Hummer vich baithe munde, Yo Yo sound system!" 🔊',
      '🎤 "Yo Yo Honey Singh! Dope Shope Banger!" 🎧'
    ],
    leadNotes: [
      369.99, 369.99, 0, 440.0, 0, 493.88, 0, 554.37, 554.37, 0, 493.88, 0, 440.0, 0, 369.99, 0,
      369.99, 0, 440.0, 0, 493.88, 0, 440.0, 0, 369.99, 0, 329.63, 0, 369.99, 0, 0, 0,
      554.37, 554.37, 0, 493.88, 0, 440.0, 0, 493.88, 0, 554.37, 0, 440.0, 0, 369.99, 0, 0,
      440.0, 0, 493.88, 0, 440.0, 0, 369.99, 0, 329.63, 0, 277.18, 0, 369.99, 0, 0, 0
    ],
    bassNotes: [
      46.25, 0, 46.25, 0, 46.25, 0, 46.25, 0, 36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0,
      41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0, 34.65, 0, 34.65, 0, 34.65, 0, 34.65, 0,
      46.25, 0, 46.25, 0, 46.25, 0, 46.25, 0, 36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0,
      41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0, 46.25, 0, 46.25, 0, 46.25, 0, 46.25, 0
    ]
  },
  {
    id: 'lovedose',
    title: 'Love Dose',
    hindiTitle: 'लव डोज़',
    year: '2014 / Desi Kalakaar',
    bpm: 102,
    style: 'Melodic R&B Romance',
    emoji: '❤️',
    tagline: 'Lagdi mainu jivein ambran di rani soniye! 🌹',
    audioUrl: '/audio/love_dose.mp3',
    rhythmStyle: 'rnb102',
    lyrics: [
      '❤️ YO YO: "Lagdi mainu jivein ambran di rani!" 👸',
      '✨ "Ek tu hi meri baby, ek tu hi zindgani!" 🌹',
      '🔥 "Mujhe de de tu ik love dose!" 💊❤️',
      '🕺 "Lagti hai cute jab kardi tu blush!" 🥰',
      '🎤 "Yo Yo Honey Singh! Love Dose Romance!" 🎶'
    ],
    leadNotes: [
      440.0, 0, 554.37, 0, 659.25, 659.25, 0, 587.33, 0, 554.37, 0, 493.88, 0, 440.0, 0, 0,
      369.99, 0, 440.0, 0, 493.88, 0, 554.37, 0, 493.88, 0, 440.0, 0, 369.99, 0, 329.63, 0,
      440.0, 440.0, 0, 554.37, 0, 659.25, 0, 739.99, 0, 659.25, 0, 554.37, 0, 493.88, 0, 0,
      440.0, 0, 493.88, 0, 554.37, 0, 493.88, 0, 440.0, 0, 369.99, 0, 440.0, 0, 0, 0
    ],
    bassNotes: [
      55.0, 0, 55.0, 0, 55.0, 0, 55.0, 0, 46.25, 0, 46.25, 0, 46.25, 0, 46.25, 0,
      36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0,
      55.0, 0, 55.0, 0, 55.0, 0, 55.0, 0, 46.25, 0, 46.25, 0, 46.25, 0, 46.25, 0,
      36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0, 55.0, 0, 55.0, 0, 55.0, 0, 55.0, 0
    ]
  },
  {
    id: 'desikalakaar',
    title: 'Desi Kalakaar',
    hindiTitle: 'देसी कलाकार',
    year: '2014 / Title Track',
    bpm: 110,
    style: 'Desi Hip-Hop / Swagger',
    emoji: '🌟',
    tagline: 'Yaar tera superstar desi kalakaar! 🚘',
    audioUrl: '/audio/desi_kalakaar.mp3',
    rhythmStyle: 'hiphop95',
    lyrics: [
      '🌟 YO YO: "Yaar tera superstar desi kalakaar!" 🕶️',
      '🚘 "Main putt jatt da manda ni haar!" 💥',
      '💃 "Duniya di parwah karni chhad de tu!" 🔥',
      '✨ "Superstar in the house!" 🎤'
    ],
    leadNotes: [
      329.63, 0, 392.0, 0, 440.0, 0, 493.88, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 0, 0,
      392.0, 0, 440.0, 0, 493.88, 0, 587.33, 0, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 0,
      329.63, 329.63, 0, 392.0, 440.0, 440.0, 0, 392.0, 0, 329.63, 0, 293.66, 0, 329.63, 0, 0,
      329.63, 0, 392.0, 0, 440.0, 0, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 329.63, 0, 0
    ],
    bassNotes: [
      41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0, 32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0,
      36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0, 30.87, 0, 30.87, 0, 30.87, 0, 30.87, 0,
      41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0, 32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0,
      36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0
    ]
  },
  {
    id: 'highheels',
    title: 'High Heels',
    hindiTitle: 'हाई हील्स',
    year: '2012 / Party Monster',
    bpm: 128,
    style: 'Bhangra Club Banger',
    emoji: '👠',
    tagline: 'High heels te nache tan tu badi jache! 👠✨',
    audioUrl: '/audio/high_heels.mp3',
    rhythmStyle: 'bhangra126',
    lyrics: [
      '👠 YO YO: "Pe pe pe pe.. High heels te nache!" 💃',
      '🔥 "Aankhon se goli maare, kudi badi jache!" 💥',
      '✨ "Dance floor pe aake aag laga de!" 🕺',
      '🎤 "Jaz Dhami ft. Yo Yo Honey Singh!" 🎧'
    ],
    leadNotes: [
      392.0, 0, 493.88, 0, 587.33, 587.33, 0, 523.25, 0, 493.88, 0, 440.0, 0, 392.0, 0, 0,
      392.0, 392.0, 0, 493.88, 0, 587.33, 0, 659.25, 0, 587.33, 0, 493.88, 0, 392.0, 0, 0,
      587.33, 587.33, 0, 659.25, 0, 587.33, 0, 493.88, 0, 440.0, 0, 493.88, 0, 392.0, 0, 0,
      493.88, 493.88, 0, 440.0, 0, 392.0, 0, 329.63, 0, 392.0, 392.0, 0, 0, 0, 0, 0
    ],
    bassNotes: [
      49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0,
      32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0, 36.71, 0, 36.71, 0, 36.71, 0, 36.71, 0,
      49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0, 41.20, 0, 41.20, 0, 41.20, 0, 41.20, 0,
      32.70, 0, 32.70, 0, 32.70, 0, 32.70, 0, 49.0, 0, 49.0, 0, 49.0, 0, 49.0, 0
    ]
  },
  {
    id: 'casatupka',
    title: 'Casa Tupka Anthem',
    hindiTitle: 'कासा तुपका',
    year: '2024 / 2026',
    bpm: 105,
    style: 'Reggaeton Dembow',
    emoji: '🔥',
    tagline: 'Casa Casa Tupka Tequila • Latin Desi Party Anthem',
    audioUrl: '/audio/desi_kalakaar.mp3',
    rhythmStyle: 'dembow',
    lyrics: [
      '🔥 YO YO: "Casa casa casa tupka tequila!" 🎧',
      '🎶 "Party karni party pehle YO YO bulao! 🕺🔊"',
      '💥 "Bada hot hai weather jab baje reggaeton! 🔥"',
      '✨ "Tara rum bam bam bam bam! 💃"',
      '🎤 "Yo Yo Honey Singh in the House! 🪔"'
    ],
    leadNotes: [
      293.66, 0, 293.66, 0, 293.66, 0, 293.66, 0, 293.66, 0, 261.63, 0, 233.08, 0, 220.0, 196.0,
      196.0,  0, 196.0,  0, 220.0,  0, 233.08, 0, 261.63, 0, 293.66, 0, 261.63, 0, 220.0, 0,
      349.23, 0, 392.0,  0, 349.23, 0, 293.66, 0, 261.63, 0, 293.66, 293.66, 0, 0, 392.0, 0,
      440.0,  0, 392.0,  0, 349.23, 0, 329.63, 0, 293.66, 0, 261.63, 0, 293.66, 0, 0, 0
    ],
    bassNotes: [
      49.0, 0, 49.0, 0, 49.0, 0, 58.27, 0, 49.0, 0, 49.0, 0, 58.27, 0, 49.0, 0,
      38.89, 0, 38.89, 0, 43.65, 0, 43.65, 0, 38.89, 0, 38.89, 0, 43.65, 0, 36.71, 0,
      49.0, 0, 49.0, 0, 49.0, 0, 58.27, 0, 49.0, 0, 49.0, 0, 58.27, 0, 49.0, 0,
      38.89, 0, 38.89, 0, 43.65, 0, 43.65, 0, 36.71, 0, 36.71, 0, 43.65, 0, 49.0, 0
    ]
  }
];

export const soundEngine = new SoundEngine();


