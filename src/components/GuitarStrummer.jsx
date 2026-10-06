import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  ArrowDown, 
  ArrowUp, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { audio } from '../utils/audio';
import { 
  getChordsInKey, 
  getGuitarChordVoicing, 
  GUITAR_TUNING, 
  STRUMMING_PATTERNS 
} from '../utils/musicTheory';

export default function GuitarStrummer({ currentKey }) {
  const chords = getChordsInKey(currentKey);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const [strumSpeed, setStrumSpeed] = useState(0.035); // seconds per string
  const [guitarTone, setGuitarTone] = useState('steel'); // 'steel' | 'nylon' | 'bright'
  const [vibratingString, setVibratingString] = useState(null);
  const [activePatternIndex, setActivePatternIndex] = useState(0);
  const [isPlayingPattern, setIsPlayingPattern] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [bpm, setBpm] = useState(96);

  const patternTimerRef = useRef(null);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlayingPattern;
  }, [isPlayingPattern]);

  const activeChord = chords[selectedChordIndex];
  const voicing = getGuitarChordVoicing(activeChord.chordName, activeChord.quality, activeChord.triadNotes);

  // Strum single direction
  const handleStrum = (direction = 'down') => {
    audio.init();
    audio.playGuitarStrum(voicing.soundingNotes, direction, strumSpeed, 2.4, guitarTone);

    // Trigger visual string vibration wave
    const stringIndices = direction === 'down' ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
    stringIndices.forEach((sIdx, i) => {
      setTimeout(() => {
        setVibratingString(sIdx);
      }, i * (strumSpeed * 1000));
    });

    setTimeout(() => {
      setVibratingString(null);
    }, (stringIndices.length * strumSpeed + 0.6) * 1000);
  };

  // Pluck individual string
  const handlePluckString = (stringIndex, noteWithOctave) => {
    if (!noteWithOctave || noteWithOctave === 'x') return;
    audio.init();
    audio.playGuitarString(noteWithOctave, 2.2, 0, 0.88, guitarTone);
    setVibratingString(stringIndex);
    setTimeout(() => setVibratingString(null), 700);
  };

  // Pattern rhythm playback
  const selectedPattern = STRUMMING_PATTERNS[activePatternIndex];

  const togglePlayPattern = () => {
    if (isPlayingPattern) {
      stopPattern();
    } else {
      startPattern();
    }
  };

  const startPattern = () => {
    audio.init();
    setIsPlayingPattern(true);
    isPlayingRef.current = true;
    stepRef.current = 0;
    runPatternStep();
  };

  const stopPattern = () => {
    setIsPlayingPattern(false);
    isPlayingRef.current = false;
    setCurrentStepIndex(null);
    if (patternTimerRef.current) {
      clearTimeout(patternTimerRef.current);
      patternTimerRef.current = null;
    }
  };

  const runPatternStep = () => {
    if (!isPlayingRef.current) return;
    const currentStep = stepRef.current;
    setCurrentStepIndex(currentStep);

    const stroke = selectedPattern.pattern[currentStep];
    if (stroke === 'D') {
      audio.playGuitarStrum(voicing.soundingNotes, 'down', strumSpeed * 0.85, 1.8, guitarTone);
    } else if (stroke === 'U') {
      audio.playGuitarStrum(voicing.soundingNotes, 'up', strumSpeed * 0.8, 1.6, guitarTone);
    }

    const stepDurationMs = ((60 / bpm) / 2) * 1000; // Eighth note duration
    const nextStep = (currentStep + 1) % selectedPattern.pattern.length;
    stepRef.current = nextStep;

    patternTimerRef.current = setTimeout(runPatternStep, stepDurationMs);
  };

  useEffect(() => {
    return () => {
      if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
    };
  }, []);

  return (
    <div className="guitar-strummer-page">
      {/* Page Header */}
      <div className="section-header">
        <div className="header-meta">
          <span className="section-badge">Acoustic Simulation</span>
          <h1 className="section-title">
            Guitar Strummer & Fretboard Lab
          </h1>
          <p className="section-subtitle">
            Experience realistic acoustic guitar chord strums, individual string plucking, authentic 6-string voicings, and strumming patterns in the key of <strong>{currentKey} Major</strong>.
          </p>
        </div>

        {/* Tone & Strum Speed Controls */}
        <div className="guitar-global-controls">
          <div className="control-group">
            <span className="control-label">Acoustic Tone:</span>
            <div className="btn-group">
              <button 
                className={`segmented-btn ${guitarTone === 'steel' ? 'active' : ''}`}
                onClick={() => setGuitarTone('steel')}
              >
                Steel Acoustic
              </button>
              <button 
                className={`segmented-btn ${guitarTone === 'bright' ? 'active' : ''}`}
                onClick={() => setGuitarTone('bright')}
              >
                Bright Folk
              </button>
              <button 
                className={`segmented-btn ${guitarTone === 'nylon' ? 'active' : ''}`}
                onClick={() => setGuitarTone('nylon')}
              >
                Warm Nylon
              </button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Strum Speed: {Math.round(strumSpeed * 1000)}ms</span>
            <input 
              type="range"
              min="0.015"
              max="0.070"
              step="0.005"
              value={strumSpeed}
              onChange={(e) => setStrumSpeed(parseFloat(e.target.value))}
              className="strum-slider"
            />
          </div>
        </div>
      </div>

      {/* 7 Diatonic Chord Selector Bar */}
      <div className="guitar-chord-bar">
        <div className="chord-bar-header">
          <span className="bar-label">Select Diatonic Chord (Key of {currentKey}):</span>
          <span className="bar-sub">Tap any chord to switch voicings</span>
        </div>
        <div className="guitar-chords-row">
          {chords.map((chord, idx) => {
            const isSelected = idx === selectedChordIndex;
            return (
              <button
                key={chord.degree}
                onClick={() => {
                  setSelectedChordIndex(idx);
                  const v = getGuitarChordVoicing(chord.chordName, chord.quality, chord.triadNotes);
                  audio.playGuitarStrum(v.soundingNotes, 'down', strumSpeed, 2.2, guitarTone);
                }}
                className={`guitar-chord-btn ${isSelected ? 'active' : ''}`}
                style={{
                  '--degree-color': chord.color,
                  '--degree-glow': chord.glowColor
                }}
              >
                <div className="gc-degree">{chord.degree}</div>
                <div className="gc-name">{chord.chordName}</div>
                <div className="gc-roman">{chord.roman}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Strumming Stage */}
      <div className="strum-stage-layout">
        {/* Left: 6-String Guitar Neck & Pluck Area */}
        <div className="guitar-body-card">
          <div className="stage-top-bar">
            <div className="current-chord-badge">
              <span className="badge-deg">{activeChord.degree}</span>
              <span className="badge-title">{activeChord.chordName}</span>
              <span className="badge-sub">({activeChord.fullName})</span>
            </div>

            {/* Quick Action Strum Buttons */}
            <div className="strum-action-buttons">
              <button 
                onClick={() => handleStrum('down')} 
                className="strum-trigger-btn down"
                title="Downstrum (Low strings to high strings)"
              >
                <ArrowDown size={18} /> Downstrum
              </button>
              <button 
                onClick={() => handleStrum('up')} 
                className="strum-trigger-btn up"
                title="Upstrum (High strings to low strings)"
              >
                <ArrowUp size={18} /> Upstrum
              </button>
            </div>
          </div>

          {/* Interactive 6 Strings Visualizer */}
          <div className="guitar-strings-box">
            <div className="strings-fret-nut" />
            <div className="strings-list">
              {GUITAR_TUNING.map((t, stringIdx) => {
                const noteAtFret = voicing.notes[stringIdx];
                const fretNum = voicing.frets[stringIdx];
                const isMuted = fretNum === -1;
                const isVibrating = vibratingString === stringIdx;

                return (
                  <div
                    key={t.string}
                    className={`guitar-string-row ${isVibrating ? 'vibrating' : ''} ${isMuted ? 'muted-string' : ''}`}
                    onClick={() => handlePluckString(stringIdx, noteAtFret)}
                    onMouseEnter={(e) => {
                      if (e.buttons === 1) {
                        handlePluckString(stringIdx, noteAtFret);
                      }
                    }}
                  >
                    <div className="string-info-tag">
                      <span className="string-num">String {t.string}</span>
                      <span className="tuning-name">({t.name})</span>
                    </div>

                    {/* Physical String Wire */}
                    <div className="string-wire-container">
                      <div 
                        className={`string-wire gauge-${stringIdx + 1}`} 
                        style={{ height: `${6 - stringIdx * 0.75}px` }}
                      />
                      {isVibrating && <div className="string-harmonic-glow" />}
                    </div>

                    {/* Chord Fret Marker */}
                    <div className="string-fret-tag">
                      {isMuted ? (
                        <span className="fret-pill muted">X (Mute)</span>
                      ) : fretNum === 0 ? (
                        <span className="fret-pill open">Open ({noteAtFret})</span>
                      ) : (
                        <span className="fret-pill fretted">Fret {fretNum} ({noteAtFret})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sweep Gesture Strip */}
          <div 
            className="strum-sweep-strip"
            onMouseEnter={(e) => {
              if (e.buttons === 1) handleStrum('down');
            }}
            onClick={() => handleStrum('down')}
          >
            <div className="strip-sweep-glow" />
            <span>Click or drag across strings to strum {activeChord.chordName}</span>
          </div>
        </div>

        {/* Right: Guitar Chord Diagram & Rhythm Pattern Player */}
        <div className="guitar-side-column">
          {/* Chord Fingering Diagram */}
          <div className="chord-diagram-card">
            <div className="card-header-compact">
              <Sparkles size={16} className="text-amber" />
              <h3>Chord Chart & Voicing</h3>
            </div>

            <div className="diagram-content">
              <div className="voicing-fret-summary">
                <span className="summary-title">String Frets:</span>
                <div className="frets-readout">
                  {voicing.frets.map((f, i) => (
                    <span key={i} className={`fret-indicator ${f === -1 ? 'muted' : f === 0 ? 'open' : 'fretted'}`}>
                      {f === -1 ? 'X' : f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="chord-notes-breakdown">
                <span className="summary-title">Sounding Notes:</span>
                <div className="notes-chips">
                  {voicing.soundingNotes.map((note, i) => (
                    <span key={i} className="guitar-note-chip">
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              <div className="voicing-tip">
                <Info size={14} />
                <span>
                  Standard acoustic tuning (E-A-D-G-B-E). {activeChord.quality === 'Major' ? 'Major triad with rich open ring.' : activeChord.quality === 'minor' ? 'Minor voicing with soulful third.' : 'Diminished voicing with tense flat-fifth.'}
                </span>
              </div>
            </div>
          </div>

          {/* Strumming Pattern Rhythm Looper */}
          <div className="strum-pattern-card">
            <div className="pattern-card-header">
              <div className="header-title-box">
                <Clock size={16} className="text-emerald" />
                <h3>Rhythm Strumming Looper</h3>
              </div>
              <div className="pattern-tempo-box">
                <span>{bpm} BPM</span>
              </div>
            </div>

            {/* Pattern Selectors */}
            <div className="patterns-picker">
              {STRUMMING_PATTERNS.map((pat, idx) => (
                <button
                  key={pat.id}
                  onClick={() => {
                    stopPattern();
                    setActivePatternIndex(idx);
                  }}
                  className={`pat-pill ${idx === activePatternIndex ? 'active' : ''}`}
                >
                  {pat.name}
                </button>
              ))}
            </div>

            {/* Pattern Steps Visualizer */}
            <div className="pattern-steps-grid">
              {selectedPattern.pattern.map((stroke, sIdx) => {
                const isActive = currentStepIndex === sIdx;
                const isDown = stroke === 'D';
                const isUp = stroke === 'U';

                return (
                  <div 
                    key={sIdx} 
                    className={`pattern-step-cell ${isActive ? 'step-active' : ''} ${stroke ? 'has-stroke' : 'rest'}`}
                  >
                    <span className="step-label">{selectedPattern.labels[sIdx]}</span>
                    <div className="stroke-icon-box">
                      {isDown && <ArrowDown size={14} className="stroke-arrow down" />}
                      {isUp && <ArrowUp size={14} className="stroke-arrow up" />}
                      {!stroke && <span className="rest-dash">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tempo Slider & Play Button */}
            <div className="pattern-controls-row">
              <div className="tempo-slider-box">
                <label className="tempo-label">Tempo: {bpm} BPM</label>
                <input 
                  type="range"
                  min="60"
                  max="160"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                  className="bpm-slider"
                />
              </div>

              <button 
                onClick={togglePlayPattern}
                className={`pattern-play-btn ${isPlayingPattern ? 'playing' : ''}`}
              >
                {isPlayingPattern ? (
                  <>
                    <Square size={16} fill="currentColor" /> Stop
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> Loop Strum
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
