
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import { getGameCommentary } from './geminiService';
import { Trophy, Play, RotateCcw, Ghost } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    status: GameStatus.START
  });
  const [highScore, setHighScore] = useState<number>(0);
  const [aiCommentary, setAiCommentary] = useState<string>("준비되셨나요? 시작해보세요!");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('brick-breaker-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Update High Score
  useEffect(() => {
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem('brick-breaker-high-score', gameState.score.toString());
    }
  }, [gameState.score, highScore]);

  const fetchCommentary = useCallback(async (event: 'victory' | 'defeat' | 'streak') => {
    setIsAiLoading(true);
    const text = await getGameCommentary(gameState.score, gameState.level, event);
    setAiCommentary(text);
    setIsAiLoading(false);
  }, [gameState.score, gameState.level]);

  const handleStartGame = () => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      level: 1,
      lives: 3
    }));
    fetchCommentary('streak');
  };

  const handleGameOver = useCallback(() => {
    setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    fetchCommentary('defeat');
  }, [fetchCommentary]);

  const handleLevelComplete = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      status: GameStatus.LEVEL_COMPLETE
    }));
    fetchCommentary('victory');
  }, [fetchCommentary]);

  const handleNextLevel = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }));
  };

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        handleGameOver();
        return { ...prev, lives: 0 };
      }
      return { ...prev, lives: newLives };
    });
  }, [handleGameOver]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Header Info */}
      <div className="w-full max-w-[800px] flex justify-between items-end mb-4 px-2">
        <div className="flex flex-col">
          <h1 className="text-4xl font-orbitron font-bold text-sky-400 tracking-tighter flex items-center gap-2">
            <Ghost className="w-8 h-8" /> NEON BREAKER
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAiLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            AI Assistant: <span className="text-slate-200 font-medium italic">"{aiCommentary}"</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-slate-500 text-xs font-bold uppercase">High Score</div>
          <div className="text-2xl font-orbitron text-amber-400">{highScore.toLocaleString()}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative shadow-2xl shadow-sky-900/20 rounded-xl overflow-hidden border border-slate-800">
        <GameCanvas 
          gameState={gameState}
          onScoreUpdate={updateScore}
          onLifeLost={loseLife}
          onLevelComplete={handleLevelComplete}
        />

        {/* UI Overlays */}
        {gameState.status === GameStatus.START && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-sky-500/20">
              <Play className="w-12 h-12 text-sky-400 ml-1" />
            </div>
            <h2 className="text-5xl font-orbitron font-bold text-white mb-4">READY?</h2>
            <p className="text-slate-400 mb-8 max-w-md">마우스를 움직여 패들을 조작하고 공을 튕겨 모든 벽돌을 제거하세요.</p>
            <button 
              onClick={handleStartGame}
              className="px-10 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-sky-500/20"
            >
              START GAME
            </button>
          </div>
        )}

        {gameState.status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-6xl font-orbitron font-bold text-white mb-2">GAME OVER</h2>
            <div className="text-slate-300 mb-8 text-xl">Score: <span className="text-sky-400 font-bold font-orbitron">{gameState.score}</span></div>
            <button 
              onClick={handleStartGame}
              className="flex items-center gap-2 px-10 py-4 bg-white text-slate-900 font-bold rounded-full transition-all hover:bg-slate-200 shadow-xl"
            >
              <RotateCcw className="w-5 h-5" /> TRY AGAIN
            </button>
          </div>
        )}

        {gameState.status === GameStatus.LEVEL_COMPLETE && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <Trophy className="w-20 h-20 text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-5xl font-orbitron font-bold text-white mb-2">LEVEL CLEAR!</h2>
            <div className="text-slate-300 mb-8 text-xl">Great Job! Get ready for Level {gameState.level + 1}</div>
            <button 
              onClick={handleNextLevel}
              className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full transition-all shadow-xl shadow-emerald-500/20"
            >
              NEXT LEVEL
            </button>
          </div>
        )}
      </div>

      {/* Footer / HUD */}
      <div className="w-full max-w-[800px] mt-4">
        <HUD gameState={gameState} />
      </div>

      <div className="mt-8 text-slate-600 text-xs flex gap-4 uppercase tracking-tighter">
        <span>Mouse - Move Paddle</span>
        <span>Space - Pause (WIP)</span>
      </div>
    </div>
  );
};

export default App;
