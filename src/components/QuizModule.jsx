import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  RotateCcw, 
  Award, 
  Flame, 
  ArrowRight, 
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../utils/musicTheory';
import { audio } from '../utils/audio';

export default function QuizModule({ setActiveTab }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handlePlayAudioQuestion = () => {
    if (currentQ?.audioChord) {
      audio.playChord(currentQ.audioChord.notes, 'strum', 2.0, 4);
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      // Play celebratory chime
      audio.playNote('C5', 0.15, 0, 0.6);
      audio.playNote('E5', 0.15, 0.1, 0.6);
      audio.playNote('G5', 0.3, 0.2, 0.7);

      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      // Gentle low dissonance
      audio.playNote('F#3', 0.3, 0, 0.5);
      setStreak(0);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ.question,
        selected: idx,
        correct: currentQ.correctIndex,
        isCorrect,
        explanation: currentQ.explanation
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
    // Fire celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizCompleted(false);
    setUserAnswers([]);
  };

  // Badges based on score
  const getBadge = (scoreTotal) => {
    const percentage = Math.round((scoreTotal / QUIZ_QUESTIONS.length) * 100);
    if (percentage === 100) {
      return {
        title: 'Harmonic Grandmaster 🏆',
        color: '#f59e0b',
        desc: 'Flawless score! You have completely mastered scale degrees, diatonic chord qualities, and harmonic families!'
      };
    }
    if (percentage >= 80) {
      return {
        title: 'Chord Virtuoso 🌟',
        color: '#10b981',
        desc: 'Outstanding ears and theory chops! You are ready to analyze and write hit song progressions.'
      };
    }
    if (percentage >= 60) {
      return {
        title: 'Music Producer in Training 🎧',
        color: '#3b82f6',
        desc: 'Solid foundation! A quick review of the chord families will push you to expert level.'
      };
    }
    return {
      title: 'Theory Apprentice 🎼',
      color: '#ec4899',
      desc: 'Great start! Music theory is a puzzle that clicks with repetition. Review the 1-7 chapter and try again!'
    };
  };

  return (
    <div className="quiz-page">
      {!quizCompleted ? (
        <div className="quiz-card">
          {/* Header & Status Bar */}
          <div className="quiz-status-bar">
            <div className="status-left">
              <span className="q-category-pill">{currentQ.category}</span>
              <span className="q-progress-text">
                Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
            </div>

            <div className="status-right">
              {streak > 1 && (
                <div className="streak-badge">
                  <Flame size={16} className="flame-icon" />
                  <span>{streak} Streak!</span>
                </div>
              )}
              <div className="score-live">
                Score: <strong>{score}</strong>
              </div>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="question-body">
            <h2 className="question-title">{currentQ.question}</h2>

            {/* Audio Question Player if applicable */}
            {currentQ.type === 'audio' && (
              <div className="audio-prompt-box">
                <button onClick={handlePlayAudioQuestion} className="play-audio-test-btn">
                  <Volume2 size={20} /> Click to Play Chord Audio
                </button>
                <span className="audio-hint">Listen closely: Does it feel bright/happy (Major) or moody/sad (minor)?</span>
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          <div className="options-grid">
            {currentQ.options.map((option, idx) => {
              let optClass = 'quiz-option-btn';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  optClass += ' option-correct';
                } else if (idx === selectedOption) {
                  optClass += ' option-wrong';
                } else {
                  optClass += ' option-disabled';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={optClass}
                >
                  <div className="opt-letter">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="opt-text">{option}</div>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 size={20} className="check-icon" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                    <XCircle size={20} className="wrong-icon" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Drawer after answering */}
          {isAnswered && (
            <div className={`explanation-card ${selectedOption === currentQ.correctIndex ? 'exp-correct' : 'exp-wrong'}`}>
              <div className="exp-header">
                {selectedOption === currentQ.correctIndex ? (
                  <span className="exp-verdict correct">🎉 Correct!</span>
                ) : (
                  <span className="exp-verdict wrong">❌ Not quite!</span>
                )}
              </div>
              <p className="exp-text">{currentQ.explanation}</p>
              <div className="exp-action">
                <button onClick={handleNext} className="next-q-btn">
                  {currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Next Question' : 'See Final Results'} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Final Results Screen */
        <div className="results-card">
          <div className="trophy-glow-icon">
            <Trophy size={60} />
          </div>

          <h2 className="results-title">Quiz Completed!</h2>
          <div className="results-score-big">
            <span className="score-num">{score}</span>
            <span className="score-denom">/ {QUIZ_QUESTIONS.length}</span>
          </div>

          <div className="badge-reveal-box" style={{ borderColor: getBadge(score).color }}>
            <h3 className="badge-name" style={{ color: getBadge(score).color }}>
              {getBadge(score).title}
            </h3>
            <p className="badge-desc">{getBadge(score).desc}</p>
          </div>

          <div className="results-stats-row">
            <div className="stat-pill">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{Math.round((score / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Highest Streak</span>
              <span className="stat-value">🔥 {bestStreak}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="results-actions">
            <button onClick={handleRestart} className="primary-glow-btn">
              <RotateCcw size={18} /> Take Quiz Again
            </button>
            <button onClick={() => setActiveTab('theory')} className="secondary-glass-btn">
              Review Theory Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
