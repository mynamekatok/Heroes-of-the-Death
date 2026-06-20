import type { Zone, Item, Quest, GameSettings, StorySlide, ZoneId, Faction, EnemyType } from '../types/game';

// Canvas settings
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const TILE_SIZE = 64;

// Player settings
export const PLAYER_SPEED = 150;
export const PLAYER_SIZE = 48;
export const PLAYER_MAX_HP = 100;
export const PLAYER_MAX_MANA = 50;
export const PLAYER_MAX_STAMINA = 100;
export const PLAYER_DAMAGE = 15;
export const PLAYER_DEFENSE = 5;
export const ROLL_SPEED = 350;
export const ROLL_DURATION = 0.3;
export const ROLL_COOLDOWN = 1.5;
export const ROLL_STAMINA_COST = 25;
export const ATTACK_COOLDOWN = 0.5;
export const ATTACK_STAMINA_COST = 10;
export const MANA_REGEN_RATE = 5;
export const STAMINA_REGEN_RATE = 20;
export const EXPOSURE_MAX = 100;
export const EXPOSURE_WARNING_THRESHOLD = 75;

// Death Duel settings
export const DEATH_DUEL_SPIRIT_HP = 50;
export const DEATH_DUEL_BOSS_HP = 200;
export const DEATH_DUEL_BOSS_DAMAGE = 20;
export const DEATH_DUEL_ARENA_SIZE = 800;
export const DEATH_SCYTHE_SPEED = 180;
export const DEATH_PROJECTILE_SPEED = 250;

// Camera
export const CAMERA_LERP = 0.08;
export const SHAKE_DECAY = 0.9;

// XP System
export const XP_BASE = 100;
export const XP_MULTIPLIER = 1.5;

// Items
export const ITEMS: Record<string, Item> = {
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    type: 'potion',
    sprite: '/assets/potion_health.png',
    description: 'Restores 50 HP',
    value: 25,
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    type: 'potion',
    sprite: '/assets/potion_health.png',
    description: 'Restores 30 Mana',
    value: 20,
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    type: 'weapon',
    sprite: '/assets/sword.png',
    description: 'A sturdy iron blade',
    value: 100,
    weaponClass: 'sword',
    stats: { damage: 20 },
  },
  magic_staff: {
    id: 'magic_staff',
    name: 'Magic Staff',
    type: 'weapon',
    sprite: '/assets/staff.png',
    description: 'Channels arcane power',
    value: 150,
    weaponClass: 'staff',
    stats: { damage: 25, maxMana: 30 },
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'armor',
    sprite: '/assets/potion_health.png',
    description: 'Basic protection',
    value: 80,
    stats: { defense: 10, maxHp: 20 },
  },
  gold_coin: {
    id: 'gold_coin',
    name: 'Gold',
    type: 'gold',
    sprite: '/assets/coin.png',
    description: 'Currency of the realm',
    value: 1,
  },
  sun_crystal: {
    id: 'sun_crystal',
    name: 'Sun Crystal',
    type: 'quest_item',
    sprite: '/assets/coin.png',
    description: 'A glowing crystal from the dwarf mines',
    value: 0,
  },
};

