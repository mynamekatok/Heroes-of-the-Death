import { X, Sword, Shield, Sparkles, Package } from 'lucide-react';
import type { GameState, Item } from '../types/game';

interface InventoryOverlayProps {
  gameState: GameState;
  onClose: () => void;
  onEquipItem: (item: Item) => void;
  onUseItem: (item: Item) => void;
}

export function InventoryOverlay({ gameState, onClose, onEquipItem, onUseItem }: InventoryOverlayProps) {
  const player = gameState.player;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Sword size={16} />;
      case 'armor': return <Shield size={16} />;
      case 'potion': return <Sparkles size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(26, 28, 44, 0.95)',
          border: '2px solid #2D2F45',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)',
        }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(45, 47, 69, 0.8)', borderBottom: '2px solid #555' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#F4E4C1' }}>
            <Package size={24} style={{ color: '#C41E3A' }} /> Инвентарь
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={24} style={{ color: '#A39B8B' }} />
          </button>
        </div>

        <div className="flex">
          <div className="w-48 p-4" style={{ borderRight: '1px solid #333' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#A39B8B' }}>Экипировка</h3>

            <div className="space-y-3">
              <div className="p-3 rounded text-center" style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)', border: '1px solid #555' }}>
                <Sword size={20} className="mx-auto mb-1" style={{ color: '#A39B8B' }} />
                <div className="text-xs" style={{ color: '#555' }}>Оружие</div>
                {player.equipment.weapon ? (
                  <div className="text-xs font-bold" style={{ color: '#FFD700' }}>{player.equipment.weapon.name}</div>
                ) : (
                  <div className="text-xs" style={{ color: '#555' }}>Пусто</div>
                )}
              </div>

              <div className="p-3 rounded text-center" style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)', border: '1px solid #555' }}>
                <Shield size={20} className="mx-auto mb-1" style={{ color: '#A39B8B' }} />
                <div className="text-xs" style={{ color: '#555' }}>Доспех</div>
                {player.equipment.armor ? (
                  <div className="text-xs font-bold" style={{ color: '#FFD700' }}>{player.equipment.armor.name}</div>
                ) : (
                  <div className="text-xs" style={{ color: '#555' }}>Пусто</div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(45, 47, 69, 0.3)', border: '1px solid #333' }}>
              <h4 className="text-xs font-bold mb-2" style={{ color: '#A39B8B' }}>Характеристики</h4>
              <div className="text-xs space-y-1" style={{ color: '#F4E4C1' }}>
                <div className="flex justify-between"><span style={{ color: '#A39B8B' }}>Сила</span> <span>{player.stats.strength}</span></div>
                <div className="flex justify-between"><span style={{ color: '#A39B8B' }}>Ловкость</span> <span>{player.stats.agility}</span></div>
                <div className="flex justify-between"><span style={{ color: '#A39B8B' }}>Магия</span> <span>{player.stats.magic}</span></div>
                <div className="flex justify-between"><span style={{ color: '#A39B8B' }}>Урон</span> <span style={{ color: '#C41E3A' }}>{player.damage}</span></div>
                <div className="flex justify-between"><span style={{ color: '#A39B8B' }}>Защита</span> <span style={{ color: '#4A7C59' }}>{player.defense}</span></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: '#A39B8B' }}>Предметы</h3>
              <span className="text-xs" style={{ color: '#FFD700' }}>
                {player.gold} золота
              </span>
            </div>

            {player.inventory.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#555' }}>
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p>Инвентарь пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {player.inventory.map((invItem, i) => (
                  <div key={i} className="group relative p-2 rounded cursor-pointer transition-all hover:scale-105 hover:brightness-110"
                    style={{ backgroundColor: 'rgba(45, 47, 69, 0.5)', border: '1px solid #555' }}
                    onClick={() => {
                      if (invItem.item.type === 'potion') onUseItem(invItem.item);
                      else if (invItem.item.type === 'weapon' || invItem.item.type === 'armor') onEquipItem(invItem.item);
                    }}>

                    <div className="flex items-center justify-center h-10" style={{ color: '#A39B8B' }}>
                      {getItemIcon(invItem.item.type)}
                    </div>

                    <div className="text-xs text-center truncate" style={{ color: '#F4E4C1' }}>
                      {invItem.item.name}
                    </div>

                    {invItem.quantity > 1 && (
                      <div className="absolute top-1 right-1 text-xs font-bold" style={{ color: '#FFD700' }}>
                        {invItem.quantity}
                      </div>
                    )}

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                      style={{ backgroundColor: 'rgba(0,0,0,0.9)', color: '#F4E4C1' }}>
                      {invItem.item.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
