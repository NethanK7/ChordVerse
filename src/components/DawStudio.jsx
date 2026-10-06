import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Sliders, 
  Clock, 
  Music, 
  Disc3, 
  Zap, 
  Sparkles, 
  Maximize2,
  Layers
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getChordsInKey, getGuitarChordVoicing } from '../utils/musicTheory';
import BeatMaker from './BeatMaker';
import GuitarStrummer from './GuitarStrummer';
import Metronome from './Metronome';

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
  const [masterBpm, setMasterBpm] = useState(100);
  const [isMasterPlaying, setIsMasterPlaying] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(25); // percentage
  const [activeChordJam, setActiveChordJam] = useState(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);

  // Synced 16-step playhead for DAW Console
  const [dawStep, setDawStep] = useState(0);

  // Quick DAW drum pattern
  const [dawKickSteps, setDawKickSteps] = useState([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
  const [dawSnareSteps, setDawSnareSteps] = useState([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
  const [dawHatSteps, setDawHatSteps] = useState([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);

  // Track Mute States
  const [muteDrums, setMuteDrums] = useState(false);
  const [muteGuitar, setMuteGuitar] = useState(false);
  const [metronomeClickInDaw, setMetronomeClickInDaw] = useState(false);

  // Chord Progression Arranger inside DAW (e.g. 1 - 5 - 6 - 4)
  const [dawProgression, setDawProgression] = useState([1, 5, 6, 4]);
  const [progressionStep, setProgressionStep] = useState(0);

  const chords = getChordsInKey(currentKey);

  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const kickRef = useRef(dawKickSteps);
  const snareRef = useRef(dawSnareSteps);
  const hatRef = useRef(dawHatSteps);
  const muteDrumsRef = useRef(muteDrums);
  const metronomeRef = useRef(metronomeClickInDaw);
  const progressionRef = useRef(dawProgression);
  const currentKeyRef = useRef(currentKey);

  useEffect(() => {
    kickRef.current = dawKickSteps;
    snareRef.current = dawSnareSteps;
    hatRef.current = dawHatSteps;
    muteDrumsRef.current = muteDrums;
    metronomeRef.current = metronomeClickInDaw;
    progressionRef.current = dawProgression;
    currentKeyRef.current = currentKey;
  }, [dawKickSteps, dawSnareSteps, dawHatSteps, muteDrums, metronomeClickInDaw, dawProgression, currentKey]);

  useEffect(() => {
    isPlayingRef.current = isMasterPlaying;
  }, [isMasterPlaying]);

  // Master Reverb control
  const handleReverbChange = (val) => {
    setReverbAmount(val);
    audio.setReverb(val / 100);
  };

  // Master DAW Transport Play/Stop
  const toggleMasterTransport = () => {
    if (isMasterPlaying) {
      stopMaster();
    } else {
      startMaster();
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
  };

  const runDawStep = () => {
    if (!isPlayingRef.current) return;
    const currentStep = stepRef.current;
    setDawStep(currentStep);

    // 1. Play Drums
    if (!muteDrumsRef.current) {
      if (kickRef.current[currentStep] === 1) audio.playDrum('kick', 0, 0.9);
      if (snareRef.current[currentStep] === 1) audio.playDrum('snare', 0, 0.85);
      if (hatRef.current[currentStep] === 1) audio.playDrum('hihat-closed', 0, 0.7);
    }

    // 2. Play Metronome tick if enabled in DAW
    if (metronomeRef.current && currentStep % 4 === 0) {
      const isAccent = currentStep === 0;
      audio.playMetronomeTick(isAccent, 'woodblock', 0, 0.7);
    }

    // 3. Play Chord progression (switches chord every 4 sixteenth steps = 1 quarter beat, or every 8 steps)
    if (currentStep % 4 === 0 && progressionRef.current.length > 0 && !muteGuitar) {
      const progIndex = Math.floor(currentStep / 4) % progressionRef.current.length;
      setProgressionStep(progIndex);
      const degree = progressionRef.current[progIndex];
      const chord = chords.find((c) => c.degree === degree);
      if (chord) {
        const voicing = getGuitarChordVoicing(chord.chordName, chord.quality, chord.triadNotes);
        audio.playGuitarStrum(voicing.soundingNotes, 'down', 0.026, 1.4, 'steel');
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
    };
  }, []);

  // Quick guitar strum
  const handleQuickStrum = (chord, direction = 'down') => {
    audio.init();
    setActiveChordJam(chord.degree);
    const voicing = getGuitarChordVoicing(chord.chordName, chord.quality, chord.triadNotes);
    audio.playGuitarStrum(voicing.soundingNotes, direction, 0.03, 2.2, 'steel');
    setTimeout(() => setActiveChordJam(null), 500);
  };

  return (
    <div className="daw-studio-page">
      {/* DAW Master Header & Transport Deck */}
      <div className="daw-master-header">
        <div className="daw-branding">
          <div className="daw-badge-icon">
            <Sliders size={20} className="text-emerald" />
          </div>
          <div>
            <div className="daw-title-row">
              <h1 className="daw-title">DAW Studio</h1>
              <span className="daw-version-tag">Pro Audio Workstation</span>
            </div>
            <p className="daw-subtitle">
              Unified digital audio workstation: 16-step beat machine, acoustic guitar physical model, precision metronome & chord arranger.
            </p>
          </div>
        </div>

        {/* DAW Sub-View Switcher (Console, Beats, Guitar, Metronome) */}
        <div className="daw-view-switcher">
          <button
            onClick={() => setDawView('console')}
            className={`daw-view-tab ${dawView === 'console' ? 'active' : ''}`}
          >
            <Layers size={16} /> All-in-One Console
          </button>
          <button
            onClick={() => setDawView('beats')}
            className={`daw-view-tab ${dawView === 'beats' ? 'active' : ''}`}
          >
            <Disc3 size={16} /> Beat Maker
          </button>
          <button
            onClick={() => setDawView('guitar')}
            className={`daw-view-tab ${dawView === 'guitar' ? 'active' : ''}`}
          >
            <Zap size={16} /> Guitar Strummer
          </button>
          <button
            onClick={() => setDawView('metronome')}
            className={`daw-view-tab ${dawView === 'metronome' ? 'active' : ''}`}
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

      {/* VIEW 1: FULL DAW ALL-IN-ONE CONSOLE */}
      {dawView === 'console' && (
        <>
          {/* Global DAW Master Transport Bar */}
          <div className="daw-transport-bar">
            {/* Play/Stop Transport */}
            <div className="transport-play-group">
              <button
                onClick={toggleMasterTransport}
                className={`daw-master-play-btn ${isMasterPlaying ? 'playing' : ''}`}
              >
                {isMasterPlaying ? (
                  <>
                    <Square size={18} fill="currentColor" /> Stop DAW
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" /> Play DAW Session
                  </>
                )}
              </button>

              <div className="daw-time-display">
                <span className="time-bar">BAR {Math.floor(dawStep / 4) + 1}</span>
                <span className="time-divider">:</span>
                <span className="time-step">{(dawStep % 4) + 1}</span>
              </div>
            </div>

            {/* Master Tempo (BPM) */}
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
              />
            </div>

            {/* Studio Reverb Space Control */}
            <div className="daw-fx-box">
              <div className="fx-label-row">
                <Sparkles size={14} className="text-purple" />
                <span>Studio Reverb: {reverbAmount}%</span>
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

            {/* Metronome Click Sync in DAW */}
            <div className="daw-quick-toggles">
              <button
                onClick={() => setMetronomeClickInDaw(!metronomeClickInDaw)}
                className={`daw-toggle-btn ${metronomeClickInDaw ? 'active' : ''}`}
                title="Play woodblock metronome click during playback"
              >
                <Clock size={15} /> Metronome: {metronomeClickInDaw ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setMuteDrums(!muteDrums)}
                className={`daw-toggle-btn ${muteDrums ? 'muted' : ''}`}
                title="Mute or unmute drums"
              >
                <Disc3 size={15} /> Drums: {muteDrums ? 'MUTED' : 'ON'}
              </button>

              <button
                onClick={() => setMuteGuitar(!muteGuitar)}
                className={`daw-toggle-btn ${muteGuitar ? 'muted' : ''}`}
                title="Mute or unmute acoustic guitar playback"
              >
                <Zap size={15} /> Guitar: {muteGuitar ? 'MUTED' : 'ON'}
              </button>
            </div>
          </div>

          <div className="daw-console-layout">
          {/* Track Rack 1: 16-Step Beat Machine Track */}
          <div className="daw-track-card">
            <div className="track-card-header">
              <div className="header-meta-box">
                <Disc3 size={18} className="text-emerald" />
                <h3>Track 1: Drum Machine (16-Step Grid)</h3>
                <span className="track-status-pill">{muteDrums ? 'MUTED' : 'ACTIVE'}</span>
              </div>
              <div className="track-header-actions">
                <button
                  onClick={() => setDawKickSteps([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0])}
                  className="quick-preset-link"
                >
                  Four-on-Floor
                </button>
                <button
                  onClick={() => {
                    setDawKickSteps([1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
                    setDawSnareSteps([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
                  }}
                  className="quick-preset-link"
                >
                  Lofi Beat
                </button>
                <button
                  onClick={() => setDawView('beats')}
                  className="open-full-btn"
                  title="Expand to full beat maker"
                >
                  <Maximize2 size={14} /> Full Drum Suite
                </button>
              </div>
            </div>

            {/* Quick 16-Step Trigger Grid */}
            <div className="daw-drum-matrix">
              {/* Kick Row */}
              <div className="drum-matrix-row">
                <div className="drum-row-label kick">KICK</div>
                <div className="drum-cells-strip">
                  {dawKickSteps.map((on, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const copy = [...dawKickSteps];
                        copy[idx] = on === 1 ? 0 : 1;
                        setDawKickSteps(copy);
                        if (!on) audio.playDrum('kick', 0, 0.9);
                      }}
                      className={`matrix-cell ${on ? 'cell-on kick' : ''} ${dawStep === idx ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Snare Row */}
              <div className="drum-matrix-row">
                <div className="drum-row-label snare">SNARE</div>
                <div className="drum-cells-strip">
                  {dawSnareSteps.map((on, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const copy = [...dawSnareSteps];
                        copy[idx] = on === 1 ? 0 : 1;
                        setDawSnareSteps(copy);
                        if (!on) audio.playDrum('snare', 0, 0.85);
                      }}
                      className={`matrix-cell ${on ? 'cell-on snare' : ''} ${dawStep === idx ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Hi-Hat Row */}
              <div className="drum-matrix-row">
                <div className="drum-row-label hat">HI-HAT</div>
                <div className="drum-cells-strip">
                  {dawHatSteps.map((on, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const copy = [...dawHatSteps];
                        copy[idx] = on === 1 ? 0 : 1;
                        setDawHatSteps(copy);
                        if (!on) audio.playDrum('hihat-closed', 0, 0.7);
                      }}
                      className={`matrix-cell ${on ? 'cell-on hat' : ''} ${dawStep === idx ? 'playhead' : ''} ${idx % 4 === 0 ? 'downbeat' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Track Rack 2: Acoustic Guitar & Chord Arranger */}
          <div className="daw-track-card">
            <div className="track-card-header">
              <div className="header-meta-box">
                <Zap size={18} className="text-amber" />
                <h3>Track 2: Acoustic Guitar & Chord Arranger</h3>
                <span className="track-status-pill">{muteGuitar ? 'MUTED' : 'ACTIVE'}</span>
              </div>
              <div className="track-header-actions">
                <button
                  onClick={() => setDawView('guitar')}
                  className="open-full-btn"
                >
                  <Maximize2 size={14} /> Full Guitar Lab
                </button>
              </div>
            </div>

            {/* DAW Chord Progression Bar */}
            <div className="daw-progression-bar">
              <span className="prog-label">Arranged Chord Loop:</span>
              <div className="prog-chords-list">
                {dawProgression.map((deg, i) => {
                  const chord = chords.find((c) => c.degree === deg);
                  const isActive = isMasterPlaying && progressionStep === i;
                  return (
                    <div
                      key={i}
                      className={`prog-chord-badge ${isActive ? 'active-pulse' : ''}`}
                      style={{
                        '--prog-color': chord?.color || '#3b82f6'
                      }}
                    >
                      <span className="badge-deg">{deg}</span>
                      <span className="badge-name">{chord?.chordName}</span>
                    </div>
                  );
                })}
              </div>

              <div className="prog-preset-links">
                <button onClick={() => setDawProgression([1, 5, 6, 4])} className="prog-preset-btn">Pop (1-5-6-4)</button>
                <button onClick={() => setDawProgression([1, 4, 5, 1])} className="prog-preset-btn">Classic (1-4-5-1)</button>
                <button onClick={() => setDawProgression([6, 4, 1, 5])} className="prog-preset-btn">Minor (6-4-1-5)</button>
                <button onClick={() => setDawProgression([1, 2, 5, 1])} className="prog-preset-btn">Jazz (1-2-5-1)</button>
              </div>
            </div>

            {/* Live Interactive Guitar Strum Pads for Key of currentKey */}
            <div className="daw-guitar-jam-grid">
              {chords.map((chord, idx) => {
                const isSelected = selectedChordIndex === idx;
                const isStrumming = activeChordJam === chord.degree;

                return (
                  <div
                    key={chord.degree}
                    className={`daw-guitar-pad ${isSelected ? 'selected' : ''} ${isStrumming ? 'strumming' : ''}`}
                    style={{
                      '--chord-color': chord.color,
                      '--chord-glow': chord.glowColor
                    }}
                    onClick={() => {
                      setSelectedChordIndex(idx);
                      handleQuickStrum(chord, 'down');
                    }}
                  >
                    <div className="pad-top-row">
                      <span className="deg-pill">{chord.degree}</span>
                      <span className="roman-pill">{chord.roman}</span>
                    </div>
                    <div className="pad-chord-name">{chord.chordName}</div>
                    <div className="pad-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickStrum(chord, 'down');
                        }}
                        className="quick-strum-mini down"
                        title="Downstrum"
                      >
                        ↓ Down
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickStrum(chord, 'up');
                        }}
                        className="quick-strum-mini up"
                        title="Upstrum"
                      >
                        ↑ Up
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track Rack 3: Precision Sync Metronome Strip */}
          <div className="daw-metronome-strip-card">
            <div className="strip-left">
              <Clock size={20} className="text-emerald" />
              <div>
                <h4 className="strip-title">Track 3: Master Clock & Metronome</h4>
                <p className="strip-sub">Precision zero-drift timing synchronized with DAW session.</p>
              </div>
            </div>

            <div className="strip-center-leds">
              {Array.from({ length: 4 }).map((_, beatIdx) => {
                const isBeatActive = isMasterPlaying && Math.floor(dawStep / 4) === beatIdx;
                return (
                  <div
                    key={beatIdx}
                    className={`daw-beat-led ${isBeatActive ? 'active' : ''} ${beatIdx === 0 ? 'accent' : ''}`}
                  >
                    Beat {beatIdx + 1}
                  </div>
                );
              })}
            </div>

            <div className="strip-right">
              <button
                onClick={() => setDawView('metronome')}
                className="open-full-btn"
              >
                <Maximize2 size={14} /> Open Full Metronome
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Sub-View Quick Banner when in expanded single-instrument views */}
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