// Zones
export const ZONES: Record<ZoneId, Zone> = {
  beach: {
    id: 'beach',
    name: 'Vuklas Shore',
    nameRu: 'Берег Вукласа',
    background: '/assets/zone_beach.jpg',
    width: 2048,
    height: 2048,
    difficulty: 1,
    musicTheme: 'shore',
    enemySpawns: [
      { enemyType: 'skeleton' as EnemyType, x: 400, y: 300, level: 1, patrolRadius: 100 },
      { enemyType: 'skeleton' as EnemyType, x: 800, y: 600, level: 1, patrolRadius: 100 },
      { enemyType: 'skeleton' as EnemyType, x: 1200, y: 400, level: 2, patrolRadius: 150 },
    ],
    npcSpawns: [],
    interactables: [
      { interactType: 'chest', x: 1500, y: 800, loot: [ITEMS.health_potion, ITEMS.iron_sword] },
      { interactType: 'campfire', x: 1024, y: 1024 },
      { interactType: 'zone_transition', x: 2000, y: 1024, targetZone: 'village', targetX: 50, targetY: 600 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 2048, height: 50 },
      { x: 0, y: 0, width: 50, height: 2048 },
      { x: 1998, y: 0, width: 50, height: 900 },
      { x: 1998, y: 1150, width: 50, height: 898 },
      { x: 0, y: 1998, width: 2048, height: 50 },
    ],
    exits: [
      { direction: 'east', targetZone: 'village', targetX: 100, targetY: 600, x: 2040, y: 900, width: 48, height: 250 },
    ],
  },
  village: {
    id: 'village',
    name: 'Greyhaven',
    nameRu: 'Серная Гавань',
    background: '/assets/zone_village.jpg',
    width: 1536,
    height: 1536,
    difficulty: 0,
    musicTheme: 'village',
    enemySpawns: [],
    npcSpawns: [
      { npcType: 'quest_giver', name: 'Elder Morgan', x: 768, y: 400, faction: 'human' as Faction, dialogueId: 'elder_morgan_intro', facing: 'down' },
      { npcType: 'merchant', name: 'Trader Gimli', x: 500, y: 700, faction: 'dwarf' as Faction, dialogueId: 'merchant_gimli', facing: 'right' },
      { npcType: 'villager', name: 'Villager', x: 900, y: 600, faction: 'human' as Faction, dialogueId: 'villager_random', facing: 'left' },
      { npcType: 'blacksmith', name: 'Smith Borin', x: 300, y: 400, faction: 'human' as Faction, dialogueId: 'blacksmith_borin', facing: 'right' },
    ],
    interactables: [
      { interactType: 'campfire', x: 768, y: 1000, message: 'Checkpoint saved' },
      { interactType: 'sign', x: 200, y: 200, message: 'Welcome to Greyhaven. Beware the forest to the east.' },
    ],
    obstacles: [
      { x: 0, y: 0, width: 1536, height: 50 },
      { x: 0, y: 0, width: 50, height: 1536 },
      { x: 1486, y: 0, width: 50, height: 1536 },
      { x: 0, y: 1486, width: 1536, height: 50 },
    ],
    exits: [
      { direction: 'west', targetZone: 'beach', targetX: 1900, targetY: 1024, x: 0, y: 500, width: 48, height: 300 },
      { direction: 'north', targetZone: 'mine', targetX: 768, targetY: 1400, x: 600, y: 0, width: 400, height: 48 },
      { direction: 'east', targetZone: 'forest', targetX: 100, targetY: 768, x: 1488, y: 600, width: 48, height: 400 },
    ],
  },
  forest: {
    id: 'forest',
    name: 'Whispering Woods',
    nameRu: 'Шепчущий Лес',
    background: '/assets/zone_forest.jpg',
    width: 2048,
    height: 2048,
    difficulty: 2,
    musicTheme: 'forest',
    enemySpawns: [
      { enemyType: 'wolf' as EnemyType, x: 500, y: 500, level: 2, patrolRadius: 150 },
      { enemyType: 'wolf' as EnemyType, x: 1200, y: 800, level: 2, patrolRadius: 150 },
      { enemyType: 'cultist' as EnemyType, x: 1600, y: 600, level: 3, patrolRadius: 100 },
      { enemyType: 'elf' as EnemyType, x: 800, y: 1200, level: 3, patrolRadius: 200 },
      { enemyType: 'cultist' as EnemyType, x: 400, y: 1600, level: 3, patrolRadius: 100 },
    ],
    npcSpawns: [
      { npcType: 'quest_giver', name: 'Elara', x: 1000, y: 1000, faction: 'elf' as Faction, dialogueId: 'elara_quest', facing: 'down' },
    ],
    interactables: [
      { interactType: 'chest', x: 1800, y: 300, loot: [ITEMS.magic_staff, ITEMS.mana_potion] },
      { interactType: 'campfire', x: 600, y: 600 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 2048, height: 50 },
      { x: 0, y: 0, width: 50, height: 2048 },
      { x: 1998, y: 0, width: 50, height: 2048 },
      { x: 0, y: 1998, width: 2048, height: 50 },
    ],
    exits: [
      { direction: 'west', targetZone: 'village', targetX: 1400, targetY: 800, x: 0, y: 600, width: 48, height: 400 },
      { direction: 'north', targetZone: 'temple', targetX: 768, targetY: 1400, x: 800, y: 0, width: 400, height: 48 },
    ],
  },
  mine: {
    id: 'mine',
    name: 'Ironbelly Mines',
    nameRu: 'Шахты Желчного Железа',
    background: '/assets/zone_mine.jpg',
    width: 2048,
    height: 2048,
    difficulty: 3,
    musicTheme: 'mine',
    enemySpawns: [
      { enemyType: 'dwarf' as EnemyType, x: 600, y: 400, level: 3, patrolRadius: 100 },
      { enemyType: 'dwarf' as EnemyType, x: 1400, y: 800, level: 4, patrolRadius: 150 },
      { enemyType: 'skeleton' as EnemyType, x: 1000, y: 1200, level: 4, patrolRadius: 100 },
      { enemyType: 'dwarf' as EnemyType, x: 400, y: 1600, level: 4, patrolRadius: 100 },
    ],
    npcSpawns: [
      { npcType: 'quest_giver', name: 'King Ironfoot', x: 1024, y: 500, faction: 'dwarf' as Faction, dialogueId: 'king_ironfoot', facing: 'down' },
    ],
    interactables: [
      { interactType: 'chest', x: 1800, y: 1600, loot: [ITEMS.sun_crystal, ITEMS.leather_armor] },
      { interactType: 'campfire', x: 300, y: 300 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 2048, height: 50 },
      { x: 0, y: 0, width: 50, height: 2048 },
      { x: 1998, y: 0, width: 50, height: 2048 },
      { x: 0, y: 1998, width: 2048, height: 50 },
    ],
    exits: [
      { direction: 'south', targetZone: 'village', targetX: 800, targetY: 100, x: 600, y: 2000, width: 400, height: 48 },
      { direction: 'east', targetZone: 'moor', targetX: 100, targetY: 1024, x: 2040, y: 900, width: 48, height: 300 },
    ],
  },
  temple: {
    id: 'temple',
    name: 'Sunken Cathedral',
    nameRu: 'Затопленный Собор',
    background: '/assets/zone_temple.jpg',
    width: 1536,
    height: 1536,
    difficulty: 4,
    musicTheme: 'temple',
    enemySpawns: [
      { enemyType: 'cultist' as EnemyType, x: 400, y: 400, level: 5, patrolRadius: 150 },
      { enemyType: 'cultist' as EnemyType, x: 1100, y: 400, level: 5, patrolRadius: 150 },
      { enemyType: 'cultist' as EnemyType, x: 768, y: 900, level: 6, patrolRadius: 100 },
      { enemyType: 'skeleton' as EnemyType, x: 600, y: 1200, level: 5, patrolRadius: 100 },
    ],
    npcSpawns: [],
    interactables: [
      { interactType: 'chest', x: 768, y: 600, loot: [ITEMS.health_potion, ITEMS.health_potion, ITEMS.mana_potion] },
    ],
    obstacles: [
      { x: 0, y: 0, width: 1536, height: 50 },
      { x: 0, y: 0, width: 50, height: 1536 },
      { x: 1486, y: 0, width: 50, height: 1536 },
      { x: 0, y: 1486, width: 1536, height: 50 },
    ],
    exits: [
      { direction: 'south', targetZone: 'forest', targetX: 1000, targetY: 100, x: 600, y: 1488, width: 400, height: 48 },
    ],
  },
  moor: {
    id: 'moor',
    name: 'The Bleak Moor',
    nameRu: 'Мрачная Пустошь',
    background: '/assets/zone_forest.jpg',
    width: 1536,
    height: 1536,
    difficulty: 5,
    musicTheme: 'moor',
    enemySpawns: [
      { enemyType: 'wolf' as EnemyType, x: 400, y: 400, level: 5, patrolRadius: 200 },
      { enemyType: 'skeleton' as EnemyType, x: 1100, y: 800, level: 6, patrolRadius: 150 },
      { enemyType: 'cultist' as EnemyType, x: 700, y: 1100, level: 6, patrolRadius: 150 },
    ],
    npcSpawns: [],
    interactables: [
      { interactType: 'campfire', x: 768, y: 768 },
    ],
    obstacles: [],
    exits: [
      { direction: 'west', targetZone: 'mine', targetX: 1900, targetY: 1024, x: 0, y: 900, width: 48, height: 300 },
      { direction: 'east', targetZone: 'ruins', targetX: 100, targetY: 768, x: 1488, y: 600, width: 48, height: 400 },
    ],
  },
  ruins: {
    id: 'ruins',
    name: 'The Shattered City',
    nameRu: 'Разрушенный Город',
    background: '/assets/zone_temple.jpg',
    width: 2048,
    height: 2048,
    difficulty: 6,
    musicTheme: 'ruins',
    enemySpawns: [
      { enemyType: 'cultist' as EnemyType, x: 500, y: 500, level: 7, patrolRadius: 200 },
      { enemyType: 'cultist' as EnemyType, x: 1500, y: 500, level: 7, patrolRadius: 200 },
      { enemyType: 'elf' as EnemyType, x: 1000, y: 1000, level: 8, patrolRadius: 300 },
      { enemyType: 'cultist' as EnemyType, x: 800, y: 1600, level: 8, patrolRadius: 200 },
    ],
    npcSpawns: [],
    interactables: [],
    obstacles: [],
    exits: [
      { direction: 'west', targetZone: 'moor', targetX: 1400, targetY: 768, x: 0, y: 600, width: 48, height: 400 },
      { direction: 'north', targetZone: 'frostpeak', targetX: 768, targetY: 1400, x: 800, y: 0, width: 400, height: 48 },
      { direction: 'east', targetZone: 'stronghold', targetX: 100, targetY: 1024, x: 2040, y: 900, width: 48, height: 300 },
    ],
  },
  frostpeak: {
    id: 'frostpeak',
    name: 'Frostpeak',
    nameRu: 'Ледяная Вершина',
    background: '/assets/zone_mine.jpg',
    width: 1536,
    height: 1536,
    difficulty: 7,
    musicTheme: 'frost',
    enemySpawns: [
      { enemyType: 'wolf' as EnemyType, x: 400, y: 400, level: 8, patrolRadius: 200 },
      { enemyType: 'dwarf' as EnemyType, x: 1100, y: 600, level: 9, patrolRadius: 150 },
      { enemyType: 'skeleton' as EnemyType, x: 700, y: 1100, level: 9, patrolRadius: 200 },
    ],
    npcSpawns: [],
    interactables: [],
    obstacles: [],
    exits: [
      { direction: 'south', targetZone: 'ruins', targetX: 1024, targetY: 100, x: 600, y: 1488, width: 400, height: 48 },
    ],
  },
  stronghold: {
    id: 'stronghold',
    name: 'Cultist Stronghold',
    nameRu: 'Цитадель Культистов',
    background: '/assets/zone_temple.jpg',
    width: 2048,
    height: 2048,
    difficulty: 8,
    musicTheme: 'stronghold',
    enemySpawns: [
      { enemyType: 'cultist' as EnemyType, x: 600, y: 400, level: 10, patrolRadius: 200 },
      { enemyType: 'cultist' as EnemyType, x: 1400, y: 400, level: 10, patrolRadius: 200 },
      { enemyType: 'cultist' as EnemyType, x: 1000, y: 1000, level: 11, patrolRadius: 300 },
      { enemyType: 'cultist' as EnemyType, x: 400, y: 1600, level: 11, patrolRadius: 200 },
      { enemyType: 'cultist' as EnemyType, x: 1600, y: 1600, level: 12, patrolRadius: 200 },
    ],
    npcSpawns: [],
    interactables: [],
    obstacles: [],
    exits: [
      { direction: 'west', targetZone: 'ruins', targetX: 1900, targetY: 1024, x: 0, y: 900, width: 48, height: 300 },
      { direction: 'east', targetZone: 'eye_of_storm', targetX: 400, targetY: 400, x: 2040, y: 900, width: 48, height: 300 },
    ],
  },
  eye_of_storm: {
    id: 'eye_of_storm',
    name: 'Eye of the Storm',
    nameRu: 'Око Бури',
    background: '/assets/zone_temple.jpg',
    width: 1024,
    height: 1024,
    difficulty: 10,
    musicTheme: 'boss',
    enemySpawns: [
      { enemyType: 'boss_cultist' as EnemyType, x: 512, y: 300, level: 15, patrolRadius: 0 },
    ],
    npcSpawns: [],
    interactables: [],
    obstacles: [
      { x: 0, y: 0, width: 1024, height: 50 },
      { x: 0, y: 0, width: 50, height: 1024 },
      { x: 974, y: 0, width: 50, height: 1024 },
      { x: 0, y: 974, width: 1024, height: 50 },
    ],
    exits: [],
  },
};

