// Web Audio API Synthesizer Engine
// Provides warm polyphonic sound synthesis for notes, chords, and progressions
// Zero external asset dependencies - instant, responsive, and studio-quality tone

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = new Set();
    this.listeners = new Set();
    this.volume = 0.75;
    this.muted = false;
  }

  // Ensure AudioContext is initialized and resumed after user gesture
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  setMuted(isMuted) {
    this.muted = isMuted;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyKeyHighlight(notes, active) {
    this.listeners.forEach((fn) => fn({ notes, active }));
  }

  // Convert note name (e.g., 'C4', 'F#3', 'Bb4') to frequency in Hz
  getFrequency(noteWithOctave) {
    if (!noteWithOctave) return 440;
    
    // Parse note and octave
    const regex = /^([A-G][#b]?)([0-9]?)$/i;
    const match = noteWithOctave.trim().match(regex);
    if (!match) return 440;

    let [, note, octaveStr] = match;
    let octave = octaveStr ? parseInt(octaveStr, 10) : 4;

    // Normalize flats to sharps
    const flatToSharp = {
      'Db': 'C#',
      'Eb': 'D#',
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#'
    };
    if (flatToSharp[note]) {
      note = flatToSharp[note];
    }

    const noteOffsets = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
      'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };

    const semitonesFromC0 = (octave * 12) + (noteOffsets[note.toUpperCase()] ?? 0);
    // A4 is 440 Hz, which is semitonesFromC0 = (4 * 12) + 9 = 57
    const semitonesFromA4 = semitonesFromC0 - 57;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // Play a single note with piano/rhodes-like physical envelope
  playNote(noteNameWithOctave, duration = 1.2, startTimeOffset = 0, velocity = 0.8) {
    if (this.muted) return;
    const ctx = this.init();
    const startTime = ctx.currentTime + startTimeOffset;
    const freq = this.getFrequency(noteNameWithOctave);

    // Master gain for this note
    const gainNode = ctx.createGain();
    const effectiveGain = this.volume * velocity * 0.35;

    // Two layered oscillators for warm harmonics
    // Osc 1: Warm Triangle (fundamental body)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Osc 2: Gentle Sine (pure sub/mid tone)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, startTime);

    // Osc 3: Very subtle slightly detuned saw for bite/chime
    const osc3 = ctx.createOscillator();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(freq * 2, startTime); // 1 octave overtone
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.08, startTime);

    // Filter to soften the sound into acoustic warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.frequency.exponentialRampToValueAtTime(350, startTime + duration);

    // Connect oscillators
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Natural ADSR curve (fast attack, exponential decay)
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(effectiveGain, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(effectiveGain * 0.6, startTime + 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    const stopTime = startTime + duration + 0.05;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);

    // Track active nodes
    this.activeNodes.add(gainNode);
    setTimeout(() => {
      this.activeNodes.delete(gainNode);
    }, (startTimeOffset + duration + 0.1) * 1000);

    // Visual keyboard indicator timing
    setTimeout(() => {
      this.notifyKeyHighlight([noteNameWithOctave], true);
    }, startTimeOffset * 1000);

    setTimeout(() => {
      this.notifyKeyHighlight([noteNameWithOctave], false);
    }, (startTimeOffset + Math.min(duration, 0.9)) * 1000);
  }

  // Play a full chord with choice of strum, block, or arpeggio
  playChord(notes, mode = 'strum', duration = 2.0, baseOctave = 4) {
    if (!notes || notes.length === 0) return;

    // Attach octaves if not present
    const voicedNotes = notes.map((n, i) => {
      if (/\d/.test(n)) return n;
      // Spread triad voicing nicely: Root at baseOctave, 3rd and 5th
      const oct = i === 0 ? baseOctave : (i >= 2 ? baseOctave : baseOctave);
      return `${n}${oct}`;
    });

    if (mode === 'block') {
      voicedNotes.forEach((n) => this.playNote(n, duration, 0, 0.75));
    } else if (mode === 'strum') {
      // Natural guitar/piano strum spread (28ms between notes)
      voicedNotes.forEach((n, i) => {
        this.playNote(n, duration, i * 0.035, 0.85 - i * 0.05);
      });
    } else if (mode === 'arpeggio') {
      // Flowing arpeggio pattern: Up then down
      const arpSequence = [...voicedNotes];
      arpSequence.forEach((n, i) => {
        this.playNote(n, 1.4, i * 0.18, 0.8);
      });
    }
  }

  // Play a diatonic scale ascending
  playScale(notes, speed = 0.22, baseOctave = 4) {
    if (!notes || notes.length === 0) return;
    
    // Add tonic 1 octave up at the end for satisfying resolution
    const fullScale = [...notes, notes[0]];

    fullScale.forEach((n, i) => {
      const oct = (i >= notes.length) ? baseOctave + 1 : baseOctave;
      const noteName = /\d/.test(n) ? n : `${n}${oct}`;
      this.playNote(noteName, 0.8, i * speed, 0.8);
    });
  }

  stopAll() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audio = new AudioEngine();
