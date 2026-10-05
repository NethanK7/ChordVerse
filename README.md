# ChordVerse 🎵 | The 1–7 Number Code & Music Theory Mastery

> An interactive, visual, and auditory music theory web application teaching the **1 to 7 diatonic number system (Nashville & Roman numerals)**, the **3 harmonic chord families**, and testing learners with a gamified **Music Theory & Ear-Training Quiz**.

Built with **React 19**, **Vite 8**, **Web Audio API polyphonic sound engine**, and styled with a luxury dark music studio aesthetic. Ready for zero-config deployment on **Vercel**.

---

## 🌟 What You Learn & Experience

1. **Chapter 1: The 1–7 Number Code Demystified**
   - Why pros use numbers instead of letter notes (transposition superpower).
   - Comparative transposition table across keys (C Major, G Major, D Major).
   - Movable-Do Solfège integration.

2. **Chapter 2: How 7 Chords Are Born from a Scale**
   - The universal scale interval formula: `W-W-H-W-W-W-H`.
   - Stacking in 3rds (Triad formula: 1 - 3 - 5).
   - The immutable Major key law: `Major - minor - minor - Major - Major - minor - diminished`.

3. **Chapter 3: The 3 Harmonic Chord Families**
   - **Tonic Family (Home & Rest 🏡)**: Chords 1 (I), 6 (vi), 3 (iii).
   - **Subdominant Family (The Journey 🚗)**: Chords 4 (IV), 2 (ii).
   - **Dominant Family (Tension & Climax 🎢)**: Chords 5 (V), 7 (vii°).
   - Interactive 4-stage audio journey: *Home ➔ Departure ➔ Tension ➔ Resolution*.

4. **The 7 Diatonic Chords Explorer**
   - Interactive grid for degrees 1 through 7 in any chosen key.
   - Click to hear each chord as a **Strum**, **Arpeggio**, or **Block chord**.
   - Click individual notes inside any triad to hear single pitches.
   - Interactive 2-octave piano keyboard with live key illumination.

5. **Hit Song Progression Lab**
   - Multi-platinum presets: The 4-Chord Pop Axis (`1 - 5 - 6 - 4`), The 50s Doo-Wop (`1 - 6 - 4 - 5`), Jazz Cadence (`2 - 5 - 1 - 1`), Emotional Loop (`6 - 4 - 1 - 5`), and Blues.
   - Live looping engine with adjustable Tempo (BPM), voicing style, and animated beat stepping.
   - Custom progression palette to sequence your own chord combinations.

6. **The Music Theory & Ear Training Quiz**
   - 10 comprehensive multi-choice questions with live streak counter.
   - Real audio ear-training questions (identifying Major vs. minor by ear).
   - Instant "Why is this correct?" explanations with deep music context.
   - Confetti blast celebrations, accuracy ratings, and rank titles (*Harmonic Grandmaster*, *Chord Virtuoso*).

---

## 🚀 How to Host on Vercel

### Option 1: Vercel Git Integration (Recommended)
1. Push this folder to a GitHub, GitLab, or Bitbucket repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial music theory web app"
   git remote add origin https://github.com/your-username/music-web.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel will automatically detect **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**! Your site will be live on a `*.vercel.app` URL with free global SSL in ~20 seconds.

### Option 2: Vercel CLI (Instant from terminal)
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy directly from this directory
vercel
```

---

## 💻 Local Development

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
