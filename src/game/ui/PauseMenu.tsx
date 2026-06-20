import { Play, RotateCcw, LogOut, Save } from 'lucide-react';
import type { GameState } from '../types/game';

interface PauseMenuProps {
  gameState: GameState;
  onResume: () => void;
  onRestart: () => void;
  onSave: () => void;
  onQuit: () => void;
}

export function PauseMenu({ gameState, onResume, onRestart, onSave, onQuit }: PauseMenuProps) {
  const player = gameState.player;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-lg"
        style={{
          backgroundColor: 'rgba(26, 28, 44, 0.95)',
          border: '2px solid #C41E3A',
          boxShadow: '0 0 40px rgba(196, 30, 58, 0.3)',
        }}>

        <h2 className="text-4xl font-black text-center mb-2" style={{
          color: '#F4E4C1',
          textShadow: '0 0 15px rgba(196, 30, 58, 0.5)',
        }}>
          ПАУЗА
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: '#555' }}>
          Игра приостановлена
        </p>

        <div className="mb-6 p-4 rounded"
          style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)' }}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div style={{ color: '#A39B8B' }}>Уровень: <span style={{ color: '#F4E4C1' }}>{player.level}</span></div>
            <div style={{ color: '#A39B8B' }}>HP: <span style={{ color: '#4A7C59' }}>{Math.floor(player.hp)}/{player.maxHp}</span></div>
            <div style={{ color: '#A39B8B' }}>Золото: <span style={{ color: '#FFD700' }}>{player.gold}</span></div>
            <div style={{ color: '#A39B8B' }}>Смертей: <span style={{ color: '#C41E3A' }}>{player.deaths}</span></div>
            <div style={{ color: '#A39B8B' }}>Разоблачение: <span style={{ color: player.exposure > 50 ? '#C41E3A' : '#A39B8B' }}>{Math.floor(player.exposure)}%</span></div>
            <div style={{ color: '#A39B8B' }}>Зона: <span style={{ color: '#F4E4C1' }}>
              {gameState.currentZone === 'beach' ? 'Берег' :
               gameState.currentZone === 'village' ? 'Деревня' :
               gameState.currentZone === 'forest' ? 'Лес' :
               gameState.currentZone === 'mine' ? 'Шахты' :
               gameState.currentZone === 'temple' ? 'Собор' : gameState.currentZone}
            </span></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="py-3 px-6 rounded font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105"
            style={{ backgroundColor: '#4A7C59', color: '#F4E4C1' }}>
            <Play size={20} /> Продолжить
          </button>

          <button
            onClick={onSave}
            className="py-3 px-6 rounded font-bold flex items-center justify-center gap-3 transition-all hover:scale-105"
            style={{ backgroundColor: '#2D2F45', color: '#F4E4C1', border: '1px solid #555' }}>
            <Save size={18} /> Сохранить
          </button>

          <button
            onClick={onRestart}
            className="py-3 px-6 rounded font-bold flex items-center justify-center gap-3 transition-all hover:scale-105"
            style={{ backgroundColor: '#2D2F45', color: '#A39B8B', border: '1px solid #555' }}>
            <RotateCcw size={18} /> Заново
          </button>

          <button
            onClick={onQuit}
            className="py-3 px-6 rounded font-bold flex items-center justify-center gap-3 transition-all hover:scale-105"
            style={{ backgroundColor: '#2D2F45', color: '#C41E3A', border: '1px solid #C41E3A' }}>
            <LogOut size={18} /> Выйти в меню
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#555' }}>
          Нажмите ESC чтобы продолжить
        </p>
      </div>
    </div>
  );
}
