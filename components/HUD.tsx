
import React from 'react';
import { GameState } from '../types';
import { Heart, Target, Layers } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
}

const HUD: React.FC<HUDProps> = ({ gameState }) => {
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center gap-4">
        <div className="bg-sky-500/10 p-2 rounded-md">
          <Target className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Score</div>
          <div className="text-xl font-orbitron text-white leading-none">{gameState.score.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center gap-4">
        <div className="bg-violet-500/10 p-2 rounded-md">
          <Layers className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Level</div>
          <div className="text-xl font-orbitron text-white leading-none">{gameState.level}</div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500/10 p-2 rounded-md">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Lives</div>
            <div className="flex gap-1.5 mt-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < gameState.lives ? 'bg-rose-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
