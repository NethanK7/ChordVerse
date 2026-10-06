// Web Audio API Synthesizer Engine
// Provides studio-grade polyphonic sound synthesis for:
// 1. Warm Piano / Rhodes tone
// 2. Realistic Plucked Acoustic Guitar strings and dynamic Down/Up strums
// 3. Drum Machine (Punchy Kick, Snare, Hi-Hats, Clap, Rimshot, Tom)
// 4. Precision Metronome (Woodblock, Beep, Mechanical Click, Rimshot)
// Zero external asset dependencies - instant, responsive, and studio-quality tone

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = new Set();
    this.listeners = new Set();
    this.volume = 0.75;
    this.muted = false;
    this.noiseBuffer = null;
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

  // Generate reusable 1-second white noise buffer for transients and percussions
  getNoiseBuffer() {
    if (!this.noiseBuffer && this.ctx) {
      const bufferSize = this.ctx.sampleRate * 1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
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
    // A4 is 440 Hz (semitonesFromC0 = 57)
    const semitonesFromA4 = semitonesFromC0 - 57;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // -------------------------------------------------------------
  // 1. PIANO / RHODES SYNTHESIS
  // -------------------------------------------------------------
  playNote(noteNameWithOctave, duration = 1.2, startTimeOffset = 0, velocity = 0.8) {
    if (this.muted) return;
    const ctx = this.init();
    const startTime = ctx.currentTime + startTimeOffset;
    const freq = this.getFrequency(noteNameWithOctave);

    const gainNode = ctx.createGain();
    const effectiveGain = this.volume * velocity * 0.35;

    // Osc 1: Warm Triangle (fundamental body)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Osc 2: Gentle Sine (pure sub/mid tone)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, startTime);

    // Osc 3: Slightly detuned saw for bite/chime
    const osc3 = ctx.createOscillator();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(freq * 2, startTime);
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.08, startTime);

    // Filter to soften the sound into acoustic warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.frequency.exponentialRampToValueAtTime(350, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // ADSR curve
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

    this.activeNodes.add(gainNode);
    setTimeout(() => {
      this.activeNodes.delete(gainNode);
    }, (startTimeOffset + duration + 0.1) * 1000);

    // Visual indicators
    setTimeout(() => {
      this.notifyKeyHighlight([noteNameWithOctave], true);
    }, startTimeOffset * 1000);

    setTimeout(() => {
      this.notifyKeyHighlight([noteNameWithOctave], false);
    }, (startTimeOffset + Math.min(duration, 0.9)) * 1000);
  }

  // -------------------------------------------------------------
  // 2. ACOUSTIC GUITAR STRING & STRUM SYNTHESIS
  // -------------------------------------------------------------
  // Synthesizes a physical plucked steel string with pick transient,
  // harmonic richness, and body resonance.
  playGuitarString(noteWithOctave, duration = 2.4, startTimeOffset = 0, velocity = 0.8, tone = 'steel') {
    if (this.muted) return;
    const ctx = this.init();
    const startTime = ctx.currentTime + startTimeOffset;
    const freq = this.getFrequency(noteWithOctave);

    const masterGain = ctx.createGain();
    const effectiveGain = this.volume * velocity * 0.42;

    // Pick Transient Impulse (noise burst through bandpass filter)
    const noiseBuf = this.getNoiseBuffer();
    if (noiseBuf) {
      const pickSource = ctx.createBufferSource();
      pickSource.buffer = noiseBuf;

      const pickFilter = ctx.createBiquadFilter();
      pickFilter.type = 'bandpass';
      pickFilter.frequency.setValueAtTime(3200, startTime);
      pickFilter.Q.setValueAtTime(3.5, startTime);

      const pickGain = ctx.createGain();
      pickGain.gain.setValueAtTime(effectiveGain * 0.35, startTime);
      pickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.015);

      pickSource.connect(pickFilter);
      pickFilter.connect(pickGain);
      pickGain.connect(masterGain);

      pickSource.start(startTime);
      pickSource.stop(startTime + 0.02);
    }

    // String Harmonic Oscillators (Sawtooth for steel brightness + Triangle for core pitch)
    const oscSaw = ctx.createOscillator();
    oscSaw.type = tone === 'nylon' ? 'triangle' : 'sawtooth';
    oscSaw.frequency.setValueAtTime(freq, startTime);
    // Micro-detune for authentic dual-string natural phase
    oscSaw.detune.setValueAtTime(1.5, startTime);

    const oscTri = ctx.createOscillator();
    oscTri.type = 'triangle';
    oscTri.frequency.setValueAtTime(freq, startTime);
    oscTri.detune.setValueAtTime(-1.5, startTime);

    // String Dynamic Lowpass Filter (starts bright on pick strike, quickly damps out high frequencies)
    const stringFilter = ctx.createBiquadFilter();
    stringFilter.type = 'lowpass';
    const initCutoff = tone === 'bright' ? 5200 : (tone === 'nylon' ? 2400 : 4200);
    stringFilter.frequency.setValueAtTime(initCutoff, startTime);
    stringFilter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.35);

    // Acoustic Guitar Body Resonances (Wood air soundhole & top soundboard resonance)
    const bodyResonance = ctx.createBiquadFilter();
    bodyResonance.type = 'peaking';
    bodyResonance.frequency.setValueAtTime(110, startTime); // Helmholtz resonance
    bodyResonance.Q.setValueAtTime(2.0, startTime);
    bodyResonance.gain.setValueAtTime(3.5, startTime);

    const soundboardResonance = ctx.createBiquadFilter();
    soundboardResonance.type = 'peaking';
    soundboardResonance.frequency.setValueAtTime(220, startTime); // Top wood spruce resonance
    soundboardResonance.Q.setValueAtTime(1.8, startTime);
    soundboardResonance.gain.setValueAtTime(3.0, startTime);

    // String Envelope
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.linearRampToValueAtTime(effectiveGain, startTime + 0.003); // Instant crisp pick attack
    masterGain.gain.exponentialRampToValueAtTime(effectiveGain * 0.65, startTime + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Connect nodes
    oscSaw.connect(stringFilter);
    oscTri.connect(stringFilter);
    stringFilter.connect(bodyResonance);
    bodyResonance.connect(soundboardResonance);
    soundboardResonance.connect(masterGain);
    masterGain.connect(ctx.destination);

    oscSaw.start(startTime);
    oscTri.start(startTime);

    const stopTime = startTime + duration + 0.05;
    oscSaw.stop(stopTime);
    oscTri.stop(stopTime);

    this.activeNodes.add(masterGain);
    setTimeout(() => {
      this.activeNodes.delete(masterGain);
    }, (startTimeOffset + duration + 0.1) * 1000);

    // Visual indicators
    setTimeout(() => {
      this.notifyKeyHighlight([noteWithOctave], true);
    }, startTimeOffset * 1000);

    setTimeout(() => {
      this.notifyKeyHighlight([noteWithOctave], false);
    }, (startTimeOffset + Math.min(duration, 0.9)) * 1000);
  }

  // Play a full guitar strum with directional sweep (Downstrum or Upstrum)
  playGuitarStrum(notes, direction = 'down', speed = 0.035, duration = 2.4, tone = 'steel') {
    if (!notes || notes.length === 0) return;

    // Filter valid notes
    const activeNotes = notes.filter((n) => n && n !== 'x');
    if (activeNotes.length === 0) return;

    // Ordered sequence depending on strum direction
    const ordered = direction === 'up' ? [...activeNotes].reverse() : [...activeNotes];

    ordered.forEach((note, idx) => {
      // Natural velocity weighting:
      // Downstrums emphasize lower bass foundation; upstrums emphasize top trebles
      let stringVelocity = 0.82;
      if (direction === 'down') {
        stringVelocity = 0.95 - (idx * 0.04);
      } else {
        stringVelocity = 0.72 + (idx * 0.05);
      }

      this.playGuitarString(
        note,
        duration,
        idx * speed,
        stringVelocity,
        tone
      );
    });
  }

  // -------------------------------------------------------------
  // 3. DRUM MACHINE SYNTHESIS
  // -------------------------------------------------------------
  playDrum(type, startTimeOffset = 0, volume = 0.8) {
    if (this.muted) return;
    const ctx = this.init();
    const startTime = ctx.currentTime + startTimeOffset;
    const masterGain = ctx.createGain();
    const effectiveGain = this.volume * volume * 0.75;
    masterGain.connect(ctx.destination);

    const noiseBuf = this.getNoiseBuffer();

    switch (type) {
      case 'kick': {
        // Deep punchy bass kick with fast pitch sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(155, startTime);
        osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.06);

        gain.gain.setValueAtTime(effectiveGain * 1.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.3);

        // Click transient for beater attack
        if (noiseBuf) {
          const click = ctx.createBufferSource();
          click.buffer = noiseBuf;
          const clickGain = ctx.createGain();
          clickGain.gain.setValueAtTime(effectiveGain * 0.4, startTime);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.015);
          click.connect(clickGain);
          clickGain.connect(masterGain);
          click.start(startTime);
          click.stop(startTime + 0.02);
        }
        break;
      }

      case 'snare': {
        // Snappy snare drum: tone fundamental + white noise wire snap
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(185, startTime);
        osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.07);

        oscGain.gain.setValueAtTime(effectiveGain * 0.65, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.16);

        if (noiseBuf) {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1200, startTime);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(effectiveGain * 0.75, startTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(masterGain);

          noise.start(startTime);
          noise.stop(startTime + 0.25);
        }
        break;
      }

      case 'clap': {
        // Layered handclap with 3 rapid pre-impulses + reverberant tail
        if (noiseBuf) {
          [0, 0.011, 0.022].forEach((offset) => {
            const burst = ctx.createBufferSource();
            burst.buffer = noiseBuf;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1100, startTime + offset);
            filter.Q.setValueAtTime(2.0, startTime + offset);

            const burstGain = ctx.createGain();
            burstGain.gain.setValueAtTime(effectiveGain * 0.55, startTime + offset);
            burstGain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 0.025);

            burst.connect(filter);
            filter.connect(burstGain);
            burstGain.connect(masterGain);

            burst.start(startTime + offset);
            burst.stop(startTime + offset + 0.03);
          });

          // Sustained clap tail
          const tail = ctx.createBufferSource();
          tail.buffer = noiseBuf;
          const tailFilter = ctx.createBiquadFilter();
          tailFilter.type = 'bandpass';
          tailFilter.frequency.setValueAtTime(1200, startTime + 0.025);

          const tailGain = ctx.createGain();
          tailGain.gain.setValueAtTime(effectiveGain * 0.7, startTime + 0.025);
          tailGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2);

          tail.connect(tailFilter);
          tailFilter.connect(tailGain);
          tailGain.connect(masterGain);

          tail.start(startTime + 0.025);
          tail.stop(startTime + 0.22);
        }
        break;
      }

      case 'hihat-closed': {
        // Crisp high-passed metallic tick
        if (noiseBuf) {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(8000, startTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(effectiveGain * 0.6, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          noise.start(startTime);
          noise.stop(startTime + 0.06);
        }
        break;
      }

      case 'hihat-open': {
        // Sizzling metallic open hi-hat
        if (noiseBuf) {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(7000, startTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(effectiveGain * 0.65, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          noise.start(startTime);
          noise.stop(startTime + 0.38);
        }
        break;
      }

      case 'rimshot': {
        // Sharp acoustic rim click
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, startTime);

        oscGain.gain.setValueAtTime(effectiveGain * 0.7, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.035);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.04);
        break;
      }

      case 'tom': {
        // Resonant pitched tom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(130, startTime);
        osc.frequency.exponentialRampToValueAtTime(70, startTime + 0.2);

        gain.gain.setValueAtTime(effectiveGain * 0.8, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
        break;
      }

      default:
        break;
    }
  }

  // -------------------------------------------------------------
  // 4. PRECISION METRONOME AUDIO ENGINE
  // -------------------------------------------------------------
  playMetronomeTick(isAccent = false, soundType = 'woodblock', startTimeOffset = 0, volume = 0.85) {
    if (this.muted) return;
    const ctx = this.init();
    const startTime = ctx.currentTime + startTimeOffset;
    const gainNode = ctx.createGain();
    const effectiveGain = this.volume * volume * 0.75;
    gainNode.connect(ctx.destination);

    switch (soundType) {
      case 'woodblock': {
        // Rich organic woodblock knock
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const freq = isAccent ? 1450 : 920;
        osc.frequency.setValueAtTime(freq, startTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, startTime);
        filter.Q.setValueAtTime(10, startTime);

        gainNode.gain.setValueAtTime(isAccent ? effectiveGain * 1.1 : effectiveGain * 0.8, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + (isAccent ? 0.05 : 0.035));

        osc.connect(filter);
        filter.connect(gainNode);

        osc.start(startTime);
        osc.stop(startTime + 0.06);
        break;
      }

      case 'beep': {
        // Clean digital studio beep
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isAccent ? 1760 : 880, startTime);

        gainNode.gain.setValueAtTime(effectiveGain * 0.75, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

        osc.connect(gainNode);
        osc.start(startTime);
        osc.stop(startTime + 0.05);
        break;
      }

      case 'mechanical': {
        // Sharp mechanical clock tick
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isAccent ? 2400 : 1600, startTime);

        gainNode.gain.setValueAtTime(effectiveGain * 0.85, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.02);

        osc.connect(gainNode);
        osc.start(startTime);
        osc.stop(startTime + 0.03);
        break;
      }

      case 'rimshot': {
        this.playDrum('rimshot', startTimeOffset, isAccent ? volume * 1.2 : volume * 0.8);
        break;
      }

      default:
        break;
    }
  }

  // -------------------------------------------------------------
  // 5. CHORD & SCALE PLAYBACK WITH INSTRUMENT TOGGLE
  // -------------------------------------------------------------
  playChord(notes, mode = 'strum', duration = 2.0, baseOctave = 4, instrument = 'piano') {
    if (!notes || notes.length === 0) return;

    if (instrument === 'guitar') {
      // Guitar Strum engine
      const voicedNotes = notes.map((n, i) => {
        if (/\d/.test(n)) return n;
        const oct = i === 0 ? baseOctave : baseOctave;
        return `${n}${oct}`;
      });

      if (mode === 'arpeggio') {
        voicedNotes.forEach((n, i) => {
          this.playGuitarString(n, 1.8, i * 0.16, 0.85);
        });
      } else {
        const dir = mode === 'upstrum' ? 'up' : 'down';
        this.playGuitarStrum(voicedNotes, dir, 0.032, duration);
      }
      return;
    }

    // Default: Piano/Rhodes engine
    const voicedNotes = notes.map((n, i) => {
      if (/\d/.test(n)) return n;
      const oct = i === 0 ? baseOctave : baseOctave;
      return `${n}${oct}`;
    });

    if (mode === 'block') {
      voicedNotes.forEach((n) => this.playNote(n, duration, 0, 0.75));
    } else if (mode === 'strum') {
      voicedNotes.forEach((n, i) => {
        this.playNote(n, duration, i * 0.035, 0.85 - i * 0.05);
      });
    } else if (mode === 'arpeggio') {
      const arpSequence = [...voicedNotes];
      arpSequence.forEach((n, i) => {
        this.playNote(n, 1.4, i * 0.18, 0.8);
      });
    }
  }

  playScale(notes, speed = 0.22, baseOctave = 4) {
    if (!notes || notes.length === 0) return;
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
