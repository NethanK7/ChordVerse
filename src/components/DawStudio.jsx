import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Circle, 
  Clock, 
  Music, 
  Disc3, 
  Zap, 
  Sparkles, 
  Maximize2, 
  Layers, 
  Download, 
  Trash2, 
  Radio, 
  Activity 
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getChordsInKey, getGuitarChordVoicing } from '../utils/musicTheory';
import BeatMaker from './BeatMaker';
import GuitarStrummer from './GuitarStrummer';
import Metronome from './Metronome';

// Preset grooves for DAW Beat Machine
const DAW_BEAT_PRESETS = [
  {
    name: 'Lofi Chillhop',
    bpm: 84,
    kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
    open:  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0]
  },
  {
    name: 'Boom Bap',
    bpm: 92,
    kick:  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    open:  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
  },
  {
    name: '4-on-Floor House',
    bpm: 124,
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    open:  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
  },
  {
    name: 'Trap Banger',
    bpm: 140,
    kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hat:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    open:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
  }
];

export default function DawStudio({ 
  currentKey, 
  dawView: externalDawView, 
  setDawView: setExternalDawView,
  onSwitchToLearning 
}) {
  // Controlled or uncontrolled DAW Sub-view: 'console' (Full Studio DAW), 'beats', 'guitar', 'metronome'
  const [internalDawView, setInternalDawView] = useState('console');
  const dawView = externalDawView !== undefined ? externalDawView : internalDawView;
  const setDawView = setExternalDawView || setInternalDawView;

  // Master Session Transport
  const [masterBpm, setMasterBpm] = useState(100);
  const [isMasterPlaying, setIsMasterPlaying] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(24);
  const [activeChordJam, setActiveChordJam] = useState(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);

  // Playhead step (0 to 15)
  const [dawStep, setDawStep] = useState(0);

  // Live Audio Recording Engine States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedTakes, setRecordedTakes] = useState([]);
  const [currentlyPlayingTake, setCurrentlyPlayingTake] = useState(null);

  // Live Peak VU Meter level (0 to 1)
  const [vuLevel, setVuLevel] = useState(0);

  // Track 1: Drum Machine Matrix (Kick, Snare, Closed Hat, Open Hat)
  const [dawKickSteps, setDawKickSteps] = useState([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
  const [dawSnareSteps, setDawSnareSteps] = useState([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
  const [dawHatSteps, setDawHatSteps] = useState([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
  const [dawOpenSteps, setDawOpenSteps] = useState([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0]);

  // Track 2: Acoustic Guitar & Chord Arranger (4 Bars)
  const [dawProgression, setDawProgression] = useState([1, 5, 6, 4]);
  const [progressionStep, setProgressionStep] = useState(0);
  const [guitarTone, setGuitarTone] = useState('steel'); // 'steel' | 'nylon'

  // Track 3: Sub & Synth Bass
  const [bassEnabled, setBassEnabled] = useState(true);
  const [bassTone, setBassTone] = useState('sub'); // 'sub' | 'moog'

  // Track Mixer States (Mute, Solo, Volume)
  const [trackMutes, setTrackMutes] = useState({
    drums: false,
    guitar: false,
    bass: false,
    metronome: false
  });
  const [trackSolos, setTrackSolos] = useState({
    drums: false,
    guitar: false,
    bass: false
  });
  const [trackVolumes, setTrackVolumes] = useState({
    drums: 0.9,
    guitar: 0.85,
    bass: 0.85
  });

  const chords = getChordsInKey(currentKey);

  // Refs for zero-jitter Web Audio scheduling loop
  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const kickRef = useRef(dawKickSteps);
  const snareRef = useRef(dawSnareSteps);
  const hatRef = useRef(dawHatSteps);
  const openRef = useRef(dawOpenSteps);
  const mutesRef = useRef(trackMutes);
  const solosRef = useRef(trackSolos);
  const volumesRef = useRef(trackVolumes);
  const progressionRef = useRef(dawProgression);
  const guitarToneRef = useRef(guitarTone);
  const bassEnabledRef = useRef(bassEnabled);
  const bassToneRef = useRef(bassTone);
  const chordsRef = useRef(chords);
  const recordingTimerRef = useRef(null);
  const vuAnimRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    kickRef.current = dawKickSteps;
    snareRef.current = dawSnareSteps;
    hatRef.current = dawHatSteps;
    openRef.current = dawOpenSteps;
    mutesRef.current = trackMutes;
    solosRef.current = trackSolos;
    volumesRef.current = trackVolumes;
    progressionRef.current = dawProgression;
    guitarToneRef.current = guitarTone;
    bassEnabledRef.current = bassEnabled;
    bassToneRef.current = bassTone;
    chordsRef.current = chords;
  }, [
    dawKickSteps, 
    dawSnareSteps, 
    dawHatSteps, 
    dawOpenSteps, 
    trackMutes, 
    trackSolos, 
    trackVolumes, 
    dawProgression, 
    guitarTone, 
    bassEnabled, 
    bassTone, 
    chords
  ]);

  useEffect(() => {
    isPlayingRef.current = isMasterPlaying;
  }, [isMasterPlaying]);

  // Master Peak VU meter animation frame loop
  useEffect(() => {
    const updateVU = () => {
      if (audio.analyser && isMasterPlaying) {
        const peak = audio.getPeakLevel();
        setVuLevel((prev) => Math.max(peak, prev * 0.88));
      } else {
        setVuLevel((prev) => Math.max(0, prev * 0.8));
      }
      vuAnimRef.current = requestAnimationFrame(updateVU);
    };
    vuAnimRef.current = requestAnimationFrame(updateVU);
    return () => {
      if (vuAnimRef.current) cancelAnimationFrame(vuAnimRef.current);
    };
  }, [isMasterPlaying]);

  // Master Reverb control
  const handleReverbChange = (val) => {
    setReverbAmount(val);
    audio.setReverb(val / 100);
  };

  const handleStartRecording = () => {
    audio.init();
    const started = audio.startRecording();
    if (started) {
      setIsRecording(true);
      setRecordingSeconds(0);
      if (!isMasterPlaying) {
        startMaster();
      }
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    const take = await audio.stopRecording();
    if (take && take.url) {
      const takeNumber = recordedTakes.length + 1;
      const newTake = {
        id: `take-${Date.now()}`,
        name: `Mixdown Take #${takeNumber} (${currentKey} Major)`,
        url: take.url,
        blob: take.blob,
        duration: take.duration.toFixed(1),
        timestamp: take.timestamp
      };
      setRecordedTakes((prev) => [newTake, ...prev]);
    }
  };

  // Live Audio Recording Handler
  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const startMaster = () => {
    audio.init();
    setIsMasterPlaying(true);
    isPlayingRef.current = true;
    stepRef.current = 0;
    runDawStep();
  };

  const stopMaster = () => {
    setIsMasterPlaying(false);
    isPlayingRef.current = false;
    setDawStep(0);
    setProgressionStep(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // If recording, auto stop recording as well
    if (isRecording) {
      handleStopRecording();
    }
  };

  // Master DAW Transport Play/Stop
  const toggleMasterTransport = () => {
    if (isMasterPlaying) {
      stopMaster();
    } else {
      startMaster();
    }
  };

  const toggleTransportRef = useRef(toggleMasterTransport);
  const toggleRecordingRef = useRef(handleToggleRecording);
  useEffect(() => {
    toggleTransportRef.current = toggleMasterTransport;
    toggleRecordingRef.current = handleToggleRecording;
  });

  // Keyboard Shortcuts (Space: Play/Stop, R: Record)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTransportRef.current();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        toggleRecordingRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Download recorded take
  const handleDownloadTake = (take) => {
    const a = document.createElement('a');
    a.href = take.url;
    a.download = `${take.name.replace(/\s+/g, '_')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete recorded take
  const handleDeleteTake = (takeId) => {
    setRecordedTakes((prev) => prev.filter((t) => t.id !== takeId));
    if (currentlyPlayingTake === takeId) {
      setCurrentlyPlayingTake(null);
    }
  };

  // 16-Step DAW Clock Tick Execution Loop
  const runDawStep = () => {
    if (!isPlayingRef.current) return;
    const currentStep = stepRef.current;
    setDawStep(currentStep);

    const solos = solosRef.current;
    const mutes = mutesRef.current;
    const vols = volumesRef.current;
    const anySolo = solos.drums || solos.guitar || solos.bass;

    // Check if track is audibly enabled (Solo priority over Mute)
    const canPlayDrums = (anySolo ? solos.drums : !mutes.drums);
    const canPlayGuitar = (anySolo ? solos.guitar : !mutes.guitar);
    const canPlayBass = (anySolo ? solos.bass : !mutes.bass) && bassEnabledRef.current;
    const canPlayMetronome = !mutes.metronome;

    // 1. Play Drums Track
    if (canPlayDrums) {
      const dVol = vols.drums;
      if (kickRef.current[currentStep] === 1) audio.playDrum('kick', 0, 0.9 * dVol);
      if (snareRef.current[currentStep] === 1) audio.playDrum('snare', 0, 0.85 * dVol);
      if (hatRef.current[currentStep] === 1) audio.playDrum('hihat-closed', 0, 0.7 * dVol);
      if (openRef.current[currentStep] === 1) audio.playDrum('hihat-open', 0, 0.75 * dVol);
    }

    // 2. Play Metronome Click on Downbeats
    if (canPlayMetronome && currentStep % 4 === 0) {
      const isAccent = currentStep === 0;
      audio.playMetronomeTick(isAccent, 'woodblock', 0, 0.65);
    }

    // 3. Play Chord Progression Track (Strums chord every quarter bar = 4 steps)
    if (currentStep % 4 === 0 && progressionRef.current.length > 0) {
      const progIndex = Math.floor(currentStep / 4) % progressionRef.current.length;
      setProgressionStep(progIndex);
      const degree = progressionRef.current[progIndex];
      const chord = chordsRef.current.find((c) => c.degree === degree);

      if (chord) {
        if (canPlayGuitar) {
          const voicing = getGuitarChordVoicing(chord.chordName, chord.quality, chord.triadNotes);
          const gVol = vols.guitar;
          const strokeDirection = currentStep % 8 === 0 ? 'down' : 'up';
          audio.playGuitarStrum(voicing.soundingNotes, strokeDirection, 0.026, 1.4 * gVol, guitarToneRef.current);
        }

        // 4. Play Sub / Synth Bass Note locked to root of the chord
        if (canPlayBass) {
          const bVol = vols.bass;
          const rootNote = chord.rootNote || chord.chordName.replace(/[m°+]/g, '');
          const bassNote = `${rootNote}2`;
          audio.playBass(bassNote, 0.75, 0, 0.88 * bVol, bassToneRef.current);
        }
      }
    }

    // 16th note step interval in ms
    const stepDurationMs = ((60 / masterBpm) / 4) * 1000;
    const nextStep = (currentStep + 1) % 16;
    stepRef.current = nextStep;

    timerRef.current = setTimeout(runDawStep, stepDurationMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Quick guitar strum from jam pad
  const handleQuickStrum = (chord, direction = 'down') => {
    audio.init();
    setActiveChordJam(chord.degree);
    const voicing = getGuitarChordVoicing(chord.chordName, chord.quality, chord.triadNotes);
    audio.playGuitarStrum(voicing.soundingNotes, direction, 0.03, 2.2, guitarTone);

    if (bassEnabled) {
      const rootNote = chord.rootNote || chord.chordName.replace(/[m°+]/g, '');
      audio.playBass(`${rootNote}2`, 0.8, 0, 0.88, bassTone);
    }

    setTimeout(() => setActiveChordJam(null), 450);
  };

  // Toggle Drum Matrix Step
  const handleToggleDrumStep = (instrumentType, stepIdx) => {
    audio.init();
    if (instrumentType === 'kick') {
      const next = [...dawKickSteps];
      next[stepIdx] = next[stepIdx] === 1 ? 0 : 1;
      setDawKickSteps(next);
      if (next[stepIdx] === 1) audio.playDrum('kick', 0, 0.85);
    } else if (instrumentType === 'snare') {
      const next = [...dawSnareSteps];
      next[stepIdx] = next[stepIdx] === 1 ? 0 : 1;
      setDawSnareSteps(next);
      if (next[stepIdx] === 1) audio.playDrum('snare', 0, 0.8);
    } else if (instrumentType === 'hat') {
      const next = [...dawHatSteps];
      next[stepIdx] = next[stepIdx] === 1 ? 0 : 1;
      setDawHatSteps(next);
      if (next[stepIdx] === 1) audio.playDrum('hihat-closed', 0, 0.7);
    } else if (instrumentType === 'open') {
      const next = [...dawOpenSteps];
      next[stepIdx] = next[stepIdx] === 1 ? 0 : 1;
      setDawOpenSteps(next);
      if (next[stepIdx] === 1) audio.playDrum('hihat-open', 0, 0.75);
    }
  };

  // Load Drum Groove Preset
  const handleLoadGroovePreset = (p) => {
    setDawKickSteps([...p.kick]);
    setDawSnareSteps([...p.snare]);
    setDawHatSteps([...p.hat]);
    setDawOpenSteps([...p.open]);
    setMasterBpm(p.bpm);
  };

  // Toggle Track Solo
  const toggleTrackSolo = (trackKey) => {
    setTrackSolos((prev) => ({
      ...prev,
      [trackKey]: !prev[trackKey]
    }));
  };

  // Toggle Track Mute
  const toggleTrackMute = (trackKey) => {
    setTrackMutes((prev) => ({
      ...prev,
      [trackKey]: !prev[trackKey]
    }));
  };

  // Format recording seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="daw-studio-page">
      {/* =========================================================
          DAW MASTER HEADER & WORKSTATION VIEW SWITCHER
          ========================================================= */}
      <div className="daw-master-header">
        <div className="daw-branding">
          <div className="daw-badge-icon">
            <Radio size={22} className="text-emerald" />
          </div>
          <div>
            <div className="daw-title-row">
              <h1 className="daw-title">DAW Studio Workstation</h1>
              <span className="daw-version-tag">Pro Audio Suite</span>
              {isRecording && (
                <span className="recording-live-pill">
                  <span className="rec-dot-pulse" /> REC {formatTime(recordingSeconds)}
                </span>
              )}
            </div>
            <p className="daw-subtitle">
              Record live audio mixes, sequence 16-step polyphonic beats, arrange diatonic guitar strums & analog sub-bass in Key of <strong>{currentKey} Major</strong>.
            </p>
          </div>
        </div>

        {/* DAW View Switcher (All-in-One Console, Beat Maker, Guitar, Metronome) */}
        <div className="daw-view-switcher">
          <button
            onClick={() => setDawView('console')}
            className={`daw-view-tab ${dawView === 'console' ? 'active' : ''}`}
            title="Ableton/Logic Pro Full Multi-Track Console"
          >
            <Layers size={16} /> Console & Recorder
          </button>
          <button
            onClick={() => setDawView('beats')}
            className={`daw-view-tab ${dawView === 'beats' ? 'active' : ''}`}
            title="Dedicated 16-Step Drum Sequencer"
          >
            <Disc3 size={16} /> Beat Maker
          </button>
          <button
            onClick={() => setDawView('guitar')}
            className={`daw-view-tab ${dawView === 'guitar' ? 'active' : ''}`}
            title="Acoustic Strumming Stage"
          >
            <Zap size={16} /> Guitar Strummer
          </button>
          <button
            onClick={() => setDawView('metronome')}
            className={`daw-view-tab ${dawView === 'metronome' ? 'active' : ''}`}
            title="Precision Zero-Drift Clock"
          >
            <Clock size={16} /> Metronome
          </button>
          {onSwitchToLearning && (
            <button
              onClick={onSwitchToLearning}
              className="daw-view-tab daw-theory-link"
              title="Return to Theory Learning Academy"
            >
              <Music size={15} /> Theory Academy
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          VIEW 1: ALL-IN-ONE PRO WORKSTATION (ABLETON / LOGIC STYLE)
          ========================================================= */}
      {dawView === 'console' && (
        <>
          {/* LOGIC / ABLETON MASTER TRANSPORT DECK */}
          <div className="daw-transport-bar">
            {/* Play, Stop, and Big Red Record Deck */}
            <div className="transport-play-group">
              <button
                onClick={toggleMasterTransport}
                className={`daw-master-play-btn ${isMasterPlaying ? 'playing' : ''}`}
                title="Play/Stop Master Session (Spacebar)"
              >
                {isMasterPlaying ? (
                  <>
                    <Square size={16} fill="currentColor" /> Stop
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> Play Session
                  </>
                )}
              </button>

              {/* Big Red Record Master Mix Button */}
              <button
                onClick={handleToggleRecording}
                className={`daw-record-btn ${isRecording ? 'recording' : ''}`}
                title="Record Master Mix Audio Directly (R key)"
              >
                <Circle size={15} fill={isRecording ? '#ef4444' : 'currentColor'} />
                <span>{isRecording ? 'Stop Rec' : 'Record Mix'}</span>
              </button>

              {/* Time Display (Bars : Beats : 16ths) */}
              <div className="daw-time-display">
                <span className="time-bar">BAR {Math.floor(dawStep / 4) + 1}</span>
                <span className="time-divider">:</span>
                <span className="time-step">BEAT {(dawStep % 4) + 1}</span>
              </div>
            </div>

            {/* Tempo (BPM) & Tap Deck */}
            <div className="daw-tempo-box">
              <div className="tempo-readout">
                <span className="tempo-num">{masterBpm}</span>
                <span className="tempo-label">BPM</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={masterBpm}
                onChange={(e) => setMasterBpm(parseInt(e.target.value, 10))}
                className="daw-tempo-slider"
                title="Master Tempo"
              />
              <div className="tempo-step-buttons">
                <button onClick={() => setMasterBpm((b) => Math.max(40, b - 1))} className="bpm-step-btn">-</button>
                <button onClick={() => setMasterBpm((b) => Math.min(220, b + 1))} className="bpm-step-btn">+</button>
              </div>
            </div>

            {/* Master Studio Reverb Slider */}
            <div className="daw-fx-box">
              <div className="fx-label-row">
                <Sparkles size={14} className="text-purple" />
                <span>Reverb: {reverbAmount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                value={reverbAmount}
                onChange={(e) => handleReverbChange(parseInt(e.target.value, 10))}
                className="daw-reverb-slider"
              />
            </div>

            {/* Live Master Peak VU Meter Bars */}
            <div className="daw-master-vu-deck" title="Master Audio Output Peak Level">
              <span className="vu-label">OUT</span>
              <div className="vu-meter-bar">
                <div 
                  className="vu-level-fill" 
                  style={{ height: `${Math.min(100, vuLevel * 100)}%` }} 
                />
              </div>
              <div className="vu-meter-bar">
                <div 
                  className="vu-level-fill right" 
                  style={{ height: `${Math.min(100, vuLevel * 95)}%` }} 
                />
              </div>
            </div>

            {/* Metronome Click Sync Toggle */}
            <div className="daw-quick-toggles">
              <button
                onClick={() => toggleTrackMute('metronome')}
                className={`daw-toggle-btn ${!trackMutes.metronome ? 'active' : ''}`}
                title="Toggle metronome click on downbeats"
              >
                <Clock size={15} /> Click: {!trackMutes.metronome ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* =========================================================
              MULTI-TRACK WORKSTATION RACK
              ========================================================= */}
          <div className="daw-console-layout">
            {/* TRACK 1: DRUM MACHINE & BEAT GRID */}
            <div className="daw-track-card track-drums-card">
              <div className="track-card-header">
                <div className="track-info">
                  <div className="track-icon-badge drums-badge">
                    <Disc3 size={18} />
                  </div>
                  <div>
                    <h3 className="track-title">Track 1: Polyphonic Drum Machine</h3>
                    <span className="track-badge">4 Lanes • 16-Step Sequencer</span>
                  </div>
                </div>

                {/* Track Channel Controls (Solo, Mute, Volume Fader) */}
                <div className="track-actions">
                  <div className="channel-fader-group">
                    <span className="fader-label">VOL</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={trackVolumes.drums}
                      onChange={(e) => setTrackVolumes((v) => ({ ...v, drums: parseFloat(e.target.value) }))}
                      className="channel-mini-fader"
                      title="Drum Track Volume"
                    />
                  </div>

                  <button
                    onClick={() => toggleTrackSolo('drums')}
                    className={`channel-pill-btn solo ${trackSolos.drums ? 'active' : ''}`}
                    title="Solo Drums (S)"
                  >
                    S
                  </button>
                  <button
                    onClick={() => toggleTrackMute('drums')}
                    className={`channel-pill-btn mute ${trackMutes.drums ? 'active' : ''}`}
                    title="Mute Drums (M)"
                  >
                    M
                  </button>
                  <button
                    onClick={() => setDawView('beats')}
                    className="track-action-btn"
                    title="Expand Full Beat Maker"
                  >
                    <Maximize2 size={13} /> Full Beats
                  </button>
                </div>
              </div>

              {/* 16-Step Polyphonic Grid */}
              <div className="drum-matrix-container">
                <div className="drum-matrix-steps-header">
                  <span className="matrix-track-spacer">INSTR</span>
                  {Array.from({ length: 16 }).map((_, sIdx) => (
                    <span 
                      key={sIdx} 
                      className={`drum-step-num ${sIdx % 4 === 0 ? 'downbeat' : ''} ${dawStep === sIdx && isMasterPlaying ? 'active-step-col' : ''}`}
                    >
                      {sIdx + 1}
                    </span>
                  ))}
                </div>

                {/* Kick Lane */}
                <div className="drum-matrix-row">
                  <span className="matrix-label kick-label">Kick</span>
                  <div className="matrix-step-cells">
                    {dawKickSteps.map((active, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleDrumStep('kick', idx)}
                        className={`matrix-cell ${active === 1 ? 'active kick-cell' : ''} ${dawStep === idx && isMasterPlaying ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat-cell' : ''}`}
                        title={`Kick Step ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Snare Lane */}
                <div className="drum-matrix-row">
                  <span className="matrix-label snare-label">Snare</span>
                  <div className="matrix-step-cells">
                    {dawSnareSteps.map((active, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleDrumStep('snare', idx)}
                        className={`matrix-cell ${active === 1 ? 'active snare-cell' : ''} ${dawStep === idx && isMasterPlaying ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat-cell' : ''}`}
                        title={`Snare Step ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Closed Hat Lane */}
                <div className="drum-matrix-row">
                  <span className="matrix-label hat-label">Closed Hat</span>
                  <div className="matrix-step-cells">
                    {dawHatSteps.map((active, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleDrumStep('hat', idx)}
                        className={`matrix-cell ${active === 1 ? 'active hat-cell' : ''} ${dawStep === idx && isMasterPlaying ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat-cell' : ''}`}
                        title={`Closed Hat Step ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Open Hat Lane */}
                <div className="drum-matrix-row">
                  <span className="matrix-label open-label">Open Hat</span>
                  <div className="matrix-step-cells">
                    {dawOpenSteps.map((active, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleDrumStep('open', idx)}
                        className={`matrix-cell ${active === 1 ? 'active open-cell' : ''} ${dawStep === idx && isMasterPlaying ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat-cell' : ''}`}
                        title={`Open Hat Step ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Groove Presets Row */}
                <div className="drum-presets-row">
                  <span>Groove Presets:</span>
                  {DAW_BEAT_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleLoadGroovePreset(p)}
                      className="matrix-preset-btn"
                    >
                      {p.name} ({p.bpm} BPM)
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setDawKickSteps(new Array(16).fill(0));
                      setDawSnareSteps(new Array(16).fill(0));
                      setDawHatSteps(new Array(16).fill(0));
                      setDawOpenSteps(new Array(16).fill(0));
                    }}
                    className="matrix-preset-btn clear-btn"
                    title="Clear Drum Grid"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* TRACK 2: ACOUSTIC GUITAR & CHORD PROGRESSION ARRANGER */}
            <div className="daw-track-card track-guitar-card">
              <div className="track-card-header">
                <div className="track-info">
                  <div className="track-icon-badge guitar-badge">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="track-title">Track 2: Acoustic Guitar & Chord Arranger</h3>
                    <span className="track-badge">Physical Modeling • Diatonic Voicings</span>
                  </div>
                </div>

                {/* Guitar Channel Controls */}
                <div className="track-actions">
                  <div className="channel-fader-group">
                    <span className="fader-label">VOL</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={trackVolumes.guitar}
                      onChange={(e) => setTrackVolumes((v) => ({ ...v, guitar: parseFloat(e.target.value) }))}
                      className="channel-mini-fader"
                      title="Guitar Track Volume"
                    />
                  </div>

                  <div className="guitar-tone-pill-group">
                    <button
                      onClick={() => setGuitarTone('steel')}
                      className={`tone-pill ${guitarTone === 'steel' ? 'active' : ''}`}
                    >
                      Steel String
                    </button>
                    <button
                      onClick={() => setGuitarTone('nylon')}
                      className={`tone-pill ${guitarTone === 'nylon' ? 'active' : ''}`}
                    >
                      Nylon
                    </button>
                  </div>

                  <button
                    onClick={() => toggleTrackSolo('guitar')}
                    className={`channel-pill-btn solo ${trackSolos.guitar ? 'active' : ''}`}
                    title="Solo Guitar"
                  >
                    S
                  </button>
                  <button
                    onClick={() => toggleTrackMute('guitar')}
                    className={`channel-pill-btn mute ${trackMutes.guitar ? 'active' : ''}`}
                    title="Mute Guitar"
                  >
                    M
                  </button>
                  <button
                    onClick={() => setDawView('guitar')}
                    className="track-action-btn"
                    title="Open Full Guitar Strummer"
                  >
                    <Maximize2 size={13} /> Full Strummer
                  </button>
                </div>
              </div>

              {/* 4-Bar Synced Progression Arranger */}
              <div className="daw-progression-bar">
                {dawProgression.map((deg, barIdx) => {
                  const chord = chords.find((c) => c.degree === deg);
                  const isCurrentBar = isMasterPlaying && progressionStep === barIdx;

                  return (
                    <div
                      key={barIdx}
                      className={`daw-prog-step-badge ${isCurrentBar ? 'active-stage' : ''}`}
                    >
                      <div className="daw-prog-header">
                        <span>BAR {barIdx + 1}</span>
                        <span className="prog-step-deg">{chord ? chord.roman : `${deg}`}</span>
                      </div>
                      <div className="daw-prog-chord-name">
                        {chord ? chord.chordName : `Degree ${deg}`}
                      </div>
                      <div className="daw-prog-triad-notes">
                        {chord ? chord.triadNotes.join(' - ') : ''}
                      </div>

                      {/* Bar Degree Selector Dropdown */}
                      <select
                        value={deg}
                        onChange={(e) => {
                          const next = [...dawProgression];
                          next[barIdx] = parseInt(e.target.value, 10);
                          setDawProgression(next);
                        }}
                        className="daw-prog-select"
                        title={`Select chord for Bar ${barIdx + 1}`}
                      >
                        {chords.map((c) => (
                          <option key={c.degree} value={c.degree}>
                            {c.degree}. {c.chordName} ({c.roman})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Progression Presets */}
              <div className="daw-prog-presets-row">
                <span>Progression Presets:</span>
                <button onClick={() => setDawProgression([1, 5, 6, 4])} className="prog-preset-pill">Pop (1-5-6-4)</button>
                <button onClick={() => setDawProgression([1, 4, 5, 1])} className="prog-preset-pill">Classic (1-4-5-1)</button>
                <button onClick={() => setDawProgression([6, 4, 1, 5])} className="prog-preset-pill">Minor Sad (6-4-1-5)</button>
                <button onClick={() => setDawProgression([1, 2, 5, 1])} className="prog-preset-pill">Jazz (1-2-5-1)</button>
              </div>

              {/* Diatonic Jam Pads for Key */}
              <div className="jam-pads-title-row">
                <span>Live Jam Pads (Click to audition & trigger acoustic strums):</span>
              </div>
              <div className="daw-guitar-jam-grid">
                {chords.map((chord, idx) => {
                  const isSelected = selectedChordIndex === idx;
                  const isJamming = activeChordJam === chord.degree;

                  return (
                    <button
                      key={chord.degree}
                      onClick={() => {
                        setSelectedChordIndex(idx);
                        handleQuickStrum(chord, 'down');
                      }}
                      className={`daw-guitar-jam-card ${isSelected ? 'active-jam' : ''} ${isJamming ? 'strum-anim' : ''}`}
                      style={{
                        '--pad-color': chord.color,
                        '--pad-glow': chord.glowColor
                      }}
                    >
                      <span className="jam-degree">{chord.degree} • {chord.roman}</span>
                      <span className="jam-name">{chord.chordName}</span>
                      <span className="jam-role">{chord.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRACK 3: ANALOG SUB & SYNTH BASS */}
            <div className="daw-track-card track-bass-card">
              <div className="track-card-header">
                <div className="track-info">
                  <div className="track-icon-badge bass-badge">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="track-title">Track 3: Analog Sub & Synth Bass</h3>
                    <span className="track-badge">Moog / 808 Style • Locked to Progression Root Notes</span>
                  </div>
                </div>

                {/* Bass Channel Controls */}
                <div className="track-actions">
                  <div className="channel-fader-group">
                    <span className="fader-label">VOL</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={trackVolumes.bass}
                      onChange={(e) => setTrackVolumes((v) => ({ ...v, bass: parseFloat(e.target.value) }))}
                      className="channel-mini-fader"
                      title="Bass Track Volume"
                    />
                  </div>

                  <div className="bass-tone-pill-group">
                    <button
                      onClick={() => setBassTone('sub')}
                      className={`tone-pill ${bassTone === 'sub' ? 'active' : ''}`}
                    >
                      808 Deep Sub
                    </button>
                    <button
                      onClick={() => setBassTone('moog')}
                      className={`tone-pill ${bassTone === 'moog' ? 'active' : ''}`}
                    >
                      Moog Punch
                    </button>
                  </div>

                  <button
                    onClick={() => toggleTrackSolo('bass')}
                    className={`channel-pill-btn solo ${trackSolos.bass ? 'active' : ''}`}
                    title="Solo Bass"
                  >
                    S
                  </button>
                  <button
                    onClick={() => toggleTrackMute('bass')}
                    className={`channel-pill-btn mute ${trackMutes.bass ? 'active' : ''}`}
                    title="Mute Bass"
                  >
                    M
                  </button>

                  <button
                    onClick={() => setBassEnabled(!bassEnabled)}
                    className={`channel-pill-btn ${bassEnabled ? 'active-power' : ''}`}
                    title="Enable or bypass bass synth track"
                  >
                    {bassEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="bass-track-preview-row">
                <span className="bass-status-tag">
                  {bassEnabled ? 'Synchronized with chord progression roots' : 'Bypass'}
                </span>
                <div className="bass-root-pills">
                  {dawProgression.map((deg, bIdx) => {
                    const c = chords.find((item) => item.degree === deg);
                    const isPlayingBar = isMasterPlaying && progressionStep === bIdx;
                    return (
                      <span 
                        key={bIdx} 
                        className={`bass-note-pill ${isPlayingBar ? 'active' : ''}`}
                      >
                        Bar {bIdx + 1}: {c ? c.rootNote || c.chordName : 'Root'}2
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TRACK 4: RECORDED MIXES & AUDIO TAKES SHELF */}
            <div className="daw-track-card track-recorder-card">
              <div className="track-card-header">
                <div className="track-info">
                  <div className="track-icon-badge record-badge">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h3 className="track-title">Master Recorded Audio Takes</h3>
                    <span className="track-badge">Real-Time Digital Audio Capture & Export</span>
                  </div>
                </div>

                <div className="track-actions">
                  <button
                    onClick={handleToggleRecording}
                    className={`live-rec-action-btn ${isRecording ? 'recording' : ''}`}
                  >
                    <Circle size={14} fill={isRecording ? '#ef4444' : 'currentColor'} />
                    <span>{isRecording ? 'Stop Recording' : 'New Take Record'}</span>
                  </button>
                </div>
              </div>

              {/* Takes List */}
              <div className="recorded-takes-shelf">
                {recordedTakes.length === 0 ? (
                  <div className="empty-takes-box">
                    <Radio size={28} className="text-muted" />
                    <p className="empty-takes-title">No Recorded Takes Yet</p>
                    <p className="empty-takes-desc">
                      Click the red <strong>Record Mix</strong> button in the transport bar above to record your beats, guitars, and chords into a real exportable audio track!
                    </p>
                  </div>
                ) : (
                  <div className="takes-list-grid">
                    {recordedTakes.map((take) => (
                      <div key={take.id} className="take-card">
                        <div className="take-card-meta">
                          <div className="take-title-row">
                            <span className="take-dot-indicator" />
                            <strong className="take-name">{take.name}</strong>
                          </div>
                          <span className="take-time-info">
                            {take.duration}s • Recorded at {take.timestamp}
                          </span>
                        </div>

                        {/* Built-in HTML5 Audio Player */}
                        <div className="take-audio-wrapper">
                          <audio 
                            src={take.url} 
                            controls 
                            className="take-audio-player"
                            onPlay={() => setCurrentlyPlayingTake(take.id)}
                            onPause={() => setCurrentlyPlayingTake(null)}
                          />
                        </div>

                        {/* Actions: Download Audio File & Delete */}
                        <div className="take-action-buttons">
                          <button
                            onClick={() => handleDownloadTake(take)}
                            className="take-download-btn"
                            title="Download Audio File (.webm)"
                          >
                            <Download size={14} /> Download Mix (.webm)
                          </button>

                          <button
                            onClick={() => handleDeleteTake(take.id)}
                            className="take-delete-btn"
                            title="Delete take"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sub-View Navigation Banner when in specialized expanded views */}
      {dawView !== 'console' && (
        <div className="daw-subview-banner">
          <div className="subview-breadcrumb">
            <span className="breadcrumb-root" onClick={() => setDawView('console')}>DAW Studio</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-current">
              {dawView === 'beats' && 'Beat Maker & Groovebox (16-Step Polyphonic)'}
              {dawView === 'guitar' && 'Acoustic Guitar Strummer & Harmonic Stage'}
              {dawView === 'metronome' && 'Precision Clock & Metronome'}
            </span>
          </div>
          <button
            onClick={() => setDawView('console')}
            className="return-to-console-btn"
          >
            <Layers size={14} /> Back to All-in-One Console View
          </button>
        </div>
      )}

      {/* VIEW 2: EXPANDED BEAT MAKER */}
      {dawView === 'beats' && (
        <div className="daw-nested-view">
          <BeatMaker currentKey={currentKey} />
        </div>
      )}

      {/* VIEW 3: EXPANDED GUITAR STRUMMER */}
      {dawView === 'guitar' && (
        <div className="daw-nested-view">
          <GuitarStrummer currentKey={currentKey} />
        </div>
      )}

      {/* VIEW 4: EXPANDED METRONOME */}
      {dawView === 'metronome' && (
        <div className="daw-nested-view">
          <Metronome />
        </div>
      )}
    </div>
  );
}
