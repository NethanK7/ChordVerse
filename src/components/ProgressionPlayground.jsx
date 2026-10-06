import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Music
} from 'lucide-react';
import { audio } from '../utils/audio';
import { FAMOUS_PROGRESSIONS, getChordsInKey } from '../utils/musicTheory';

export default function ProgressionPlayground({ currentKey }) {
  const chords = getChordsInKey(currentKey);
  const [selectedPresetId, setSelectedPresetId] = useState('pop-axis');
  const [customProgression, setCustomProgression] = useState([1, 5, 6, 4]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [bpm, setBpm] = useState(105);
  const [voicing, setVoicing] = useState('strum');
  const [loopMode, setLoopMode] = useState(true);
  const [instrument, setInstrument] = useState('guitar'); // 'guitar' | 'piano'

  const loopTimerRef = useRef(null);
  const activeStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const instrumentRef = useRef(instrument);

  useEffect(() => {
    instrumentRef.current = instrument;
  }, [instrument]);

  // Sync ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load preset
  const handleSelectPreset = (preset) => {
    stopPlayback();
    setSelectedPresetId(preset.id);
    setCustomProgression([...preset.numbers]);
  };

  // Add a degree to custom progression
  const handleAddDegree = (degree) => {
    if (customProgression.length >= 8) return; // Cap at 8 chords
    setCustomProgression([...customProgression, degree]);
    setSelectedPresetId('custom');
  };

  const handleRemoveLast = () => {
    if (customProgression.length <= 1) return;
    setCustomProgression(customProgression.slice(0, -1));
    setSelectedPresetId('custom');
  };

  const handleClear = () => {
    stopPlayback();
    setCustomProgression([1]);
    setSelectedPresetId('custom');
  };

  // Playback engine
  const startPlayback = () => {
    audio.init();
    setIsPlaying(true);
    isPlayingRef.current = true;
    activeStepRef.current = 0;
    runStep();
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentStepIndex(null);
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  };

  const runStep = () => {
    if (!isPlayingRef.current) return;

    const step = activeStepRef.current;
    setCurrentStepIndex(step);

    const degree = customProgression[step];
    const chord = chords.find((c) => c.degree === degree);

    if (chord) {
      const stepDurationSec = (60 / bpm) * 2; // 2 beats per chord
      audio.playChord(chord.triadNotes, voicing, stepDurationSec * 0.95, 4, instrumentRef.current);
    }

    const nextStep = step + 1;
    const stepDurationMs = ((60 / bpm) * 2) * 1000;

    if (nextStep < customProgression.length) {
      activeStepRef.current = nextStep;
      loopTimerRef.current = setTimeout(runStep, stepDurationMs);
    } else {
      if (loopMode) {
        activeStepRef.current = 0;
        loopTimerRef.current = setTimeout(runStep, stepDurationMs);
      } else {
        stopPlayback();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const activePreset = FAMOUS_PROGRESSIONS.find((p) => p.id === selectedPresetId);

  return (
    <div className="progression-lab-page">
      {/* Header */}
      <div className="section-header">
        <span className="section-badge">Progression Lab</span>
        <h1 className="section-title">
          Hit Song Progression Builder
        </h1>
        <p className="section-subtitle">
          Test drive famous multi-platinum chord formulas or build your own custom progression in <strong>{currentKey} Major</strong>.
        </p>
      </div>

      {/* Preset Library Carousel */}
      <div className="presets-shelf">
        <div className="shelf-header">
          <span className="shelf-title">Famous Song Formulas:</span>
        </div>
        <div className="presets-list">
          {FAMOUS_PROGRESSIONS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`preset-pill ${isSelected ? 'active' : ''}`}
              >
                <span className="preset-name">{preset.name}</span>
                <span className="preset-formula">{preset.romans.join(' - ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Player Display Box */}
      <div className="player-stage">
        {/* Progression Chords Rail */}
        <div className="progression-rail">
          {customProgression.map((degree, idx) => {
            const chord = chords.find((c) => c.degree === degree);
            const isStepActive = isPlaying && currentStepIndex === idx;

            return (
              <div
                key={idx}
                className={`rail-chord-card ${isStepActive ? 'step-active' : ''}`}
                style={{
                  '--step-color': chord ? chord.color : '#3b82f6',
                  '--step-glow': chord ? chord.glowColor : 'rgba(59,130,246,0.5)'
                }}
              >
                <div className="step-counter">Beat {idx + 1}</div>
                <div className="rail-degree-num">{degree}</div>
                <div className="rail-roman">{chord ? chord.roman : ''}</div>
                <div className="rail-chord-name">{chord ? chord.chordName : ''}</div>
                <div className="rail-family-pill">{chord ? chord.family.split(' ')[0] : ''}</div>
              </div>
            );
          })}
        </div>

        {/* Current Formula Display & Context */}
        {activePreset && selectedPresetId !== 'custom' && (
          <div className="preset-info-banner">
            <div className="p-info-left">
              <h4>{activePreset.name} ({activePreset.romans.join(' - ')})</h4>
              <p className="p-desc">{activePreset.description}</p>
            </div>
            <div className="p-info-examples">
              <span className="ex-title">Famous Tracks:</span>
              <div className="ex-tags">
                {activePreset.examples.map((ex, i) => (
                  <span key={i} className="ex-chip"><Music size={12} className="inline-icon" /> {ex}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controls Deck */}
        <div className="player-controls-deck">
          {/* Play / Stop */}
          <div className="primary-actions">
            {!isPlaying ? (
              <button onClick={startPlayback} className="play-master-btn">
                <Play size={20} fill="currentColor" /> Play Progression
              </button>
            ) : (
              <button onClick={stopPlayback} className="stop-master-btn">
                <Square size={20} fill="currentColor" /> Stop
              </button>
            )}

            <button
              onClick={() => setLoopMode(!loopMode)}
              className={`loop-toggle-btn ${loopMode ? 'active' : ''}`}
              title="Toggle Infinite Loop"
            >
              <RotateCcw size={16} /> Loop {loopMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Instrument Toggle */}
          <div className="instrument-pick-box">
            <span className="slider-label">Instrument:</span>
            <div className="btn-group">
              <button
                className={`segmented-btn ${instrument === 'guitar' ? 'active' : ''}`}
                onClick={() => setInstrument('guitar')}
              >
                Guitar
              </button>
              <button
                className={`segmented-btn ${instrument === 'piano' ? 'active' : ''}`}
                onClick={() => setInstrument('piano')}
              >
                Piano
              </button>
            </div>
          </div>

          {/* Tempo & Voicing Controls */}
          <div className="slider-controls">
            <div className="tempo-slider-box">
              <span className="slider-label">Tempo: <strong>{bpm} BPM</strong></span>
              <input
                type="range"
                min="60"
                max="160"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="tempo-range"
              />
            </div>

            <div className="voicing-pick-group">
              <button
                className={`tiny-pick-btn ${voicing === 'strum' ? 'active' : ''}`}
                onClick={() => setVoicing('strum')}
              >
                Strum
              </button>
              <button
                className={`tiny-pick-btn ${voicing === 'arpeggio' ? 'active' : ''}`}
                onClick={() => setVoicing('arpeggio')}
              >
                Arp
              </button>
              <button
                className={`tiny-pick-btn ${voicing === 'block' ? 'active' : ''}`}
                onClick={() => setVoicing('block')}
              >
                Block
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Build Your Own Progression Palette */}
      <div className="custom-palette-card">
        <div className="palette-header">
          <div>
            <h3>Add Chords to Sequence (Max 8)</h3>
            <p>Click any degree button to append it to your sequence:</p>
          </div>
          <div className="palette-actions">
            <button onClick={handleRemoveLast} className="danger-text-btn">
              Undo Last
            </button>
            <button onClick={handleClear} className="danger-text-btn">
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>

        <div className="palette-buttons-row">
          {chords.map((chord) => (
            <button
              key={chord.degree}
              onClick={() => handleAddDegree(chord.degree)}
              className="palette-chord-btn"
              style={{
                '--c-color': chord.color,
                '--c-glow': chord.glowColor
              }}
            >
              <span className="pal-num">{chord.degree}</span>
              <span className="pal-roman">{chord.roman}</span>
              <span className="pal-name">{chord.chordName}</span>
              <Plus size={14} className="pal-add-icon" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
