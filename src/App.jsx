import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TheoryLesson from './components/TheoryLesson';
import ChordsExplorer from './components/ChordsExplorer';
import GuitarStrummer from './components/GuitarStrummer';
import BeatMaker from './components/BeatMaker';
import Metronome from './components/Metronome';
import ChordFamiliesView from './components/ChordFamiliesView';
import ProgressionPlayground from './components/ProgressionPlayground';
import QuizModule from './components/QuizModule';
import { HelpCircle, Sparkles } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentKey, setCurrentKey] = useState('C');
  const [activeTab, setActiveTab] = useState('theory');
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        currentKey={currentKey}
        setCurrentKey={setCurrentKey}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {activeTab === 'theory' && (
            <TheoryLesson
              currentKey={currentKey}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'chords' && (
            <ChordsExplorer
              currentKey={currentKey}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'guitar' && (
            <GuitarStrummer
              currentKey={currentKey}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'beats' && (
            <BeatMaker
              currentKey={currentKey}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'metronome' && (
            <Metronome />
          )}

          {activeTab === 'families' && (
            <ChordFamiliesView
              currentKey={currentKey}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'progressions' && (
            <ProgressionPlayground
              currentKey={currentKey}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizModule
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      </main>

      {/* Quick Access Floating Footer Bar */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">Project Music</span>
            <span className="footer-dot">•</span>
            <span>Interactive Theory, Guitar Strums, Beats & Metronome</span>
          </div>

          <div className="footer-center">
            <button
              onClick={() => setActiveTab('quiz')}
              className="footer-quiz-pill"
            >
              <HelpCircle size={15} /> Test Your Knowledge (Quiz)
            </button>
          </div>

          <div className="footer-right">
            <span className="footer-badge-clean">
              <Sparkles size={14} className="text-emerald" /> Studio Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
