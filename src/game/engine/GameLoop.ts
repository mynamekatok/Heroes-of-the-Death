import type { GameState, ZoneId, Interactable } from '../types/game';
import { ZONES, ITEMS, PLAYER_SPEED, ROLL_SPEED, ROLL_DURATION, ROLL_COOLDOWN, ROLL_STAMINA_COST, ATTACK_COOLDOWN, ATTACK_STAMINA_COST, MANA_REGEN_RATE, STAMINA_REGEN_RATE, CANVAS_WIDTH, CANVAS_HEIGHT, CAMERA_LERP, DEATH_DUEL_SPIRIT_HP, DEATH_DUEL_BOSS_HP } from '../utils/constants';
import { getDistance, rectsOverlap, resolveCollision } from '../utils/helpers';
import { inputManager } from './InputManager';
import { spawnZoneEntities } from './GameState';

let lastTime = 0;
let animFrameId = 0;

export function startGameLoop(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  getState: () => GameState,
  _setState: (s: GameState | ((prev: GameState) => GameState)) => void,
  onScreenChange: (screen: string) => void
) {
  lastTime = performance.now();

  function loop(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    const state = getState();

    if (state.screen === 'playing' && !state.isPaused && !state.dialogActive && !state.inventoryOpen && !state.mapOpen) {
      updatePlaying(state, dt, onScreenChange);
    } else if (state.screen === 'death_duel') {
      updateDeathDuel(state, dt, onScreenChange);
    }

    render(canvas, ctx, state);

    if (!state.isPaused && (state.screen === 'playing' || state.screen === 'death_duel')) {
      state.timePlayed += dt;
    }

    animFrameId = requestAnimationFrame(loop);
  }

  animFrameId = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(animFrameId);
}

