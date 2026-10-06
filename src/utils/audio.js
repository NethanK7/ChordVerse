// Web Audio API Studio Synthesizer Engine
// Studio-grade polyphonic sound engine for Project Music:
// 1. Warm Piano / Rhodes tone
// 2. Realistic Plucked Acoustic Guitar strings (physical modeling, body cavity resonance, stereo panning)
// 3. Punchy Studio Drum Machine (fat saturated kick, layered acoustic/electronic snare, metallic cymbal cluster hats, clap, rimshot, tom)
// 4. Precision Metronome (woodblock, clave, electronic, mechanical)
// 5. Studio Master Chain (Stereo Reverb Ambience, Master Bus, Transparent Limiter/Compressor)

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = new Set();
    this.listeners = new Set();
    this.volume = 0.8;
    this.muted = false;
    this.noiseBuffer = null;
    this.reverbAmount = 0.22; // Studio room ambience default

    // Master chain nodes
    this.masterGain = null;
    this.limiter = null;
    this.convolver = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.masterBus = null;

    // Live VU Analyser & Master Audio Recorder
    this.analyser = null;
    this.recordDestination = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.recordStartTime = 0;
  }

  // Ensure AudioContext is initialized and master bus is connected
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupMasterChain();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Set up transparent master limiter and studio room reverb
  setupMasterChain() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Master Bus input
    this.masterBus = ctx.createGain();

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, ctx.currentTime);

    // Studio Limiter / Compressor (prevents any digital clipping while adding analog punch)
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-4, ctx.currentTime);
    this.limiter.knee.setValueAtTime(6, ctx.currentTime);
    this.limiter.ratio.setValueAtTime(10, ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, ctx.currentTime);
    this.limiter.release.setValueAtTime(0.18, ctx.currentTime);

    // Dry path
    this.dryGain = ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0, ctx.currentTime);

    // Wet path (Algorithmic Studio Reverb)
    this.reverbGain = ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.reverbAmount, ctx.currentTime);

    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.createStudioReverbBuffer(1.4, 2.2);

    // Connect chain:
    // masterBus -> dryGain -> masterGain
    // masterBus -> convolver -> reverbGain -> masterGain
    // masterGain -> limiter -> ctx.destination
    this.masterBus.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.masterBus.connect(this.convolver);
    this.convolver.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.limiter);
    this.limiter.connect(ctx.destination);

    // Live Visual Peak Analyser Node (For real-time DAW VU meters)
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.6;
    this.limiter.connect(this.analyser);

    // Direct Web Audio Recording Stream Destination
    try {
      this.recordDestination = ctx.createMediaStreamDestination();
      this.limiter.connect(this.recordDestination);
    } catch {
      // Fallback if MediaStreamDestination is not available
      this.recordDestination = null;
    }
  }

  // Get live audio peak amplitude (0.0 to 1.0)
  getPeakLevel() {
    if (!this.analyser || this.muted) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = Math.abs((dataArray[i] - 128) / 128);
      if (val > max) max = val;
    }
    return Math.min(1, max * 1.5);
  }

  // Start direct digital audio mixdown recording
  startRecording() {
    this.init();
    if (!this.recordDestination) return false;

    try {
      this.recordedChunks = [];
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime, audioBitsPerSecond: 192000 } : {};
      this.mediaRecorder = new MediaRecorder(this.recordDestination.stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.recordStartTime = Date.now();
      return true;
    } catch (err) {
      console.warn('MediaRecorder start failed:', err);
      return false;
    }
  }

  // Stop recording and return { blob, url, duration, timestamp }
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const durationSeconds = (Date.now() - this.recordStartTime) / 1000;
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        this.recordedChunks = [];
        resolve({
          blob,
          url,
          duration: Math.max(0.1, durationSeconds),
          mimeType,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      };

      this.mediaRecorder.stop();
    });
  }

  // Synthesize realistic stereo acoustic studio room impulse response
  createStudioReverbBuffer(duration = 1.4, decay = 2.2) {
    if (!this.ctx) return null;
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = Math.pow(1 - t, decay);
      // Subtle pre-delay decorrelation between left and right channels
      const leftNoise = Math.random() * 2 - 1;
      const rightNoise = Math.random() * 2 - 1;
      left[i] = leftNoise * env;
      right[i] = rightNoise * env;
    }
    return impulse;
  }

  // Output destination for all instruments
  getDestination() {
    this.init();
    return this.masterBus || this.ctx.destination;
  }

  // Reusable white noise buffer
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
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setReverb(amount) {
    this.reverbAmount = Math.max(0, Math.min(1, amount));
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setValueAtTime(this.reverbAmount * 0.65, this.ctx.currentTime);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyKeyHighlight(notes, active) {
    this.listeners.forEach((fn) => fn({ notes, active }));
  }

  // Convert note name (e.g. 'C4', 'F#3') to Hz
  getFrequency(noteWithOctave) {
    if (!noteWithOctave) return 440;
    const regex = /^([A-G][#b]?)([0-9]?)$/i;
    const match = noteWithOctave.trim().match(regex);
    if (!match) return 440;

    let [, note, octaveStr] = match;
    let octave = octaveStr ? parseInt(octaveStr, 10) : 4;

    const flatToSharp = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    if (flatToSharp[note]) {
      note = flatToSharp[note];
    }

    const noteOffsets = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
      'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };

    const semitonesFromC0 = (octave * 12) + (noteOffsets[note.toUpperCase()] ?? 0);
    const semitonesFromA4 = semitonesFromC0 - 57;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // Distortion curve generator for analog warmth
  createDistortionCurve(amount = 15) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // -------------------------------------------------------------
  // ANALOG SUB & SYNTH BASS (Logic / Ableton style Moog / 808 Bass)
  // -------------------------------------------------------------
  playBass(noteWithOctave = 'C2', duration = 0.8, startTimeOffset = 0, velocity = 0.88, tone = 'sub') {
    if (this.muted) return;
    const ctx = this.init();
    const dest = this.getDestination();
    const startTime = ctx.currentTime + Math.max(0, startTimeOffset);
    const freq = typeof noteWithOctave === 'number' ? noteWithOctave : this.getFrequency(noteWithOctave);
    if (!freq || isNaN(freq)) return;

    // Sub oscillator (Sine fundamental)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq, startTime);

    // Body oscillator (Triangle or Sawtooth)
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = tone === 'sub' ? 'triangle' : 'sawtooth';
    bodyOsc.frequency.setValueAtTime(freq, startTime);
    bodyOsc.detune.setValueAtTime(tone === 'sub' ? 0 : 4, startTime);

    // Resonant lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = tone === 'sub' ? Math.min(260, freq * 2.8) : Math.min(680, freq * 5);
    filter.frequency.setValueAtTime(cutoff * 2.5, startTime);
    filter.frequency.exponentialRampToValueAtTime(cutoff, startTime + 0.14);
    filter.Q.setValueAtTime(tone === 'sub' ? 2 : 4.5, startTime);

    // Bass Amp Envelope
    const bassGain = ctx.createGain();
    const baseAmp = velocity * 0.92;
    bassGain.gain.setValueAtTime(0.0001, startTime);
    bassGain.gain.exponentialRampToValueAtTime(baseAmp, startTime + 0.015);
    bassGain.gain.exponentialRampToValueAtTime(baseAmp * 0.72, startTime + 0.22);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Warmth wave shaper
    const shaper = ctx.createWaveShaper();
    shaper.curve = this.createDistortionCurve(10);

    subOsc.connect(filter);
    bodyOsc.connect(filter);
    filter.connect(shaper);
    shaper.connect(bassGain);
    bassGain.connect(dest);

    subOsc.start(startTime);
    bodyOsc.start(startTime);
    subOsc.stop(startTime + duration + 0.05);
    bodyOsc.stop(startTime + duration + 0.05);
  }

  // -------------------------------------------------------------
  // 1. PIANO / RHODES SYNTHESIS
  // -------------------------------------------------------------
  playNote(noteNameWithOctave, duration = 1.2, startTimeOffset = 0, velocity = 0.8) {
    if (this.muted) return;
    const ctx = this.init();
    const destination = this.getDestination();
    const startTime = ctx.currentTime + startTimeOffset;
    const freq = this.getFrequency(noteNameWithOctave);

    const gainNode = ctx.createGain();
    const effectiveGain = velocity * 0.38;

    // Body Triangle
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Warm Sub Sine
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, startTime);

    // Rhodes tine overtone
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, startTime);
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.06, startTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, startTime);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    filter.connect(gainNode);
    gainNode.connect(destination);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(effectiveGain, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(effectiveGain * 0.55, startTime + 0.22);
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

    setTimeout(() => this.notifyKeyHighlight([noteNameWithOctave], true), startTimeOffset * 1000);
    setTimeout(() => this.notifyKeyHighlight([noteNameWithOctave], false), (startTimeOffset + Math.min(duration, 0.9)) * 1000);
  }

  // -------------------------------------------------------------
  // 2. ENHANCED ACOUSTIC GUITAR PHYSICAL MODELING
  // -------------------------------------------------------------
  // Plucked steel string with pick scrape transient, dual detuned harmonics,
  // frequency-dependent damping, acoustic soundboard + air cavity resonance,
  // and subtle stereo panning for studio breadth.
  playGuitarString(noteWithOctave, duration = 2.4, startTimeOffset = 0, velocity = 0.85, tone = 'steel', panPosition = 0) {
    if (this.muted) return;
    const ctx = this.init();
    const destination = this.getDestination();
    const startTime = ctx.currentTime + startTimeOffset;
    const freq = this.getFrequency(noteWithOctave);

    const stringGain = ctx.createGain();
    const effectiveGain = velocity * 0.44;

    // Stereo Panner (spreads strings across acoustic stereo field)
    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(panPosition, startTime);
      stringGain.connect(panner);
      panner.connect(destination);
    } else {
      stringGain.connect(destination);
    }

    // 1. Tactile Pick Strike Transient (click + string friction impulse)
    const noiseBuf = this.getNoiseBuffer();
    if (noiseBuf) {
      const pickSource = ctx.createBufferSource();
      pickSource.buffer = noiseBuf;

      const pickFilter = ctx.createBiquadFilter();
      pickFilter.type = 'bandpass';
      pickFilter.frequency.setValueAtTime(tone === 'bright' ? 3600 : (tone === 'nylon' ? 2200 : 2900), startTime);
      pickFilter.Q.setValueAtTime(4.2, startTime);

      const pickGain = ctx.createGain();
      pickGain.gain.setValueAtTime(effectiveGain * 0.42, startTime);
      pickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.016);

      pickSource.connect(pickFilter);
      pickFilter.connect(pickGain);
      pickGain.connect(stringGain);

      pickSource.start(startTime);
      pickSource.stop(startTime + 0.02);
    }

    // 2. Dual-Oscillator String Core (Detuned saw + fundamental triangle for rich steel shimmer)
    const oscSaw = ctx.createOscillator();
    oscSaw.type = tone === 'nylon' ? 'triangle' : 'sawtooth';
    oscSaw.frequency.setValueAtTime(freq, startTime);
    oscSaw.detune.setValueAtTime(2.2, startTime);

    const oscTri = ctx.createOscillator();
    oscTri.type = 'triangle';
    oscTri.frequency.setValueAtTime(freq, startTime);
    oscTri.detune.setValueAtTime(-2.2, startTime);

    // Warm sub harmonic for low string body
    const oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(freq, startTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.22, startTime);

    // 3. Dynamic String Damping Filter (higher partials decay much faster than fundamental)
    const dampingFilter = ctx.createBiquadFilter();
    dampingFilter.type = 'lowpass';
    const initCutoff = tone === 'bright' ? 5600 : (tone === 'nylon' ? 2600 : 4500);
    dampingFilter.frequency.setValueAtTime(initCutoff, startTime);
    // Exponential damping sweep down to warm string sustain
    dampingFilter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.8, 380), startTime + 0.16);

    // 4. Acoustic Guitar Body Modes (3 Tuned Physical Resonances)
    // Mode A: Helmholtz Soundhole Cavity resonance (~98Hz)
    const cavityAir = ctx.createBiquadFilter();
    cavityAir.type = 'peaking';
    cavityAir.frequency.setValueAtTime(98, startTime);
    cavityAir.Q.setValueAtTime(2.6, startTime);
    cavityAir.gain.setValueAtTime(4.0, startTime);

    // Mode B: Spruce Top Soundboard mode (~215Hz)
    const soundboard = ctx.createBiquadFilter();
    soundboard.type = 'peaking';
    soundboard.frequency.setValueAtTime(215, startTime);
    soundboard.Q.setValueAtTime(2.2, startTime);
    soundboard.gain.setValueAtTime(3.5, startTime);

    // Mode C: Back Wood plate mode (~420Hz)
    const backPlate = ctx.createBiquadFilter();
    backPlate.type = 'peaking';
    backPlate.frequency.setValueAtTime(420, startTime);
    backPlate.Q.setValueAtTime(2.0, startTime);
    backPlate.gain.setValueAtTime(2.0, startTime);

    // 5. String Amplitude ADSR Envelope
    stringGain.gain.setValueAtTime(0.0001, startTime);
    stringGain.gain.linearRampToValueAtTime(effectiveGain, startTime + 0.004); // Sharp pick impact
    stringGain.gain.exponentialRampToValueAtTime(effectiveGain * 0.65, startTime + 0.07);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Connect node chain
    oscSaw.connect(dampingFilter);
    oscTri.connect(dampingFilter);
    oscSub.connect(subGain);
    subGain.connect(dampingFilter);

    dampingFilter.connect(cavityAir);
    cavityAir.connect(soundboard);
    soundboard.connect(backPlate);
    backPlate.connect(stringGain);

    oscSaw.start(startTime);
    oscTri.start(startTime);
    oscSub.start(startTime);

    const stopTime = startTime + duration + 0.05;
    oscSaw.stop(stopTime);
    oscTri.stop(stopTime);
    oscSub.stop(stopTime);

    this.activeNodes.add(stringGain);
    setTimeout(() => {
      this.activeNodes.delete(stringGain);
    }, (startTimeOffset + duration + 0.1) * 1000);

    setTimeout(() => this.notifyKeyHighlight([noteWithOctave], true), startTimeOffset * 1000);
    setTimeout(() => this.notifyKeyHighlight([noteWithOctave], false), (startTimeOffset + Math.min(duration, 0.9)) * 1000);
  }

  // Play a full guitar chord strum with physics timing and stereo field placement
  playGuitarStrum(notes, direction = 'down', speed = 0.032, duration = 2.4, tone = 'steel') {
    if (!notes || notes.length === 0) return;
    const activeNotes = notes.filter((n) => n && n !== 'x');
    if (activeNotes.length === 0) return;

    const ordered = direction === 'up' ? [...activeNotes].reverse() : [...activeNotes];

    ordered.forEach((note, idx) => {
      // Natural velocity weighting: downstrums hit bass hardest, upstrums emphasize top trebles
      let stringVelocity = 0.85;
      if (direction === 'down') {
        stringVelocity = 0.96 - (idx * 0.035);
      } else {
        stringVelocity = 0.74 + (idx * 0.045);
      }

      // Spread 6 strings slightly across the stereo field (-0.22 to +0.22)
      const pan = -0.2 + (idx / Math.max(1, ordered.length - 1)) * 0.4;

      this.playGuitarString(
        note,
        duration,
        idx * speed,
        stringVelocity,
        tone,
        pan
      );
    });
  }

  // -------------------------------------------------------------
  // 3. ENHANCED STUDIO DRUM MACHINE SYNTHESIS
  // -------------------------------------------------------------
  // Punchy, saturated, analog & modern drum engine with deep kick,
  // cracking snare with wire resonance, metallic FM-cluster hats,
  // 4-stage clap, acoustic rim, and resonant tom.
  playDrum(type, startTimeOffset = 0, volume = 0.85) {
    if (this.muted) return;
    const ctx = this.init();
    const destination = this.getDestination();
    const startTime = ctx.currentTime + startTimeOffset;
    const drumGain = ctx.createGain();
    const effectiveGain = volume * 0.85;
    drumGain.connect(destination);

    const noiseBuf = this.getNoiseBuffer();

    switch (type) {
      case 'kick': {
        // Punchy sub-heavy kick with fast pitch sweep + beater click + soft saturation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dual pitch envelope: 165Hz -> 65Hz punch -> 42Hz sub bottom
        osc.frequency.setValueAtTime(165, startTime);
        osc.frequency.exponentialRampToValueAtTime(65, startTime + 0.035);
        osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.18);

        gain.gain.setValueAtTime(effectiveGain * 1.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

        // Click beater transient for punchy pop through the mix
        if (noiseBuf) {
          const click = ctx.createBufferSource();
          click.buffer = noiseBuf;

          const clickFilter = ctx.createBiquadFilter();
          clickFilter.type = 'bandpass';
          clickFilter.frequency.setValueAtTime(3200, startTime);
          clickFilter.Q.setValueAtTime(3.0, startTime);

          const clickGain = ctx.createGain();
          clickGain.gain.setValueAtTime(effectiveGain * 0.55, startTime);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.018);

          click.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(drumGain);

          click.start(startTime);
          click.stop(startTime + 0.025);
        }

        osc.connect(gain);
        gain.connect(drumGain);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
        break;
      }

      case 'snare': {
        // Dual-tone drum body (185Hz & 330Hz) + dual-filtered noise wires
        const body1 = ctx.createOscillator();
        const body1Gain = ctx.createGain();
        body1.type = 'triangle';
        body1.frequency.setValueAtTime(195, startTime);
        body1.frequency.exponentialRampToValueAtTime(125, startTime + 0.06);
        body1Gain.gain.setValueAtTime(effectiveGain * 0.7, startTime);
        body1Gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

        const body2 = ctx.createOscillator();
        const body2Gain = ctx.createGain();
        body2.type = 'sine';
        body2.frequency.setValueAtTime(330, startTime);
        body2Gain.gain.setValueAtTime(effectiveGain * 0.35, startTime);
        body2Gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

        body1.connect(body1Gain);
        body2.connect(body2Gain);
        body1Gain.connect(drumGain);
        body2Gain.connect(drumGain);

        body1.start(startTime);
        body2.start(startTime);
        body1.stop(startTime + 0.14);
        body2.stop(startTime + 0.1);

        if (noiseBuf) {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;

          const hpFilter = ctx.createBiquadFilter();
          hpFilter.type = 'highpass';
          hpFilter.frequency.setValueAtTime(1400, startTime);

          const presenceFilter = ctx.createBiquadFilter();
          presenceFilter.type = 'peaking';
          presenceFilter.frequency.setValueAtTime(3800, startTime);
          presenceFilter.gain.setValueAtTime(4.0, startTime);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(effectiveGain * 0.85, startTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

          noise.connect(hpFilter);
          hpFilter.connect(presenceFilter);
          presenceFilter.connect(noiseGain);
          noiseGain.connect(drumGain);

          noise.start(startTime);
          noise.stop(startTime + 0.24);
        }
        break;
      }

      case 'clap': {
        // 4 rapid pre-impulses (human clap scatter) + roomy tail
        if (noiseBuf) {
          [0, 0.009, 0.019, 0.031].forEach((offset) => {
            const burst = ctx.createBufferSource();
            burst.buffer = noiseBuf;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1150, startTime + offset);
            filter.Q.setValueAtTime(2.2, startTime + offset);

            const burstGain = ctx.createGain();
            burstGain.gain.setValueAtTime(effectiveGain * 0.6, startTime + offset);
            burstGain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 0.024);

            burst.connect(filter);
            filter.connect(burstGain);
            burstGain.connect(drumGain);

            burst.start(startTime + offset);
            burst.stop(startTime + offset + 0.03);
          });

          // Roomy tail
          const tail = ctx.createBufferSource();
          tail.buffer = noiseBuf;
          const tailFilter = ctx.createBiquadFilter();
          tailFilter.type = 'bandpass';
          tailFilter.frequency.setValueAtTime(1250, startTime + 0.032);

          const tailGain = ctx.createGain();
          tailGain.gain.setValueAtTime(effectiveGain * 0.75, startTime + 0.032);
          tailGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

          tail.connect(tailFilter);
          tailFilter.connect(tailGain);
          tailGain.connect(drumGain);

          tail.start(startTime + 0.032);
          tail.stop(startTime + 0.24);
        }
        break;
      }

      case 'hihat-closed': {
        // Metallic cluster: 6 detuned square waves + highpass shimmer
        const freqs = [205, 300, 365, 418, 540, 680];
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(effectiveGain * 0.45, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.048);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7800, startTime);

        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(f, startTime);
          osc.connect(filter);
          osc.start(startTime);
          osc.stop(startTime + 0.055);
        });

        // Add touch of noise sparkle
        if (noiseBuf) {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.setValueAtTime(9500, startTime);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(effectiveGain * 0.4, startTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.042);

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(drumGain);

          noise.start(startTime);
          noise.stop(startTime + 0.05);
        }

        filter.connect(oscGain);
        oscGain.connect(drumGain);
        break;
      }

      case 'hihat-open': {
        // Metallic cluster with long sizzling cymbal wash
        const freqs = [205, 300, 365, 418, 540, 680];
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(effectiveGain * 0.5, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6800, startTime);

        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(f, startTime);
          osc.connect(filter);
          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });

        if (noiseBuf) {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.setValueAtTime(8000, startTime);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(effectiveGain * 0.55, startTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.36);

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(drumGain);

          noise.start(startTime);
          noise.stop(startTime + 0.4);
        }

        filter.connect(oscGain);
        oscGain.connect(drumGain);
        break;
      }

      case 'rimshot': {
        // Sharp acoustic woodblock knock (1280Hz + 840Hz resonant ping)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1280, startTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(840, startTime);

        gain.gain.setValueAtTime(effectiveGain * 0.85, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.038);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(drumGain);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + 0.045);
        osc2.stop(startTime + 0.045);
        break;
      }

      case 'tom': {
        // Warm round tom with pitch sweep 140Hz -> 65Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, startTime);
        osc.frequency.exponentialRampToValueAtTime(65, startTime + 0.18);

        gain.gain.setValueAtTime(effectiveGain * 0.9, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

        osc.connect(gain);
        gain.connect(drumGain);

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
    const destination = this.getDestination();
    const startTime = ctx.currentTime + startTimeOffset;
    const gainNode = ctx.createGain();
    const effectiveGain = volume * 0.8;
    gainNode.connect(destination);

    switch (soundType) {
      case 'woodblock': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const freq = isAccent ? 1520 : 980;
        osc.frequency.setValueAtTime(freq, startTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, startTime);
        filter.Q.setValueAtTime(12, startTime);

        gainNode.gain.setValueAtTime(isAccent ? effectiveGain * 1.15 : effectiveGain * 0.85, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + (isAccent ? 0.055 : 0.038));

        osc.connect(filter);
        filter.connect(gainNode);

        osc.start(startTime);
        osc.stop(startTime + 0.06);
        break;
      }

      case 'beep': {
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
  // 5. CHORD & SCALE PLAYBACK
  // -------------------------------------------------------------
  playChord(notes, mode = 'strum', duration = 2.0, baseOctave = 4, instrument = 'piano') {
    if (!notes || notes.length === 0) return;

    if (instrument === 'guitar') {
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
      this.masterBus = null;
      this.masterGain = null;
      this.limiter = null;
      this.convolver = null;
    }
  }
}

export const audio = new AudioEngine();
