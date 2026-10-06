import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  Activity, 
  Sliders, 
  Clock
} from 'lucide-react';
import { audio } from '../utils/audio';

const TEMPO_MARKINGS = [
  { name: 'Largo', range: [40, 60], bpm: 50 },
  { name: 'Adagio', range: [66, 76], bpm: 72 },
  { name: 'Andante', range: [77, 108], bpm: 92 },
  { name: 'Moderato', range: [109, 120], bpm: 114 },
  { name: 'Allegro', range: [121, 156], bpm: 138 },
  { name: 'Presto', range: [157, 200], bpm: 172 }
];

const TIME_SIGNATURES = [
  { id: '4/4', beats: 4, name: '4/4 Common' },
  { id: '3/4', beats: 3, name: '3/4 Waltz' },
  { id: '2/4', beats: 2, name: '2/4 March' },
  { id: '6/8', beats: 6, name: '6/8 Compound' },
  { id: '5/4', beats: 5, name: '5/4 Complex' }
];

const SUBDIVISIONS = [
  { id: 'quarter', name: 'Quarter (1x)', multiplier: 1 },
  { id: 'eighth', name: '8th Notes (2x)', multiplier: 2 },
  { id: 'triplet', name: 'Triplets (3x)', multiplier: 3 },
  { id: 'sixteenth', name: '16th Notes (4x)', multiplier: 4 }
];

const SOUND_PRESETS = [
  { id: 'woodblock', name: 'Woodblock Clave' },
  { id: 'mechanical', name: 'Mechanical Click' },
  { id: 'beep', name: 'Studio Beep' },
  { id: 'rimshot', name: 'Drumstick Rim' },
  { id: 'silent', name: 'Visual Only (Silent)' }
];

