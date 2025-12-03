import { Note } from "../types";

// Simple synth to play the bass notes in the browser without requiring large mp3 files for the demo
class AudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private activeOscillators: Map<
    string,
    { osc: OscillatorNode; gain: GainNode }
  > = new Map();

  constructor() {
    // Lazy init
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Convert string/fret to frequency
  // Standard Bass tuning: E1, A1, D2, G2
  // E1 = 41.20 Hz
  private getFrequency(stringIdx: number, fret: number): number {
    const stringBaseFreqs = [41.2, 55.0, 73.42, 98.0]; // E, A, D, G
    if (stringIdx < 0 || stringIdx > 3) return 0;

    const base = stringBaseFreqs[stringIdx];
    // Frequency formula: f = f0 * (2 ^ (n/12))
    return base * Math.pow(2, fret / 12);
  }

  public playNote(note: Note, masterVolume: number) {
    // DISABLED: Debug synth removed - this was causing the "tazer sound" and performance issues
    // We only want to visualize notes, not synthesize them
    // The original MP3 file should be playing instead
    /* ORIGINAL SYNTHESIS CODE - COMMENTED OUT
    this.init();
    if (!this.ctx || !this.gainNode) return;

    const freq = this.getFrequency(note.string, note.fret);
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Bass-like synthesis: Sawtooth + Lowpass filter simulation via simple harmonics or type
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // Envelope
    const now = this.ctx.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(masterVolume * 0.8, now + 0.02); // Attack
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + note.duration); // Decay

    osc.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + note.duration + 0.1);

    // Track active notes if we needed to stop them prematurely, though mainly for visualization sync logic
    const key = note.id;
    this.activeOscillators.set(key, { osc, gain: noteGain });

    // Cleanup
    setTimeout(() => {
      this.activeOscillators.delete(key);
    }, (note.duration + 0.1) * 1000);
    */
  }

  public setVolume(val: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  public stopAll() {
    this.activeOscillators.forEach(({ osc, gain }) => {
      try {
        const now = this.ctx?.currentTime || 0;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        osc.stop(now);
      } catch (e) {
        // Ignore already stopped
      }
    });
    this.activeOscillators.clear();
  }
}

export const audioEngine = new AudioEngine();
