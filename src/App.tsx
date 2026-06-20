import { useState, useCallback, useEffect } from 'react';
import type { GameState, GameScreen, Item } from './game/types/game';
import { createInitialState } from './game/engine/GameState';
import { inputManager } from './game/engine/InputManager';
import { GameCanvas } from './game/ui/GameCanvas';
import { MainMenu } from './game/ui/MainMenu';
import { StoryIntro } from './game/ui/StoryIntro';
import { DialogOverlay } from './game/ui/DialogOverlay';
import { PauseMenu } from './game/ui/PauseMenu';
import { InventoryOverlay } from './game/ui/InventoryOverlay';
import { GameOverScreen } from './game/ui/GameOverScreen';
import { VictoryScreen } from './game/ui/VictoryScreen';
import { Skull, Swords } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('main_menu');
  const [hasSave, setHasSave] = useState(false);

  // Check for save on mount
  useEffect(() => {
    const save = localStorage.getItem('heroes_of_death_save');
    setHasSave(!!save);
  }, []);

  // Keyboard handler for pause, inventory, map
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentScreen === 'playing') {
          setGameState(prev => ({
            ...prev,
            isPaused: !prev.isPaused,
            dialogActive: false,
            inventoryOpen: false,
            mapOpen: false,
          }));
        }
      }
      if (e.key.toLowerCase() === 'i' && currentScreen === 'playing') {
        setGameState(prev => ({
          ...prev,
          inventoryOpen: !prev.inventoryOpen,
          isPaused: !prev.inventoryOpen,
        }));
      }
      if (e.key.toLowerCase() === 'm' && currentScreen === 'playing') {
        setGameState(prev => ({
          ...prev,
          mapOpen: !prev.mapOpen,
          isPaused: !prev.mapOpen,
        }));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentScreen]);

  const handleStartGame = useCallback(() => {
    setGameState(createInitialState());
    setCurrentScreen('story_intro');
  }, []);

  const handleContinueGame = useCallback(() => {
    const save = localStorage.getItem('heroes_of_death_save');
    if (save) {
      try {
        const savedState = JSON.parse(save);
        setGameState(prev => ({ ...prev, ...savedState, screen: 'playing' }));
        setCurrentScreen('playing');
      } catch {
        // Invalid save, start new
        handleStartGame();
      }
    }
  }, [handleStartGame]);

  const handleStoryComplete = useCallback(() => {
    setCurrentScreen('playing');
    setGameState(prev => ({
      ...prev,
      screen: 'playing',
      player: { ...prev.player, hp: prev.player.maxHp },
    }));
  }, []);

  const handleScreenChange = useCallback((screen: string) => {
    setCurrentScreen(screen as GameScreen);
  }, []);

  const handleResume = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState());
    setCurrentScreen('playing');
    inputManager.reset();
  }, []);

  const handleSave = useCallback(() => {
    const saveData = {
      player: gameState.player,
      currentZone: gameState.currentZone,
      quests: gameState.quests,
      factionReputation: gameState.factionReputation,
      timePlayed: gameState.timePlayed,
    };
    localStorage.setItem('heroes_of_death_save', JSON.stringify(saveData));
    setHasSave(true);
    alert('Игра сохранена!');
  }, [gameState]);

  const handleQuit = useCallback(() => {
    setGameState(createInitialState());
    setCurrentScreen('main_menu');
    inputManager.reset();
  }, []);

  const handleEquipItem = useCallback((item: Item) => {
    setGameState(prev => {
      const newState = { ...prev };
      if (item.type === 'weapon') {
        newState.player.equipment.weapon = item;
        if (item.weaponClass) newState.player.weaponClass = item.weaponClass;
      } else if (item.type === 'armor') {
        newState.player.equipment.armor = item;
      }
      // Remove from inventory
      const idx = newState.player.inventory.findIndex(inv => inv.item.id === item.id);
      if (idx >= 0) {
        newState.player.inventory[idx].quantity--;
        if (newState.player.inventory[idx].quantity <= 0) {
          newState.player.inventory.splice(idx, 1);
        }
      }
      return newState;
    });
  }, []);

  const handleUseItem = useCallback((item: Item) => {
    setGameState(prev => {
      const newState = { ...prev };
      if (item.id === 'health_potion') {
        newState.player.hp = Math.min(newState.player.maxHp, newState.player.hp + 50);
      } else if (item.id === 'mana_potion') {
        newState.player.mana = Math.min(newState.player.maxMana, newState.player.mana + 30);
      }
      // Remove from inventory
      const idx = newState.player.inventory.findIndex(inv => inv.item.id === item.id);
      if (idx >= 0) {
        newState.player.inventory[idx].quantity--;
        if (newState.player.inventory[idx].quantity <= 0) {
          newState.player.inventory.splice(idx, 1);
        }
      }
      return newState;
    });
  }, []);

  const handleNewGamePlus = useCallback(() => {
    const newState = createInitialState();
    newState.player.level = 5;
    newState.player.damage = 30;
    newState.player.maxHp = 150;
    newState.player.hp = 150;
    setGameState(newState);
    setCurrentScreen('playing');
  }, []);

  // Render screens
  if (currentScreen === 'main_menu') {
    return (
      <MainMenu
        onStartGame={handleStartGame}
        onContinueGame={handleContinueGame}
        hasSave={hasSave}
      />
    );
  }

  if (currentScreen === 'story_intro') {
    return <StoryIntro onComplete={handleStoryComplete} />;
  }

  if (currentScreen === 'game_over') {
    return (
      <GameOverScreen
        gameState={gameState}
        onRestart={handleRestart}
        onMainMenu={handleQuit}
      />
    );
  }

  if (currentScreen === 'victory') {
    return (
      <VictoryScreen
        gameState={gameState}
        onNewGame={handleNewGamePlus}
        onMainMenu={handleQuit}
      />
    );
  }

  // Playing or Death Duel - render canvas + overlays
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <GameCanvas
        gameState={gameState}
        setGameState={setGameState}
        onScreenChange={handleScreenChange}
      />

      {/* Quest notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        {gameState.quests.filter(q => q.isActive && !q.isCompleted).map(q => (
          <div key={q.id} className="px-4 py-2 rounded mb-1 text-xs font-bold animate-pulse"
            style={{
              backgroundColor: 'rgba(196, 30, 58, 0.8)',
              color: '#F4E4C1',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}>
            <Swords size={12} className="inline mr-1" />
            {q.nameRu}: {q.objectives.filter(o => o.current < o.required).map(o => o.descriptionRu).join(', ')}
          </div>
        ))}
        {gameState.quests.filter(q => q.isCompleted && !q.isTurnedIn).map(q => (
          <div key={q.id} className="px-4 py-2 rounded mb-1 text-xs font-bold"
            style={{
              backgroundColor: 'rgba(74, 124, 89, 0.9)',
              color: '#F4E4C1',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}>
            ✓ {q.nameRu} — Выполнено!
          </div>
        ))}
      </div>

      {/* Exposure warning overlay */}
      {gameState.player.exposure > 75 && (
        <div className="fixed inset-0 pointer-events-none z-20"
          style={{
            boxShadow: `inset 0 0 100px rgba(196, 30, 58, ${0.1 + Math.sin(Date.now() / 300) * 0.1})`,
          }} />
      )}

      {/* Dialog overlay */}
      {gameState.dialogActive && (
        <DialogOverlay gameState={gameState} setGameState={setGameState} />
      )}

      {/* Pause menu */}
      {gameState.isPaused && !gameState.inventoryOpen && !gameState.mapOpen && currentScreen === 'playing' && (
        <PauseMenu
          gameState={gameState}
          onResume={handleResume}
          onRestart={handleRestart}
          onSave={handleSave}
          onQuit={handleQuit}
        />
      )}

      {/* Inventory overlay */}
      {gameState.inventoryOpen && (
        <InventoryOverlay
          gameState={gameState}
          onClose={() => setGameState(prev => ({ ...prev, inventoryOpen: false, isPaused: false }))}
          onEquipItem={handleEquipItem}
          onUseItem={handleUseItem}
        />
      )}

      {/* Map overlay */}
      {gameState.mapOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center"
          onClick={() => setGameState(prev => ({ ...prev, mapOpen: false, isPaused: false }))}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-3xl mx-4 rounded-lg overflow-hidden p-6"
            style={{
              backgroundColor: 'rgba(26, 28, 44, 0.95)',
              border: '2px solid #2D2F45',
            }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#F4E4C1' }}>Карта острова Вуклас</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'frostpeak', name: 'Ледяная Вершина', x: 1, y: 0 },
                { id: 'beach', name: 'Берег Вукласа', x: 0, y: 1 },
                { id: 'village', name: 'Серная Гавань', x: 1, y: 1 },
                { id: 'forest', name: 'Шепчущий Лес', x: 2, y: 1 },
                { id: 'mine', name: 'Шахты', x: 1, y: 2 },
                { id: 'moor', name: 'Мрачная Пустошь', x: 2, y: 2 },
                { id: 'temple', name: 'Собор', x: 2, y: 0 },
                { id: 'ruins', name: 'Разрушенный Город', x: 1, y: 3 },
                { id: 'stronghold', name: 'Цитадель', x: 2, y: 3 },
                { id: 'eye_of_storm', name: 'Око Бури', x: 2, y: 4 },
              ].map(zone => (
                <div key={zone.id}
                  className="p-3 rounded text-center text-sm transition-all"
                  style={{
                    backgroundColor: gameState.currentZone === zone.id ? 'rgba(196, 30, 58, 0.3)' : 'rgba(45, 47, 69, 0.5)',
                    border: gameState.currentZone === zone.id ? '2px solid #C41E3A' : '1px solid #555',
                    color: gameState.currentZone === zone.id ? '#F4E4C1' : '#A39B8B',
                    gridColumn: zone.x + 1,
                  }}>
                  {gameState.currentZone === zone.id && <Skull size={12} className="inline mr-1" style={{ color: '#C41E3A' }} />}
                  {zone.name}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-center" style={{ color: '#555' }}>Нажмите M или кликните вне карты чтобы закрыть</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
