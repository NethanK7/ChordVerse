import React from 'react';
import { 
  Play, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  HeartHandshake,
  Flame,
  Volume2,
  Lightbulb,
  Sliders
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getScaleNotes, getChordsInKey } from '../utils/musicTheory';

export default function TheoryLesson({ currentKey, setActiveTab }) {
  const scaleNotes = getScaleNotes(currentKey);
  const chords = getChordsInKey(currentKey);

  const handlePlayScale = () => {
    audio.playScale(scaleNotes, 0.25, 4);
  };

  const handlePlayChord = (notes) => {
    audio.playChord(notes, 'strum', 1.8, 4);
  };

  return (
    <div className="theory-page">
      {/* Hero Banner */}
      <section className="theory-hero">
        <div className="hero-badge">
          <Sparkles size={16} /> Music Theory Demystified
        </div>
        <h1 className="hero-title">
          How Music <span className="text-gradient">Actually Works</span>
        </h1>
        <p className="hero-subtitle">
          Discover why pros use numbers <strong>1 through 7</strong> instead of note letters, how all 7 chords are born from a single scale, and how the <strong>3 harmonic families</strong> control emotion in every hit song.
        </p>

        <div className="hero-action-row">
          <button onClick={handlePlayScale} className="primary-glow-btn">
            <Play size={18} fill="currentColor" /> Listen to {currentKey} Major Scale
          </button>
          <button onClick={() => setActiveTab('chords')} className="secondary-glass-btn">
            Explore The 7 Chords <ArrowRight size={18} />
          </button>
          <button onClick={() => setActiveTab('daw')} className="hero-daw-pill-btn" title="Open DAW Studio Workstation">
            <Sliders size={17} className="text-emerald" /> Produce in DAW Studio
          </button>
        </div>
      </section>

      {/* Part 1: Why Numbers (1-7)? */}
      <section className="theory-card">
        <div className="card-header-row">
          <div className="step-pill">Chapter 01</div>
          <h2 className="card-title">Why Numbers (1 to 7) Beat Letter Names</h2>
        </div>

        <div className="card-body-grid">
          <div className="card-text">
            <p>
              Imagine walking into a studio where a singer says: <em>"My voice is tired, can we take this song down two steps?"</em>
            </p>
            <p>
              If you learned songs as <strong>"C - G - Am - F"</strong>, your brain melts trying to calculate every single letter note in real time.
            </p>
            <p>
              But if you see the song as <strong>1 - 5 - 6 - 4</strong>, you only need to know one thing: <strong>The pattern never changes!</strong>
            </p>

            <div className="benefit-list">
              <div className="benefit-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span><strong>Instant Transposition:</strong> Change keys in a millisecond for any vocalist or instrument.</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span><strong>Ear Training Superpower:</strong> You begin hearing chord "roles" and feelings rather than isolated pitches.</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span><strong>Studio Universal Language:</strong> Used across Nashville, jazz charts, pop songwriting, and movie scoring.</span>
              </div>
            </div>
          </div>

          <div className="transposition-box">
            <div className="transposition-header">
              <Zap size={18} className="text-amber" /> The Same "1 - 5 - 6 - 4" Across Keys
            </div>
            <div className="transposition-table">
              <div className="trans-row header-row">
                <span>Key</span>
                <span className="deg-col deg-1">1 (I)</span>
                <span className="deg-col deg-5">5 (V)</span>
                <span className="deg-col deg-6">6 (vi)</span>
                <span className="deg-col deg-4">4 (IV)</span>
              </div>
              <div className="trans-row highlight-row">
                <span className="key-name">C Major</span>
                <span className="chord-badge deg-1">C</span>
                <span className="chord-badge deg-5">G</span>
                <span className="chord-badge deg-6">Am</span>
                <span className="chord-badge deg-4">F</span>
              </div>
              <div className="trans-row">
                <span className="key-name">G Major</span>
                <span className="chord-badge deg-1">G</span>
                <span className="chord-badge deg-5">D</span>
                <span className="chord-badge deg-6">Em</span>
                <span className="chord-badge deg-4">C</span>
              </div>
              <div className="trans-row">
                <span className="key-name">D Major</span>
                <span className="chord-badge deg-1">D</span>
                <span className="chord-badge deg-5">A</span>
                <span className="chord-badge deg-6">Bm</span>
                <span className="chord-badge deg-4">G</span>
              </div>
            </div>
            <p className="trans-footnote">
              *The Roman numerals and feelings are 100% identical. Only the pitch moves!
            </p>
          </div>
        </div>
      </section>

      {/* Part 2: How the 7 Chords Are Born */}
      <section className="theory-card">
        <div className="card-header-row">
          <div className="step-pill">Chapter 02</div>
          <h2 className="card-title">How 7 Chords Are Born: "Stacking in 3rds"</h2>
        </div>

        <p className="section-desc">
          You don't memorize chords out of thin air. In every key, chords are created by taking the scale and <strong>skipping every other note</strong> (stacking in 3rds).
        </p>

        {/* Scale Degrees Interactive Strip */}
        <div className="scale-strip-container">
          <div className="strip-title">
            Scale Degrees of {currentKey} Major:
          </div>
          <div className="scale-strip">
            {scaleNotes.map((note, idx) => {
              const chord = chords[idx];
              return (
                <div key={idx} className="scale-step-node" style={{ borderColor: chord.color }}>
                  <span className="step-number" style={{ background: chord.color }}>
                    {idx + 1}
                  </span>
                  <span className="step-note">{note}</span>
                  <span className="step-roman">{chord.roman}</span>
                  <span className="step-quality">{chord.quality}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Universal Formula */}
        <div className="formula-banner">
          <div className="formula-title">The Universal Major Scale Rule (Never changes!):</div>
          <div className="formula-chips">
            <span className="chip major">1: Major</span>
            <span className="chip minor">2: minor</span>
            <span className="chip minor">3: minor</span>
            <span className="chip major">4: Major</span>
            <span className="chip major">5: Major</span>
            <span className="chip minor">6: minor</span>
            <span className="chip dim">7: diminished</span>
          </div>
          <p className="formula-mnemonic">
            <Lightbulb size={16} className="inline-icon text-amber" /> <strong>Mnemonic Trick:</strong> 1, 4, 5 are always <strong>MAJOR</strong>. 2, 3, 6 are always <strong>MINOR</strong>. 7 is <strong>DIMINISHED</strong>.
          </p>
        </div>

        {/* Triad Stacking Example */}
        <div className="triad-explanation">
          <div className="triad-box">
            <h3>How Chord 1 is formed ({chords[0].chordName})</h3>
            <p>Start on scale degree <strong>1 ({scaleNotes[0]})</strong>, skip 2, take <strong>3 ({scaleNotes[2]})</strong>, skip 4, take <strong>5 ({scaleNotes[4]})</strong>.</p>
            <div className="notes-pill-group">
              <span className="note-pill root">{scaleNotes[0]} (Root)</span>
              <span className="plus">+</span>
              <span className="note-pill third">{scaleNotes[2]} (3rd)</span>
              <span className="plus">+</span>
              <span className="note-pill fifth">{scaleNotes[4]} (5th)</span>
              <span className="equals">=</span>
              <button 
                onClick={() => handlePlayChord(chords[0].triadNotes)}
                className="play-chord-pill"
                title="Hear Chord 1"
              >
                <Volume2 size={16} /> {chords[0].chordName} (Major)
              </button>
            </div>
          </div>

          <div className="triad-box">
            <h3>How Chord 2 is formed ({chords[1].chordName})</h3>
            <p>Start on scale degree <strong>2 ({scaleNotes[1]})</strong>, skip 3, take <strong>4 ({scaleNotes[3]})</strong>, skip 5, take <strong>6 ({scaleNotes[5]})</strong>.</p>
            <div className="notes-pill-group">
              <span className="note-pill root">{scaleNotes[1]} (Root)</span>
              <span className="plus">+</span>
              <span className="note-pill third">{scaleNotes[3]} (3rd)</span>
              <span className="plus">+</span>
              <span className="note-pill fifth">{scaleNotes[5]} (5th)</span>
              <span className="equals">=</span>
              <button 
                onClick={() => handlePlayChord(chords[1].triadNotes)}
                className="play-chord-pill minor"
                title="Hear Chord 2"
              >
                <Volume2 size={16} /> {chords[1].chordName} (minor)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Part 3: The 3 Harmonic Families */}
      <section className="theory-card">
        <div className="card-header-row">
          <div className="step-pill">Chapter 03</div>
          <h2 className="card-title">The 3 Chord Families: Music's Emotional Engine</h2>
        </div>

        <p className="section-desc">
          Every chord in the 1-7 system belongs to one of 3 emotional families. Understanding this is how producers write songs that feel like an unforgettable emotional story.
        </p>

        <div className="families-grid">
          {/* Tonic Family */}
          <div className="family-card tonic-card">
            <div className="family-badge">
              <HeartHandshake size={18} /> Home & Stability
            </div>
            <h3 className="family-name">Tonic Family</h3>
            <div className="family-chords-row">
              <span className="f-chord">1 (I)</span>
              <span className="f-chord">6 (vi)</span>
              <span className="f-chord">3 (iii)</span>
            </div>
            <p className="family-desc">
              Feels grounded, peaceful, and resolved. Chord 1 is the true home; Chord 6 is the bittersweet emotional home (relative minor).
            </p>
            <div className="family-mood">
              <strong>Emotion:</strong> "Ahhh, I'm finally safe at home."
            </div>
          </div>

          {/* Subdominant Family */}
          <div className="family-card subdominant-card">
            <div className="family-badge">
              <Compass size={18} /> Journey & Departure
            </div>
            <h3 className="family-name">Subdominant Family</h3>
            <div className="family-chords-row">
              <span className="f-chord">4 (IV)</span>
              <span className="f-chord">2 (ii)</span>
            </div>
            <p className="family-desc">
              Pushes outward into the world. Builds momentum, curiosity, and steps away from the comfort of home.
            </p>
            <div className="family-mood">
              <strong>Emotion:</strong> "Packing our bags, starting the road trip."
            </div>
          </div>

          {/* Dominant Family */}
          <div className="family-card dominant-card">
            <div className="family-badge">
              <Flame size={18} /> Tension & Climax
            </div>
            <h3 className="family-name">Dominant Family</h3>
            <div className="family-chords-row">
              <span className="f-chord">5 (V)</span>
              <span className="f-chord">7 (vii°)</span>
            </div>
            <p className="family-desc">
              Electrifying suspense! These chords contain the "Leading Tone" (scale degree 7) which urgently screams to resolve back to 1.
            </p>
            <div className="family-mood">
              <strong>Emotion:</strong> "At the top of the rollercoaster right before the drop!"
            </div>
          </div>
        </div>

        {/* Narrative Flow Diagram */}
        <div className="narrative-flow">
          <div className="flow-step tonic">
            <span className="flow-label">HOME</span>
            <span className="flow-degree">1 (I)</span>
          </div>
          <div className="flow-arrow">
            <ArrowRight size={14} className="inline-icon" /> Leaves home <ArrowRight size={14} className="inline-icon" />
          </div>
          <div className="flow-step subdom">
            <span className="flow-label">JOURNEY</span>
            <span className="flow-degree">4 (IV) / 2 (ii)</span>
          </div>
          <div className="flow-arrow">
            <ArrowRight size={14} className="inline-icon" /> Builds tension <ArrowRight size={14} className="inline-icon" />
          </div>
          <div className="flow-step dom">
            <span className="flow-label">TENSION</span>
            <span className="flow-degree">5 (V) / 7 (vii°)</span>
          </div>
          <div className="flow-arrow">
            <ArrowRight size={14} className="inline-icon" /> Magnetic pull back <ArrowRight size={14} className="inline-icon" />
          </div>
          <div className="flow-step tonic">
            <span className="flow-label">RESOLVE</span>
            <span className="flow-degree">1 (I)</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA to Chords Explorer & DAW Studio */}
      <section className="theory-cta">
        <h2>Ready to Put Theory Into Practice?</h2>
        <p>Interactive sounds, individual chord dissections, or jump straight into beat-making.</p>
        <div className="theory-cta-buttons">
          <button onClick={() => setActiveTab('chords')} className="primary-glow-btn large">
            Jump to The 7 Chords Explorer <ArrowRight size={20} />
          </button>
          <button onClick={() => setActiveTab('daw')} className="secondary-glass-btn large daw-cta-accent">
            <Sliders size={20} className="text-emerald" /> Produce in DAW Studio
          </button>
        </div>
      </section>
    </div>
  );
}
