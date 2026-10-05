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
  Sparkles
} from 'lucide-react';
import { AVAILABLE_KEYS } from '../utils/musicTheory';
import { audio } from '../utils/audio';

export default function Navbar({ 
  currentKey, 
  setCurrentKey, 
  activeTab, 
  setActiveTab,
  isMuted,
  setIsMuted
}) {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
    if (!next) {
      audio.init();
      // Play a soft test chime
      audio.playNote('C5', 0.4, 0, 0.5);
    }
  };

  const navItems = [
    { id: 'theory', label: '1-7 Concept', icon: BookOpen },
    { id: 'chords', label: 'The 7 Chords', icon: Layers },
    { id: 'families', label: 'Chord Families', icon: Compass },
    { id: 'progressions', label: 'Progression Lab', icon: Disc3 },
    { id: 'quiz', label: 'Mastery Quiz', icon: HelpCircle, badge: 'Quiz' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="brand" onClick={() => setActiveTab('theory')}>
          <div className="brand-icon-box">
            <Music className="brand-icon" />
            <Sparkles className="brand-sparkle" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Chord<span className="brand-accent">Verse</span></span>
            <span className="brand-tagline">The 1–7 Number Code</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-tab-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

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
                // Play root note of newly selected key
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
    </header>
  );
}
