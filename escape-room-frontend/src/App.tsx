import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // We'll use this for extra styling

const API = 'http://localhost:3001/escape';

function App() {
  const [level, setLevel] = useState(1);
  const [riddle, setRiddle] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [lives, setLives] = useState(3);
  const [theme, setTheme] = useState('classic');
  const [difficulty, setDifficulty] = useState('easy');
  const [hint, setHint] = useState('');
  const [usedHint, setUsedHint] = useState(false);

  // Load a riddle
  const loadRiddle = async (currentLevel: number) => {
    setLoading(true);
    setMessage('');
    setTimer(60);
    setUsedHint(false);
    try {
      const res = await axios.get(
        `${API}/riddle?level=${currentLevel}&theme=${theme}&difficulty=${difficulty}`
      );
      setRiddle(res.data.riddle);
      setHint(res.data.hint || '');
      setDifficulty(res.data.difficulty || 'easy');
    } catch (err: any) {
      setMessage('Failed to load riddle.');
    }
    setLoading(false);
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!answer) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/answer`, { level, riddle, answer });
      const next = res.data.nextLevel;
      setLevel(next);
      setAnswer('');
      setMessage('✅ Correct! 🎉');

      // Load next level
      if (next <= 4) await loadRiddle(next);
    } catch (err) {
      loseLife();
      setMessage('❌ Wrong answer!');
    }
    setLoading(false);
  };

  const loseLife = () => {
    setLives((l) => l - 1);
    if (lives - 1 <= 0) {
      new Audio('/sounds/gameover.mp3').play();
      alert('💀 Game Over!');
      window.location.reload();
    } else {
      new Audio('/sounds/wrong.mp3').play();
    }
  };

  // Show hint
  const showHint = () => {
    if (usedHint) return;
    if (lives <= 1) {
      alert('Not enough lives for a hint!');
      return;
    }
    setUsedHint(true);
    setLives((l) => l - 1);
    setMessage(`💡 Hint: ${hint}`);
    new Audio('/sounds/hint.mp3').play();
  };

  // Timer countdown
  useEffect(() => {
    if (!riddle || level > 4) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    if (timer <= 0) {
      loseLife();
      loadRiddle(level);
      setTimer(60);
    }

    return () => clearInterval(interval);
  }, [timer, riddle]);

  // Progress for levels
  const progress = (level - 1) / 4 * 100;

  return (
    <div className="game-container">
      <h1>🧩 AI Escape Room</h1>

      <div className="label-select">
        <p className="label-with-emoji">🎯 Theme:
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="classic">Classic</option>
            <option value="science">Science</option>
            <option value="pirate">Pirate</option>
          </select>
        </p>

        <p className="label-with-emoji">⚡ Difficulty:
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </p>
        <div className="status-bar">
        <p className="label-with-emoji">⏱ Timer: {timer}s | ❤️ Lives: {lives}</p>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {level > 4 ? (
        <div className="victory-screen">
          <h2>🎉 YOU ESCAPED!</h2>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      ) : (
        <div className="riddle-card">
          <h3>Level {level} / 4 </h3>
          <p className="riddle-text">{loading ? 'AI is thinking...' : riddle || 'Click below to start!'}</p>

          {!riddle && !loading && (
            <button className="btn" onClick={() => loadRiddle(level)}>Get Riddle</button>
          )}

          {riddle && !loading && (
            <>
              <input
                className="riddle-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
              />
              <div className="btn-group">
                <button className="btn" onClick={submitAnswer}>Submit Answer</button>
                <button className="btn hint" onClick={showHint}>💡 Hint (-1 life)</button>
              </div>
            </>
          )}

          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
