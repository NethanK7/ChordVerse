// Comprehensive Music Theory Data & Helpers
// Focus: The 1-7 Number System, Diatonic Chords, Chord Families, and Progressions

export const CHROMATIC_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export const ENHARMONIC_FLATS = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]; // Semitone offsets (W-W-H-W-W-W-H)
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // Natural minor (W-H-W-W-H-W-W)

// Available keys for exploration
export const AVAILABLE_KEYS = [
  { note: 'C', name: 'C Major', accidentals: 'Natural (No sharps/flats)', popularIn: 'Pop, Classical, Ballads' },
  { note: 'G', name: 'G Major', accidentals: '1 Sharp (F#)', popularIn: 'Acoustic, Folk, Country' },
  { note: 'D', name: 'D Major', accidentals: '2 Sharps (F#, C#)', popularIn: 'Rock, Classical, Pop' },
  { note: 'A', name: 'A Major', accidentals: '3 Sharps (F#, C#, G#)', popularIn: 'Rock, Guitar anthems' },
  { note: 'E', name: 'E Major', accidentals: '4 Sharps (F#, C#, G#, D#)', popularIn: 'Blues, Rock' },
  { note: 'F', name: 'F Major', accidentals: '1 Flat (Bb)', popularIn: 'Jazz, Soul, Brass' },
  { note: 'Bb', name: 'Bb Major', accidentals: '2 Flats (Bb, Eb)', popularIn: 'Jazz, Pop, Broadway' },
  { note: 'Eb', name: 'Eb Major', accidentals: '3 Flats (Bb, Eb, Ab)', popularIn: 'R&B, Soul, Piano Pop' }
];

