
export enum UnitType {
  CAPTAIN = 'CAPTAIN',
  TANK = 'TANK',
  ASSASSIN = 'ASSASSIN',
  HEALER = 'HEALER',
  MAGE = 'MAGE',
  ARCHER = 'ARCHER',
  BERSERKER = 'BERSERKER',
  PALADIN = 'PALADIN',
}

export enum Side {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
}

export enum TargetType {
  SELF = 'SELF',
  SINGLE_ENEMY = 'SINGLE_ENEMY',
  ALL_ENEMIES = 'ALL_ENEMIES',
  ALL_ALLIES = 'ALL_ALLIES',
  LOWEST_HP_ALLY = 'LOWEST_HP_ALLY',
  LOWEST_HP_ENEMY = 'LOWEST_HP_ENEMY',
  RANDOM_3_ENEMIES = 'RANDOM_3_ENEMIES',
  FRONT_3_STRIKES = 'FRONT_3_STRIKES', // Berserker style
}

export enum SkillEffectType {
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  SHIELD = 'SHIELD',
  TAUNT_AND_SHIELD = 'TAUNT_AND_SHIELD',
}

export type GridId = number; 

export interface Stats {
  hp: number;
  maxHp: number;
  shield: number;
  atk: number;
  def: number;
  rage: number;
  maxRage: number;
}

export interface SkillTemplate {
  id: number;
  name: string;
  description: string;
  targetType: TargetType;
  effectType: SkillEffectType;
  multiplier: number; // Damage/Heal multiplier or Shield ratio
  extraValue?: number; // Fixed values if needed
}

export interface Unit {
  id: string; // Instance ID (UUID)
  templateId: string; // "101", "102" etc.
  type: UnitType;
  side: Side;
  gridId: GridId;
  stats: Stats;
  nextAttackTime: number;
  isDead: boolean;
  removeAt?: number;
  skillId?: number; // Runtime link to skill
  
  // Status Effects
  tauntUntil?: number;
  
  fx?: {
    isHit?: boolean;
    isHealing?: boolean;
    isAttacking?: boolean;
    isSkill?: boolean;
    floatingText?: FloatingTextInstance[];
  };
  name: string;
}

export interface FloatingTextInstance {
  id: string;
  text: string;
  type: 'DAMAGE' | 'HEAL' | 'CRIT' | 'BLOCK' | 'TEXT';
  createdAt: number;
}

export interface CombatLogEntry {
  id: string;
  time: string;
  message: string;
  type: 'DAMAGE' | 'HEAL' | 'DEATH' | 'SKILL' | 'SYSTEM';
  side: Side;
}

export interface CardTemplate {
  id: string; // "101"
  name: string;
  type: UnitType;
  cost: number;
  hp: number;
  atk: number;
  def: number;
  skillId: number; // Link to Skill Table
  color: string;
  icon: string;
}

export interface CardInstance {
  instanceId: string;
  templateId: string;
  isCoolingDown: boolean;
}

export interface GameConfig {
  global: Record<string, number>; // INITIAL_ENERGY etc.
  effects: Record<string, number>; // CRIT_CHANCE etc.
  captains: Record<number, { hp: number, atk: number, def: number, rageRegen: number, skillId: number, name: string }>; // 0: Player, 1: Enemy
}

export interface GameState {
  timeRemaining: number;
  energy: number;
  maxEnergy: number;
  isPaused: boolean;
  timeScale: number;
  winner: Side | null;
  units: Unit[];
  hand: (CardInstance | null)[]; 
  deck: string[]; 
  draggingCardId: string | null;
  combatLog: CombatLogEntry[];
}

export const TICKS_PER_SECOND = 60;
