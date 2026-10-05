import React, { useState, useEffect } from 'react';
import { audio } from '../utils/audio';
import { getNoteIndex, CHROMATIC_NOTES } from '../utils/musicTheory';

// 2-Octave piano layout (C4 to B5)
const PIANO_KEYS = [
  // Octave 4
  { note: 'C', octave: 4, isBlack: false },
  { note: 'C#', octave: 4, isBlack: true, flatName: 'Db' },
  { note: 'D', octave: 4, isBlack: false },
  { note: 'D#', octave: 4, isBlack: true, flatName: 'Eb' },
  { note: 'E', octave: 4, isBlack: false },
  { note: 'F', octave: 4, isBlack: false },
  { note: 'F#', octave: 4, isBlack: true, flatName: 'Gb' },
  { note: 'G', octave: 4, isBlack: false },
  { note: 'G#', octave: 4, isBlack: true, flatName: 'Ab' },
  { note: 'A', octave: 4, isBlack: false },
  { note: 'A#', octave: 4, isBlack: true, flatName: 'Bb' },
  { note: 'B', octave: 4, isBlack: false },
  // Octave 5
  { note: 'C', octave: 5, isBlack: false },
  { note: 'C#', octave: 5, isBlack: true, flatName: 'Db' },
  { note: 'D', octave: 5, isBlack: false },
  { note: 'D#', octave: 5, isBlack: true, flatName: 'Eb' },
  { note: 'E', octave: 5, isBlack: false },
  { note: 'F', octave: 5, isBlack: false },
  { note: 'F#', octave: 5, isBlack: true, flatName: 'Gb' },
  { note: 'G', octave: 5, isBlack: false },
  { note: 'G#', octave: 5, isBlack: true, flatName: 'Ab' },
  { note: 'A', octave: 5, isBlack: false },
  { note: 'A#', octave: 5, isBlack: true, flatName: 'Bb' },
  { note: 'B', octave: 5, isBlack: false },
  { note: 'C', octave: 6, isBlack: false }
];

export default function InteractivePiano({ activeNotes = [], currentKey = 'C', scaleNotes = [] }) {
  const [soundingKeys, setSoundingKeys] = useState(new Set());

  useEffect(() => {
    const unsubscribe = audio.subscribe(({ notes, active }) => {
      setSoundingKeys((prev) => {
        const next = new Set(prev);
        notes.forEach((n) => {
          // Normalize note format
          const formatted = n.toUpperCase();
          if (active) {
            next.add(formatted);
          } else {
            next.delete(formatted);
          }
        });
        return next;
      });
    });
    return unsubscribe;
  }, []);

  const handleKeyClick = (key) => {
    const noteId = `${key.note}${key.octave}`;
    audio.playNote(noteId, 1.2, 0, 0.9);
  };

  // Determine if a key belongs to the current scale
  const getScaleDegree = (note) => {
    if (!scaleNotes || scaleNotes.length === 0) return null;
    const idx = scaleNotes.findIndex((sn) => {
      return sn === note || (note === 'C#' && sn === 'Db') || (note === 'D#' && sn === 'Eb') ||
             (note === 'F#' && sn === 'Gb') || (note === 'G#' && sn === 'Ab') || (note === 'A#' && sn === 'Bb');
    });
    return idx >= 0 ? idx + 1 : null;
  };

  return (
    <div className="piano-container">
      <div className="piano-header">
        <div className="piano-title">
          <span className="live-dot" /> Interactive Piano Roll
        </div>
        <div className="piano-hint">
          Click any key to hear notes • Highlighted = active chord notes
        </div>
      </div>

      <div className="piano-wrapper">
        <div className="piano-keys">
          {PIANO_KEYS.map((k, index) => {
            const fullNote = `${k.note}${k.octave}`;
            const isSounding = soundingKeys.has(fullNote.toUpperCase()) || 
              (activeNotes && activeNotes.some((an) => an.toUpperCase().includes(k.note.toUpperCase())));
            const scaleDegree = getScaleDegree(k.note);
            const isRoot = scaleDegree === 1;

            if (k.isBlack) {
              return (
                <button
                  key={index}
                  className={`piano-key black-key ${isSounding ? 'active' : ''} ${isRoot ? 'is-root' : ''}`}
                  onClick={() => handleKeyClick(k)}
                  title={`${k.note}${k.octave} / ${k.flatName}${k.octave}`}
                  aria-label={`${k.note}${k.octave}`}
                >
                  <span className="key-label">
                    {k.note}
                    {scaleDegree && <span className="degree-pill">{scaleDegree}</span>}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={index}
                className={`piano-key white-key ${isSounding ? 'active' : ''} ${isRoot ? 'is-root' : ''}`}
                onClick={() => handleKeyClick(k)}
                title={`${k.note}${k.octave}`}
                aria-label={`${k.note}${k.octave}`}
              >
                <div className="key-content">
                  {scaleDegree && (
                    <span className={`degree-badge degree-${scaleDegree}`}>
                      {scaleDegree}
                    </span>
                  )}
                  <span className="note-name">{k.note}</span>
                  <span className="octave-num">{k.octave}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
