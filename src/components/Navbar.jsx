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
  GraduationCap,
  ArrowRight,
  ArrowLeft
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

  const handleModeSwitch = (mode, targetView = null) => {
    if (setMainMode) setMainMode(mode);
    if (mode === 'learning') {
      const tab = targetView || learningTab || 'theory';
      if (setLearningTab) setLearningTab(tab);
      if (onNavigate) onNavigate(tab);
    } else {
      const view = targetView || dawView || 'console';
      if (setDawView) setDawView(view);
      if (onNavigate) onNavigate(view);
    }
  };

  return (
    <header className="navbar">
      {/* Top Header Row */}
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="brand" onClick={handleBrandClick} role="button" tabIndex={0} title="Return to Home / Theory">
          <div className="brand-icon-box">
            <Music className="brand-icon" />
            <Sparkles className="brand-sparkle" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Project <span className="brand-accent">Music</span></span>
            <span className="brand-tagline">Studio & Theory Suite</span>
          </div>
        </div>

        {/* Primary Workspace Segmented Switcher (Center Dock) */}
        <div className="primary-area-toggle" role="tablist" aria-label="Workspaces">
          <button
            type="button"
            role="tab"
            aria-selected={mainMode === 'learning'}
            onClick={() => handleModeSwitch('learning')}
            className={`area-toggle-btn ${mainMode === 'learning' ? 'active learning' : ''}`}
            title="Music Theory, Roman Numerals & Chord Science"
          >
            <GraduationCap size={17} />
            <span className="toggle-btn-text">Theory Academy</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mainMode === 'daw'}
            onClick={() => handleModeSwitch('daw')}
            className={`area-toggle-btn ${mainMode === 'daw' ? 'active daw' : ''}`}
            title="Digital Audio Workstation: Beats, Guitar & Metronome"
          >
            <span className="daw-pulse-dot" />
            <Sliders size={17} />
            <span className="toggle-btn-text">DAW Studio</span>
            <span className="area-pro-pill">PRO</span>
          </button>
        </div>

        {/* Controls: Key Picker & Audio Mute */}
        <div className="nav-controls">
          <div className="key-selector-box" title="Global Musical Key Center">
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

      {/* Sub-Navigation Row: Dynamically matches the active Area with direct cross-jump */}
      <div className="sub-navbar-container">
        <nav className="nav-tabs" aria-label="Sub Navigation">
          {mainMode === 'learning' ? (
            <>
              {learningNavItems.map((item) => {
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
              })}
              {/* Unmissable DAW Studio Direct Access Pill */}
              <button
                onClick={() => handleModeSwitch('daw')}
                className="nav-daw-jump-btn"
                title="Switch to DAW Studio Area"
              >
                <Disc3 size={15} className="text-emerald" />
                <span>Open DAW Studio</span>
                <ArrowRight size={13} />
              </button>
            </>
          ) : (
            <>
              {dawNavItems.map((item) => {
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
              })}
              {/* Direct Link back to Theory Academy */}
              <button
                onClick={() => handleModeSwitch('learning')}
                className="nav-learning-jump-btn"
                title="Return to Theory Academy"
              >
                <ArrowLeft size={13} />
                <GraduationCap size={15} />
                <span>Back to Theory</span>
              </button>
            </>
          )}
        </nav>

        <div className="active-area-indicator">
          {mainMode === 'learning' ? (
            <span className="indicator-chip learning-chip">
              <GraduationCap size={12} /> Theory Academy
            </span>
          ) : (
            <span className="indicator-chip daw-chip">
              <Sliders size={12} /> DAW Studio (Active)
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