// Details of the 7 scale degrees & diatonic chords in a Major key
export const SCALE_DEGREE_DATA = [
  {
    degree: 1,
    roman: 'I',
    quality: 'Major',
    symbol: '',
    name: 'Tonic',
    solfege: 'Do',
    family: 'Tonic (Home)',
    familyKey: 'tonic',
    color: '#10b981', // Emerald green
    glowColor: 'rgba(16, 185, 129, 0.4)',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    mood: 'Resolved, grounded, pure satisfaction. This is HOME.',
    description: 'The King of chords in your key. Every progression feels gravitational pull towards the 1 chord. When you land here, your ears sigh in relief.',
    role: 'Establishes the musical universe. The beginning and ultimate destination of almost every melody.',
    triadFormula: '1 - 3 - 5',
    triadIntervals: [0, 4, 7], // Root, Major 3rd, Perfect 5th
    seventhIntervals: [0, 4, 7, 11] // Maj7
  },
  {
    degree: 2,
    roman: 'ii',
    quality: 'minor',
    symbol: 'm',
    name: 'Supertonic',
    solfege: 'Re',
    family: 'Subdominant (Journey)',
    familyKey: 'subdominant',
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    mood: 'Melancholic, preparatory, smooth anticipation.',
    description: 'A gentle stepping stone. It acts as an on-ramp to the 5 chord. In Jazz and R&B, the "ii - V - I" turnaround is the single most legendary cadence.',
    role: 'Pre-dominant chord. Moves music away from home and tees up the dominant tension.',
    triadFormula: '2 - 4 - 6',
    triadIntervals: [0, 3, 7], // Root, Minor 3rd, Perfect 5th
    seventhIntervals: [0, 3, 7, 10] // m7
  },
  {
    degree: 3,
    roman: 'iii',
    quality: 'minor',
    symbol: 'm',
    name: 'Mediant',
    solfege: 'Mi',
    family: 'Tonic (Home Alternate)',
    familyKey: 'tonic',
    color: '#14b8a6', // Teal
    glowColor: 'rgba(20, 184, 166, 0.4)',
    accentBg: 'rgba(20, 184, 166, 0.12)',
    mood: 'Dreamy, nostalgic, ethereal, introspective.',
    description: 'Shares two out of three notes with the 1 chord! It acts like a softer, moodier disguise of the Tonic. It bridges the tonic and dominant with gentle sorrow.',
    role: 'A sweet substitute for the 1 chord when you want emotional nuance rather than total conclusion.',
    triadFormula: '3 - 5 - 7',
    triadIntervals: [0, 3, 7],
    seventhIntervals: [0, 3, 7, 10]
  },
  {
    degree: 4,
    roman: 'IV',
    quality: 'Major',
    symbol: '',
    name: 'Subdominant',
    solfege: 'Fa',
    family: 'Subdominant (Journey)',
    familyKey: 'subdominant',
    color: '#3b82f6', // Bright Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    accentBg: 'rgba(59, 130, 246, 0.12)',
    mood: 'Hopeful, lifting, adventurous, open-hearted.',
    description: 'The epic departure from home! Stepping to the 4 chord feels like opening the front door and walking out into crisp fresh air. Used extensively in anthems and gospel.',
    role: 'Pushes the narrative forward. In church music, the "IV - I" transition is the famous "Amen" cadence (Plagal cadence).',
    triadFormula: '4 - 6 - 1',
    triadIntervals: [0, 4, 7],
    seventhIntervals: [0, 4, 7, 11]
  },
  {
    degree: 5,
    roman: 'V',
    quality: 'Major',
    symbol: '',
    name: 'Dominant',
    solfege: 'Sol',
    family: 'Dominant (Tension)',
    familyKey: 'dominant',
    color: '#f59e0b', // Amber / Flame Orange
    glowColor: 'rgba(245, 158, 11, 0.4)',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    mood: 'Excited, commanding, maximum suspense and tension.',
    description: 'The cliffhanger chord! It contains the "leading tone" (scale degree 7), which is magnetically dying to resolve up one half-step into the 1.',
    role: 'Creates supreme musical urgency. When a song hits the 5 chord, your brain predicts the 1 chord with 99% certainty.',
    triadFormula: '5 - 7 - 2',
    triadIntervals: [0, 4, 7],
    seventhIntervals: [0, 4, 7, 10] // Dominant 7th (contains tritone!)
  },
  {
    degree: 6,
    roman: 'vi',
    quality: 'minor',
    symbol: 'm',
    name: 'Submediant',
    solfege: 'La',
    family: 'Tonic (Home Alternate)',
    familyKey: 'tonic',
    color: '#ec4899', // Pink / Rose
    glowColor: 'rgba(236, 72, 153, 0.4)',
    accentBg: 'rgba(236, 72, 153, 0.12)',
    mood: 'Heartbreaking, bittersweet, deep emotional weight.',
    description: 'The "Relative Minor" chord. It shares almost all notes with the 1 chord, but with a somber twist. If you want a sad or vulnerable pop chorus, start on chord 6!',
    role: 'Emotional anchor. Millions of hit songs (Adele, Taylor Swift, Billie Eilish) leverage the emotional gravity of the 6 chord.',
    triadFormula: '6 - 1 - 3',
    triadIntervals: [0, 3, 7],
    seventhIntervals: [0, 3, 7, 10]
  },
  {
    degree: 7,
    roman: 'vii°',
    quality: 'diminished',
    symbol: '°',
    name: 'Leading Tone',
    solfege: 'Ti',
    family: 'Dominant (Extreme Tension)',
    familyKey: 'dominant',
    color: '#8b5cf6', // Violet
    glowColor: 'rgba(139, 92, 246, 0.4)',
    accentBg: 'rgba(139, 92, 246, 0.12)',
    mood: 'Unstable, eerie, suspenseful, tightrope tension.',
    description: 'The quirky black sheep of the major family! Because it has a flat-5th (diminished 5th / tritone), it cannot rest. It practically lunges forward to resolve back into 1.',
    role: 'Supercharged dominant tension. Frequently used in film scoring and classical drama to trigger intense suspense before resolution.',
    triadFormula: '7 - 2 - 4',
    triadIntervals: [0, 3, 6], // Root, Minor 3rd, Diminished 5th (Tritone!)
    seventhIntervals: [0, 3, 6, 10] // Half-diminished m7b5
  }
];

