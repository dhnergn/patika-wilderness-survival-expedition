/**
 * Procedural Web Audio API sound synthesis for PATİKA wilderness environment.
 * Generates dynamic wind, rain, crackling fire, stream water, footsteps, and UI clicks
 * without requiring external sound files.
 */

class WildernessAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Continuous ambient nodes
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private streamGain: GainNode | null = null;

  private isInitialized = false;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWind();
      this.setupRain();
      this.setupFire();
      this.setupStream();

      this.isInitialized = true;
    } catch {
      // AudioContext may fail if not supported
    }
  }

  private createNoiseBuffer(durationSeconds = 3): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink-ish noise filter
      lastOut = (lastOut * 0.95) + (white * 0.05);
      data[i] = lastOut * 3;
    }
    return buffer;
  }

  private setupWind() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noiseSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    noiseSource.start();

    // Gentle LFO modulation for wind gusting
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    if (this.windFilter) {
      lfoGain.connect(this.windFilter.frequency);
    }
    lfo.start();
  }

  private setupRain() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    source.start();
  }

  private setupFire() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(3);
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(this.fireGain);
    this.fireGain.connect(this.masterGain);

    source.start();
  }

  private setupStream() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(3);
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(this.streamGain);
    this.streamGain.connect(this.masterGain);

    source.start();
  }

  public updateAmbience(
    windSpeedKmh: number, 
    rainIntensity: number, 
    nearFire: boolean, 
    nearStream: boolean
  ) {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;

    // Wind modulation
    if (this.windGain && this.windFilter) {
      const windVol = Math.min(0.35, 0.05 + (windSpeedKmh / 90) * 0.28);
      this.windGain.gain.setTargetAtTime(windVol, now, 1.0);
      const cutoff = 260 + (windSpeedKmh * 7);
      this.windFilter.frequency.setTargetAtTime(cutoff, now, 1.0);
    }

    // Rain modulation
    if (this.rainGain) {
      const targetRain = rainIntensity > 0 ? Math.min(0.3, rainIntensity * 0.25) : 0;
      this.rainGain.gain.setTargetAtTime(targetRain, now, 1.5);
    }

    // Campfire modulation
    if (this.fireGain) {
      const targetFire = nearFire ? 0.22 : 0.0;
      this.fireGain.gain.setTargetAtTime(targetFire, now, 1.0);
    }

    // Stream sound modulation
    if (this.streamGain) {
      const targetStream = nearStream ? 0.16 : 0.0;
      this.streamGain.gain.setTargetAtTime(targetStream, now, 1.0);
    }
  }

  // Sound FX: Footsteps on turf / rock
  public playFootstep(isRocky: boolean) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isRocky ? 'triangle' : 'sine';
    const baseFreq = isRocky ? 80 + Math.random() * 25 : 55 + Math.random() * 15;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.07);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Sound FX: Compass bezel click
  public playCompassClick() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Sound FX: Spark from Ferro rod
  public playSpark() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.15);
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
  }

  // Sound FX: Drinking or gulping water
  public playWaterSip() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Sound FX: Bandage / first aid application
  public playBandageRustle() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.25);
    if (!noise) return;

    const src = this.ctx.createBufferSource();
    src.buffer = noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(now);
  }

  // Sound FX: Animal alert call (distant bird/owl or wolf howl tone)
  public playWildlifeCall(type: 'bird' | 'wolf') {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'bird') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(1900, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.32);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.8);
      osc.frequency.exponentialRampToValueAtTime(260, now + 1.8);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.0);
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.7, this.ctx.currentTime);
    }
  }
}

export const soundEngine = new WildernessAudioEngine();
