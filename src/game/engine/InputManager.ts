import type { InputState } from '../types/game';

export class InputManager {
  private state: InputState;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.state = {
      keys: new Set(),
      mouseX: 0,
      mouseY: 0,
      mouseDown: false,
      mouseClicked: false,
    };
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    canvas.addEventListener('keydown', this.handleKeyDown);
    canvas.addEventListener('keyup', this.handleKeyUp);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.tabIndex = 0;
    canvas.focus();
  }

  destroy() {
    if (!this.canvas) return;
    this.canvas.removeEventListener('keydown', this.handleKeyDown);
    this.canvas.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    this.state.keys.add(e.key.toLowerCase());
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.state.keys.delete(e.key.toLowerCase());
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.state.mouseX = e.clientX - rect.left;
    this.state.mouseY = e.clientY - rect.top;
  };

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.state.mouseDown = true;
    this.state.mouseClicked = true;
  };

  private handleMouseUp = () => {
    this.state.mouseDown = false;
  };

  getState(): InputState {
    return this.state;
  }

  isKeyPressed(key: string): boolean {
    return this.state.keys.has(key.toLowerCase());
  }

  consumeClick(): boolean {
    const clicked = this.state.mouseClicked;
    this.state.mouseClicked = false;
    return clicked;
  }

  getMouseWorldPos(cameraX: number, cameraY: number): { x: number; y: number } {
    return {
      x: this.state.mouseX + cameraX,
      y: this.state.mouseY + cameraY,
    };
  }

  reset() {
    this.state.keys.clear();
    this.state.mouseDown = false;
    this.state.mouseClicked = false;
  }
}

export const inputManager = new InputManager();