function updatePlaying(state: GameState, dt: number, onScreenChange: (screen: string) => void) {
  const input = inputManager.getState();
  const zone = ZONES[state.currentZone];
  const player = state.player;

  // === PLAYER MOVEMENT ===
  let dx = 0, dy = 0;
  if (input.keys.has('w') || input.keys.has('arrowup')) dy -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) dy += 1;
  if (input.keys.has('a') || input.keys.has('arrowleft')) dx -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) dx += 1;

  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    dx /= len;
    dy /= len;

    if (dx > 0) player.facing = 'right';
    else if (dx < 0) player.facing = 'left';
    if (dy > 0) player.facing = 'down';
    else if (dy < 0) player.facing = 'up';

    if (!player.isRolling) {
      player.x += dx * PLAYER_SPEED * dt;
      player.y += dy * PLAYER_SPEED * dt;
    }
  }

  // Roll
  if (input.keys.has(' ') && player.rollCooldown <= 0 && player.stamina >= ROLL_STAMINA_COST && !player.isRolling) {
    player.isRolling = true;
    player.rollCooldown = ROLL_COOLDOWN;
    player.stamina -= ROLL_STAMINA_COST;

    const rollDir = { x: dx || (player.facing === 'right' ? 1 : player.facing === 'left' ? -1 : 0), y: dy || (player.facing === 'down' ? 1 : player.facing === 'up' ? -1 : 0) };
    const rLen = Math.sqrt(rollDir.x * rollDir.x + rollDir.y * rollDir.y);
    if (rLen > 0) {
      rollDir.x /= rLen;
      rollDir.y /= rLen;
    }

    player.x += rollDir.x * ROLL_SPEED * 0.15;
    player.y += rollDir.y * ROLL_SPEED * 0.15;

    setTimeout(() => { player.isRolling = false; }, ROLL_DURATION * 1000);
  }

  if (player.rollCooldown > 0) player.rollCooldown -= dt;
  if (player.attackCooldown > 0) player.attackCooldown -= dt;

  // Regen
  if (player.mana < player.maxMana) player.mana = Math.min(player.maxMana, player.mana + MANA_REGEN_RATE * dt);
  if (player.stamina < player.maxStamina) player.stamina = Math.min(player.maxStamina, player.stamina + STAMINA_REGEN_RATE * dt);

  // === PLAYER ATTACK ===
  if ((input.mouseDown || input.keys.has('j')) && player.attackCooldown <= 0 && player.stamina >= ATTACK_STAMINA_COST && !player.isAttacking) {
    player.isAttacking = true;
    player.attackCooldown = ATTACK_COOLDOWN;
    player.stamina -= ATTACK_STAMINA_COST;

    const attackRange = player.weaponClass === 'staff' ? 200 : 70;
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      const dist = getDistance(player, enemy);
      if (dist < attackRange) {
        const dmg = Math.max(1, player.damage + (player.equipment.weapon?.stats?.damage || 0) - enemy.defense);
        const isCrit = Math.random() < 0.15;
        const finalDmg = isCrit ? dmg * 2 : dmg;
        enemy.hp -= finalDmg;
        enemy.state = 'hurt';
        enemy.stateTimer = 0.2;

        state.damageNumbers.push({ x: enemy.x, y: enemy.y - 20, value: Math.floor(finalDmg), life: 1, color: isCrit ? '#FFD700' : '#FFFFFF', isCritical: isCrit });

        for (let i = 0; i < 5; i++) {
          state.particles.push({
            x: enemy.x, y: enemy.y, vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200,
            life: 0.3, maxLife: 0.3, color: isCrit ? '#FFD700' : '#FF4444', size: 3,
          });
        }

        if (state.settings.screenShake) {
          state.camera.shakeIntensity = isCrit ? 8 : 4;
          state.camera.shakeDuration = 0.15;
        }

        if (enemy.hp <= 0) {
          enemy.hp = 0;
          player.xp += enemy.xpReward;
          player.gold += enemy.goldReward;

          if (Math.random() < 0.3) {
            state.itemDrops.push({
              id: `drop_${Date.now()}_${Math.random()}`, type: 'item_drop',
              x: enemy.x, y: enemy.y, width: 32, height: 32,
              sprite: '/assets/potion_health.png', rotation: 0, opacity: 1,
              item: ITEMS.health_potion, lifetime: 30,
            });
          }

          for (const quest of state.quests) {
            if (!quest.isActive || quest.isCompleted) continue;
            for (const obj of quest.objectives) {
              if (obj.targetType === 'kill' && enemy.enemyType === obj.targetId) {
                obj.current = Math.min(obj.required, obj.current + 1);
              }
            }
            checkQuestComplete(quest);
          }

          while (player.xp >= player.xpToNext) {
            player.xp -= player.xpToNext;
            player.level++;
            player.xpToNext = Math.floor(100 * Math.pow(1.5, player.level - 1));
            player.maxHp += 10;
            player.hp = player.maxHp;
            player.maxMana += 5;
            player.mana = player.maxMana;
            player.damage += 3;

            for (let i = 0; i < 15; i++) {
              state.particles.push({
                x: player.x, y: player.y, vx: (Math.random() - 0.5) * 100, vy: -Math.random() * 150 - 50,
                life: 1.5, maxLife: 1.5, color: '#FFD700', size: 4,
              });
            }
          }
        }
      }
    }

    // Magic projectile for staff
    if (player.weaponClass === 'staff' && player.mana >= 10) {
      player.mana -= 10;
      const mouseWorld = inputManager.getMouseWorldPos(state.camera.x, state.camera.y);
      const angle = Math.atan2(mouseWorld.y - player.y, mouseWorld.x - player.x);
      state.projectiles.push({
        id: `proj_${Date.now()}`, type: 'projectile', x: player.x, y: player.y,
        width: 12, height: 12, sprite: '', rotation: angle, opacity: 1,
        ownerId: 'player', isPlayerProjectile: true, damage: player.damage + 10,
        speed: 350, lifetime: 2, maxLifetime: 2, color: '#7B68EE',
      });
    }

    setTimeout(() => { player.isAttacking = false; }, 200);
  }

  // Magic attack (key 1) - fireball
  if (input.keys.has('1') && player.mana >= 15) {
    player.mana -= 15;
    const mouseWorld = inputManager.getMouseWorldPos(state.camera.x, state.camera.y);
    const angle = Math.atan2(mouseWorld.y - player.y, mouseWorld.x - player.x);
    state.projectiles.push({
      id: `fireball_${Date.now()}`, type: 'projectile', x: player.x, y: player.y,
      width: 16, height: 16, sprite: '', rotation: angle, opacity: 1,
      ownerId: 'player', isPlayerProjectile: true, damage: player.damage + 15,
      speed: 300, lifetime: 2, maxLifetime: 2, color: '#FF4500',
    });

    for (const enemy of state.enemies) {
      if (enemy.hp > 0 && getDistance(player, enemy) < 300) {
        player.exposure = Math.min(100, player.exposure + 5);
        break;
      }
    }
  }

  // === COLLISIONS ===
  if (zone) {
    for (const obs of zone.obstacles) {
      if (rectsOverlap(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height, obs.x, obs.y, obs.width, obs.height)) {
        resolveCollision(player, obs.x, obs.y, obs.width, obs.height);
      }
    }
    player.x = Math.max(player.width / 2, Math.min(zone.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(zone.height - player.height / 2, player.y));
  }

  // === ENEMY AI ===
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;

    const distToPlayer = getDistance(player, enemy);

    if (enemy.state === 'hurt') {
      enemy.stateTimer -= dt;
      if (enemy.stateTimer <= 0) {
        enemy.state = distToPlayer < enemy.aggroRange ? 'chase' : 'patrol';
      }
      continue;
    }

    if (distToPlayer < enemy.aggroRange || enemy.isAggro) {
      enemy.isAggro = true;
      enemy.state = 'chase';

      if (distToPlayer < enemy.attackRange) {
        enemy.state = 'attack';
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1.5;
          enemy.isAttacking = true;

          if (!player.isRolling) {
            const dmg = Math.max(1, enemy.damage - player.defense - (player.equipment.armor?.stats?.defense || 0));
            player.hp -= dmg;

            state.damageNumbers.push({ x: player.x, y: player.y - 20, value: dmg, life: 1, color: '#FF0000', isCritical: false });

            if (state.settings.screenShake) {
              state.camera.shakeIntensity = 5;
              state.camera.shakeDuration = 0.1;
            }

            if (player.hp <= 0) {
              player.hp = 0;
              player.deaths++;
              state.screen = 'death_duel';
              state.deathDuel = {
                phase: 1,
                bossHp: DEATH_DUEL_BOSS_HP + player.deaths * 50,
                bossMaxHp: DEATH_DUEL_BOSS_HP + player.deaths * 50,
                spiritHp: DEATH_DUEL_SPIRIT_HP,
                spiritMaxHp: DEATH_DUEL_SPIRIT_HP,
                bossAttackCooldown: 2,
                bossAttackPattern: 0,
                warningX: 400, warningY: 400, warningActive: false, warningTimer: 0,
                playerAttacks: 0,
              };
              onScreenChange('death_duel');
              return;
            }
          }

          setTimeout(() => { enemy.isAttacking = false; }, 300);
        }
      } else {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed * dt;
        enemy.y += Math.sin(angle) * enemy.speed * dt;
      }
    } else {
      enemy.state = 'patrol';
      const target = enemy.patrolPoints[enemy.currentPatrolIndex];
      if (target) {
        const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
        const dist = getDistance(enemy, target);
        if (dist < 10) {
          enemy.currentPatrolIndex = (enemy.currentPatrolIndex + 1) % enemy.patrolPoints.length;
        } else {
          enemy.x += Math.cos(angle) * enemy.speed * 0.4 * dt;
          enemy.y += Math.sin(angle) * enemy.speed * 0.4 * dt;
        }
      }
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

    // Enemy projectiles
    if ((enemy.enemyType === 'cultist' || enemy.enemyType === 'elf') && enemy.isAggro && enemy.attackCooldown <= 0 && distToPlayer < 250) {
      enemy.attackCooldown = 2;
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      state.projectiles.push({
        id: `enemy_proj_${Date.now()}_${enemy.id}`, type: 'projectile',
        x: enemy.x, y: enemy.y, width: 10, height: 10,
        sprite: '', rotation: angle, opacity: 1,
        ownerId: enemy.id, isPlayerProjectile: false, damage: enemy.damage,
        speed: 200, lifetime: 3, maxLifetime: 3,
        color: enemy.enemyType === 'cultist' ? '#7B68EE' : '#4A7C59',
      });
    }
  }

  // === PROJECTILES ===
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    proj.lifetime -= dt;
    if (proj.lifetime <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }

    proj.x += Math.cos(proj.rotation) * proj.speed * dt;
    proj.y += Math.sin(proj.rotation) * proj.speed * dt;

    if (Math.random() < 0.3) {
      state.particles.push({
        x: proj.x, y: proj.y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
        life: 0.3, maxLife: 0.3, color: proj.color, size: 2,
      });
    }

    if (proj.isPlayerProjectile) {
      for (const enemy of state.enemies) {
        if (enemy.hp <= 0) continue;
        if (getDistance(proj, enemy) < enemy.width / 2 + proj.width / 2) {
          enemy.hp -= proj.damage;
          enemy.state = 'hurt';
          enemy.stateTimer = 0.2;
          state.damageNumbers.push({ x: enemy.x, y: enemy.y - 20, value: proj.damage, life: 1, color: '#7B68EE', isCritical: false });
          state.projectiles.splice(i, 1);

          if (enemy.hp <= 0) {
            enemy.hp = 0;
            player.xp += enemy.xpReward;
            player.gold += enemy.goldReward;
          }
          break;
        }
      }
    } else {
      if (!player.isRolling && getDistance(proj, player) < player.width / 2 + proj.width / 2) {
        const dmg = Math.max(1, proj.damage - player.defense);
        player.hp -= dmg;
        state.damageNumbers.push({ x: player.x, y: player.y - 20, value: dmg, life: 1, color: '#FF0000', isCritical: false });
        state.projectiles.splice(i, 1);

        if (player.hp <= 0) {
          player.hp = 0;
          player.deaths++;
          state.screen = 'death_duel';
          state.deathDuel = {
            phase: 1,
            bossHp: DEATH_DUEL_BOSS_HP + player.deaths * 50,
            bossMaxHp: DEATH_DUEL_BOSS_HP + player.deaths * 50,
            spiritHp: DEATH_DUEL_SPIRIT_HP,
            spiritMaxHp: DEATH_DUEL_SPIRIT_HP,
            bossAttackCooldown: 2,
            bossAttackPattern: 0,
            warningX: 400, warningY: 400, warningActive: false, warningTimer: 0,
            playerAttacks: 0,
          };
          onScreenChange('death_duel');
          return;
        }
      }
    }
  }

  // === ITEM PICKUP ===
  for (let i = state.itemDrops.length - 1; i >= 0; i--) {
    const drop = state.itemDrops[i];
    drop.lifetime -= dt;
    if (drop.lifetime <= 0) {
      state.itemDrops.splice(i, 1);
      continue;
    }
    if (getDistance(player, drop) < player.width) {
      const existing = player.inventory.find(inv => inv.item.id === drop.item.id);
      if (existing) {
        existing.quantity++;
      } else {
        player.inventory.push({ item: drop.item, quantity: 1 });
      }
      state.itemDrops.splice(i, 1);
    }
  }

  // === NPC INTERACTION ===
  if (input.keys.has('e')) {
    inputManager.consumeClick(); // Prevent holding E
    for (const npc of state.npcs) {
      if (getDistance(player, npc) < npc.interactionRadius) {
        state.dialogActive = true;
        state.currentDialogue = {
          id: 'start',
          text: npc.dialogue.text,
          speaker: npc.name,
          choices: npc.dialogue.choices,
        };
        break;
      }
    }

    for (const inter of state.interactables) {
      if (!inter.isActive) continue;
      if (getDistance(player, inter) < 60) {
        handleInteractable(state, inter);
      }
    }
  }

  // === ZONE TRANSITIONS (edge walking) ===
  if (zone) {
    for (const exit of zone.exits) {
      if (rectsOverlap(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height, exit.x, exit.y, exit.width, exit.height)) {
        changeZone(state, exit.targetZone, exit.targetX, exit.targetY);
        break;
      }
    }
  }

  // === PARTICLES ===
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  // === DAMAGE NUMBERS ===
  for (let i = state.damageNumbers.length - 1; i >= 0; i--) {
    const dn = state.damageNumbers[i];
    dn.life -= dt;
    dn.y -= 40 * dt;
    if (dn.life <= 0) state.damageNumbers.splice(i, 1);
  }

  // === CAMERA ===
  const targetCamX = player.x - CANVAS_WIDTH / 2;
  const targetCamY = player.y - CANVAS_HEIGHT / 2;
  state.camera.x += (targetCamX - state.camera.x) * CAMERA_LERP;
  state.camera.y += (targetCamY - state.camera.y) * CAMERA_LERP;

  if (zone) {
    state.camera.x = Math.max(0, Math.min(zone.width - CANVAS_WIDTH, state.camera.x));
    state.camera.y = Math.max(0, Math.min(zone.height - CANVAS_HEIGHT, state.camera.y));
  }

  // Screen shake
  if (state.camera.shakeDuration > 0) {
    state.camera.shakeDuration -= dt;
    state.camera.shakeX = (Math.random() - 0.5) * state.camera.shakeIntensity * 2;
    state.camera.shakeY = (Math.random() - 0.5) * state.camera.shakeIntensity * 2;
    state.camera.shakeIntensity *= 0.9;
  } else {
    state.camera.shakeX = 0;
    state.camera.shakeY = 0;
  }
}