// The Three Harmonic Families
export const CHORD_FAMILIES = {
  tonic: {
    name: 'Tonic Family',
    badge: 'Home & Stability',
    degrees: [1, 6, 3],
    romans: ['I', 'vi', 'iii'],
    color: '#10b981',
    description: 'Feels at rest. Provides grounded emotional resolution. Like sitting on your favorite sofa at home after a long journey.',
    metaphor: 'Home Base 🏡'
  },
  subdominant: {
    name: 'Subdominant Family',
    badge: 'Journey & Departure',
    degrees: [4, 2],
    romans: ['IV', 'ii'],
    color: '#3b82f6',
    description: 'Moves away from home. Adds momentum, curiosity, and sets the stage for the big dramatic tension.',
    metaphor: 'The Open Road 🚗'
  },
  dominant: {
    name: 'Dominant Family',
    badge: 'Tension & Climax',
    degrees: [5, 7],
    romans: ['V', 'vii°'],
    color: '#f59e0b',
    description: 'High energy and musical suspense! It carries the "leading tone" that creates an irresistible urge to snap back to the Tonic (1).',
    metaphor: 'The Rollercoaster Drop 🎢'
  }
};

// Famous Progressions in the 1-7 Number System
export const FAMOUS_PROGRESSIONS = [
  {
    id: 'pop-axis',
    name: 'The 4-Chord Pop Axis',
    numbers: [1, 5, 6, 4],
    romans: ['I', 'V', 'vi', 'IV'],
    description: 'The most successful chord loop in modern music history. Powers hundreds of stadium-filling anthems.',
    examples: ["Journey - Don't Stop Believin'", 'The Beatles - Let It Be', 'Adele - Someone Like You', 'Lady Gaga - Poker Face'],
    mood: 'Triumphant, euphoric, sing-along perfection'
  },
  {
    id: 'emotional-ballad',
    name: 'The Melancholy Loop',
    numbers: [6, 4, 1, 5],
    romans: ['vi', 'IV', 'I', 'V'],
    description: 'Starting on the emotional 6 chord pulls heartstrings immediately. Used by modern pop, EDM, and rock hits.',
    examples: ['Luis Fonsi - Despacito', 'Alan Walker - Faded', 'Avicii - Wake Me Up', 'Linkin Park - In the End'],
    mood: 'Bittersweet, passionate, dramatic'
  },
  {
    id: 'fifties-doowop',
    name: 'The 50s Doo-Wop / Stand By Me',
    numbers: [1, 6, 4, 5],
    romans: ['I', 'vi', 'IV', 'V'],
    description: 'The classic golden-age retro sound of the 1950s and 60s. Warm, nostalgic, and endlessly catchy.',
    examples: ['Ben E. King - Stand By Me', 'The Penguins - Earth Angel', 'The Police - Every Breath You Take'],
    mood: 'Nostalgic, romantic, vintage sunshine'
  },
  {
    id: 'jazz-turnaround',
    name: 'The Jazz Cadence (ii - V - I)',
    numbers: [2, 5, 1, 1],
    romans: ['ii', 'V', 'I', 'I'],
    description: 'The holy grail of jazz and bossa nova. Pre-dominant (2) to Dominant (5) to Tonic (1).',
    examples: ['Autumn Leaves', 'Fly Me to the Moon', 'Miles Davis - Tune Up', 'Stevie Wonder classics'],
    mood: 'Sophisticated, silky smooth, classic'
  },
  {
    id: 'rock-folk-classic',
    name: 'The Rock & Folk Anthem',
    numbers: [1, 4, 5, 4],
    romans: ['I', 'IV', 'V', 'IV'],
    description: 'Simple, raw, and high octane. Rock & roll was practically built on these three primary chords.',
    examples: ['The Troggs - Wild Thing', 'Ritchie Valens - La Bamba', 'The Beatles - Twist and Shout'],
    mood: 'High-energy, rebellious, upbeat'
  },
  {
    id: 'blues-standard',
    name: 'The 12-Bar Blues Foundation',
    numbers: [1, 1, 4, 1, 5, 4, 1, 5],
    romans: ['I', 'I', 'IV', 'I', 'V', 'IV', 'I', 'V'],
    description: 'The heartbeat of American music. Rock, R&B, and modern pop all descend from this exact structure.',
    examples: ['Chuck Berry - Johnny B. Goode', 'Elvis - Hound Dog', 'B.B. King blues'],
    mood: 'Soulful, groovy, timeless'
  }
];

