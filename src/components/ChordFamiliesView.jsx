import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Compass, 
  Flame, 
  Play, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getChordsInKey, CHORD_FAMILIES } from '../utils/musicTheory';

export default function ChordFamiliesView({ currentKey, setActiveTab }) {
  const chords = getChordsInKey(currentKey);
  const [isPlayingCycle, setIsPlayingCycle] = useState(false);
  const [activeCycleStep, setActiveCycleStep] = useState(null);

  // Group chords by family
  const tonicChords = chords.filter((c) => c.familyKey === 'tonic');
  const subdomChords = chords.filter((c) => c.familyKey === 'subdominant');
  const dominantChords = chords.filter((c) => c.familyKey === 'dominant');

  const playSingleChord = (chord) => {
    audio.playChord(chord.triadNotes, 'strum', 1.8, 4);
  };

  // Play a full harmonic sequence (Home -> Journey -> Tension -> Resolution)
  const playHarmonicJourney = (degrees = [1, 4, 5, 1], label = 'Classic Journey') => {
    if (isPlayingCycle) return;
    setIsPlayingCycle(true);
    audio.init();

    const sequence = degrees.map((deg) => chords.find((c) => c.degree === deg));

    sequence.forEach((chord, i) => {
      setTimeout(() => {
        setActiveCycleStep(chord.degree);
        audio.playChord(chord.triadNotes, 'strum', 1.6, 4);
      }, i * 1400);
    });

    setTimeout(() => {
      setIsPlayingCycle(false);
      setActiveCycleStep(null);
    }, sequence.length * 1400 + 400);
  };

  return (
    <div className="chord-families-page">
      {/* Header */}
      <div className="section-header">
        <span className="section-badge">Harmonic Function</span>
        <h1 className="section-title">
          The 3 Chord Families of <span className="key-highlight">{currentKey} Major</span>
        </h1>
        <p className="section-subtitle">
          Chords aren't random. Every chord belongs to an emotional family that dictates musical storytelling: 
          <strong> Home (Tonic)</strong>, <strong>Journey (Subdominant)</strong>, and <strong>Tension (Dominant)</strong>.
        </p>
      </div>

      {/* Interactive Harmonic Journey Banner */}
      <div className="journey-interactive-board">
        <div className="board-top-row">
          <div className="board-title-group">
            <span className="board-tag">Interactive Audio Story</span>
            <h2>Experience The Universal Harmonic Cycle</h2>
            <p>Listen to how music travels from stability, to adventure, to climax, and back home:</p>
          </div>

          <div className="board-controls">
            <button
              onClick={() => playHarmonicJourney([1, 4, 5, 1], 'Classic (1 - 4 - 5 - 1)')}
              disabled={isPlayingCycle}
              className="primary-glow-btn"
            >
              <Play size={18} fill="currentColor" /> Play Classic Cycle (1 ➔ 4 ➔ 5 ➔ 1)
            </button>
            <button
              onClick={() => playHarmonicJourney([1, 2, 5, 1], 'Jazz (1 - 2 - 5 - 1)')}
              disabled={isPlayingCycle}
              className="secondary-glass-btn"
            >
              <Sparkles size={18} /> Jazz Cadence (1 ➔ 2 ➔ 5 ➔ 1)
            </button>
            <button
              onClick={() => playHarmonicJourney([6, 4, 5, 6], 'Minor (6 - 4 - 5 - 6)')}
              disabled={isPlayingCycle}
              className="secondary-glass-btn"
            >
              <HeartHandshake size={18} /> Emotional Minor (6 ➔ 4 ➔ 5 ➔ 6)
            </button>
          </div>
        </div>

        {/* Visual Map of the 4 Stages */}
        <div className="journey-visual-map">
          {/* Stage 1: Tonic Home */}
          <div className={`stage-card tonic-stage ${activeCycleStep === 1 || activeCycleStep === 6 ? 'active-pulse' : ''}`}>
            <div className="stage-header">
              <span className="stage-step-num">Step 1</span>
              <span className="stage-family-badge">Tonic Family</span>
            </div>
            <div className="stage-icon-circle">
              🏡
            </div>
            <h3 className="stage-title">Home Base</h3>
            <div className="stage-chord-pill">
              {chords[0].chordName} (Chord 1)
            </div>
            <p className="stage-desc">
              Completely relaxed and grounded. The musical origin.
            </p>
          </div>

          <div className="flow-indicator">
            <ArrowRight size={28} className="arrow-pulse" />
          </div>

          {/* Stage 2: Subdominant Journey */}
          <div className={`stage-card subdominant-stage ${activeCycleStep === 4 || activeCycleStep === 2 ? 'active-pulse' : ''}`}>
            <div className="stage-header">
              <span className="stage-step-num">Step 2</span>
              <span className="stage-family-badge">Subdominant</span>
            </div>
            <div className="stage-icon-circle">
              🚗
            </div>
            <h3 className="stage-title">The Departure</h3>
            <div className="stage-chord-pill">
              {chords[3].chordName} (Chord 4)
            </div>
            <p className="stage-desc">
              Steps away from home. Adds adventure, curiosity, and forward momentum.
            </p>
          </div>

          <div className="flow-indicator">
            <ArrowRight size={28} className="arrow-pulse" />
          </div>

          {/* Stage 3: Dominant Tension */}
          <div className={`stage-card dominant-stage ${activeCycleStep === 5 || activeCycleStep === 7 ? 'active-pulse' : ''}`}>
            <div className="stage-header">
              <span className="stage-step-num">Step 3</span>
              <span className="stage-family-badge">Dominant</span>
            </div>
            <div className="stage-icon-circle">
              🎢
            </div>
            <h3 className="stage-title">High Tension</h3>
            <div className="stage-chord-pill">
              {chords[4].chordName} (Chord 5)
            </div>
            <p className="stage-desc">
              Maximum suspense! The leading tone magnetically pulls back to 1.
            </p>
          </div>

          <div className="flow-indicator">
            <ArrowRight size={28} className="arrow-pulse" />
          </div>

          {/* Stage 4: Resolution */}
          <div className={`stage-card resolution-stage ${activeCycleStep === 1 ? 'active-pulse' : ''}`}>
            <div className="stage-header">
              <span className="stage-step-num">Step 4</span>
              <span className="stage-family-badge">Tonic Resolution</span>
            </div>
            <div className="stage-icon-circle">
              ✨
            </div>
            <h3 className="stage-title">Safe Return</h3>
            <div className="stage-chord-pill">
              {chords[0].chordName} (Chord 1)
            </div>
            <p className="stage-desc">
              Sweet resolution! Dopamine release as tension evaporates.
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Families Detailed Columns */}
      <div className="families-columns-container">
        {/* 1. TONIC FAMILY */}
        <div className="family-column tonic-col">
          <div className="column-header">
            <div className="col-icon tonic-bg">
              <HeartHandshake size={24} />
            </div>
            <div>
              <span className="col-family-badge">Tonic Family (Home)</span>
              <h2 className="col-title">Chords 1, 6, and 3</h2>
            </div>
          </div>

          <p className="col-summary">
            The Tonic family represents stability and rest. In any song, landing on these chords provides emotional relief and conclusion.
          </p>

          <div className="family-chords-list">
            {tonicChords.map((chord) => (
              <div key={chord.degree} className="family-chord-item">
                <div className="item-meta">
                  <span className="item-num" style={{ background: chord.color }}>
                    {chord.degree}
                  </span>
                  <div>
                    <h4 className="item-name">{chord.chordName} ({chord.roman})</h4>
                    <span className="item-quality">{chord.quality} • {chord.name}</span>
                  </div>
                </div>

                <div className="item-role-snippet">
                  {chord.degree === 1 && '⭐ True Home. The center of gravity.'}
                  {chord.degree === 6 && '💔 Relative minor. Emotional, sad substitute for 1.'}
                  {chord.degree === 3 && '☁️ Mediant. Gentle, dreamy, peaceful substitute.'}
                </div>

                <button
                  onClick={() => playSingleChord(chord)}
                  className="mini-play-btn"
                  title={`Play ${chord.chordName}`}
                >
                  <Volume2 size={16} /> Listen
                </button>
              </div>
            ))}
          </div>

          <div className="pro-tip-box">
            <Sparkles size={16} className="text-emerald" />
            <span>
              <strong>Songwriter Secret:</strong> If your chorus feels too cheerful on chord 1, swap it for chord 6! It will instantly give the melody a powerful emotional pang.
            </span>
          </div>
        </div>

        {/* 2. SUBDOMINANT FAMILY */}
        <div className="family-column subdominant-col">
          <div className="column-header">
            <div className="col-icon subdom-bg">
              <Compass size={24} />
            </div>
            <div>
              <span className="col-family-badge">Subdominant (Journey)</span>
              <h2 className="col-title">Chords 4 and 2</h2>
            </div>
          </div>

          <p className="col-summary">
            The Subdominant family moves the story away from home. They provide forward momentum and set the runway for the dramatic dominant tension.
          </p>

          <div className="family-chords-list">
            {subdomChords.map((chord) => (
              <div key={chord.degree} className="family-chord-item">
                <div className="item-meta">
                  <span className="item-num" style={{ background: chord.color }}>
                    {chord.degree}
                  </span>
                  <div>
                    <h4 className="item-name">{chord.chordName} ({chord.roman})</h4>
                    <span className="item-quality">{chord.quality} • {chord.name}</span>
                  </div>
                </div>

                <div className="item-role-snippet">
                  {chord.degree === 4 && '🚀 Open road! Uplifting departure from home.'}
                  {chord.degree === 2 && '🎷 Smooth stepping stone. Pre-dominant jazz favorite.'}
                </div>

                <button
                  onClick={() => playSingleChord(chord)}
                  className="mini-play-btn"
                  title={`Play ${chord.chordName}`}
                >
                  <Volume2 size={16} /> Listen
                </button>
              </div>
            ))}
          </div>

          <div className="pro-tip-box">
            <Sparkles size={16} className="text-blue" />
            <span>
              <strong>The Plagal "Amen" Cadence:</strong> Moving directly from chord 4 to 1 (IV ➔ I) gives the peaceful, sacred "Amen" finish heard in church music and hymns.
            </span>
          </div>
        </div>

        {/* 3. DOMINANT FAMILY */}
        <div className="family-column dominant-col">
          <div className="column-header">
            <div className="col-icon dom-bg">
              <Flame size={24} />
            </div>
            <div>
              <span className="col-family-badge">Dominant (Tension)</span>
              <h2 className="col-title">Chords 5 and 7</h2>
            </div>
          </div>

          <p className="col-summary">
            The climax of harmony! Dominant chords are charged with electric urgency. They contain the Leading Tone that wants to snap back to the Tonic.
          </p>

          <div className="family-chords-list">
            {dominantChords.map((chord) => (
              <div key={chord.degree} className="family-chord-item">
                <div className="item-meta">
                  <span className="item-num" style={{ background: chord.color }}>
                    {chord.degree}
                  </span>
                  <div>
                    <h4 className="item-name">{chord.chordName} ({chord.roman})</h4>
                    <span className="item-quality">{chord.quality} • {chord.name}</span>
                  </div>
                </div>

                <div className="item-role-snippet">
                  {chord.degree === 5 && '⚡ The Great Pull. The single most tense diatonic chord.'}
                  {chord.degree === 7 && '👻 The Tritone Monster. Diminished, unstable, wild tension.'}
                </div>

                <button
                  onClick={() => playSingleChord(chord)}
                  className="mini-play-btn"
                  title={`Play ${chord.chordName}`}
                >
                  <Volume2 size={16} /> Listen
                </button>
              </div>
            ))}
          </div>

          <div className="pro-tip-box">
            <Sparkles size={16} className="text-amber" />
            <span>
              <strong>The Perfect Cadence:</strong> Moving from chord 5 to chord 1 (V ➔ I) is the strongest conclusion in all of Western music. 95% of pop anthems end on this!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
