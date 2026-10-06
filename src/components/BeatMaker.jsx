import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Music
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getChordsInKey, getGuitarChordVoicing } from '../utils/musicTheory';

// 6 Drum tracks with their default names and types
const DRUM_TRACKS = [
  { id: 'kick', name: 'Kick Drum', color: '#ec4899', short: 'KICK' },
  { id: 'snare', name: 'Snare Drum', color: '#f59e0b', short: 'SNARE' },
  { id: 'clap', name: 'Hand Clap', color: '#8b5cf6', short: 'CLAP' },
  { id: 'hihat-closed', name: 'Closed Hat', color: '#10b981', short: 'CH' },
  { id: 'hihat-open', name: 'Open Hat', color: '#06b6d4', short: 'OH' },
  { id: 'rimshot', name: 'Rim / Perc', color: '#3b82f6', short: 'RIM' }
];

// Presets for instant small music beats
const BEAT_PRESETS = [
  {
    id: 'lofi',
    name: 'Lofi Chillhop',
    bpm: 84,
    description: 'Laid-back, relaxed groove with swinging pocket hats',
    grid: {
      'kick':         [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      'snare':        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      'clap':         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'hihat-closed': [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
      'hihat-open':   [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
      'rimshot':      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }
  },
  {
    id: 'boombap',
    name: '90s Boom Bap',
    bpm: 92,
    description: 'Classic hip-hop punch with heavy kick and cracking snare',
    grid: {
      'kick':         [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      'snare':        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      'clap':         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'hihat-closed': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      'hihat-open':   [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      'rimshot':      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
    }
  },
  {
    id: 'house',
    name: 'Four-on-the-Floor',
    bpm: 124,
    description: 'Pumping house & dance rhythm with driving upbeat open hats',
    grid: {
      'kick':         [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      'snare':        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'clap':         [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      'hihat-closed': [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      'hihat-open':   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      'rimshot':      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]
    }
  },
  {
    id: 'trap',
    name: 'Modern Trap',
    bpm: 140,
    description: 'Rapid-fire 16th hats with booming kick and sharp clap',
    grid: {
      'kick':         [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      'snare':        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'clap':         [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      'hihat-closed': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      'hihat-open':   [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      'rimshot':      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0]
    }
  },
  {
    id: 'pop-rock',
    name: 'Acoustic Pop Groove',
    bpm: 105,
    description: 'Clean acoustic pop pocket perfect for jamming progressions',
    grid: {
      'kick':         [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      'snare':        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      'clap':         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'hihat-closed': [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      'hihat-open':   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      'rimshot':      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    }
  }
];

export default function BeatMaker({ currentKey }) {
  const chords = getChordsInKey(currentKey);
  const [bpm, setBpm] = useState(92);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('lofi');
  const [activeChordJam, setActiveChordJam] = useState(null);
  const [jamInstrument, setJamInstrument] = useState('guitar'); // 'guitar' | 'piano'

  // 16-step grid state for all 6 tracks
  const [grid, setGrid] = useState(() => {
    return BEAT_PRESETS[0].grid;
  });

  // Track mute / volume state
  const [trackMutes, setTrackMutes] = useState({
    'kick': false,
    'snare': false,
    'clap': false,
    'hihat-closed': false,
    'hihat-open': false,
    'rimshot': false
  });

  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const gridRef = useRef(grid);
  const trackMutesRef = useRef(trackMutes);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    trackMutesRef.current = trackMutes;
  }, [trackMutes]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Toggle step in grid
  const toggleStep = (trackId, stepIndex) => {
    setGrid((prev) => {
      const trackRow = [...prev[trackId]];
      trackRow[stepIndex] = trackRow[stepIndex] === 1 ? 0 : 1;
      return {
        ...prev,
        [trackId]: trackRow
      };
    });
    setSelectedPresetId('custom');

    // Audition sound on toggle if activated
    if (grid[trackId][stepIndex] === 0) {
      audio.init();
      audio.playDrum(trackId, 0, 0.8);
    }
  };

  // Toggle mute for a track
  const toggleMute = (trackId) => {
    setTrackMutes((prev) => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  // Clear entire grid
  const handleClearGrid = () => {
    stopBeat();
    const emptyGrid = {};
    DRUM_TRACKS.forEach((t) => {
      emptyGrid[t.id] = new Array(16).fill(0);
    });
    setGrid(emptyGrid);
    setSelectedPresetId('custom');
  };

  // Randomize beat
  const handleRandomize = () => {
    const newGrid = {};
    DRUM_TRACKS.forEach((t) => {
      newGrid[t.id] = Array.from({ length: 16 }, () => (Math.random() > 0.75 ? 1 : 0));
    });
    // Ensure kick on 1 and snare on 5, 13
    newGrid['kick'][0] = 1;
    newGrid['kick'][8] = 1;
    newGrid['snare'][4] = 1;
    newGrid['snare'][12] = 1;

    setGrid(newGrid);
    setSelectedPresetId('custom');
  };

  // Load a preset
  const handleLoadPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setGrid(preset.grid);
    setBpm(preset.bpm);
  };

  // Sequencer loop execution
  const startBeat = () => {
    audio.init();
    setIsPlaying(true);
    isPlayingRef.current = true;
    stepRef.current = 0;
    runBeatStep();
  };

  const stopBeat = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentStep(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const runBeatStep = () => {
    if (!isPlayingRef.current) return;
    const step = stepRef.current;
    setCurrentStep(step);

    // Trigger sounds for this step
    const currentGrid = gridRef.current;
    const mutes = trackMutesRef.current;

    DRUM_TRACKS.forEach((track) => {
      if (currentGrid[track.id] && currentGrid[track.id][step] === 1 && !mutes[track.id]) {
        audio.playDrum(track.id, 0, 0.85);
      }
    });

    // 16th note step duration in ms
    const stepDurationMs = ((60 / bpm) / 4) * 1000;
    const nextStep = (step + 1) % 16;
    stepRef.current = nextStep;

    timerRef.current = setTimeout(runBeatStep, stepDurationMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Jam along chord trigger
  const handleJamChord = (chord) => {
    audio.init();
    setActiveChordJam(chord.degree);

    if (jamInstrument === 'guitar') {
      const v = getGuitarChordVoicing(chord.chordName, chord.quality, chord.triadNotes);
      audio.playGuitarStrum(v.soundingNotes, 'down', 0.03, 2.0);
    } else {
      audio.playChord(chord.triadNotes, 'strum', 1.8, 4, 'piano');
    }

    setTimeout(() => setActiveChordJam(null), 600);
  };

  return (
    <div className="beat-maker-page">
      {/* Header */}
      <div className="section-header">
        <div className="header-meta">
          <span className="section-badge">Rhythm Studio</span>
          <h1 className="section-title">
            Beat Maker & Groovebox
          </h1>
          <p className="section-subtitle">
            Craft punchy 16-step music beats, explore curated groove presets, adjust tempos, and jam your diatonic chord progressions live over your running beats.
          </p>
        </div>

        {/* Global Controls & Preset Picker */}
        <div className="beat-global-controls">
          {/* Preset Buttons */}
          <div className="preset-selector-row">
            <span className="control-label">Groove Presets:</span>
            <div className="presets-pill-group">
              {BEAT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className={`preset-pill-btn ${selectedPresetId === p.id ? 'active' : ''}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Beat Sequencer Board */}
      <div className="sequencer-board-card">
        {/* Top Control Bar */}
        <div className="sequencer-toolbar">
          <div className="transport-controls">
            <button
              onClick={isPlaying ? stopBeat : startBeat}
              className={`transport-btn ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? (
                <>
                  <Square size={18} fill="currentColor" /> Stop Beat
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Play Beat
                </>
              )}
            </button>

            <button 
              onClick={handleRandomize} 
              className="toolbar-action-btn"
              title="Generate a random groove"
            >
              <Shuffle size={16} /> Randomize
            </button>

            <button 
              onClick={handleClearGrid} 
              className="toolbar-action-btn danger"
              title="Clear all steps"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          {/* Tempo BPM Slider & Tap */}
          <div className="tempo-control-box">
            <div className="tempo-display">
              <span className="tempo-val">{bpm}</span>
              <span className="tempo-unit">BPM</span>
            </div>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value, 10))}
              className="bpm-slider"
            />
            <div className="tempo-fine-btns">
              <button onClick={() => setBpm((b) => Math.max(50, b - 5))} className="fine-btn">-5</button>
              <button onClick={() => setBpm((b) => Math.min(220, b + 5))} className="fine-btn">+5</button>
            </div>
          </div>
        </div>

        {/* 16-Step Column Headers (Numbered 1 to 4 with 16th divisions) */}
        <div className="step-column-headers">
          <div className="track-label-placeholder" />
          <div className="steps-header-grid">
            {Array.from({ length: 16 }).map((_, stepIdx) => {
              const isQuarter = stepIdx % 4 === 0;
              const quarterNum = Math.floor(stepIdx / 4) + 1;
              const isCurrent = currentStep === stepIdx;

              return (
                <div 
                  key={stepIdx} 
                  className={`step-header-cell ${isQuarter ? 'quarter-downbeat' : ''} ${isCurrent ? 'active-header' : ''}`}
                >
                  <span className="step-num-text">
                    {isQuarter ? quarterNum : `${quarterNum}.${(stepIdx % 4) + 1}`}
                  </span>
                  {isCurrent && <div className="playhead-indicator-dot" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sequencer Grid Rows */}
        <div className="sequencer-grid">
          {DRUM_TRACKS.map((track) => {
            const isMuted = trackMutes[track.id];

            return (
              <div key={track.id} className={`sequencer-track-row ${isMuted ? 'track-muted' : ''}`}>
                {/* Track Header & Mute */}
                <div className="track-info">
                  <div className="track-color-indicator" style={{ background: track.color }} />
                  <div className="track-names">
                    <span className="track-title">{track.name}</span>
                    <span className="track-short">{track.short}</span>
                  </div>
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`track-mute-btn ${isMuted ? 'muted' : ''}`}
                    title={isMuted ? 'Unmute Track' : 'Mute Track'}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>

                {/* 16 Step Buttons */}
                <div className="track-steps-row">
                  {Array.from({ length: 16 }).map((_, sIdx) => {
                    const isActive = grid[track.id] && grid[track.id][sIdx] === 1;
                    const isPlayhead = currentStep === sIdx;
                    const isMeasureStart = sIdx % 4 === 0;

                    return (
                      <button
                        key={sIdx}
                        onClick={() => toggleStep(track.id, sIdx)}
                        className={`sequencer-step-btn ${isActive ? 'active-step' : ''} ${isPlayhead ? 'playhead-active' : ''} ${isMeasureStart ? 'measure-start' : ''}`}
                        style={{
                          '--track-color': track.color
                        }}
                        aria-label={`${track.name} Step ${sIdx + 1}`}
                      >
                        {isActive && <div className="step-active-fill" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Jam-Along Section */}
      <div className="beat-jam-card">
        <div className="jam-header">
          <div className="jam-title-box">
            <Music size={18} className="text-emerald" />
            <h3>Jam Along: Play Chords Over Your Beat</h3>
          </div>

          <div className="jam-instrument-toggle">
            <span className="toggle-label">Jam Sound:</span>
            <div className="btn-group">
              <button
                onClick={() => setJamInstrument('guitar')}
                className={`segmented-btn ${jamInstrument === 'guitar' ? 'active' : ''}`}
              >
                Acoustic Guitar
              </button>
              <button
                onClick={() => setJamInstrument('piano')}
                className={`segmented-btn ${jamInstrument === 'piano' ? 'active' : ''}`}
              >
                Rhodes Piano
              </button>
            </div>
          </div>
        </div>

        <p className="jam-subtitle">
          Start the drum loop above, then click any chord below to strum in time with your groove. Practice 1-7 transitions like 1 → 5 → 6 → 4!
        </p>

        {/* 7 Diatonic Jam Chords */}
        <div className="jam-chords-grid">
          {chords.map((chord) => {
            const isJamming = activeChordJam === chord.degree;
            return (
              <button
                key={chord.degree}
                onClick={() => handleJamChord(chord)}
                className={`jam-chord-pad ${isJamming ? 'jamming' : ''}`}
                style={{
                  '--degree-color': chord.color,
                  '--degree-glow': chord.glowColor
                }}
              >
                <div className="jam-degree-num">{chord.degree}</div>
                <div className="jam-chord-name">{chord.chordName}</div>
                <div className="jam-roman">{chord.roman}</div>
                <div className="jam-family-tag">{chord.family.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