// Helper: Normalize note name to chromatic index
export function getNoteIndex(note) {
  const normalized = note.replace('♭', 'b').replace('♯', '#');
  let index = CHROMATIC_NOTES.indexOf(normalized);
  if (index === -1) {
    // Check enharmonic flats
    for (const [sharp, flat] of Object.entries(ENHARMONIC_FLATS)) {
      if (flat.toLowerCase() === normalized.toLowerCase()) {
        index = CHROMATIC_NOTES.indexOf(sharp);
        break;
      }
    }
  }
  return index >= 0 ? index : 0;
}

// Generate the 7 diatonic notes for any root key
export function getScaleNotes(rootNote) {
  const rootIndex = getNoteIndex(rootNote);
  return MAJOR_SCALE_INTERVALS.map((interval) => {
    const noteIdx = (rootIndex + interval) % 12;
    return CHROMATIC_NOTES[noteIdx];
  });
}

// Generate complete info for all 7 chords in the given key
export function getChordsInKey(rootNote) {
  const scaleNotes = getScaleNotes(rootNote);

  return SCALE_DEGREE_DATA.map((info, idx) => {
    const chordRoot = scaleNotes[idx];
    const thirdNote = scaleNotes[(idx + 2) % 7];
    const fifthNote = scaleNotes[(idx + 4) % 7];
    const seventhNote = scaleNotes[(idx + 6) % 7];

    const chordName = `${chordRoot}${info.symbol}`;
    const triadNotes = [chordRoot, thirdNote, fifthNote];
    const seventhNotes = [chordRoot, thirdNote, fifthNote, seventhNote];

    return {
      ...info,
      rootNote: chordRoot,
      chordName,
      fullName: `${chordRoot} ${info.quality}`,
      triadNotes,
      seventhNotes
    };
  });
}

