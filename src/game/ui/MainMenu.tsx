import { useState, useEffect } from 'react';
import { Swords, BookOpen, Settings, Trophy, Play, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  onContinueGame: () => void;
  hasSave: boolean;
}

type MenuScreen = 'main' | 'how_to_play' | 'settings';

export function MainMenu({ onStartGame, onContinueGame, hasSave }: MainMenuProps) {
  const [screen, setScreen] = useState<MenuScreen>('main');
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [showDamageNumbers, setShowDamageNumbers] = useState(true);
  const [screenShake, setScreenShake] = useState(true);
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [titlePulse, setTitlePulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitlePulse(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const glowIntensity = 0.5 + Math.sin(titlePulse * Math.PI / 180) * 0.3;

  if (screen === 'how_to_play') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundImage: 'url(/assets/title_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 w-full max-w-2xl p-8 rounded-lg"
          style={{ backgroundColor: 'rgba(26, 28, 44, 0.95)', border: '2px solid #C41E3A' }}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#F4E4C1' }}>
            <BookOpen className="inline mr-2 mb-1" /> Как Играть
          </h2>

          <div className="space-y-4 text-sm" style={{ color: '#A39B8B' }}>
            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)' }}>
              <h3 className="font-bold mb-1" style={{ color: '#F4E4C1' }}>Управление</h3>
              <p><span style={{ color: '#FFD700' }}>WASD / Стрелки</span> — Передвижение</p>
              <p><span style={{ color: '#FFD700' }}>ЛКМ / Клик</span> — Атака</p>
              <p><span style={{ color: '#FFD700' }}>Пробел</span> — Перекат (уклонение)</p>
              <p><span style={{ color: '#FFD700' }}>1</span> — Магическая атака</p>
              <p><span style={{ color: '#FFD700' }}>E</span> — Взаимодействие / Диалог</p>
              <p><span style={{ color: '#FFD700' }}>I</span> — Инвентарь</p>
              <p><span style={{ color: '#FFD700' }}>M</span> — Карта</p>
              <p><span style={{ color: '#FFD700' }}>ESC</span> — Пауза</p>
            </div>

            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)' }}>
              <h3 className="font-bold mb-1" style={{ color: '#F4E4C1' }}>Суть Игры</h3>
              <p>Вы — Кристофер, ангел, попавший на остров Вуклас. Люди боятся ангелов, поэтому вы должны скрывать свою истинную сущность.</p>
              <p className="mt-1">Если шкала <span style={{ color: '#C41E3A' }}>Разоблачения</span> достигнет 100%, враги узнают вас!</p>
            </div>

            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)' }}>
              <h3 className="font-bold mb-1" style={{ color: '#F4E4C1' }}>Механика Смерти</h3>
              <p>Когда ваше HP падает до 0, вы попадаете на <span style={{ color: '#7B68EE' }}>дуэль со Смертью</span>. Победите её, чтобы воскреснуть!</p>
              <p className="mt-1">Если проиграете дуэль — игра окончена навсегда.</p>
            </div>

            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)' }}>
              <h3 className="font-bold mb-1" style={{ color: '#F4E4C1' }}>Фракции</h3>
              <p><span style={{ color: '#4A7C59' }}>Люди</span> — Осторожны, живут в деревне</p>
              <p><span style={{ color: '#8B7355' }}>Гномы</span> — Торгаши и воины из шахт</p>
              <p><span style={{ color: '#4A7C59' }}>Эльфы</span> — Лучники, охраняют лес</p>
              <p><span style={{ color: '#7B68EE' }}>Культисты</span> — Самые опасные! Знают ваши слабости</p>
            </div>
          </div>

          <button
            onClick={() => setScreen('main')}
            className="mt-6 w-full py-3 rounded font-bold text-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#C41E3A', color: '#F4E4C1' }}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundImage: 'url(/assets/title_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 w-full max-w-md p-8 rounded-lg"
          style={{ backgroundColor: 'rgba(26, 28, 44, 0.95)', border: '2px solid #C41E3A' }}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#F4E4C1' }}>
            <Settings className="inline mr-2 mb-1" /> Настройки
          </h2>

          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between" style={{ color: '#F4E4C1' }}>
                <span className="flex items-center gap-2">{musicVolume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />} Музыка</span>
                <span style={{ color: '#A39B8B' }}>{Math.floor(musicVolume * 100)}%</span>
              </label>
              <input type="range" min="0" max="100" value={musicVolume * 100}
                onChange={e => setMusicVolume(Number(e.target.value) / 100)}
                className="w-full mt-2 accent-red-700" />
            </div>

            <div>
              <label className="flex items-center justify-between" style={{ color: '#F4E4C1' }}>
                <span className="flex items-center gap-2">{sfxVolume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />} Звуки</span>
                <span style={{ color: '#A39B8B' }}>{Math.floor(sfxVolume * 100)}%</span>
              </label>
              <input type="range" min="0" max="100" value={sfxVolume * 100}
                onChange={e => setSfxVolume(Number(e.target.value) / 100)}
                className="w-full mt-2 accent-red-700" />
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: '#F4E4C1' }}>Показать урон</span>
              <button onClick={() => setShowDamageNumbers(!showDamageNumbers)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: showDamageNumbers ? '#4A7C59' : '#555' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
                  style={{
                    backgroundColor: '#F4E4C1',
                    left: showDamageNumbers ? '28px' : '4px'
                  }} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: '#F4E4C1' }}>Тряска экрана</span>
              <button onClick={() => setScreenShake(!screenShake)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: screenShake ? '#4A7C59' : '#555' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
                  style={{
                    backgroundColor: '#F4E4C1',
                    left: screenShake ? '28px' : '4px'
                  }} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ color: '#C41E3A' }}>
                <AlertTriangle size={16} /> Хардкорный режим
              </span>
              <button onClick={() => setHardcoreMode(!hardcoreMode)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: hardcoreMode ? '#C41E3A' : '#555' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
                  style={{
                    backgroundColor: '#F4E4C1',
                    left: hardcoreMode ? '28px' : '4px'
                  }} />
              </button>
            </div>
            {hardcoreMode && (
              <p className="text-xs" style={{ color: '#C41E3A' }}>
                В хардкорном режиме нет дуэли со Смертью — смерть окончательна!
              </p>
            )}
          </div>

          <button
            onClick={() => setScreen('main')}
            className="mt-6 w-full py-3 rounded font-bold text-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#C41E3A', color: '#F4E4C1' }}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundImage: 'url(/assets/title_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Lightning effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, rgba(123, 104, 238, ${glowIntensity * 0.15}) 0%, transparent 70%)`,
        }} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <h1 className="text-6xl font-black mb-2 tracking-wider text-center"
          style={{
            color: '#F4E4C1',
            textShadow: `0 0 ${20 + glowIntensity * 20}px rgba(196, 30, 58, ${glowIntensity}), 0 0 40px rgba(196, 30, 58, 0.5), 2px 2px 4px #000`,
            fontFamily: 'serif',
          }}>
          HEROES OF DEATH
        </h1>
        <h2 className="text-2xl font-bold mb-12 tracking-widest"
          style={{
            color: '#C41E3A',
            textShadow: '0 0 10px rgba(196, 30, 58, 0.8), 1px 1px 2px #000',
          }}>
          ГЕРОИ СМЕРТИ
        </h2>

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 w-72">
          <button
            onClick={onStartGame}
            className="py-4 px-8 rounded font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 hover:brightness-125"
            style={{
              backgroundColor: '#C41E3A',
              color: '#F4E4C1',
              boxShadow: '0 0 15px rgba(196, 30, 58, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            <Play size={20} /> Новая Игра
          </button>

          {hasSave && (
            <button
              onClick={onContinueGame}
              className="py-4 px-8 rounded font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 hover:brightness-125"
              style={{
                backgroundColor: '#2D2F45',
                color: '#F4E4C1',
                border: '2px solid #4A7C59',
                boxShadow: '0 0 10px rgba(74, 124, 89, 0.3)',
              }}>
              <Swords size={20} /> Продолжить
            </button>
          )}

          <button
            onClick={() => setScreen('how_to_play')}
            className="py-3 px-8 rounded font-bold flex items-center justify-center gap-3 transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(45, 47, 69, 0.8)',
              color: '#A39B8B',
              border: '1px solid #555',
            }}>
            <BookOpen size={18} /> Обучение
          </button>

          <button
            onClick={() => setScreen('settings')}
            className="py-3 px-8 rounded font-bold flex items-center justify-center gap-3 transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(45, 47, 69, 0.8)',
              color: '#A39B8B',
              border: '1px solid #555',
            }}>
            <Settings size={18} /> Настройки
          </button>

          <button
            className="py-3 px-8 rounded font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 opacity-50 cursor-not-allowed"
            style={{
              backgroundColor: 'rgba(45, 47, 69, 0.5)',
              color: '#666',
              border: '1px solid #444',
            }}>
            <Trophy size={18} /> Достижения
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs" style={{ color: '#555' }}>
          v1.0 | Браузерная RPG | 2024
        </p>
      </div>
    </div>
  );
}
