
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

export type GridId = number; 

export interface Stats {
  hp: number;
  maxHp: number;
  shield: number; // Added shield
  atk: number;
  def: number;
  rage: number;
  maxRage: number;
}

export interface Unit {
  id: string;
  templateId: string;
  type: UnitType;
  side: Side;
  gridId: GridId;
  stats: Stats;
  nextAttackTime: number;
  isDead: boolean;
  removeAt?: number;
  
  // Status Effects
  tauntUntil?: number; // Timestamp until taunt expires
  
  fx?: {
    isHit?: boolean;
    isHealing?: boolean;
    isAttacking?: boolean;
    isSkill?: boolean; // Casting skill visual
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
  time: string; // Formatted 2:54
  message: string;
  type: 'DAMAGE' | 'HEAL' | 'DEATH' | 'SKILL' | 'SYSTEM';
  side: Side;
}

export interface CardTemplate {
  id: string;
  name: string;
  type: UnitType;
  cost: number;
  hp: number;
  atk: number;
  def: number;
  description: string;
  skillDescription: string;
  color: string;
  icon: string;
}

export interface CardInstance {
  instanceId: string;
  templateId: string;
  isCoolingDown: boolean;
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
