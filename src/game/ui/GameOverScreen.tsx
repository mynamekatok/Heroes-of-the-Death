import { useEffect, useState } from 'react';
import { Skull, RotateCcw, Home, Clock, TrendingUp, DollarSign } from 'lucide-react';
import type { GameState } from '../types/game';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOverScreen({ gameState, onRestart, onMainMenu }: GameOverScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeIn(true), 500);
    const t2 = setTimeout(() => setShowStats(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}ч ${mins}м`;
    return `${mins}м ${secs}с`;
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundImage: 'url(/assets/gameover_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/60" />

      {/* Blood drip effect */}
      <div className="absolute top-0 left-1/4 w-1 h-20 opacity-30"
        style={{ background: 'linear-gradient(to bottom, #C41E3A, transparent)' }} />
      <div className="absolute top-0 left-1/2 w-0.5 h-32 opacity-20"
        style={{ background: 'linear-gradient(to bottom, #8B0000, transparent)' }} />
      <div className="absolute top-0 right-1/3 w-1 h-16 opacity-25"
        style={{ background: 'linear-gradient(to bottom, #C41E3A, transparent)' }} />

      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Death icon */}
        <div className="mb-4">
          <Skull size={64} style={{ color: '#C41E3A', filter: 'drop-shadow(0 0 20px rgba(196, 30, 58, 0.6))' }} />
        </div>

        <h1 className="text-5xl font-black mb-2 tracking-wider"
          style={{
            color: '#C41E3A',
            textShadow: '0 0 30px rgba(196, 30, 58, 0.8), 0 0 60px rgba(196, 30, 58, 0.4), 2px 2px 4px #000',
          }}>
          ВАША ДУША ПОГЛОЩЕНА
        </h1>

        <p className="text-xl mb-8" style={{ color: '#A39B8B' }}>
          Смерть одержала верх. Ваше путешествие окончено.
        </p>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-4 mb-8 w-80 transition-all duration-700 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid #333' }}>
            <Clock size={16} className="mx-auto mb-1" style={{ color: '#A39B8B' }} />
            <div className="text-xs" style={{ color: '#555' }}>Время</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{formatTime(gameState.timePlayed)}</div>
          </div>

          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid #333' }}>
            <TrendingUp size={16} className="mx-auto mb-1" style={{ color: '#A39B8B' }} />
            <div className="text-xs" style={{ color: '#555' }}>Уровень</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{gameState.player.level}</div>
          </div>

          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid #333' }}>
            <Skull size={16} className="mx-auto mb-1" style={{ color: '#C41E3A' }} />
            <div className="text-xs" style={{ color: '#555' }}>Смертей пережито</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{gameState.player.deaths}</div>
          </div>

          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid #333' }}>
            <DollarSign size={16} className="mx-auto mb-1" style={{ color: '#FFD700' }} />
            <div className="text-xs" style={{ color: '#555' }}>Золото</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{gameState.player.gold}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-4 transition-all duration-700 delay-300 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onRestart}
            className="py-3 px-8 rounded font-bold flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: '#C41E3A',
              color: '#F4E4C1',
              boxShadow: '0 0 15px rgba(196, 30, 58, 0.4)',
            }}>
            <RotateCcw size={18} /> Заново
          </button>

          <button
            onClick={onMainMenu}
            className="py-3 px-8 rounded font-bold flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(45, 47, 69, 0.8)',
              color: '#A39B8B',
              border: '1px solid #555',
            }}>
            <Home size={18} /> В меню
          </button>
        </div>
      </div>
    </div>
  );
}
