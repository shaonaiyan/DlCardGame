import { Unit, Side, GridId } from './types';

// Convert grid ID (1-9) to coordinates
// Player: [7][4][1] (Back to Front)
// Enemy: [1][4][7] (Front to Back)
export const getGridCoords = (id: GridId) => {
  const map: Record<number, {row: number, col: number}> = {
    1: {row: 0, col: 2}, 2: {row: 1, col: 2}, 3: {row: 2, col: 2},
    4: {row: 0, col: 1}, 5: {row: 1, col: 1}, 6: {row: 2, col: 1},
    7: {row: 0, col: 0}, 8: {row: 1, col: 0}, 9: {row: 2, col: 0},
  };
  return map[id];
};

export const getTarget = (attacker: Unit, allUnits: Unit[]): Unit | null => {
  const enemies = allUnits.filter(u => u.side !== attacker.side && !u.isDead);
  if (enemies.length === 0) return null;

  // 0. Taunt Check
  const taunters = enemies.filter(e => e.tauntUntil && e.tauntUntil > Date.now());
  if (taunters.length > 0) {
    // Attack closest taunter
    return taunters.sort((a, b) => a.gridId - b.gridId)[0];
  }

  if (attacker.type === 'ASSASSIN') {
     // Sort descending by grid ID to find backline
     const sortedByBack = [...enemies].sort((a, b) => b.gridId - a.gridId);
     return sortedByBack[0];
  }

  const attackerCoords = getGridCoords(attacker.gridId);
  
  // Standard Logic: Same Row -> Front to Back
  const sameRow = enemies.filter(e => getGridCoords(e.gridId).row === attackerCoords.row);
  if (sameRow.length > 0) {
    // Frontmost is smallest Grid ID (1,2,3 are front)
    return sameRow.sort((a, b) => a.gridId - b.gridId)[0];
  }

  // Priority 2: Mid Row (Row 1)
  const midRow = enemies.filter(e => getGridCoords(e.gridId).row === 1);
  if (midRow.length > 0) {
    return midRow.sort((a, b) => a.gridId - b.gridId)[0];
  }

  // Priority 3: Top Row (Row 0)
  const topRow = enemies.filter(e => getGridCoords(e.gridId).row === 0);
  if (topRow.length > 0) {
    return topRow.sort((a, b) => a.gridId - b.gridId)[0];
  }

  // Priority 4: Bot Row (Row 2)
  const botRow = enemies.filter(e => getGridCoords(e.gridId).row === 2);
  if (botRow.length > 0) {
    return botRow.sort((a, b) => a.gridId - b.gridId)[0];
  }

  return enemies[0]; // Fallback
};

export const calculateDamage = (attacker: Unit, defender: Unit, effectsConfig: Record<string, number>, skillMulti: number = 1.0) => {
  // Base Damage: Atk - Def (Minimum 5% of Atk)
  const baseDmg = Math.max(attacker.stats.atk - defender.stats.def, attacker.stats.atk * 0.05);
  let damage = baseDmg * skillMulti;

  // Critical Hit
  let isCrit = false;
  if (Math.random() < (effectsConfig['CRIT_CHANCE'] || 0.2)) {
    damage *= (effectsConfig['CRIT_MULTIPLIER'] || 1.5);
    isCrit = true;
  }
  
  // Block (Tank only - logic could be moved to config but kept simple here)
  let isBlock = false;
  if (!isCrit && defender.type === 'TANK' && Math.random() < (effectsConfig['BLOCK_CHANCE'] || 0.3)) {
    damage *= (effectsConfig['BLOCK_MULTIPLIER'] || 0.7);
    isBlock = true;
  }

  return { damage: Math.floor(damage), isCrit, isBlock };
};