// Quests
export const QUESTS: Quest[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Survive the shore and reach Greyhaven village.',
    objectives: [
      { id: 'reach_village', description: 'Reach Greyhaven', descriptionRu: 'Доберитесь до Серной Гавани', targetType: 'reach', targetId: 'village', required: 1, current: 0 },
    ],
    rewards: { xp: 50, gold: 10 },
    isActive: true,
    isCompleted: false,
    isTurnedIn: false,
  },
  {
    id: 'missing_scouts',
    name: 'Missing Scouts',
    description: 'Elven scouts have gone missing in the Whispering Woods. Find them.',
    objectives: [
      { id: 'find_elara', description: 'Find Elara in the woods', descriptionRu: 'Найдите Элару в лесу', targetType: 'talk', targetId: 'elara', required: 1, current: 0 },
      { id: 'kill_cultists', description: 'Defeat cultists in the woods', descriptionRu: 'Победите культистов в лесу', targetType: 'kill', targetId: 'cultist', required: 3, current: 0 },
    ],
    rewards: { xp: 200, gold: 50, reputation: { faction: 'elf' as Faction, amount: 20 } },
    isActive: false,
    isCompleted: false,
    isTurnedIn: false,
  },
  {
    id: 'dwarf_crystal',
    name: 'The Sun Crystal',
    description: 'Negotiate with the Dwarf King for the Sun Crystal.',
    objectives: [
      { id: 'talk_king', description: 'Speak with King Ironfoot', descriptionRu: 'Поговорите с Королем Железной Стопы', targetType: 'talk', targetId: 'king_ironfoot', required: 1, current: 0 },
      { id: 'collect_crystal', description: 'Find the Sun Crystal in the mines', descriptionRu: 'Найдите Солнечный Кристалл в шахтах', targetType: 'collect', targetId: 'sun_crystal', required: 1, current: 0 },
    ],
    rewards: { xp: 300, gold: 100, reputation: { faction: 'dwarf' as Faction, amount: 20 } },
    isActive: false,
    isCompleted: false,
    isTurnedIn: false,
  },
];

