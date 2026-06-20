import { useEffect, useState } from 'react';
import { Crown, Star, Clock, TrendingUp, DollarSign, RotateCcw, Home } from 'lucide-react';
import type { GameState } from '../types/game';

interface VictoryScreenProps {
  gameState: GameState;
  onNewGame: () => void;
  onMainMenu: () => void;
}

export function VictoryScreen({ gameState, onNewGame, onMainMenu }: VictoryScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeIn(true), 500);
    const t2 = setTimeout(() => setShowStats(true), 1500);
    const t3 = setTimeout(() => {
      // Calculate star rating
      let starCount = 1; // Completed story
      if (gameState.player.exposure < 50) starCount = 2;
      if (gameState.player.exposure < 50 && gameState.timePlayed < 1800) starCount = 3;
      setStars(starCount);
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [gameState.player.exposure, gameState.timePlayed]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}ч ${mins}м ${secs}с`;
    return `${mins}м ${secs}с`;
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundImage: 'url(/assets/victory_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/40" />

      {/* Golden particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              backgroundColor: '#FFD700',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }} />
        ))}
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Crown icon */}
        <div className="mb-4">
          <Crown size={64} style={{ color: '#FFD700', filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))' }} />
        </div>

        <h1 className="text-6xl font-black mb-2 tracking-wider"
          style={{
            color: '#FFD700',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4), 2px 2px 4px #000',
          }}>
          ПОБЕДА
        </h1>

        <p className="text-xl mb-4" style={{ color: '#F4E4C1' }}>
          Остров Вуклас спасён!
        </p>

        <p className="text-sm mb-8 max-w-md text-center" style={{ color: '#A39B8B' }}>
          Кристофер раскрыл заговор Культистов, победил их вождя и восстановил мир на острове.
          Ваша легенда будет жить в веках...
        </p>

        {/* Stars */}
        <div className={`flex gap-2 mb-6 transition-all duration-500 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
          {[1, 2, 3].map(i => (
            <Star key={i} size={40}
              className="transition-all duration-500"
              style={{
                color: i <= stars ? '#FFD700' : '#333',
                fill: i <= stars ? '#FFD700' : 'none',
                filter: i <= stars ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'none',
                transform: i <= stars ? 'scale(1)' : 'scale(0.8)',
                transitionDelay: `${i * 200}ms`,
              }} />
          ))}
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-4 mb-8 w-80 transition-all duration-700 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <Clock size={16} className="mx-auto mb-1" style={{ color: '#FFD700' }} />
            <div className="text-xs" style={{ color: '#555' }}>Время</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{formatTime(gameState.timePlayed)}</div>
          </div>

          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <TrendingUp size={16} className="mx-auto mb-1" style={{ color: '#FFD700' }} />
            <div className="text-xs" style={{ color: '#555' }}>Уровень</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{gameState.player.level}</div>
          </div>

          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <DollarSign size={16} className="mx-auto mb-1" style={{ color: '#FFD700' }} />
            <div className="text-xs" style={{ color: '#555' }}>Золото собрано</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{gameState.player.gold}</div>
          </div>

          <div className="p-3 rounded text-center"
            style={{ backgroundColor: 'rgba(26, 28, 44, 0.8)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <Star size={16} className="mx-auto mb-1" style={{ color: '#FFD700' }} />
            <div className="text-xs" style={{ color: '#555' }}>Разоблачение</div>
            <div className="font-bold" style={{ color: '#F4E4C1' }}>{Math.floor(gameState.player.exposure)}%</div>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-4 transition-all duration-700 delay-300 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onNewGame}
            className="py-3 px-8 rounded font-bold flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: '#FFD700',
              color: '#1A1C2C',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
            }}>
            <RotateCcw size={18} /> Новая Игра+
          </button>

          <button
            onClick={onMainMenu}
            className="py-3 px-8 rounded font-bold flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(26, 28, 44, 0.8)',
              color: '#F4E4C1',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }}>
            <Home size={18} /> В меню
          </button>
        </div>
      </div>
    </div>
  );
}
