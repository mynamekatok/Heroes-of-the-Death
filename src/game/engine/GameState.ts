import type { GameState, Player, ZoneId } from '../types/game';
import { ZONES, QUESTS, DEFAULT_SETTINGS, PLAYER_MAX_HP, PLAYER_MAX_MANA, PLAYER_MAX_STAMINA, PLAYER_DAMAGE, PLAYER_DEFENSE } from '../utils/constants';

export function createInitialPlayer(): Player {
  return {
    id: 'player',
    type: 'player',
    x: 200,
    y: 200,
    width: 48,
    height: 48,
    sprite: '/assets/player.png',
    rotation: 0,
    opacity: 1,
    name: 'Christopher',
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 20,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    mana: PLAYER_MAX_MANA,
    maxMana: PLAYER_MAX_MANA,
    stamina: PLAYER_MAX_STAMINA,
    maxStamina: PLAYER_MAX_STAMINA,
    damage: PLAYER_DAMAGE,
    defense: PLAYER_DEFENSE,
    speed: 150,
    exposure: 0,
    stats: { strength: 5, agility: 5, magic: 5 },
    equipment: { weapon: null, armor: null, accessory: null },
    inventory: [],
    weaponClass: 'sword',
    isRolling: false,
    rollCooldown: 0,
    attackCooldown: 0,
    isAttacking: false,
    facing: 'down',
    deaths: 0,
    checkpointZone: 'beach',
    checkpointX: 200,
    checkpointY: 200,
  };
}

export function createInitialState(): GameState {
  return {
    screen: 'main_menu',
    player: createInitialPlayer(),
    currentZone: 'beach',
    enemies: [],
    npcs: [],
    projectiles: [],
    itemDrops: [],
    interactables: [],
    camera: {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      zoom: 1,
      shakeX: 0,
      shakeY: 0,
      shakeIntensity: 0,
      shakeDuration: 0,
    },
    particles: [],
    damageNumbers: [],
    quests: QUESTS.map(q => ({ ...q, objectives: q.objectives.map(o => ({ ...o })) })),
    factionReputation: { human: 0, dwarf: 0, elf: 0, cultist: -50, neutral: 0 },
    isPaused: false,
    dialogActive: false,
    currentDialogue: null,
    inventoryOpen: false,
    mapOpen: false,
    deathDuel: null,
    settings: { ...DEFAULT_SETTINGS },
    timePlayed: 0,
  };
}

export function spawnZoneEntities(state: GameState, zoneId: ZoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return;

  // Spawn enemies
  state.enemies = zone.enemySpawns.map((spawn, i) => {
    const configKey = spawn.enemyType === 'boss_cultist' || spawn.enemyType === 'boss_death'
      ? spawn.enemyType
      : spawn.enemyType;
    const config = getEnemyConfig(configKey);
    const levelMult = 1 + (spawn.level - 1) * 0.2;

    return {
      id: `enemy_${zoneId}_${i}`,
      type: 'enemy' as const,
      x: spawn.x,
      y: spawn.y,
      width: config.size,
      height: config.size,
      sprite: config.sprite,
      rotation: 0,
      opacity: 1,
      enemyType: spawn.enemyType,
      faction: config.faction,
      name: config.name,
      level: spawn.level,
      hp: Math.floor(config.baseHp * levelMult),
      maxHp: Math.floor(config.baseHp * levelMult),
      mana: 50,
      maxMana: 50,
      stamina: 100,
      maxStamina: 100,
      damage: Math.floor(config.baseDamage * levelMult),
      defense: Math.floor(config.baseDefense * levelMult),
      speed: config.speed,
      aggroRange: config.aggroRange,
      attackRange: config.attackRange,
      xpReward: config.xpReward * spawn.level,
      goldReward: config.goldReward * spawn.level,
      isAggro: false,
      patrolPoints: generatePatrolPoints(spawn.x, spawn.y, spawn.patrolRadius || 100),
      currentPatrolIndex: 0,
      attackCooldown: 0,
      isAttacking: false,
      dropTable: [],
      state: 'patrol' as const,
      stateTimer: 0,
    };
  });

  // Spawn NPCs
  state.npcs = zone.npcSpawns.map((spawn, i) => ({
    id: `npc_${zoneId}_${i}`,
    type: 'npc' as const,
    x: spawn.x,
    y: spawn.y,
    width: 48,
    height: 48,
    sprite: getNPCSprite(spawn.npcType, spawn.faction),
    rotation: 0,
    opacity: 1,
    npcType: spawn.npcType,
    faction: spawn.faction,
    name: spawn.name,
    dialogue: buildDialogue(spawn.dialogueId),
    facing: spawn.facing || 'down',
    interactionRadius: 80,
  }));

  // Spawn interactables
  state.interactables = zone.interactables.map((def, i) => ({
    id: `interact_${zoneId}_${i}`,
    type: 'interactable' as const,
    x: def.x,
    y: def.y,
    width: 48,
    height: 48,
    sprite: '/assets/chest.png',
    rotation: 0,
    opacity: 1,
    interactType: def.interactType,
    isActive: true,
    targetZone: def.targetZone,
    targetX: def.targetX,
    targetY: def.targetY,
    loot: def.loot,
    message: def.message,
  }));
}

