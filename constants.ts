
import { CardTemplate, UnitType, GameConfig, SkillTemplate, TargetType, SkillEffectType } from './types';

// Default Global Config
export const DEFAULT_CONFIG: GameConfig = {
  global: {
    INITIAL_ENERGY: 15,
    MAX_ENERGY: 30,
    ENERGY_REGEN_PER_SEC: 0.8,
    GAME_DURATION_SECONDS: 180,
    MAX_RAGE: 1000,
    ATTACK_COOLDOWN_MS: 2000, // Faster pace
    BASE_GAME_SPEED: 1.0,
  },
  effects: {
    TAUNT_DURATION_MS: 4000,
    SHIELD_ABSORB_RATIO: 0.3,
    CRIT_CHANCE: 0.2,
    CRIT_MULTIPLIER: 1.5,
    BLOCK_CHANCE: 0.3,
    BLOCK_MULTIPLIER: 0.7,
  },
  captains: {
    0: { // Player
      name: '人族领袖',
      hp: 16000,
      atk: 450,
      def: 100,
      rageRegen: 20,
      skillId: 901
    },
    1: { // Enemy
      name: '深渊魔王',
      hp: 10000,
      atk: 650,
      def: 150,
      rageRegen: 20,
      skillId: 902
    }
  }
};

// Default Skills
export const DEFAULT_SKILLS: Record<number, SkillTemplate> = {
  // Unit Skills
  101: { id: 101, name: '嘲讽防御', description: '嘲讽敌军并获得护盾', targetType: TargetType.SELF, effectType: SkillEffectType.TAUNT_AND_SHIELD, multiplier: 0.3 },
  102: { id: 102, name: '神圣护盾', description: '为全体队友提供护盾', targetType: TargetType.ALL_ALLIES, effectType: SkillEffectType.SHIELD, multiplier: 3.0 },
  103: { id: 103, name: '弱点刺杀', description: '对最虚弱敌人造成巨额伤害', targetType: TargetType.LOWEST_HP_ENEMY, effectType: SkillEffectType.DAMAGE, multiplier: 5.0 },
  104: { id: 104, name: '狂暴连斩', description: '对前方敌人造成3连击', targetType: TargetType.FRONT_3_STRIKES, effectType: SkillEffectType.DAMAGE, multiplier: 1.5 },
  105: { id: 105, name: '分裂箭', description: '攻击3名随机敌人', targetType: TargetType.RANDOM_3_ENEMIES, effectType: SkillEffectType.DAMAGE, multiplier: 1.8 },
  106: { id: 106, name: '暴风雪', description: '对所有敌人造成伤害', targetType: TargetType.ALL_ENEMIES, effectType: SkillEffectType.DAMAGE, multiplier: 2.0 },
  107: { id: 107, name: '群体治愈', description: '大幅治疗全体队友', targetType: TargetType.ALL_ALLIES, effectType: SkillEffectType.HEAL, multiplier: 3.5 },
  
  // Captain Skills
  901: { id: 901, name: '圣剑裁决', description: '全屏伤害', targetType: TargetType.ALL_ENEMIES, effectType: SkillEffectType.DAMAGE, multiplier: 2.5 },
  902: { id: 902, name: '毁灭咆哮', description: '全屏伤害', targetType: TargetType.ALL_ENEMIES, effectType: SkillEffectType.DAMAGE, multiplier: 2.5 },
};

// Card Definitions (Numeric IDs as strings)
export const DEFAULT_TEMPLATES: Record<string, CardTemplate> = {
  '101': {
    id: '101',
    name: '重装骑士',
    type: UnitType.TANK,
    cost: 5,
    hp: 2200,
    atk: 120,
    def: 120,
    skillId: 101,
    color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    icon: 'Shield',
  },
  '102': {
    id: '102',
    name: '圣骑士',
    type: UnitType.PALADIN,
    cost: 6,
    hp: 1800,
    atk: 180,
    def: 90,
    skillId: 102,
    color: 'bg-gradient-to-br from-yellow-600 to-amber-800',
    icon: 'Shield',
  },
  '103': {
    id: '103',
    name: '影流刺客',
    type: UnitType.ASSASSIN,
    cost: 4,
    hp: 750,
    atk: 420,
    def: 30,
    skillId: 103,
    color: 'bg-gradient-to-br from-indigo-800 to-black',
    icon: 'Sword',
  },
  '104': {
    id: '104',
    name: '狂战士',
    type: UnitType.BERSERKER,
    cost: 5,
    hp: 1100,
    atk: 350,
    def: 40,
    skillId: 104,
    color: 'bg-gradient-to-br from-red-700 to-red-950',
    icon: 'Axe',
  },
  '105': {
    id: '105',
    name: '精灵射手',
    type: UnitType.ARCHER,
    cost: 4,
    hp: 650,
    atk: 280,
    def: 20,
    skillId: 105,
    color: 'bg-gradient-to-br from-lime-700 to-green-900',
    icon: 'Crosshair',
  },
  '106': {
    id: '106',
    name: '元素法师',
    type: UnitType.MAGE,
    cost: 7,
    hp: 700,
    atk: 320,
    def: 30,
    skillId: 106,
    color: 'bg-gradient-to-br from-violet-700 to-purple-950',
    icon: 'Zap',
  },
  '107': {
    id: '107',
    name: '光明牧师',
    type: UnitType.HEALER,
    cost: 5,
    hp: 900,
    atk: 100,
    def: 40,
    skillId: 107,
    color: 'bg-gradient-to-br from-teal-600 to-emerald-800',
    icon: 'Heart',
  },
};

// Initial Deck
export const INITIAL_DECK = [
  '101', '105', '107', '104', 
  '106', '103', '102', '101', 
  '105', '104', '106', '107'
];