// Story Intro
export const STORY_SLIDES: StorySlide[] = [
  { text: 'Времена Великих давно уже прошли...', duration: 4000 },
  { text: 'Кристофер, ангел-странник, возвращался домой после долгого путешествия...', duration: 4000 },
  { text: 'Небо внезапно потемнело. Огромная воздушная воронка поглотила его...', duration: 4000 },
  { text: 'Когда он очнулся, он лежал на песке незнакомого острова...', duration: 4000 },
  { text: 'Остров Вуклас. Обитает людской народ. И кое-кто похуже.', duration: 4000 },
  { text: 'Люди боятся ангелов. Не раскрывай себя. Выживи.', duration: 4000 },
  { text: 'Быть может, именно твое имя останется в памяти миллионов...', duration: 4000 },
];

// Default Settings
export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  showDamageNumbers: true,
  screenShake: true,
  hardcoreMode: false,
};

// Dialogue Database
export const DIALOGUES: Record<string, { nodes: Record<string, { text: string; textRu: string; choices: { text: string; textRu: string; nextNodeId?: string; exposureGain?: number }[] }> }> = {
  elder_morgan_intro: {
    nodes: {
      start: {
        text: "Welcome, stranger. You look like you've been through the storm. This is Greyhaven, the last safe haven on Vuklas Island.",
        textRu: "Добро пожаловать, странник. Похоже, ты пережил бурю. Это Серная Гавань — последнее безопасное место на острове Вуклас.",
        choices: [
          { text: "What happened to this island?", textRu: "Что случилось с этим островом?", nextNodeId: 'island_history', exposureGain: 0 },
          { text: "I need to get off this island.", textRu: "Мне нужно убраться с этого острова.", nextNodeId: 'escape', exposureGain: 0 },
          { text: "I'm... just a traveler.", textRu: "Я... просто путник.", nextNodeId: 'suspicion', exposureGain: 5 },
        ],
      },
      island_history: {
        text: "The Cultists came three moons ago. They brought dark magic and opened portals. The elves hide in their woods, dwarves sealed their mines. We humans stick together... mostly.",
        textRu: "Культисты пришли три луны назад. Они принесли темную магию и открыли порталы. Эльфы прячутся в своих лесах, гномы запечатали шахты. Мы, люди, держимся вместе... в основном.",
        choices: [
          { text: "Tell me about the Cultists.", textRu: "Расскажи мне о Культистах.", nextNodeId: 'cultists', exposureGain: 0 },
          { text: "I'll help however I can.", textRu: "Я помогу, чем смогу.", nextNodeId: 'quest_offer', exposureGain: 0 },
        ],
      },
      cultists: {
        text: "They serve something ancient and evil. They know things they shouldn't — weaknesses of all races. Be very careful around them, traveler. They can see what others cannot.",
        textRu: "Они служат чему-то древнему и злому. Они знают то, чего не должны — слабости всех рас. Будь очень осторожен рядом с ними, странник. Они видят то, что другие не могут.",
        choices: [
          { text: "What do you mean, 'see'?", textRu: "Что значит 'видят'?", nextNodeId: 'see_more', exposureGain: 5 },
          { text: "I should go.", textRu: "Мне пора.", nextNodeId: 'goodbye', exposureGain: 0 },
        ],
      },
      see_more: {
        text: "They can sense... true nature. If you have something to hide, stay far from the Cathedral. Now, will you help us?",
        textRu: "Они чувствуют... истинную природу. Если тебе есть что скрывать, держись подальше от Собора. Так что, поможешь нам?",
        choices: [
          { text: "Yes, I'll help.", textRu: "Да, я помогу.", nextNodeId: 'quest_offer', exposureGain: 0 },
          { text: "I need to think about it.", textRu: "Мне нужно подумать.", nextNodeId: 'goodbye', exposureGain: 0 },
        ],
      },
      suspicion: {
        text: "Hmm... your eyes have an unusual glow. No matter. We don't ask questions in Greyhaven. Survival comes first.",
        textRu: "Хм... в твоих глазах необычное свечение. Неважно. Мы не задаем вопросов в Серной Гавани. Выживание превыше всего.",
        choices: [
          { text: "Thank you for your hospitality.", textRu: "Спасибо за гостеприимство.", nextNodeId: 'quest_offer', exposureGain: 0 },
        ],
      },
      escape: {
        text: "The only way off is through the Eye of the Storm — the Cultist's main stronghold. Nobody who went there has returned.",
        textRu: "Единственный путь — через Око Бури, главную цитадель Культистов. Никто, кто отправился туда, не вернулся.",
        choices: [
          { text: "Then I'll be the first.", textRu: "Тогда я буду первым.", nextNodeId: 'quest_offer', exposureGain: 0 },
        ],
      },
      quest_offer: {
        text: "Go to the Whispering Woods east of here. Find Elara, the elven scout. She has information about the Cultists' movements. And beware — the woods are dangerous.",
        textRu: "Отправляйся в Шепчущий Лес к востоку. Найди Элару, эльфийскую разведчицу. У нее есть информация о передвижении Культистов. И осторожно — лес опасен.",
        choices: [
          { text: "I'll find her.", textRu: "Я найду ее.", exposureGain: 0 },
        ],
      },
      goodbye: {
        text: "Farewell, stranger. Watch your back.",
        textRu: "Прощай, странник. Береги спину.",
        choices: [],
      },
    },
  },
  merchant_gimli: {
    nodes: {
      start: {
        text: "Ha! A customer! What can Gimli sell ya? I got the finest wares this side of the island!",
        textRu: "Ха! Покупатель! Что Гимли может тебе продать? У меня лучшие товары на этой стороне острова!",
        choices: [
          { text: "Show me your wares.", textRu: "Покажи свои товары.", exposureGain: 0 },
          { text: "What do you know about the Cultists?", textRu: "Что ты знаешь о Культистах?", nextNodeId: 'cultists', exposureGain: 0 },
          { text: "Not today.", textRu: "Не сегодня.", exposureGain: 0 },
        ],
      },
      cultists: {
        text: "Bad for business, I tell ya! They don't trade, they take! But I heard whispers... they fear something. Something pure. Something with wings, if you believe the tales.",
        textRu: "Плохо для бизнеса, говорю тебе! Они не торгуют, они забирают! Но я слышал шепот... они чего-то боятся. Чего-то чистого. Чего-то с крыльями, если верить сказкам.",
        choices: [
          { text: "Wings? What do you mean?", textRu: "Крыльями? Что ты имеешь в виду?", nextNodeId: 'wings', exposureGain: 10 },
          { text: "Thanks for the info.", textRu: "Спасибо за информацию.", exposureGain: 0 },
        ],
      },
      wings: {
        text: "Hey, don't look at me like that! It's just tavern talk! ...Though now that I look at you closer... never mind. Want to buy something or not?",
        textRu: "Эй, не смотри на меня так! Это просто таверная болтовня! ...Хотя, если присмотреться к тебе поближе... неважно. Будешь что-то покупать или нет?",
        choices: [
          { text: "Show me your wares.", textRu: "Покажи свои товары.", exposureGain: 0 },
          { text: "I should go.", textRu: "Мне пора.", exposureGain: 0 },
        ],
      },
    },
  },
  villager_random: {
    nodes: {
      start: {
        text: "Did you hear? More disappearances near the woods. The Cultists are getting bolder.",
        textRu: "Слышал? Новые исчезновения у леса. Культисты становятся смелее.",
        choices: [
          { text: "Stay safe.", textRu: "Береги себя.", exposureGain: 0 },
        ],
      },
    },
  },
  blacksmith_borin: {
    nodes: {
      start: {
        text: "Need your blade sharpened? Or maybe some new armor? I forge only the best.",
        textRu: "Нужно заточить клинок? Или новые доспехи? Я кую только лучшее.",
        choices: [
          { text: "I'll come back later.", textRu: "Я зайду позже.", exposureGain: 0 },
        ],
      },
    },
  },
  elara_quest: {
    nodes: {
      start: {
        text: "You... you're not from this island. I can sense it. The trees whisper about you — they say you have hidden wings.",
        textRu: "Ты... ты не с этого острова. Я чувствую это. Деревья шепчут о тебе — говорят, у тебя есть скрытые крылья.",
        choices: [
          { text: "The trees are mistaken.", textRu: "Деревья ошибаются.", nextNodeId: 'deny', exposureGain: 5 },
          { text: "...What do you want?", textRu: "...Что тебе нужно?", nextNodeId: 'truth', exposureGain: 10 },
        ],
      },
      deny: {
        text: "Perhaps. But I won't betray you. The Cultists must be stopped. They've taken three of my scouts to the Sunken Cathedral. Help me save them.",
        textRu: "Возможно. Но я не выдам тебя. Культистов нужно остановить. Они забрали троих моих разведчиков в Затопленный Собор. Помоги мне спасти их.",
        choices: [
          { text: "I'll help.", textRu: "Я помогу.", exposureGain: 0 },
          { text: "That's too dangerous.", textRu: "Это слишком опасно.", nextNodeId: 'refuse', exposureGain: 0 },
        ],
      },
      truth: {
        text: "Your secret is safe with me, angel. The Cultists hunt your kind — they know your weaknesses. We must work together. Will you help me save my scouts from the Cathedral?",
        textRu: "Твой секрет в безопасности со мной, ангел. Культисты охотятся на твоих — они знают ваши слабости. Мы должны работать вместе. Поможешь мне спасти моих разведчиков из Собора?",
        choices: [
          { text: "I'll save them.", textRu: "Я спасу их.", exposureGain: 0 },
          { text: "I need more time.", textRu: "Мне нужно время.", nextNodeId: 'refuse', exposureGain: 0 },
        ],
      },
      refuse: {
        text: "I understand. But remember — the Cultists already know you're here. It's only a matter of time.",
        textRu: "Я понимаю. Но помни — Культисты уже знают, что ты здесь. Это лишь вопрос времени.",
        choices: [
          { text: "I'll be careful.", textRu: "Я буду осторожен.", exposureGain: 0 },
        ],
      },
    },
  },
  king_ironfoot: {
    nodes: {
      start: {
        text: "An outsider in my halls? State your business, surface-dweller.",
        textRu: "Чужак в моих залах? Говори, чего тебе надо, житель поверхности.",
        choices: [
          { text: "I need the Sun Crystal.", textRu: "Мне нужен Солнечный Кристалл.", nextNodeId: 'crystal', exposureGain: 0 },
          { text: "The Cultists threaten everyone.", textRu: "Культисты угрожают всем.", nextNodeId: 'cultists', exposureGain: 0 },
        ],
      },
      crystal: {
        text: "The Sun Crystal?! That's our most precious relic! Why should I give it to a stranger?",
        textRu: "Солнечный Кристалл?! Это наша драгоценнейшая реликвия! Почему я должен отдать ее незнакомцу?",
        choices: [
          { text: "To defeat the Cultists.", textRu: "Чтобы победить Культистов.", nextNodeId: 'defeat', exposureGain: 0 },
          { text: "I'll pay for it.", textRu: "Я заплачу за него.", nextNodeId: 'pay', exposureGain: 0 },
        ],
      },
      cultists: {
        text: "Hmph. The deep ones care little for surface wars. But... the Cultists have been digging near our eastern tunnels. That changes things.",
        textRu: "Хм. Глубинные мало заботятся о поверхностных войнах. Но... Культисты копали у наших восточных туннелей. Это меняет дело.",
        choices: [
          { text: "Let me help.", textRu: "Позволь мне помочь.", nextNodeId: 'defeat', exposureGain: 0 },
        ],
      },
      defeat: {
        text: "Very well. The Sun Crystal is hidden in the deepest chamber. Clear out the undead that have infested the lower levels, and it's yours.",
        textRu: "Что ж. Солнечный Кристалл спрятан в самой глубокой камере. Зачисти нежить, которая заполонила нижние уровни, и он твой.",
        choices: [
          { text: "I'll clear them out.", textRu: "Я зачищу их.", exposureGain: 0 },
        ],
      },
      pay: {
        text: "Gold? HA! We dwarves care for honor, not gold! ...Well, maybe a little gold. 500 pieces, and the Crystal is yours.",
        textRu: "Золото? ХА! Мы, гномы, ценим честь, а не золото! ...Ну, может, немного золота. 500 монет, и Кристалл твой.",
        choices: [
          { text: "I'll gather the gold.", textRu: "Я соберу золото.", exposureGain: 0 },
        ],
      },
    },
  },
};

// Colors
export const COLORS = {
  bgPrimary: '#1A1C2C',
  bgSecondary: '#2D2F45',
  accent: '#C41E3A',
  gameElementPrimary: '#8B9A6B',
  gameElementSecondary: '#8B7355',
  textPrimary: '#F4E4C1',
  textSecondary: '#A39B8B',
  success: '#4A7C59',
  danger: '#8B0000',
  magic: '#7B68EE',
  hpBar: '#4A7C59',
  manaBar: '#1E90FF',
  staminaBar: '#FFD700',
  exposureWarning: '#C41E3A',
};
