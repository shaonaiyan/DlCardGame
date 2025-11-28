import { CardTemplate, UnitType } from './types';

// Central Configuration
export const GAME_CONFIG = {
  // Global Settings
  INITIAL_ENERGY: 15,
  MAX_ENERGY: 30,
  ENERGY_REGEN_PER_SEC: 0.8,
  GAME_DURATION_SECONDS: 180,
  MAX_RAGE: 1000,
  ATTACK_COOLDOWN_MS: 2500,
  
  // Game Speed Control (1.0 = Real Time)
  BASE_GAME_SPEED: 1.0, 
  
  // Player Captain Stats (Protagonist)
  PLAYER_CAPTAIN: {
    HP: 16000,
    ATK: 450,
    DEF: 100,
    RAGE_REGEN_PER_SEC: 20,
  },
  
  // Enemy Captain Stats (Boss)
  ENEMY_CAPTAIN: {
    HP: 10000,
    ATK: 650,
    DEF: 150,
    RAGE_REGEN_PER_SEC: 20,
  },
  
  // Skills / Mechanics
  TAUNT_DURATION_MS: 4000,
  SHIELD_ABSORB_RATIO: 0.3, // 30% of HP as shield
  CRIT_CHANCE: 0.2,
  CRIT_MULTIPLIER: 1.5,
  BLOCK_CHANCE: 0.3,
  BLOCK_MULTIPLIER: 0.7,
};

// Re-export specific constants for backward compatibility if needed, 
// or use GAME_CONFIG directly in other files.
export const INITIAL_ENERGY = GAME_CONFIG.INITIAL_ENERGY;
export const MAX_ENERGY = GAME_CONFIG.MAX_ENERGY;
export const MAX_RAGE = GAME_CONFIG.MAX_RAGE;

// Card Definitions
export const CARD_TEMPLATES: Record<string, CardTemplate> = {
  'unit_tank': {
    id: 'unit_tank',
    name: '重装骑士',
    type: UnitType.TANK,
    cost: 5,
    hp: 2200,
    atk: 120,
    def: 120,
    description: '坚不可摧的前排壁垒。',
    skillDescription: '嘲讽敌军4秒并获得护盾',
    color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    icon: 'Shield',
  },
  'unit_paladin': {
    id: 'unit_paladin',
    name: '圣骑士',
    type: UnitType.PALADIN,
    cost: 6,
    hp: 1800,
    atk: 180,
    def: 90,
    description: '攻守兼备，能辅助队友。',
    skillDescription: '给予全体队友护盾',
    color: 'bg-gradient-to-br from-yellow-600 to-amber-800',
    icon: 'Shield',
  },
  'unit_assassin': {
    id: 'unit_assassin',
    name: '影流刺客',
    type: UnitType.ASSASSIN,
    cost: 4,
    hp: 750,
    atk: 420,
    def: 30,
    description: '切后排专家，爆发极高。',
    skillDescription: '对最虚弱敌人造成巨额伤害',
    color: 'bg-gradient-to-br from-indigo-800 to-black',
    icon: 'Sword',
  },
  'unit_berserker': {
    id: 'unit_berserker',
    name: '狂战士',
    type: UnitType.BERSERKER,
    cost: 5,
    hp: 1100,
    atk: 350,
    def: 40,
    description: '越战越勇，输出恐怖。',
    skillDescription: '对前方敌人造成3连击',
    color: 'bg-gradient-to-br from-red-700 to-red-950',
    icon: 'Axe',
  },
  'unit_archer': {
    id: 'unit_archer',
    name: '精灵射手',
    type: UnitType.ARCHER,
    cost: 4,
    hp: 650,
    atk: 280,
    def: 20,
    description: '远程持续输出。',
    skillDescription: '乱射：攻击3名随机敌人',
    color: 'bg-gradient-to-br from-lime-700 to-green-900',
    icon: 'Crosshair',
  },
  'unit_mage': {
    id: 'unit_mage',
    name: '元素法师',
    type: UnitType.MAGE,
    cost: 7,
    hp: 700,
    atk: 320,
    def: 30,
    description: '掌控元素的范围打击者。',
    skillDescription: '对所有敌人造成伤害',
    color: 'bg-gradient-to-br from-violet-700 to-purple-950',
    icon: 'Zap',
  },
  'unit_healer': {
    id: 'unit_healer',
    name: '光明牧师',
    type: UnitType.HEALER,
    cost: 5,
    hp: 900,
    atk: 100,
    def: 40,
    description: '团队的核心续航保障。',
    skillDescription: '大幅治疗全体队友',
    color: 'bg-gradient-to-br from-teal-600 to-emerald-800',
    icon: 'Heart',
  },
};

export const CAPTAIN_PLAYER_TEMPLATE: CardTemplate = {
  id: 'captain_player',
  name: '人族领袖',
  type: UnitType.CAPTAIN,
  cost: 0,
  hp: GAME_CONFIG.PLAYER_CAPTAIN.HP,
  atk: GAME_CONFIG.PLAYER_CAPTAIN.ATK,
  def: GAME_CONFIG.PLAYER_CAPTAIN.DEF,
  description: '你的化身',
  skillDescription: '圣剑裁决：全屏伤害+眩晕',
  color: 'bg-gradient-to-br from-yellow-500 to-orange-700',
  icon: 'Crown',
};

export const CAPTAIN_ENEMY_TEMPLATE: CardTemplate = {
  id: 'captain_enemy',
  name: '深渊魔王',
  type: UnitType.CAPTAIN,
  cost: 0,
  hp: GAME_CONFIG.ENEMY_CAPTAIN.HP,
  atk: GAME_CONFIG.ENEMY_CAPTAIN.ATK,
  def: GAME_CONFIG.ENEMY_CAPTAIN.DEF,
  description: '最终BOSS',
  skillDescription: '毁灭咆哮：全屏伤害+削弱',
  color: 'bg-gradient-to-br from-rose-900 to-black',
  icon: 'Skull',
};

// Initial Deck - Mixed randomness
export const INITIAL_DECK = [
  'unit_tank', 'unit_archer', 'unit_healer', 'unit_berserker', 
  'unit_mage', 'unit_assassin', 'unit_paladin', 'unit_tank', 
  'unit_archer', 'unit_berserker', 'unit_mage', 'unit_healer'
];