function handleInteractable(state: GameState, inter: Interactable) {
  const player = state.player;

  if (inter.interactType === 'chest' && inter.loot) {
    for (const item of inter.loot) {
      const existing = player.inventory.find(inv => inv.item.id === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        player.inventory.push({ item, quantity: 1 });
      }
    }
    inter.isActive = false;
  } else if (inter.interactType === 'campfire') {
    player.hp = Math.min(player.maxHp, player.hp + 30);
    player.checkpointZone = state.currentZone;
    player.checkpointX = player.x;
    player.checkpointY = player.y;
  } else if (inter.interactType === 'zone_transition' && inter.targetZone) {
    changeZone(state, inter.targetZone, inter.targetX || 100, inter.targetY || 100);
  } else if (inter.interactType === 'sign' && inter.message) {
    state.dialogActive = true;
    state.currentDialogue = { id: 'sign', text: inter.message, speaker: 'Табличка', choices: [], isEnd: true };
  }
}

function updateDeathDuel(state: GameState, dt: number, onScreenChange: (screen: string) => void) {
  if (!state.deathDuel) return;

  const input = inputManager.getState();
  const duel = state.deathDuel;
  const player = state.player;

  // Player movement
  let dx = 0, dy = 0;
  if (input.keys.has('w') || input.keys.has('arrowup')) dy -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) dy += 1;
  if (input.keys.has('a') || input.keys.has('arrowleft')) dx -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) dx += 1;

  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
    player.x += dx * PLAYER_SPEED * dt;
    player.y += dy * PLAYER_SPEED * dt;
  }

  player.x = Math.max(50, Math.min(750, player.x));
  player.y = Math.max(50, Math.min(750, player.y));

  // Player attack
  if ((input.mouseDown || input.keys.has('j')) && player.attackCooldown <= 0) {
    player.attackCooldown = ATTACK_COOLDOWN;

    const bossX = 400;
    const bossY = 300;
    const dist = Math.sqrt((player.x - bossX) ** 2 + (player.y - bossY) ** 2);

    if (dist < 120) {
      const dmg = player.damage + 5;
      duel.bossHp -= dmg;
      duel.playerAttacks++;

      state.damageNumbers.push({
        x: bossX + (Math.random() - 0.5) * 60, y: bossY - 40,
        value: dmg, life: 1, color: '#7B68EE', isCritical: false,
      });

      for (let i = 0; i < 8; i++) {
        state.particles.push({
          x: bossX, y: bossY, vx: (Math.random() - 0.5) * 250, vy: (Math.random() - 0.5) * 250,
          life: 0.4, maxLife: 0.4, color: '#C41E3A', size: 4,
        });
      }

      if (state.settings.screenShake) {
        state.camera.shakeIntensity = 6;
        state.camera.shakeDuration = 0.2;
      }

      if (duel.bossHp <= 0) {
        player.hp = Math.floor(player.maxHp * 0.5);
        state.screen = 'playing';
        state.currentZone = player.checkpointZone;
        player.x = player.checkpointX;
        player.y = player.checkpointY;
        state.deathDuel = null;
        state.camera.shakeX = 0;
        state.camera.shakeY = 0;
        spawnZoneEntities(state, state.currentZone);
        onScreenChange('playing');
        return;
      }
    }
  }

  if (player.attackCooldown > 0) player.attackCooldown -= dt;

  // Boss attacks
  duel.bossAttackCooldown -= dt;
  if (duel.bossAttackCooldown <= 0) {
    duel.bossAttackPattern = (duel.bossAttackPattern + 1) % 3;
    duel.bossAttackCooldown = 2.5 - duel.phase * 0.3;

    if (duel.bossAttackPattern === 0) {
      duel.warningActive = true;
      duel.warningX = player.x;
      duel.warningY = player.y;
      duel.warningTimer = 0.8;
    } else if (duel.bossAttackPattern === 1) {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
        state.projectiles.push({
          id: `death_proj_${Date.now()}_${i}`, type: 'projectile', x: 400, y: 300,
          width: 14, height: 14, sprite: '', rotation: angle, opacity: 1,
          ownerId: 'death_boss', isPlayerProjectile: false, damage: 15,
          speed: 180 + duel.phase * 20, lifetime: 4, maxLifetime: 4, color: '#C41E3A',
        });
      }
    } else {
      duel.warningActive = true;
      duel.warningX = player.x;
      duel.warningY = player.y;
      duel.warningTimer = 1.0;
    }
  }

  // Warning timer
  if (duel.warningActive) {
    duel.warningTimer -= dt;
    if (duel.warningTimer <= 0) {
      duel.warningActive = false;
      const dist = Math.sqrt((player.x - duel.warningX) ** 2 + (player.y - duel.warningY) ** 2);
      if (dist < 80) {
        duel.spiritHp -= 15;
        state.damageNumbers.push({ x: player.x, y: player.y - 20, value: 15, life: 1, color: '#FF0000', isCritical: false });

        if (state.settings.screenShake) {
          state.camera.shakeIntensity = 10;
          state.camera.shakeDuration = 0.3;
        }

        if (duel.spiritHp <= 0) {
          state.screen = 'game_over';
          state.deathDuel = null;
          onScreenChange('game_over');
          return;
        }
      }
    }
  }

  // Update projectiles in duel
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    proj.lifetime -= dt;
    if (proj.lifetime <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }
    proj.x += Math.cos(proj.rotation) * proj.speed * dt;
    proj.y += Math.sin(proj.rotation) * proj.speed * dt;

    if (!proj.isPlayerProjectile && getDistance(proj, player) < 30) {
      duel.spiritHp -= proj.damage;
      state.damageNumbers.push({ x: player.x, y: player.y - 20, value: proj.damage, life: 1, color: '#FF0000', isCritical: false });
      state.projectiles.splice(i, 1);

      if (duel.spiritHp <= 0) {
        state.screen = 'game_over';
        state.deathDuel = null;
        onScreenChange('game_over');
        return;
      }
    }
  }

  // Phase transitions
  if (duel.bossHp < duel.bossMaxHp * 0.3) {
    duel.phase = 3;
  } else if (duel.bossHp < duel.bossMaxHp * 0.6) {
    duel.phase = 2;
  }

  // Camera
  state.camera.x = 400 - CANVAS_WIDTH / 2;
  state.camera.y = 300 - CANVAS_HEIGHT / 2;

  // Particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  // Damage numbers
  for (let i = state.damageNumbers.length - 1; i >= 0; i--) {
    const dn = state.damageNumbers[i];
    dn.life -= dt;
    dn.y -= 40 * dt;
    if (dn.life <= 0) state.damageNumbers.splice(i, 1);
  }

  // Screen shake
  if (state.camera.shakeDuration > 0) {
    state.camera.shakeDuration -= dt;
    state.camera.shakeX = (Math.random() - 0.5) * state.camera.shakeIntensity * 2;
    state.camera.shakeY = (Math.random() - 0.5) * state.camera.shakeIntensity * 2;
    state.camera.shakeIntensity *= 0.9;
  } else {
    state.camera.shakeX = 0;
    state.camera.shakeY = 0;
  }
}

