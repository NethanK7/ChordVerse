import React, { useState } from 'react';
import { 
  Play, 
  Volume2, 
  Music, 
  Info, 
  Sparkles, 
  Disc,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getChordsInKey, getScaleNotes } from '../utils/musicTheory';
import InteractivePiano from './InteractivePiano';

export default function ChordsExplorer({ currentKey, setActiveTab }) {
  const chords = getChordsInKey(currentKey);
  const scaleNotes = getScaleNotes(currentKey);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const [voicingMode, setVoicingMode] = useState('strum'); // 'strum' | 'arpeggio' | 'block'

  const selectedChord = chords[selectedChordIndex];

  const handlePlayChord = (chord, mode = voicingMode) => {
    audio.playChord(chord.triadNotes, mode, 2.0, 4);
  };

  const handlePlaySingleNote = (note, e) => {
    e.stopPropagation();
    audio.playNote(`${note}4`, 1.2, 0, 0.85);
  };

  return (
    <div className="chords-explorer-page">
      {/* Header */}
      <div className="section-header">
        <div className="header-meta">
          <span className="section-badge">Diatonic Explorer</span>
          <h1 className="section-title">The 7 Diatonic Chords of <span className="key-highlight">{currentKey} Major</span></h1>
          <p className="section-subtitle">
            Every chord has a unique number (1 to 7), a Roman numeral, and an emotional personality. Click any chord card to hear it and explore its anatomy.
          </p>
        </div>

        {/* Voicing Mode Selector */}
        <div className="voicing-control-box">
          <span className="control-label">Voicing Style:</span>
          <div className="btn-group">
            <button 
              className={`segmented-btn ${voicingMode === 'strum' ? 'active' : ''}`}
              onClick={() => setVoicingMode('strum')}
            >
              Strum
            </button>
            <button 
              className={`segmented-btn ${voicingMode === 'arpeggio' ? 'active' : ''}`}
              onClick={() => setVoicingMode('arpeggio')}
            >
              Arpeggio
            </button>
            <button 
              className={`segmented-btn ${voicingMode === 'block' ? 'active' : ''}`}
              onClick={() => setVoicingMode('block')}
            >
              Block
            </button>
          </div>
        </div>
      </div>

      {/* 7 Chord Grid Cards */}
      <div className="chords-grid">
        {chords.map((chord, idx) => {
          const isSelected = idx === selectedChordIndex;
          return (
            <div
              key={chord.degree}
              className={`chord-card ${isSelected ? 'selected' : ''}`}
              style={{
                '--chord-color': chord.color,
                '--chord-glow': chord.glowColor,
                '--chord-bg': chord.accentBg
              }}
              onClick={() => {
                setSelectedChordIndex(idx);
                handlePlayChord(chord);
              }}
            >
              {/* Card Top: Number & Roman */}
              <div className="chord-card-top">
                <div className="degree-number-badge">
                  {chord.degree}
                </div>
                <div className="roman-numeral-badge">
                  {chord.roman}
                </div>
              </div>

              {/* Chord Name & Quality */}
              <div className="chord-identity">
                <h3 className="chord-name">{chord.chordName}</h3>
                <span className="chord-quality-pill">
                  {chord.quality}
                </span>
              </div>

              {/* Notes Pill Row (Clickable) */}
              <div className="chord-notes-row" title="Click any note to hear individual pitch">
                {chord.triadNotes.map((note, nIdx) => (
                  <button
                    key={nIdx}
                    className="single-note-chip"
                    onClick={(e) => handlePlaySingleNote(note, e)}
                    title={`Hear ${note}`}
                  >
                    {note}
                  </button>
                ))}
              </div>

              {/* Family Tag */}
              <div className="chord-family-tag">
                {chord.family.split(' ')[0]}
              </div>

              {/* Play Chord Action */}
              <button
                className="chord-play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChordIndex(idx);
                  handlePlayChord(chord);
                }}
                aria-label={`Play ${chord.chordName}`}
              >
                <Play size={16} fill="currentColor" /> Play Chord
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Chord Deep-Dive Inspector */}
      {selectedChord && (
        <section className="chord-inspector-card" style={{ borderColor: selectedChord.color }}>
          <div className="inspector-grid">
            <div className="inspector-left">
              <div className="inspector-badge-row">
                <span className="big-degree-badge" style={{ background: selectedChord.color }}>
                  Degree {selectedChord.degree}
                </span>
                <span className="big-roman-badge">
                  Roman: {selectedChord.roman}
                </span>
                <span className="family-status-badge">
                  {selectedChord.family}
                </span>
              </div>

              <h2 className="inspector-title">
                {selectedChord.fullName} ({selectedChord.chordName})
              </h2>

              <p className="inspector-desc">
                {selectedChord.description}
              </p>

              <div className="inspector-attributes">
                <div className="attr-item">
                  <span className="attr-label">Emotional Mood:</span>
                  <span className="attr-val highlight">{selectedChord.mood}</span>
                </div>
                <div className="attr-item">
                  <span className="attr-label">Harmonic Role:</span>
                  <span className="attr-val">{selectedChord.role}</span>
                </div>
                <div className="attr-item">
                  <span className="attr-label">Triad Notes (1-3-5):</span>
                  <div className="attr-notes">
                    {selectedChord.triadNotes.map((n, i) => (
                      <button
                        key={i}
                        className="note-btn-large"
                        onClick={(e) => handlePlaySingleNote(n, e)}
                      >
                        <Volume2 size={14} /> {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="inspector-actions">
                <button
                  className="primary-glow-btn"
                  onClick={() => handlePlayChord(selectedChord, 'strum')}
                >
                  <Play size={18} fill="currentColor" /> Strum {selectedChord.chordName}
                </button>
                <button
                  className="secondary-glass-btn"
                  onClick={() => handlePlayChord(selectedChord, 'arpeggio')}
                >
                  <Music size={18} /> Arpeggiate
                </button>
              </div>
            </div>

            {/* Right: Piano visualizer highlighting this chord */}
            <div className="inspector-right">
              <div className="inspector-piano-wrapper">
                <InteractivePiano
                  activeNotes={selectedChord.triadNotes}
                  currentKey={currentKey}
                  scaleNotes={scaleNotes}
                />
              </div>

              <div className="solfege-box">
                <span className="solfege-title">Solfège Reference:</span>
                <span className="solfege-val">{selectedChord.solfege}</span>
                <span className="solfege-hint">
                  In movable-Do solfège, degree {selectedChord.degree} corresponds to singing "{selectedChord.solfege}".
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom bridge to progression playground */}
      <div className="explorer-footer-banner">
        <div className="footer-banner-text">
          <h3>Combine Chords Into Real Songs</h3>
          <p>Now that you know chords 1 through 7, hear how they string together in hit tracks!</p>
        </div>
        <button onClick={() => setActiveTab('progressions')} className="primary-glow-btn">
          Open Progression Lab <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
