# Project Music | The 1–7 Number Code, Guitar Strums & Beat Studio

> An interactive, visual, and auditory music theory web application teaching the **1 to 7 diatonic number system (Nashville & Roman numerals)**, featuring realistic **Guitar Strums & Fretboard Voicings**, a 16-step **Beat Maker & Groovebox**, a precision **Studio Metronome**, the **3 harmonic chord families**, and a gamified **Music Theory & Ear-Training Quiz**.

Built with **React 19**, **Vite 8**, **Web Audio API sound engine**, and styled with a luxury dark music studio aesthetic. Ready for zero-config deployment on **Vercel**.

---

## What You Learn & Experience

1. **Chapter 1: The 1–7 Number Code Demystified**
   - Why pros use numbers instead of letter notes (transposition superpower).
   - Comparative transposition table across keys (C Major, G Major, D Major).
   - Movable-Do Solfege integration.

2. **Chapter 2: How 7 Chords Are Born from a Scale**
   - The universal scale interval formula: `W-W-H-W-W-W-H`.
   - Stacking in 3rds (Triad formula: 1 - 3 - 5).
   - The immutable Major key law: `Major - minor - minor - Major - Major - minor - diminished`.

3. **Guitar Strummer & Fretboard Lab**
   - Realistic acoustic guitar chord strums (Downstrum and Upstrum physics).
   - Interactive 6-string guitar neck with visual string vibration.
   - Individual string plucking (E-A-D-G-B-E).
   - Authentic 6-string chord voicings with fret charts.
   - Strumming rhythm pattern looper (Island Strum, Folk 4/4, Driving 8-Beat, Waltz).

4. **Beat Maker & Groovebox**
   - 16-step drum machine with Kick, Snare, Clap, Closed Hat, Open Hat, and Rimshot.
   - Preset grooves: Lofi Chillhop, 90s Boom Bap, Four-on-the-Floor, Modern Trap, Acoustic Pop, Rock 8-Beat.
   - Tempo BPM control, tap tempo, mute, and randomize.
   - Live Jam-Along chord pads to practice chord progressions over beats.

5. **Studio Metronome & Tap Tempo**
   - Zero-latency precision metronome with visual pendulum oscillation.
   - Tap Tempo detection, Italian tempo terms (Largo, Andante, Moderato, Allegro, Presto).
   - Time signatures (4/4, 3/4, 2/4, 6/8, 5/4) and subdivisions (Quarter, 8th, Triplet, 16th).
   - Sound choices: Woodblock Clave, Mechanical Click, Digital Beep, Rimshot, and Silent Visual.

6. **The 7 Diatonic Chords Explorer**
   - Interactive grid for degrees 1 through 7 in any chosen key.
   - Switch instrument between Acoustic Guitar and Rhodes Piano.
   - Voicing styles: Strum, Arpeggio, Block chord.
   - Interactive 2-octave piano keyboard with live key illumination.

7. **The 3 Harmonic Chord Families**
   - **Tonic Family (Home & Rest)**: Chords 1 (I), 6 (vi), 3 (iii).
   - **Subdominant Family (The Journey)**: Chords 4 (IV), 2 (ii).
   - **Dominant Family (Tension & Climax)**: Chords 5 (V), 7 (vii°).
   - Interactive 4-stage audio journey: *Home → Departure → Tension → Resolution*.

8. **Hit Song Progression Lab**
   - Multi-platinum presets: The 4-Chord Pop Axis (`1 - 5 - 6 - 4`), The 50s Doo-Wop (`1 - 6 - 4 - 5`), Jazz Cadence (`2 - 5 - 1 - 1`), Emotional Loop (`6 - 4 - 1 - 5`), and Blues.
   - Listen on Acoustic Guitar or Rhodes Piano with adjustable BPM.

9. **The Music Theory & Ear Training Quiz**
   - 10 comprehensive multi-choice questions with streak counter.
   - Real audio ear-training questions (identifying Major vs. minor by ear).
   - Instant explanations with deep musical context.
   - Celebration animations and rank titles (*Harmonic Grandmaster*, *Chord Virtuoso*).

---

## How to Host on Vercel

### Option 1: Vercel Git Integration (Recommended)
1. Push this folder to a GitHub, GitLab, or Bitbucket repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Project Music release"
   git remote add origin https://github.com/your-username/music-web.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel will automatically detect **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**! Your site will be live on a `*.vercel.app` URL with free global SSL.

### Option 2: Vercel CLI (Instant from terminal)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy directly from this directory
vercel
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
