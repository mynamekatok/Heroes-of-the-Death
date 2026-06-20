import type { Entity, Position } from '../types/game';

export function getDistance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function resolveCollision(entity: Entity, obsX: number, obsY: number, obsW: number, obsH: number) {
  const centerEx = entity.x;
  const centerEy = entity.y;
  const closestX = Math.max(obsX, Math.min(centerEx, obsX + obsW));
  const closestY = Math.max(obsY, Math.min(centerEy, obsY + obsH));
  const dx = centerEx - closestX;
  const dy = centerEy - closestY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return;

  const overlap = (entity.width / 2) - dist;
  if (overlap > 0) {
    const nx = dx / dist;
    const ny = dy / dist;
    entity.x += nx * overlap;
    entity.y += ny * overlap;
  }
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
