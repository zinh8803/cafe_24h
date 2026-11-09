export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private rainGain: GainNode | null = null;
  private lofiGain: GainNode | null = null;
  private chordTimer: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;

  public rainVolume = 0.35;
  public lofiVolume = 0.25;

  start() {
    if (typeof window === 'undefined') return;
    if (this.isPlaying) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // 1. Soft Rain Pink-Filtered Noise Generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      output[i] = (b0 + b1 + b2) * 0.35;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 950;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = this.rainVolume * 0.22;

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);
    whiteNoise.start(0);

    // 2. Warm Rhodes Lofi Chord Progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    this.lofiGain = this.ctx.createGain();
    this.lofiGain.gain.value = this.lofiVolume * 0.16;
    this.lofiGain.connect(this.ctx.destination);

    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];
    let chordIdx = 0;

    const playWarmChord = () => {
      if (!this.ctx || !this.lofiGain || !this.isPlaying) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx += 1;
      const now = this.ctx.currentTime;

      for (const freq of notes) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.18, now + 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.lofiGain);
        osc.start(now);
        osc.stop(now + 3.9);
      }
    };

    this.isPlaying = true;
    playWarmChord();
    this.chordTimer = setInterval(playWarmChord, 4000);
  }

  stop() {
    this.isPlaying = false;
    if (this.chordTimer) {
      clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  setRainVolume(val: number) {
    this.rainVolume = Math.max(0, Math.min(1, val));
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(this.rainVolume * 0.22, this.ctx.currentTime, 0.1);
    }
  }

  setLofiVolume(val: number) {
    this.lofiVolume = Math.max(0, Math.min(1, val));
    if (this.lofiGain && this.ctx) {
      this.lofiGain.gain.setTargetAtTime(this.lofiVolume * 0.16, this.ctx.currentTime, 0.1);
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();

