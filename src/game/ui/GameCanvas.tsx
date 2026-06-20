import { useEffect, useRef, useCallback } from 'react';
import type { GameState } from '../types/game';
import { inputManager } from '../engine/InputManager';
import { startGameLoop, preloadImages } from '../engine/GameLoop';
import { spawnZoneEntities } from '../engine/GameState';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (s: GameState | ((prev: GameState) => GameState)) => void;
  onScreenChange: (screen: string) => void;
}

export function GameCanvas({ gameState, setGameState, onScreenChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleStart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    inputManager.init(canvas);

    // Spawn initial zone entities
    setGameState(prev => {
      const newState = { ...prev };
      spawnZoneEntities(newState, newState.currentZone);
      return newState;
    });

    const cleanup = startGameLoop(canvas, ctx, () => gameState, setGameState, onScreenChange);
    cleanupRef.current = cleanup;
  }, [gameState, setGameState, onScreenChange]);

  useEffect(() => {
    preloadImages().then(() => {
      handleStart();
    });

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      inputManager.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{
        imageRendering: 'pixelated',
        maxWidth: '100vw',
        maxHeight: '100vh',
        objectFit: 'contain',
      }}
    />
  );
}