export default function Metronome() {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [subdivision, setSubdivision] = useState('quarter');
  const [soundType, setSoundType] = useState('woodblock');
  const [accentDownbeat, setAccentDownbeat] = useState(true);
  const [currentBeat, setCurrentBeat] = useState(0); // 0 to beats-1
  const [currentSubbeat, setCurrentSubbeat] = useState(0);
  const [tapTimes, setTapTimes] = useState([]);

  const isPlayingRef = useRef(false);
  const timerRef = useRef(null);
  const beatRef = useRef(0);
  const subbeatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const timeSignatureRef = useRef(timeSignature);
  const subdivisionRef = useRef(subdivision);
  const soundTypeRef = useRef(soundType);
  const accentDownbeatRef = useRef(accentDownbeat);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);

  useEffect(() => {
    subdivisionRef.current = subdivision;
  }, [subdivision]);

  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  useEffect(() => {
    accentDownbeatRef.current = accentDownbeat;
  }, [accentDownbeat]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Find tempo term
  const activeTerm = TEMPO_MARKINGS.find(
    (t) => bpm >= t.range[0] && bpm <= t.range[1]
  )?.name || (bpm > 200 ? 'Prestissimo' : 'Grave');

  const selectedSig = TIME_SIGNATURES.find((s) => s.id === timeSignature) || TIME_SIGNATURES[0];

  // Tap Tempo calculation
  const handleTap = () => {
    const now = performance.now();
    const newTaps = [...tapTimes, now].filter((t) => now - t < 3000); // Keep within 3 seconds
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  // Start & Stop
  const startMetronome = () => {
    audio.init();
    setIsPlaying(true);
    isPlayingRef.current = true;
    beatRef.current = 0;
    subbeatRef.current = 0;
    runMetronomeTick();
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentBeat(0);
    setCurrentSubbeat(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const runMetronomeTick = () => {
    if (!isPlayingRef.current) return;

    const currentBeatIndex = beatRef.current;
    const currentSubIndex = subbeatRef.current;
    const sig = TIME_SIGNATURES.find((s) => s.id === timeSignatureRef.current) || TIME_SIGNATURES[0];
    const sub = SUBDIVISIONS.find((s) => s.id === subdivisionRef.current) || SUBDIVISIONS[0];

    setCurrentBeat(currentBeatIndex);
    setCurrentSubbeat(currentSubIndex);

    // Audio Playback
    const isDownbeat = currentBeatIndex === 0 && currentSubIndex === 0;
    const isQuarterBeat = currentSubIndex === 0;
    const shouldAccent = isDownbeat && accentDownbeatRef.current;

    if (soundTypeRef.current !== 'silent') {
      audio.playMetronomeTick(
        shouldAccent,
        soundTypeRef.current,
        0,
        isQuarterBeat ? 0.9 : 0.45
      );
    }

    // Advance to next subdivision step
    const intervalMs = (60000 / bpmRef.current) / sub.multiplier;

    let nextSub = currentSubIndex + 1;
    let nextBeat = currentBeatIndex;

    if (nextSub >= sub.multiplier) {
      nextSub = 0;
      nextBeat = (currentBeatIndex + 1) % sig.beats;
    }

    beatRef.current = nextBeat;
    subbeatRef.current = nextSub;

    timerRef.current = setTimeout(runMetronomeTick, intervalMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Pendulum angle calculation for visual swinging
  const pendulumAngle = isPlaying ? (currentBeat % 2 === 0 ? -28 : 28) : 0;

  return (
    <div className="metronome-page">
      {/* Section Header */}
      <div className="section-header">
        <div className="header-meta">
          <span className="section-badge">Precision Timing</span>
          <h1 className="section-title">
            Studio Metronome & Tap Tempo
          </h1>
          <p className="section-subtitle">
            Zero-latency tempo clock with visual pulse, time signatures, subdivisions, and tap tempo detection for practicing scales and chords.
          </p>
        </div>
      </div>

      <div className="metronome-main-layout">
        {/* Left: Metronome Stage */}
        <div className="metronome-visual-card">
          {/* Italian Tempo Term Badge */}
          <div className="tempo-term-badge">
            <span className="term-text">{activeTerm}</span>
            <span className="term-sub">({selectedSig.name})</span>
          </div>

          {/* Big BPM Display */}
          <div className="bpm-hero-display">
            <span className="bpm-hero-number">{bpm}</span>
            <span className="bpm-hero-label">BPM</span>
          </div>

          {/* Pendulum / Pulse Visualization */}
          <div className="pendulum-container">
            <div 
              className="pendulum-arm"
              style={{
                transform: `rotate(${pendulumAngle}deg)`,
                transition: `transform ${(60 / bpm) * 0.8}s cubic-bezier(0.4, 0, 0.2, 1)`
              }}
            >
              <div className="pendulum-weight" />
            </div>
            <div className="pendulum-base" />
          </div>

          {/* Beat LED Indicators */}
          <div className="beat-led-strip">
            {Array.from({ length: selectedSig.beats }).map((_, idx) => {
              const isCurrent = isPlaying && currentBeat === idx && currentSubbeat === 0;
              const isAccent = idx === 0 && accentDownbeat;

              return (
                <div 
                  key={idx}
                  className={`beat-led ${isCurrent ? 'active' : ''} ${isAccent ? 'accent' : ''}`}
                >
                  <span className="led-num">{idx + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Transport Toggle Button */}
          <button
            onClick={isPlaying ? stopMetronome : startMetronome}
            className={`metronome-start-btn ${isPlaying ? 'running' : ''}`}
          >
            {isPlaying ? (
              <>
                <Square size={22} fill="currentColor" /> Stop Metronome
              </>
            ) : (
              <>
                <Play size={22} fill="currentColor" /> Start Metronome
              </>
            )}
          </button>
        </div>

        {/* Right: Controls & Adjustments */}
        <div className="metronome-controls-column">
          {/* Fine Tempo Controls */}
          <div className="ctrl-card">
            <div className="card-top">
              <Sliders size={16} className="text-amber" />
              <h3>Tempo Adjuster</h3>
            </div>

            {/* Slider */}
            <div className="slider-wrapper">
              <input
                type="range"
                min="30"
                max="260"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="tempo-large-slider"
              />
            </div>

            {/* Step buttons */}
            <div className="step-btns-grid">
              <button onClick={() => setBpm((b) => Math.max(30, b - 5))} className="step-btn">-5</button>
              <button onClick={() => setBpm((b) => Math.max(30, b - 1))} className="step-btn">-1</button>
              <button onClick={() => setBpm((b) => Math.min(260, b + 1))} className="step-btn">+1</button>
              <button onClick={() => setBpm((b) => Math.min(260, b + 5))} className="step-btn">+5</button>
            </div>

            {/* Tap Tempo Button */}
            <button onClick={handleTap} className="tap-tempo-btn">
              <Activity size={18} /> Tap Tempo (Click repeatedly)
            </button>
          </div>

          {/* Time Signature & Subdivision */}
          <div className="ctrl-card">
            <div className="card-top">
              <Clock size={16} className="text-emerald" />
              <h3>Time Signature & Subdivisions</h3>
            </div>

            <div className="setting-row">
              <span className="setting-label">Time Signature:</span>
              <div className="pill-options">
                {TIME_SIGNATURES.map((sig) => (
                  <button
                    key={sig.id}
                    onClick={() => setTimeSignature(sig.id)}
                    className={`setting-pill ${timeSignature === sig.id ? 'active' : ''}`}
                  >
                    {sig.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-row">
              <span className="setting-label">Subdivision:</span>
              <div className="pill-options">
                {SUBDIVISIONS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubdivision(sub.id)}
                    className={`setting-pill ${subdivision === sub.id ? 'active' : ''}`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-row toggle-row">
              <span className="setting-label">Accent Beat 1 (Downbeat):</span>
              <button 
                onClick={() => setAccentDownbeat((a) => !a)}
                className={`toggle-switch-btn ${accentDownbeat ? 'active' : ''}`}
              >
                {accentDownbeat ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Sound Presets */}
          <div className="ctrl-card">
            <div className="card-top">
              <Volume2 size={16} className="text-blue" />
              <h3>Click Sound</h3>
            </div>

            <div className="sound-options-grid">
              {SOUND_PRESETS.map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => {
                    setSoundType(snd.id);
                    if (snd.id !== 'silent') {
                      audio.init();
                      audio.playMetronomeTick(true, snd.id, 0, 0.9);
                    }
                  }}
                  className={`sound-option-btn ${soundType === snd.id ? 'active' : ''}`}
                >
                  {snd.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
