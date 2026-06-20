import { useEffect, useState } from 'react';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import type { GameState } from '../types/game';

interface DialogOverlayProps {
  gameState: GameState;
  setGameState: (s: GameState | ((prev: GameState) => GameState)) => void;
}

export function DialogOverlay({ gameState, setGameState }: DialogOverlayProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const dialogue = gameState.currentDialogue;

  useEffect(() => {
    if (!dialogue) return;
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < dialogue.text.length) {
        setDisplayedText(dialogue.text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [dialogue?.id, dialogue?.text]);

  const handleChoice = (choice: { text: string; nextNodeId?: string; exposureGain?: number }) => {
    if (isTyping) {
      setDisplayedText(dialogue?.text || '');
      setIsTyping(false);
      return;
    }

    // Apply exposure gain
    if (choice.exposureGain) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          exposure: Math.min(100, prev.player.exposure + choice.exposureGain!),
        },
      }));
    }

    if (choice.nextNodeId && dialogue) {
      // Find next node - in a real implementation this would traverse the dialogue tree
      setGameState(prev => ({
        ...prev,
        currentDialogue: {
          ...prev.currentDialogue!,
          id: choice.nextNodeId!,
          text: '...',
          choices: [],
        },
      }));
    } else {
      // Close dialog
      setGameState(prev => ({
        ...prev,
        dialogActive: false,
        currentDialogue: null,
      }));
    }
  };

  const closeDialog = () => {
    setGameState(prev => ({
      ...prev,
      dialogActive: false,
      currentDialogue: null,
    }));
  };

  if (!dialogue) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pb-8"
      onClick={closeDialog}>
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Dialog box */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(26, 28, 44, 0.95)',
          border: '2px solid #2D2F45',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Speaker header */}
        <div className="px-6 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'rgba(45, 47, 69, 0.8)', borderBottom: '1px solid #555' }}>
          <MessageCircle size={18} style={{ color: '#C41E3A' }} />
          <span className="font-bold" style={{ color: '#F4E4C1' }}>{dialogue.speaker}</span>
          {gameState.player.exposure > 50 && (
            <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#C41E3A' }}>
              <AlertTriangle size={12} /> Осторожно!
            </span>
          )}
        </div>

        {/* Dialog text */}
        <div className="px-6 py-4 min-h-[100px]">
          <p className="text-lg leading-relaxed" style={{ color: '#F4E4C1' }}>
            {displayedText}
            {isTyping && <span className="animate-pulse" style={{ color: '#C41E3A' }}>|</span>}
          </p>
        </div>

        {/* Choices */}
        {!isTyping && dialogue.choices.length > 0 && (
          <div className="px-6 pb-4 flex flex-col gap-2">
            {dialogue.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                className="text-left px-4 py-3 rounded transition-all hover:scale-[1.02] hover:brightness-110"
                style={{
                  backgroundColor: 'rgba(45, 47, 69, 0.6)',
                  color: choice.exposureGain ? '#C41E3A' : '#A39B8B',
                  border: `1px solid ${choice.exposureGain ? '#C41E3A' : '#555'}`,
                }}>
                <span style={{ color: '#FFD700' }}>&gt;</span> {choice.text}
                {choice.exposureGain && choice.exposureGain > 0 && (
                  <span className="ml-2 text-xs" style={{ color: '#C41E3A' }}>
                    (+{choice.exposureGain}% разоблачение)
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {!isTyping && dialogue.choices.length === 0 && (
          <div className="px-6 pb-4">
            <button
              onClick={closeDialog}
              className="w-full py-2 rounded text-center transition-all hover:brightness-110"
              style={{ backgroundColor: '#C41E3A', color: '#F4E4C1' }}>
              Продолжить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