// Quiz questions covering 1-7 system, chord families, roman numerals, and listening
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: 'concept',
    category: 'The 1-7 System',
    question: 'Why do musicians use numbers (1 to 7) instead of just note names like C, D, E?',
    options: [
      'Because numbers allow you to transpose any song into any key instantly without relearning the pattern',
      'Because instruments only have numbers printed on them',
      'Because musical notes were invented after numbers in the 19th century',
      'Because sheet music cannot display letters'
    ],
    correctIndex: 0,
    explanation: 'The 1-7 system (and Roman numerals) describes the harmonic RELATIONSHIPS. If you know "I - V - vi - IV", you can play that song in C, in G, in Eb, or anywhere on the spot!'
  },
  {
    id: 2,
    type: 'roman',
    category: 'Chord Qualities',
    question: 'In any Major key, which chord degrees are ALWAYS Minor chords?',
    options: [
      'Chords 2, 3, and 6 (ii, iii, vi)',
      'Chords 1, 4, and 5 (I, IV, V)',
      'Only chord 7 (vii°)',
      'Chords 1, 3, and 5'
    ],
    correctIndex: 0,
    explanation: 'The universal major key formula is: Major (1), minor (2), minor (3), Major (4), Major (5), minor (6), diminished (7). Thus 2, 3, and 6 are always minor!'
  },
  {
    id: 3,
    type: 'family',
    category: 'Chord Families',
    question: 'Which chord family does chord 5 (V) belong to, and what is its primary emotional function?',
    options: [
      'Dominant Family - creates tension and strongly pulls to resolve back home to 1',
      'Tonic Family - feels completely relaxed and peaceful',
      'Subdominant Family - only used as a slow walking bass note',
      'Diminished Family - has no pull at all'
    ],
    correctIndex: 0,
    explanation: 'Chord 5 (V) is the heart of the Dominant Family. It holds the leading tone (scale degree 7) which magnetically pulls right back into the 1 chord (Home).'
  },
  {
    id: 4,
    type: 'calculation',
    category: 'Key Identification',
    question: 'If you are in the key of C Major, what chord is chord 4 (IV)?',
    options: [
      'F Major',
      'G Major',
      'D minor',
      'E minor'
    ],
    correctIndex: 0,
    explanation: 'Counting up from C (1): C(1), D(2), E(3), F(4). Since chord 4 in a major key is major, chord 4 is F Major!'
  },
  {
    id: 5,
    type: 'calculation',
    category: 'Key Identification',
    question: 'In the key of G Major (G, A, B, C, D, E, F#), what is chord 6 (vi)?',
    options: [
      'E minor (Em)',
      'C Major (C)',
      'D Major (D)',
      'B minor (Bm)'
    ],
    correctIndex: 0,
    explanation: 'Counting up in G Major: G(1), A(2), B(3), C(4), D(5), E(6). Scale degree 6 is E, and the 6 chord is minor, making it E minor (the relative minor of G Major)!'
  },
  {
    id: 6,
    type: 'family',
    category: 'Chord Families',
    question: 'Which chords belong to the "Tonic Family" (Home / Rest)?',
    options: [
      'Chords 1, 6, and 3 (I, vi, iii)',
      'Chords 4 and 2 (IV, ii)',
      'Chords 5 and 7 (V, vii°)',
      'All odd numbered chords only'
    ],
    correctIndex: 0,
    explanation: 'Chords 1, 6, and 3 share harmonic notes with the root triad. Chord 1 is the primary home, while 6 (relative minor) and 3 (mediant) act as emotional home substitutes.'
  },
  {
    id: 7,
    type: 'audio',
    category: 'Ear Training',
    question: 'Listen to this chord. Is this chord quality Major (bright/happy) or minor (somber/sad)?',
    audioChord: { root: 'C4', notes: ['C4', 'E4', 'G4'] },
    options: [
      'Major (Bright, stable, uplifted)',
      'Minor (Somber, sad, melancholic)',
      'Diminished (Tense, dissonant)',
      'Suspended'
    ],
    correctIndex: 0,
    explanation: 'That is a C Major chord (C - E - G)! The Major 3rd interval (4 semitones between C and E) gives it its open, bright, sunny sound.'
  },
  {
    id: 8,
    type: 'audio',
    category: 'Ear Training',
    question: 'Listen to this chord. What is its quality?',
    audioChord: { root: 'A3', notes: ['A3', 'C4', 'E4'] },
    options: [
      'Minor (Moody, melancholic, reflective)',
      'Major (Bright and triumphant)',
      'Diminished (Unsettled)',
      'Augmented'
    ],
    correctIndex: 0,
    explanation: 'That was an A minor chord (A - C - E)! The Minor 3rd interval (3 semitones between A and C) imparts that famous introspective, emotional tone.'
  },
  {
    id: 9,
    type: 'progression',
    category: 'Hit Song Formulas',
    question: 'What is the Roman numeral formula for the legendary "4-Chord Pop Axis" (used in Journey, Adele, Beatles)?',
    options: [
      'I - V - vi - IV  (1 - 5 - 6 - 4)',
      'ii - V - I - IV  (2 - 5 - 1 - 4)',
      'I - IV - V - vii° (1 - 4 - 5 - 7)',
      'vi - vi - vi - I (6 - 6 - 6 - 1)'
    ],
    correctIndex: 0,
    explanation: 'The classic Pop Axis starts on Tonic (I), moves to Dominant tension (V), dips into the emotional minor (vi), and resolves to the uplifting Subdominant (IV)!'
  },
  {
    id: 10,
    type: 'diminished',
    category: 'Diatonic Mastery',
    question: 'Why does chord 7 (vii°) sound so unstable and eerie compared to the other 6 chords?',
    options: [
      'It contains a Diminished 5th (Tritone) between its root and 5th instead of a Perfect 5th',
      'Because it has 4 notes instead of 3',
      'Because it can only be played backwards',
      'Because it is played louder than other chords'
    ],
    correctIndex: 0,
    explanation: 'Every other diatonic triad has a stable Perfect 5th (7 semitones). Chord 7 has a Diminished 5th (6 semitones), known historically as the "Devil\'s Interval" or tritone, creating immense tension!'
  }
];
