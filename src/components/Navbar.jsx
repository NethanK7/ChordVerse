import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Compass, 
  Disc3, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Music, 
  Sparkles,
  Sliders,
  Clock,
  Zap,
  GraduationCap
} from 'lucide-react';
import { AVAILABLE_KEYS } from '../utils/musicTheory';
import { audio } from '../utils/audio';

export default function Navbar({ 
  mainMode = 'learning',
  setMainMode,
  learningTab = 'theory',
  setLearningTab,
  dawView = 'console',
  setDawView,
  currentKey, 
  setCurrentKey, 
  isMuted,
  setIsMuted,
  onNavigate
}) {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
    if (!next) {
      audio.init();
      audio.playNote('C5', 0.4, 0, 0.5);
    }
  };

  const learningNavItems = [
    { id: 'theory', label: '1-7 Concept', icon: BookOpen },
    { id: 'chords', label: 'The 7 Chords', icon: Layers },
    { id: 'families', label: 'Chord Families', icon: Compass },
    { id: 'progressions', label: 'Progression Lab', icon: Sliders },
    { id: 'quiz', label: 'Mastery Quiz', icon: HelpCircle, badge: 'Quiz' }
  ];

  const dawNavItems = [
    { id: 'console', label: 'All-in-One Console', icon: Layers },
    { id: 'beats', label: 'Beat Maker', icon: Disc3 },
    { id: 'guitar', label: 'Guitar Strummer', icon: Zap },
    { id: 'metronome', label: 'Metronome', icon: Clock }
  ];

  const handleBrandClick = () => {
    if (setMainMode) setMainMode('learning');
    if (setLearningTab) setLearningTab('theory');
    if (onNavigate) onNavigate('theory');
  };

  const handleModeSwitch = (mode) => {
    if (setMainMode) setMainMode(mode);
    if (onNavigate) {
      if (mode === 'learning') onNavigate(learningTab || 'theory');
      if (mode === 'daw') onNavigate(dawView || 'console');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="brand" onClick={handleBrandClick}>
          <div className="brand-icon-box">
            <Music className="brand-icon" />
            <Sparkles className="brand-sparkle" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Project <span className="brand-accent">Music</span></span>
            <span className="brand-tagline">Studio & Theory Suite</span>
          </div>
        </div>

        {/* Primary Area Switcher (Learning Academy vs DAW Studio) */}
        <div className="primary-area-toggle" role="tablist" aria-label="Workspaces">
          <button
            type="button"
            role="tab"
            aria-selected={mainMode === 'learning'}
            onClick={() => handleModeSwitch('learning')}
            className={`area-toggle-btn ${mainMode === 'learning' ? 'active learning' : ''}`}
          >
            <GraduationCap size={16} />
            <span>Learning Academy</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainMode === 'daw'}
            onClick={() => handleModeSwitch('daw')}
            className={`area-toggle-btn ${mainMode === 'daw' ? 'active daw' : ''}`}
          >
            <Sliders size={16} />
            <span>DAW Studio</span>
            <span className="area-pro-pill">PRO</span>
          </button>
        </div>

        {/* Controls: Key Picker & Audio Mute */}
        <div className="nav-controls">
          <div className="key-selector-box">
            <label htmlFor="key-select" className="key-label">Key:</label>
            <select
              id="key-select"
              value={currentKey}
              onChange={(e) => {
                setCurrentKey(e.target.value);
                audio.init();
                audio.playNote(`${e.target.value}4`, 0.6, 0, 0.7);
              }}
              className="key-select"
            >
              {AVAILABLE_KEYS.map((k) => (
                <option key={k.note} value={k.note}>
                  {k.name} ({k.accidentals.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleMute}
            className={`audio-btn ${isMuted ? 'muted' : ''}`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Row: Dynamically matches the active Area */}
      <div className="sub-navbar-container">
        <nav className="nav-tabs" aria-label="Sub Navigation">
          {mainMode === 'learning' ? (
            learningNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = learningTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setLearningTab) setLearningTab(item.id);
                    if (onNavigate) onNavigate(item.id);
                  }}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-tab-badge">{item.badge}</span>}
                </button>
              );
            })
          ) : (
            dawNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = dawView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setDawView) setDawView(item.id);
                    if (onNavigate) onNavigate(item.id);
                  }}
                  className={`nav-tab-btn daw-subtab ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })
          )}
        </nav>
        <div className="active-area-indicator">
          {mainMode === 'learning' ? (
            <span className="indicator-chip learning-chip">Theory Mode</span>
          ) : (
            <span className="indicator-chip daw-chip">DAW Mode (Polyphonic)</span>
          )}
        </div>
      </div>
    </header>
  );
}