// ===================== RENDERING =====================

function render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, state: GameState) {
  const { camera } = state;

  ctx.save();

  if (state.screen === 'playing' || state.screen === 'death_duel') {
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(-camera.x + camera.shakeX, -camera.y + camera.shakeY);

    if (state.screen === 'playing') {
      renderPlaying(ctx, state);
    } else if (state.screen === 'death_duel') {
      renderDeathDuel(ctx, state);
    }

    ctx.restore();
    renderHUD(ctx, state);
  }
}

function renderPlaying(ctx: CanvasRenderingContext2D, state: GameState) {
  const zone = ZONES[state.currentZone];
  if (!zone) return;

  // Background
  const bgImg = imageCache[zone.background];
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, zone.width, zone.height);
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, zone.width, zone.height);
  }

  // Obstacles
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (const obs of zone.obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Interactables
  for (const inter of state.interactables) {
    if (!inter.isActive) continue;

    if (inter.interactType === 'chest') {
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(inter.x - 16, inter.y - 16, 32, 32);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(inter.x - 16, inter.y - 16, 32, 32);
    } else if (inter.interactType === 'campfire') {
      const flicker = Math.sin(Date.now() / 200) * 5;
      const grad = ctx.createRadialGradient(inter.x, inter.y, 5, inter.x, inter.y, 40 + flicker);
      grad.addColorStop(0, 'rgba(255, 150, 50, 0.6)');
      grad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(inter.x, inter.y, 40 + flicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.arc(inter.x, inter.y, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (inter.interactType === 'zone_transition') {
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.fillRect(inter.x, inter.y, inter.width || 48, inter.height || 48);
      ctx.strokeStyle = '#64C8FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(inter.x, inter.y, inter.width || 48, inter.height || 48);
    } else if (inter.interactType === 'sign') {
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(inter.x - 4, inter.y - 20, 8, 40);
      ctx.fillStyle = '#D2B48C';
      ctx.fillRect(inter.x - 20, inter.y - 24, 40, 24);
      ctx.strokeStyle = '#5C4033';
      ctx.strokeRect(inter.x - 20, inter.y - 24, 40, 24);
    }
  }

  // Item drops
  for (const drop of state.itemDrops) {
    const img = imageCache[drop.item.sprite];
    if (img) {
      ctx.drawImage(img, drop.x - 16, drop.y - 16, 32, 32);
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(drop.x - 8, drop.y - 8, 16, 16);
    }
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 300) * 0.2;
    const grad = ctx.createRadialGradient(drop.x, drop.y, 2, drop.x, drop.y, 20);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // NPCs
  for (const npc of state.npcs) {
    const img = imageCache[npc.sprite];
    if (img) {
      ctx.drawImage(img, npc.x - npc.width / 2, npc.y - npc.height / 2, npc.width, npc.height);
    } else {
      ctx.fillStyle = '#4A7C59';
      ctx.fillRect(npc.x - npc.width / 2, npc.y - npc.height / 2, npc.width, npc.height);
    }

    ctx.fillStyle = '#F4E4C1';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y - npc.height / 2 - 8);

    if (getDistance(state.player, npc) < npc.interactionRadius) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('[E]', npc.x, npc.y - npc.height / 2 - 22);
    }
  }

  // Enemies
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;

    const img = imageCache[enemy.sprite];
    if (img) {
      ctx.drawImage(img, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    } else {
      ctx.fillStyle = enemy.faction === 'cultist' ? '#7B68EE' : '#8B0000';
      ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    }

    // HP bar
    if (enemy.hp < enemy.maxHp) {
      const barWidth = enemy.width;
      const barHeight = 4;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - enemy.height / 2 - 8;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = enemy.faction === 'cultist' ? '#7B68EE' : '#C41E3A';
      ctx.fillRect(barX, barY, barWidth * (enemy.hp / enemy.maxHp), barHeight);
    }

    // Aggro indicator
    if (enemy.isAggro) {
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('!', enemy.x, enemy.y - enemy.height / 2 - 14);
    }
  }

  // Player
  const player = state.player;
  ctx.save();
  if (player.isRolling) ctx.globalAlpha = 0.5;
  if (player.isAttacking) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
  }

  const pImg = imageCache[player.sprite];
  if (pImg) {
    ctx.drawImage(pImg, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
  } else {
    ctx.fillStyle = '#4A7C59';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();

  // Attack arc
  if (player.isAttacking) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const attackRange = player.weaponClass === 'staff' ? 200 : 70;
    const arcAngle = player.facing === 'right' ? 0 : player.facing === 'left' ? Math.PI : player.facing === 'down' ? Math.PI / 2 : -Math.PI / 2;
    ctx.arc(player.x, player.y, attackRange * 0.6, arcAngle - 0.5, arcAngle + 0.5);
    ctx.stroke();
  }

  // Projectiles
  for (const proj of state.projectiles) {
    ctx.fillStyle = proj.color;
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.width / 2, 0, Math.PI * 2);
    ctx.fill();

    const tailLen = 15;
    ctx.strokeStyle = proj.color;
    ctx.lineWidth = proj.width / 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(proj.x, proj.y);
    ctx.lineTo(proj.x - Math.cos(proj.rotation) * tailLen, proj.y - Math.sin(proj.rotation) * tailLen);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Particles
  for (const p of state.particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // Damage numbers
  for (const dn of state.damageNumbers) {
    ctx.globalAlpha = dn.life;
    ctx.fillStyle = dn.color;
    ctx.font = dn.isCritical ? 'bold 20px monospace' : '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${dn.value}`, dn.x, dn.y);
  }
  ctx.globalAlpha = 1;
}

function renderDeathDuel(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!state.deathDuel) return;

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 800, 800);

  // Fog
  for (let i = 0; i < 20; i++) {
    const fx = ((Date.now() / 50 + i * 100) % 800);
    const fy = 200 + Math.sin(Date.now() / 1000 + i) * 100;
    ctx.fillStyle = 'rgba(139, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(fx, fy, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arena border
  ctx.strokeStyle = '#C41E3A';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 760, 760);

  // Boss
  const bossImg = imageCache['/assets/death_boss.png'];
  if (bossImg) {
    const bobY = Math.sin(Date.now() / 500) * 10;
    ctx.drawImage(bossImg, 320, 200 + bobY, 160, 160);
  } else {
    ctx.fillStyle = '#333';
    ctx.fillRect(360, 260, 80, 80);
  }

  // Boss HP
  const duel = state.deathDuel;
  const barWidth = 300;
  const barX = 250;
  const barY = 50;
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barWidth, 20);
  ctx.fillStyle = '#C41E3A';
  ctx.fillRect(barX, barY, barWidth * (duel.bossHp / duel.bossMaxHp), 20);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, 20);
  ctx.fillStyle = '#F4E4C1';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DEATH', 400, barY + 15);

  ctx.fillStyle = '#C41E3A';
  ctx.font = '12px monospace';
  ctx.fillText(`Phase ${duel.phase}`, 400, barY + 35);

  // Warning zone
  if (duel.warningActive) {
    ctx.fillStyle = `rgba(196, 30, 58, ${0.3 + Math.sin(Date.now() / 50) * 0.2})`;
    ctx.beginPath();
    ctx.arc(duel.warningX, duel.warningY, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C41E3A';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Player
  const player = state.player;
  const pImg = imageCache[player.sprite];
  if (pImg) {
    ctx.drawImage(pImg, player.x - 24, player.y - 24, 48, 48);
  } else {
    ctx.fillStyle = '#4A7C59';
    ctx.fillRect(player.x - 24, player.y - 24, 48, 48);
  }

  // Projectiles
  for (const proj of state.projectiles) {
    ctx.fillStyle = proj.color;
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Particles
  for (const p of state.particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // Damage numbers
  for (const dn of state.damageNumbers) {
    ctx.globalAlpha = dn.life;
    ctx.fillStyle = dn.color;
    ctx.font = dn.isCritical ? 'bold 20px monospace' : '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${dn.value}`, dn.x, dn.y);
  }
  ctx.globalAlpha = 1;
}

function renderHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const player = state.player;

  // HP Bar
  const hpX = 20, hpY = 20, barW = 200, barH = 20;
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(hpX - 2, hpY - 2, barW + 4, barH + 4);
  ctx.fillStyle = '#333';
  ctx.fillRect(hpX, hpY, barW, barH);
  ctx.fillStyle = player.hp < player.maxHp * 0.3 ? '#8B0000' : '#4A7C59';
  ctx.fillRect(hpX, hpY, barW * (player.hp / player.maxHp), barH);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(hpX, hpY, barW, barH);
  ctx.fillStyle = '#F4E4C1';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`HP ${Math.floor(player.hp)}/${player.maxHp}`, hpX + 5, hpY + 15);

  // Mana Bar
  const manaY = hpY + barH + 4;
  ctx.fillStyle = '#333';
  ctx.fillRect(hpX, manaY, barW, 10);
  ctx.fillStyle = '#1E90FF';
  ctx.fillRect(hpX, manaY, barW * (player.mana / player.maxMana), 10);
  ctx.strokeRect(hpX, manaY, barW, 10);

  // Stamina Bar
  const stamY = manaY + 14;
  ctx.fillStyle = '#333';
  ctx.fillRect(hpX, stamY, barW, 10);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(hpX, stamY, barW * (player.stamina / player.maxStamina), 10);
  ctx.strokeRect(hpX, stamY, barW, 10);

  // Level & XP
  ctx.fillStyle = '#F4E4C1';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`Lv.${player.level}`, hpX, stamY + 22);
  ctx.fillStyle = '#A39B8B';
  ctx.font = '11px monospace';
  ctx.fillText(`XP: ${player.xp}/${player.xpToNext}`, hpX + 50, stamY + 22);

  // Gold
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`${player.gold}`, hpX + 150, stamY + 22);

  // Exposure meter
  if (player.exposure > 0) {
    const expX = hpX + barW + 20;
    const expY = hpY + 10;
    const expRadius = 18;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(expX, expY, expRadius, 0, Math.PI * 2);
    ctx.stroke();

    const exposureAngle = (player.exposure / 100) * Math.PI * 2;
    ctx.strokeStyle = player.exposure > 75 ? '#FF0000' : '#C41E3A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(expX, expY, expRadius, -Math.PI / 2, -Math.PI / 2 + exposureAngle);
    ctx.stroke();

    ctx.fillStyle = '#F4E4C1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(player.exposure)}%`, expX, expY + 4);

    if (player.exposure > 75) {
      ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 200) * 0.5})`;
      ctx.font = 'bold 14px monospace';
      ctx.fillText('EXPOSED!', expX, expY - 28);
    }
  }

  // Zone name
  const zone = ZONES[state.currentZone];
  if (zone) {
    ctx.fillStyle = '#A39B8B';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(zone.nameRu, CANVAS_WIDTH - 20, 30);
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(zone.name, CANVAS_WIDTH - 20, 44);
  }

  // Minimap
  const mmX = CANVAS_WIDTH - 160;
  const mmY = 60;
  const mmSize = 140;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(mmX, mmY, mmSize, mmSize);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX, mmY, mmSize, mmSize);

  if (zone) {
    const mmScaleX = mmSize / zone.width;
    const mmScaleY = mmSize / zone.height;

    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      ctx.fillStyle = enemy.isAggro ? '#FF0000' : '#C41E3A';
      ctx.fillRect(mmX + enemy.x * mmScaleX - 1, mmY + enemy.y * mmScaleY - 1, 3, 3);
    }

    for (const npc of state.npcs) {
      ctx.fillStyle = '#4A7C59';
      ctx.fillRect(mmX + npc.x * mmScaleX - 1, mmY + npc.y * mmScaleY - 1, 3, 3);
    }

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(mmX + player.x * mmScaleX, mmY + player.y * mmScaleY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hotbar
  const hotX = CANVAS_WIDTH / 2 - 100;
  const hotY = CANVAS_HEIGHT - 60;
  for (let i = 0; i < 4; i++) {
    const sx = hotX + i * 55;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(sx, hotY, 50, 50);
    ctx.strokeStyle = i === 0 ? '#FFD700' : '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, hotY, 50, 50);

    ctx.fillStyle = '#A39B8B';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${i + 1}`, sx + 4, hotY + 14);

    if (i === 0 && player.weaponClass === 'sword') {
      const img = imageCache['/assets/sword.png'];
      if (img) ctx.drawImage(img, sx + 5, hotY + 15, 40, 30);
    } else if (i === 0 && player.weaponClass === 'staff') {
      const img = imageCache['/assets/staff.png'];
      if (img) ctx.drawImage(img, sx + 10, hotY + 5, 30, 40);
    }
  }

  // Controls hint
  ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('WASD: Move | SPACE: Roll | LMB: Attack | 1: Magic | E: Interact | ESC: Pause', 20, CANVAS_HEIGHT - 10);

  // Death duel HUD
  if (state.screen === 'death_duel' && state.deathDuel) {
    const spiritX = CANVAS_WIDTH / 2 - 150;
    const spiritY = CANVAS_HEIGHT - 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(spiritX, spiritY, 300, 20);
    ctx.fillStyle = '#7B68EE';
    ctx.fillRect(spiritX, spiritY, 300 * (state.deathDuel.spiritHp / state.deathDuel.spiritMaxHp), 20);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(spiritX, spiritY, 300, 20);
    ctx.fillStyle = '#F4E4C1';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SPIRIT HP ${state.deathDuel.spiritHp}/${state.deathDuel.spiritMaxHp}`, CANVAS_WIDTH / 2, spiritY + 15);

    ctx.fillStyle = '#C41E3A';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('YOU HAVE DIED', CANVAS_WIDTH / 2, 40);
    ctx.fillStyle = '#A39B8B';
    ctx.font = '14px monospace';
    ctx.fillText('Defeat Death to return to the living world', CANVAS_WIDTH / 2, 60);
  }
}

// Image cache
const imageCache: Record<string, HTMLImageElement> = {};

export function preloadImages(): Promise<void> {
  const paths = [
    '/assets/player.png', '/assets/death_boss.png', '/assets/cultist.png',
    '/assets/elf.png', '/assets/dwarf.png', '/assets/villager.png',
    '/assets/zone_beach.jpg', '/assets/zone_village.jpg', '/assets/zone_forest.jpg',
    '/assets/zone_mine.jpg', '/assets/zone_temple.jpg', '/assets/title_bg.jpg',
    '/assets/gameover_bg.jpg', '/assets/victory_bg.jpg', '/assets/potion_health.png',
    '/assets/sword.png', '/assets/staff.png', '/assets/coin.png',
  ];

  const promises = paths.map(path => {
    return new Promise<void>((resolve) => {
      if (imageCache[path]) { resolve(); return; }
      const img = new Image();
      img.onload = () => { imageCache[path] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = path;
    });
  });

  return Promise.all(promises).then(() => {});
}

function changeZone(state: GameState, zoneId: ZoneId, x: number, y: number) {
  state.currentZone = zoneId;
  state.player.x = x;
  state.player.y = y;
  state.enemies = [];
  state.npcs = [];
  state.projectiles = [];
  state.itemDrops = [];
  state.interactables = [];
  spawnZoneEntities(state, zoneId);

  for (const quest of state.quests) {
    if (!quest.isActive || quest.isCompleted) continue;
    for (const obj of quest.objectives) {
      if (obj.targetType === 'reach' && zoneId === obj.targetId) {
        obj.current = Math.min(obj.required, obj.current + 1);
      }
    }
    checkQuestComplete(quest);
  }
}

function checkQuestComplete(quest: import('../types/game').Quest) {
  const allDone = quest.objectives.every(obj => obj.current >= obj.required);
  if (allDone) quest.isCompleted = true;
}
