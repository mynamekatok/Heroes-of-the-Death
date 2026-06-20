// Game State Machine
export type GameScreen =
  | 'loading'
  | 'main_menu'
  | 'story_intro'
  | 'playing'
  | 'pause_menu'
  | 'death_duel'
  | 'game_over'
  | 'victory';

// Zone Types
export type ZoneId =
  | 'beach'
  | 'village'
  | 'forest'
  | 'mine'
  | 'temple'
  | 'moor'
  | 'ruins'
  | 'frostpeak'
  | 'stronghold'
  | 'eye_of_storm';

// Entity Types
export type Faction = 'human' | 'dwarf' | 'elf' | 'cultist' | 'neutral';

export type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'item_drop' | 'interactable';

export type EnemyType = 'cultist' | 'elf' | 'dwarf' | 'skeleton' | 'wolf' | 'boss_death' | 'boss_cultist';

export type NPCType = 'villager' | 'merchant' | 'quest_giver' | 'blacksmith';

export type ItemType = 'weapon' | 'armor' | 'potion' | 'quest_item' | 'gold';

export type WeaponClass = 'sword' | 'bow' | 'staff';

// Stats
export interface Stats {
  strength: number;
  agility: number;
  magic: number;
}

export interface CombatStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  damage: number;
  defense: number;
  speed: number;
}

// Position
export interface Position {
  x: number;
  y: number;
}

// Entity Base
export interface Entity extends Position {
  id: string;
  type: EntityType;
  width: number;
  height: number;
  sprite: string;
  rotation: number;
  opacity: number;
}

// Player
export interface Player extends Entity, CombatStats {
  type: 'player';
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  exposure: number; // 0-100 angel identity exposure
  stats: Stats;
  equipment: Equipment;
  inventory: InventoryItem[];
  weaponClass: WeaponClass;
  isRolling: boolean;
  rollCooldown: number;
  attackCooldown: number;
  isAttacking: boolean;
  facing: 'up' | 'down' | 'left' | 'right';
  deaths: number;
  checkpointZone: ZoneId;
  checkpointX: number;
  checkpointY: number;
}

// Equipment
export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

// Item
export interface Item {
  id: string;
  name: string;
  nameRu?: string;
  type: ItemType;
  sprite: string;
  description: string;
  descriptionRu?: string;
  value: number;
  stats?: Partial<CombatStats>;
  weaponClass?: WeaponClass;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

// Enemy
export interface Enemy extends Entity, CombatStats {
  type: 'enemy';
  enemyType: EnemyType;
  faction: Faction;
  name: string;
  nameRu?: string;
  level: number;
  xpReward: number;
  goldReward: number;
  aggroRange: number;
  attackRange: number;
  isAggro: boolean;
  patrolPoints: Position[];
  currentPatrolIndex: number;
  attackCooldown: number;
  isAttacking: boolean;
  dropTable: DropEntry[];
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt';
  stateTimer: number;
}

export interface DropEntry {
  itemId: string;
  chance: number; // 0-1
  quantity: number;
}

// NPC
export interface NPC extends Entity {
  type: 'npc';
  npcType: NPCType;
  faction: Faction;
  name: string;
  dialogue: DialogueNode;
  shopItems?: Item[];
  questId?: string;
  facing: 'up' | 'down' | 'left' | 'right';
  interactionRadius: number;
}

export interface DialogueNode {
  id: string;
  text: string;
  textRu?: string;
  speaker: string;
  choices: DialogueChoice[];
  exposureGain?: number;
  questTrigger?: string;
  isEnd?: boolean;
}

export interface DialogueChoice {
  text: string;
  textRu?: string;
  nextNodeId?: string;
  exposureGain?: number;
  requiredQuest?: string;
  rewardQuest?: string;
}

// Projectile
export interface Projectile extends Entity {
  type: 'projectile';
  ownerId: string;
  isPlayerProjectile: boolean;
  damage: number;
  speed: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

// Item Drop
export interface ItemDrop extends Entity {
  type: 'item_drop';
  item: Item;
  lifetime: number;
}

// Interactable
export interface Interactable extends Entity {
  type: 'interactable';
  interactType: 'chest' | 'door' | 'campfire' | 'sign' | 'zone_transition';
  isActive: boolean;
  targetZone?: ZoneId;
  targetX?: number;
  targetY?: number;
  loot?: Item[];
  message?: string;
}

// Quest
export interface Quest {
  id: string;
  name: string;
  nameRu?: string;
  description: string;
  descriptionRu?: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  isActive: boolean;
  isCompleted: boolean;
  isTurnedIn: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  descriptionRu?: string;
  targetType: 'kill' | 'collect' | 'talk' | 'reach';
  targetId: string;
  required: number;
  current: number;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items?: Item[];
  reputation?: { faction: Faction; amount: number };
}

// Zone
export interface Zone {
  id: ZoneId;
  name: string;
  nameRu: string;
  background: string;
  width: number;
  height: number;
  enemySpawns: EnemySpawn[];
  npcSpawns: NPCSpawn[];
  interactables: InteractableDef[];
  obstacles: Obstacle[];
  difficulty: number;
  musicTheme: string;
  exits: ZoneExit[];
}

export interface EnemySpawn {
  enemyType: EnemyType;
  x: number;
  y: number;
  level: number;
  patrolRadius?: number;
}

export interface NPCSpawn {
  npcType: NPCType;
  name: string;
  x: number;
  y: number;
  faction: Faction;
  dialogueId: string;
  facing?: 'up' | 'down' | 'left' | 'right';
}

export interface InteractableDef {
  interactType: 'chest' | 'door' | 'campfire' | 'sign' | 'zone_transition';
  x: number;
  y: number;
  width?: number;
  height?: number;
  targetZone?: ZoneId;
  targetX?: number;
  targetY?: number;
  loot?: Item[];
  message?: string;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoneExit {
  direction: 'north' | 'south' | 'east' | 'west';
  targetZone: ZoneId;
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Camera
export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  shakeX: number;
  shakeY: number;
  shakeIntensity: number;
  shakeDuration: number;
}

// Particle
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// Damage Number
export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  life: number;
  color: string;
  isCritical: boolean;
}

// Game State
export interface GameState {
  screen: GameScreen;
  player: Player;
  currentZone: ZoneId;
  enemies: Enemy[];
  npcs: NPC[];
  projectiles: Projectile[];
  itemDrops: ItemDrop[];
  interactables: Interactable[];
  camera: Camera;
  particles: Particle[];
  damageNumbers: DamageNumber[];
  quests: Quest[];
  factionReputation: Record<Faction, number>;
  isPaused: boolean;
  dialogActive: boolean;
  currentDialogue: DialogueNode | null;
  inventoryOpen: boolean;
  mapOpen: boolean;
  deathDuel: DeathDuelState | null;
  settings: GameSettings;
  timePlayed: number;
}

export interface DeathDuelState {
  phase: 1 | 2 | 3;
  bossHp: number;
  bossMaxHp: number;
  spiritHp: number;
  spiritMaxHp: number;
  bossAttackCooldown: number;
  bossAttackPattern: number;
  warningX: number;
  warningY: number;
  warningActive: boolean;
  warningTimer: number;
  playerAttacks: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  showDamageNumbers: boolean;
  screenShake: boolean;
  hardcoreMode: boolean;
}

// Input
export interface InputState {
  keys: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  mouseClicked: boolean;
}

// Story Intro
export interface StorySlide {
  text: string;
  duration: number;
}