function generatePatrolPoints(cx: number, cy: number, radius: number) {
  const points = [];
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return points;
}

function getEnemyConfig(enemyType: string) {
  const configs: Record<string, {
    name: string; faction: 'human' | 'dwarf' | 'elf' | 'cultist' | 'neutral';
    baseHp: number; baseDamage: number; baseDefense: number;
    speed: number; aggroRange: number; attackRange: number;
    sprite: string; size: number; xpReward: number; goldReward: number;
  }> = {
    cultist: {
      name: 'Cultist Acolyte', faction: 'cultist', baseHp: 40, baseDamage: 12,
      baseDefense: 3, speed: 80, aggroRange: 200, attackRange: 180,
      sprite: '/assets/cultist.png', size: 48, xpReward: 40, goldReward: 15,
    },
    elf: {
      name: 'Elven Guard', faction: 'elf', baseHp: 50, baseDamage: 15,
      baseDefense: 5, speed: 100, aggroRange: 250, attackRange: 200,
      sprite: '/assets/elf.png', size: 48, xpReward: 50, goldReward: 20,
    },
    dwarf: {
      name: 'Dwarven Warrior', faction: 'dwarf', baseHp: 70, baseDamage: 18,
      baseDefense: 10, speed: 70, aggroRange: 150, attackRange: 60,
      sprite: '/assets/dwarf.png', size: 44, xpReward: 60, goldReward: 25,
    },
    skeleton: {
      name: 'Skeleton', faction: 'cultist', baseHp: 25, baseDamage: 8,
      baseDefense: 2, speed: 60, aggroRange: 180, attackRange: 50,
      sprite: '/assets/cultist.png', size: 44, xpReward: 20, goldReward: 5,
    },
    wolf: {
      name: 'Dire Wolf', faction: 'neutral', baseHp: 35, baseDamage: 14,
      baseDefense: 3, speed: 130, aggroRange: 220, attackRange: 50,
      sprite: '/assets/cultist.png', size: 40, xpReward: 30, goldReward: 0,
    },
    boss_death: {
      name: 'Death', faction: 'cultist', baseHp: 200, baseDamage: 25,
      baseDefense: 15, speed: 60, aggroRange: 999, attackRange: 120,
      sprite: '/assets/death_boss.png', size: 96, xpReward: 0, goldReward: 0,
    },
    boss_cultist: {
      name: 'Cultist Leader', faction: 'cultist', baseHp: 300, baseDamage: 30,
      baseDefense: 20, speed: 90, aggroRange: 999, attackRange: 200,
      sprite: '/assets/cultist.png', size: 64, xpReward: 500, goldReward: 200,
    },
  };
  return configs[enemyType] || configs.skeleton;
}

function getNPCSprite(npcType: string, faction: string): string {
  if (npcType === 'merchant' && faction === 'dwarf') return '/assets/dwarf.png';
  if (faction === 'elf') return '/assets/elf.png';
  return '/assets/villager.png';
}

import { DIALOGUES } from '../utils/constants';

function buildDialogue(dialogueId: string) {
  const dialogData = DIALOGUES[dialogueId];
  if (!dialogData) {
    return {
      id: 'default',
      text: '...',
      speaker: 'Unknown',
      choices: [],
      isEnd: true,
    };
  }
  const firstNode = Object.values(dialogData.nodes)[0];
  return {
    id: 'start',
    text: firstNode.textRu || firstNode.text,
    speaker: dialogueId.split('_')[0],
    choices: firstNode.choices.map(c => ({
      text: c.textRu || c.text,
      nextNodeId: c.nextNodeId,
      exposureGain: c.exposureGain,
    })),
  };
}
