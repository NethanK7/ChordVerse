import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TheoryLesson from './components/TheoryLesson';
import ChordsExplorer from './components/ChordsExplorer';
import ChordFamiliesView from './components/ChordFamiliesView';
import ProgressionPlayground from './components/ProgressionPlayground';
import QuizModule from './components/QuizModule';
import DawStudio from './components/DawStudio';
import { HelpCircle, Sparkles, Sliders, GraduationCap } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentKey, setCurrentKey] = useState('C');
  // Top-level area separation: 'learning' (Theory Academy) or 'daw' (DAW Studio)
  const [mainMode, setMainMode] = useState('learning');
  // Learning area active tab
  const [learningTab, setLearningTab] = useState('theory');
  // DAW sub-view ('console', 'beats', 'guitar', 'metronome')
  const [dawView, setDawView] = useState('console');
  const [isMuted, setIsMuted] = useState(false);

  // Universal navigation handler for backward compatibility
  const handleNavigate = (destination) => {
    if (['theory', 'chords', 'families', 'progressions', 'quiz'].includes(destination)) {
      setMainMode('learning');
      setLearningTab(destination);
    } else if (['daw', 'console', 'beats', 'guitar', 'metronome'].includes(destination)) {
      setMainMode('daw');
      setDawView(destination === 'daw' ? 'console' : destination);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navbar with distinct Learning & DAW Area controls */}
      <Navbar
        mainMode={mainMode}
        setMainMode={setMainMode}
        learningTab={learningTab}
        setLearningTab={setLearningTab}
        dawView={dawView}
        setDawView={setDawView}
        currentKey={currentKey}
        setCurrentKey={setCurrentKey}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* 1. SEPARATE LEARNING AREA */}
          {mainMode === 'learning' && (
            <div className="learning-area-wrapper">
              {learningTab === 'theory' && (
                <TheoryLesson
                  currentKey={currentKey}
                  setActiveTab={handleNavigate}
                />
              )}

              {learningTab === 'chords' && (
                <ChordsExplorer
                  currentKey={currentKey}
                  setActiveTab={handleNavigate}
                />
              )}

              {learningTab === 'families' && (
                <ChordFamiliesView
                  currentKey={currentKey}
                  setActiveTab={handleNavigate}
                />
              )}

              {learningTab === 'progressions' && (
                <ProgressionPlayground
                  currentKey={currentKey}
                  setActiveTab={handleNavigate}
                />
              )}

              {learningTab === 'quiz' && (
                <QuizModule
                  setActiveTab={handleNavigate}
                />
              )}
            </div>
          )}

          {/* 2. SEPARATE DAW AREA */}
          {mainMode === 'daw' && (
            <div className="daw-area-wrapper">
              <DawStudio
                currentKey={currentKey}
                setCurrentKey={setCurrentKey}
                dawView={dawView}
                setDawView={setDawView}
                onSwitchToLearning={() => setMainMode('learning')}
              />
            </div>
          )}
        </div>
      </main>

      {/* Quick Access Floating Footer Bar */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">Project Music</span>
            <span className="footer-dot">•</span>
            {mainMode === 'learning' ? (
              <span>Learning Academy: Music Theory, Roman Numerals & Chords</span>
            ) : (
              <span>DAW Studio: Beat Maker, Acoustic Guitar Strummer & Metronome</span>
            )}
          </div>

          <div className="footer-center">
            {mainMode === 'learning' ? (
              <div className="footer-actions-group">
                <button
                  onClick={() => handleNavigate('quiz')}
                  className="footer-quiz-pill"
                >
                  <HelpCircle size={15} /> Test Your Knowledge (Quiz)
                </button>
                <button
                  onClick={() => setMainMode('daw')}
                  className="footer-daw-switch-pill"
                >
                  <Sliders size={15} /> Switch to DAW Studio
                </button>
              </div>
            ) : (
              <div className="footer-actions-group">
                <button
                  onClick={() => setMainMode('learning')}
                  className="footer-learning-switch-pill"
                >
                  <GraduationCap size={15} /> Back to Learning Academy
                </button>
                <button
                  onClick={() => handleNavigate('quiz')}
                  className="footer-quiz-pill"
                >
                  <HelpCircle size={15} /> Theory Quiz
                </button>
              </div>
            )}
          </div>

          <div className="footer-right">
            <span className="footer-badge-clean">
              <Sparkles size={14} className="text-emerald" /> Studio Engine 2.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
