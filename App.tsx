import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Side, Unit, UnitType, CardInstance, GridId, CombatLogEntry, CardTemplate, SkillTemplate, TargetType, SkillEffectType, GameConfig } from './types';
import { DEFAULT_CONFIG, INITIAL_DECK, DEFAULT_TEMPLATES, DEFAULT_SKILLS } from './constants';
import { calculateDamage, getTarget } from './utils';
import Battlefield from './components/Battlefield';
import Hand from './components/Hand';
import HUD from './components/HUD';
import { EnergyBar } from './components/EnergyBar';
import { CombatLog } from './components/CombatLog';

const uuid = () => Math.random().toString(36).substr(2, 9);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [cardTemplates, setCardTemplates] = useState<Record<string, CardTemplate>>(DEFAULT_TEMPLATES);
  const [skillsConfig, setSkillsConfig] = useState<Record<number, SkillTemplate>>(DEFAULT_SKILLS);
  
  const getInitialState = (): GameState => ({
    timeRemaining: gameConfig.global.GAME_DURATION_SECONDS,
    energy: gameConfig.global.INITIAL_ENERGY,
    maxEnergy: gameConfig.global.MAX_ENERGY,
    isPaused: false,
    timeScale: gameConfig.global.BASE_GAME_SPEED,
    winner: null,
    units: [],
    hand: Array(4).fill(null),
    deck: [...INITIAL_DECK],
    draggingCardId: null,
    combatLog: [],
  });

  const [gameState, setGameState] = useState<GameState>(getInitialState());
  const [hasStarted, setHasStarted] = useState(false);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const dragRef = useRef<{ cardId: string | null; templateId: string | null }>({ cardId: null, templateId: null });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleConfigUpdate = (newConfig: GameConfig, newTemplates: Record<string, CardTemplate>, newSkills: Record<number, SkillTemplate>) => {
      setGameConfig(newConfig);
      setCardTemplates(newTemplates);
      setSkillsConfig(newSkills);
  };

  const gameTick = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    let deltaMs = timestamp - lastTimeRef.current;
    if (deltaMs > 60) deltaMs = 60; 
    lastTimeRef.current = timestamp;

    setGameState(prev => {
      if (prev.isPaused || prev.winner) return prev;
      
      const scale = prev.draggingCardId ? 0.05 : prev.timeScale;
      const dt = (deltaMs / 1000) * scale;
      if (dt <= 0) return prev;

      let newState = { ...prev };
      newState.timeRemaining = Math.max(0, newState.timeRemaining - dt);
      newState.energy = Math.min(newState.maxEnergy, newState.energy + (gameConfig.global.ENERGY_REGEN_PER_SEC * dt));
      
      if (newState.timeRemaining <= 0) {
         newState.winner = Side.ENEMY;
         return newState;
      }

      const now = Date.now();
      const timeStr = formatTime(newState.timeRemaining);
      const frameLogs: CombatLogEntry[] = [];
      const addLog = (type: CombatLogEntry['type'], side: Side, message: string) => {
          frameLogs.push({ id: uuid(), time: timeStr, type, side, message });
      };

      let activeUnits: Unit[] = prev.units.map(u => ({
          ...u, 
          stats: { ...u.stats }, 
          fx: { 
              ...u.fx,
              floatingText: [...(u.fx?.floatingText || [])]
          }
      }));

      activeUnits.forEach(unit => {
          if (!unit.isDead) {
              unit.fx!.isAttacking = false;
              unit.fx!.isHit = false;
              unit.fx!.isHealing = false;
              unit.fx!.isSkill = false;
              unit.fx!.floatingText = unit.fx!.floatingText!.filter(ft => now - ft.createdAt < 1200);
          }
      });

      activeUnits.forEach(unit => {
        if (unit.isDead) return;

        const maxRage = gameConfig.global.MAX_RAGE;
        const canCastSkill = unit.stats.rage >= maxRage;
        const isAutoCast = unit.type !== UnitType.CAPTAIN || unit.side === Side.ENEMY;
        
        if (canCastSkill && isAutoCast) {
             unit.stats.rage = 0;
             unit.fx!.isSkill = true;
             unit.fx!.floatingText!.push({ id: uuid(), text: "MAX!!", type: 'TEXT', createdAt: now });
             
             performSkill(unit, activeUnits, now, newState, addLog);
        } 
        else {
             unit.nextAttackTime -= dt;
             
             if (unit.nextAttackTime <= 0) {
                 if (unit.type === UnitType.HEALER) {
                     const allies = activeUnits.filter(a => a.side === unit.side && !a.isDead);
                     const lowestAlly = allies.sort((a,b) => (a.stats.hp/a.stats.maxHp) - (b.stats.hp/b.stats.maxHp))[0];
                     if (lowestAlly) {
                         unit.nextAttackTime = gameConfig.global.ATTACK_COOLDOWN_MS / 1000;
                         unit.fx!.isHealing = true;
                         const healAmount = Math.floor(unit.stats.atk * 1.5);
                         applyHeal(unit, lowestAlly, healAmount, now, addLog);
                         unit.stats.rage = Math.min(maxRage, unit.stats.rage + 150); 
                     }
                 } else {
                     const target = getTarget(unit, activeUnits);
                     if (target) {
                        const mutableTarget = activeUnits.find(u => u.id === target.id);
                        if (mutableTarget) {
                            unit.nextAttackTime = gameConfig.global.ATTACK_COOLDOWN_MS / 1000;
                            unit.fx!.isAttacking = true;
                            applyDamage(unit, mutableTarget, 1.0, now, newState, addLog);
                            unit.stats.rage = Math.min(maxRage, unit.stats.rage + 250);
                        }
                     }
                 }
             }
        }
        
        if (unit.type === UnitType.CAPTAIN) {
            const capConfig = gameConfig.captains[unit.side === Side.PLAYER ? 0 : 1];
            unit.stats.rage = Math.min(maxRage, unit.stats.rage + (capConfig.rageRegen * dt)); 
        }
      });

      newState.units = activeUnits.filter(u => !u.removeAt || now < u.removeAt);
      
      if (frameLogs.length > 0) {
          newState.combatLog = [...prev.combatLog, ...frameLogs];
          if (newState.combatLog.length > 200) {
              newState.combatLog = newState.combatLog.slice(newState.combatLog.length - 200);
          }
      }

      const newHand = [...newState.hand];
      let handChanged = false;
      for (let i = 0; i < 4; i++) {
        if (newHand[i] === null && newState.deck.length > 0) {
           const nextCardId = newState.deck.shift();
           if (nextCardId) {
             newHand[i] = { instanceId: uuid(), templateId: nextCardId, isCoolingDown: false };
             handChanged = true;
           }
        }
      }
      if (handChanged) newState.hand = newHand;
      if (newState.deck.length < 5) newState.deck = [...newState.deck, ...INITIAL_DECK];

      return newState;
    });

    animationFrameRef.current = requestAnimationFrame(gameTick);
  }, [gameConfig, cardTemplates, skillsConfig]);

  // --- Generic Skill Logic ---

  const performSkill = (
      caster: Unit, 
      allUnits: Unit[], 
      now: number, 
      stateRef: {winner: Side | null},
      addLog: (type: CombatLogEntry['type'], side: Side, msg: string) => void
  ) => {
      const skillId = caster.skillId;
      if (!skillId) return;

      const skill = skillsConfig[skillId];
      if (!skill) return; // No skill def found

      addLog('SKILL', caster.side, `${caster.name} 使用了【${skill.name}】！`);

      const enemies = allUnits.filter(u => u.side !== caster.side && !u.isDead);
      const allies = allUnits.filter(u => u.side === caster.side && !u.isDead);

      // 1. Identify Targets
      let targets: Unit[] = [];
      
      switch(skill.targetType) {
          case TargetType.SELF:
              targets = [caster];
              break;
          case TargetType.SINGLE_ENEMY:
              const t = getTarget(caster, allUnits);
              if (t) {
                  const mt = allUnits.find(u => u.id === t.id);
                  if (mt) targets = [mt];
              }
              break;
          case TargetType.ALL_ENEMIES:
              targets = enemies;
              break;
          case TargetType.ALL_ALLIES:
              targets = allies;
              break;
          case TargetType.LOWEST_HP_ALLY:
              targets = allies.sort((a,b) => (a.stats.hp/a.stats.maxHp) - (b.stats.hp/b.stats.maxHp)).slice(0, 1);
              break;
          case TargetType.LOWEST_HP_ENEMY:
              targets = enemies.sort((a,b) => a.stats.hp - b.stats.hp).slice(0, 1);
              break;
          case TargetType.RANDOM_3_ENEMIES:
              const shuffled = [...enemies].sort(() => 0.5 - Math.random());
              targets = shuffled.slice(0, 3);
              break;
          case TargetType.FRONT_3_STRIKES:
               // Berserker style: multiple hits on same target usually
               const ft = getTarget(caster, allUnits);
               if (ft) {
                  const mft = allUnits.find(u => u.id === ft.id);
                  if (mft) {
                      // Hacky way to do multi-strike in generic system: push same unit multiple times
                      targets = [mft, mft, mft];
                  }
               }
               break;
          default:
              targets = [];
      }

      // 2. Apply Effects
      targets.forEach(target => {
          if (!target) return; // Safety

          switch(skill.effectType) {
              case SkillEffectType.DAMAGE:
                  applyDamage(caster, target, skill.multiplier, now, stateRef, addLog);
                  break;
              case SkillEffectType.HEAL:
                  applyHeal(caster, target, caster.stats.atk * skill.multiplier, now, addLog);
                  break;
              case SkillEffectType.SHIELD:
                  target.stats.shield += caster.stats.atk * skill.multiplier;
                  target.fx!.floatingText!.push({id: uuid(), text: "护盾", type: 'BLOCK', createdAt: now});
                  break;
              case SkillEffectType.TAUNT_AND_SHIELD:
                  if (target.id === caster.id) {
                      target.tauntUntil = now + (gameConfig.effects['TAUNT_DURATION_MS'] || 4000);
                      target.stats.shield += target.stats.maxHp * skill.multiplier;
                      target.fx!.floatingText!.push({id: uuid(), text: "嘲讽", type: 'TEXT', createdAt: now});
                  }
                  break;
          }
      });
  };

  const applyDamage = (
      attacker: Unit, 
      defender: Unit, 
      multiplier: number, 
      now: number, 
      stateRef: {winner: Side | null},
      addLog: (type: CombatLogEntry['type'], side: Side, msg: string) => void
  ) => {
      if (defender.isDead) return;

      const { damage, isCrit, isBlock } = calculateDamage(attacker, defender, gameConfig.effects, multiplier);
      
      let finalDamage = damage;
      let hitShield = false;

      if (defender.stats.shield > 0) {
          const absorbed = Math.min(defender.stats.shield, finalDamage);
          defender.stats.shield -= absorbed;
          finalDamage -= absorbed;
          hitShield = true;
      }

      defender.stats.hp -= finalDamage;
      defender.stats.rage = Math.min(gameConfig.global.MAX_RAGE, defender.stats.rage + 60); 
      
      defender.fx!.isHit = true;
      defender.fx!.floatingText!.push({
          id: uuid(),
          text: isBlock ? "格挡" : (hitShield && finalDamage === 0 ? "吸收" : `${finalDamage}`),
          type: isBlock ? 'BLOCK' : (isCrit ? 'CRIT' : 'DAMAGE'),
          createdAt: now
      });

      if (isCrit) addLog('DAMAGE', attacker.side, `${attacker.name} 暴击 ${defender.name} -${finalDamage}!`);

      if (defender.stats.hp <= 0 && !defender.isDead) {
          defender.isDead = true;
          defender.stats.hp = 0; 
          defender.removeAt = now + 1000;
          attacker.stats.rage = Math.min(gameConfig.global.MAX_RAGE, attacker.stats.rage + 300);
          
          addLog('DEATH', defender.side, `${defender.name} 倒下了`);

          if (defender.type === UnitType.CAPTAIN) {
              stateRef.winner = attacker.side === Side.PLAYER ? Side.PLAYER : Side.ENEMY;
          }
      }
  };

  const applyHeal = (
      healer: Unit,
      target: Unit, 
      amount: number, 
      now: number,
      addLog: (type: CombatLogEntry['type'], side: Side, msg: string) => void
  ) => {
      if (target.isDead) return;
      target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + amount);
      target.fx!.isHealing = true;
      target.fx!.floatingText!.push({
          id: uuid(),
          text: `${Math.floor(amount)}`,
          type: 'HEAL',
          createdAt: now
      });
  };

  useEffect(() => {
    if (!hasStarted) return;
    
    // Config Driven Setup
    const createUnit = (name: string, hp: number, atk: number, def: number, skillId: number, side: Side, gridId: GridId, type: UnitType): Unit => ({
        id: uuid(),
        templateId: type === UnitType.CAPTAIN ? 'captain' : 'unit',
        name,
        type,
        side,
        gridId,
        skillId,
        stats: { hp, maxHp: hp, atk, def, rage: 0, maxRage: gameConfig.global.MAX_RAGE, shield: 0 },
        nextAttackTime: 2,
        isDead: false,
        fx: { floatingText: [] }
    });

    const pCapConf = gameConfig.captains[0];
    const eCapConf = gameConfig.captains[1];

    const playerCap = createUnit(pCapConf.name, pCapConf.hp, pCapConf.atk, pCapConf.def, pCapConf.skillId, Side.PLAYER, 8, UnitType.CAPTAIN);
    const enemyCap = createUnit(eCapConf.name, eCapConf.hp, eCapConf.atk, eCapConf.def, eCapConf.skillId, Side.ENEMY, 8, UnitType.CAPTAIN);
    
    // Hardcoded initial enemies for demo, reading from templates if available
    const tTank = cardTemplates['101'] || Object.values(cardTemplates)[0];
    const tArcher = cardTemplates['105'] || Object.values(cardTemplates)[1];
    
    // Helper to spawn from template
    const spawnFromTemplate = (tid: string, grid: GridId) => {
        const t = cardTemplates[tid];
        if(!t) return createUnit('Enemy', 1000, 100, 10, 0, Side.ENEMY, grid, UnitType.TANK); // Fallback
        return createUnit(t.name, t.hp, t.atk, t.def, t.skillId, Side.ENEMY, grid, t.type);
    };

    const enemyTank = spawnFromTemplate('101', 2);
    const enemyArcher = spawnFromTemplate('105', 4);

    setGameState(prev => ({
      ...getInitialState(),
      units: [playerCap, enemyCap, enemyTank, enemyArcher],
      hand: INITIAL_DECK.slice(0, 4).map(tid => ({ instanceId: uuid(), templateId: tid, isCoolingDown: false })),
      deck: INITIAL_DECK.slice(4),
      combatLog: [{ id: uuid(), time: '3:00', type: 'SYSTEM', side: Side.PLAYER, message: '战斗开始' }]
    }));
    
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameTick);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [hasStarted, gameTick, gameConfig, cardTemplates, skillsConfig]);

  const handleDragStart = (cardId: string, templateId: string) => {
    if (gameState.winner || gameState.isPaused) return;
    dragRef.current = { cardId, templateId };
    setGameState(prev => ({ ...prev, draggingCardId: cardId }));
  };

  const handleDrop = (gridId: GridId) => {
    const { cardId, templateId } = dragRef.current;
    if (!cardId || !templateId) return;
    
    const template = cardTemplates[templateId];
    if (!template) return;

    if (gameState.energy < template.cost) { cancelDrag(); return; }

    let initialShield = 0; // Could move to config
    if (template.type === UnitType.TANK) initialShield = template.hp * (gameConfig.effects['SHIELD_ABSORB_RATIO'] || 0.3);

    const newUnit: Unit = {
      id: uuid(),
      templateId,
      name: template.name,
      type: template.type,
      side: Side.PLAYER,
      gridId,
      skillId: template.skillId,
      stats: { ...template, maxHp: template.hp, rage: gameConfig.global.MAX_RAGE, maxRage: gameConfig.global.MAX_RAGE, shield: initialShield },
      nextAttackTime: 0.1, 
      isDead: false,
      fx: { floatingText: [] }
    };

    setGameState(prev => {
      const newHand = prev.hand.map(c => c?.instanceId === cardId ? null : c);
      const logEntry: CombatLogEntry = {
          id: uuid(),
          time: formatTime(prev.timeRemaining),
          type: 'SYSTEM',
          side: Side.PLAYER,
          message: `玩家召唤了 ${template.name}`
      };
      
      return {
        ...prev,
        units: [...prev.units, newUnit],
        energy: prev.energy - template.cost,
        hand: newHand,
        draggingCardId: null,
        combatLog: [...prev.combatLog, logEntry]
      };
    });
    dragRef.current = { cardId: null, templateId: null };
  };

  const cancelDrag = () => {
    setGameState(prev => ({ ...prev, draggingCardId: null }));
    dragRef.current = { cardId: null, templateId: null };
  };

  const handleGlobalMouseUp = () => { if (dragRef.current.cardId) cancelDrag(); };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ((e as React.TouchEvent).touches) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    setCursorPos({ x: clientX, y: clientY });
  };
  
  const handleCaptainSkill = () => {
      setGameState(prev => {
          const newState = { ...prev };
          const activeUnits = prev.units.map(u => ({...u, stats: {...u.stats}, fx: {...u.fx, floatingText: [...(u.fx?.floatingText||[])]} }));
          
          const playerCap = activeUnits.find(u => u.type === UnitType.CAPTAIN && u.side === Side.PLAYER);
          const maxRage = gameConfig.global.MAX_RAGE;
          
          if (playerCap && playerCap.stats.rage >= maxRage) {
              playerCap.stats.rage = 0;
              playerCap.fx!.isSkill = true;
              
              const timeStr = formatTime(prev.timeRemaining);
              const logs: CombatLogEntry[] = [];
              const addLog = (type: CombatLogEntry['type'], side: Side, msg: string) => logs.push({id: uuid(), time: timeStr, type, side, message: msg});
              
              addLog('SKILL', Side.PLAYER, `${playerCap.name} 释放终极技能！`);
              performSkill(playerCap, activeUnits, Date.now(), newState, addLog);
              
              newState.combatLog = [...prev.combatLog, ...logs];
          }
          
          newState.units = activeUnits;
          return newState;
      });
  };

  if (!hasStarted) {
    return (
      <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center gap-12 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover opacity-10 animate-pulse z-0"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 text-transparent bg-clip-text drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] tracking-tighter">
            卡牌对决
          </h1>
          <div className="h-1 w-32 bg-white/20 rounded-full"></div>
          <p className="text-gray-400 text-xl tracking-widest uppercase">Real-time Strategy Demo</p>
        </div>
        <button 
          onClick={() => setHasStarted(true)}
          className="relative z-10 px-16 py-5 bg-white text-black font-black text-3xl rounded-lg shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:bg-yellow-400 hover:shadow-[0_0_60px_rgba(253,224,71,0.6)] active:scale-95 group"
        >
          <span className="relative z-10">开始战斗</span>
          <div className="absolute inset-0 bg-white blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </button>
        <div className="relative z-10 max-w-2xl text-center space-y-2 p-6 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
          <p className="text-gray-300">拖拽卡牌至左侧方格 · 击败敌方队长(骷髅) · 积攒怒气释放必杀</p>
          <div className="flex justify-center gap-8 text-sm text-gray-500 pt-4">
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> 能量管理</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> 属性克制</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> 必杀技</div>
          </div>
          
           {/* Config Panel inside start screen */}
          <div className="pt-6 flex justify-center border-t border-white/10 mt-4">
             <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-400">Excel配置:</span>
                 <HUD 
                    gameState={gameState} 
                    onPause={() => {}} 
                    onToggleSpeed={() => {}} 
                    onCaptainSkill={() => {}} 
                    onUpdateConfig={handleConfigUpdate}
                    currentConfig={gameConfig}
                    currentTemplates={cardTemplates}
                    currentSkills={skillsConfig}
                 /> 
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-screen bg-[#0a0a0a] overflow-hidden flex flex-col relative font-sans text-shadow-sm"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleGlobalMouseUp}
      onTouchEnd={handleGlobalMouseUp}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black opacity-60 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614726365723-49cfae9d0e2d?q=80&w=2574&auto=format&fit=crop')] bg-cover opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className={`absolute inset-0 bg-black/60 z-20 pointer-events-none transition-opacity duration-300 backdrop-blur-[2px] ${gameState.draggingCardId ? 'opacity-100' : 'opacity-0'}`}></div>

      <HUD 
        gameState={gameState} 
        onPause={() => setGameState(p => ({...p, isPaused: !p.isPaused}))}
        onToggleSpeed={() => setGameState(p => ({...p, timeScale: p.timeScale === 1 ? 2 : 1}))}
        onCaptainSkill={handleCaptainSkill}
        onUpdateConfig={handleConfigUpdate}
        currentConfig={gameConfig}
        currentTemplates={cardTemplates}
        currentSkills={skillsConfig}
      />

      <CombatLog 
        logs={gameState.combatLog} 
        isOpen={gameState.isPaused} 
        onClose={() => setGameState(p => ({...p, isPaused: false}))} 
      />

      {gameState.winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fadeIn">
          <div className="text-center transform scale-150">
             <h2 className={`text-8xl font-black mb-6 tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,1)] ${gameState.winner === Side.PLAYER ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' : 'text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900'}`}>
               {gameState.winner === Side.PLAYER ? '胜利' : '失败'}
             </h2>
             <button onClick={() => window.location.reload()} className="px-10 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
               再来一局
             </button>
          </div>
        </div>
      )}

      <Battlefield 
          gameState={gameState} 
          onDropCard={handleDrop} 
          templates={cardTemplates}
      />

      <div className="relative z-30 mt-auto w-full pb-4">
         <EnergyBar current={gameState.energy} max={gameState.maxEnergy} />
         <Hand 
             hand={gameState.hand} 
             currentEnergy={gameState.energy} 
             onDragStart={handleDragStart} 
             templates={cardTemplates}
         />
      </div>
      
      {gameState.draggingCardId && dragRef.current.templateId && cardTemplates[dragRef.current.templateId] && (
        <div className="fixed z-50 pointer-events-none p-6 bg-gray-900/95 border border-white/20 text-white rounded-xl shadow-2xl w-80 backdrop-blur-xl animate-slideIn" style={{ top: '15%', left: '5%' }}>
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="text-2xl font-black text-yellow-400">{cardTemplates[dragRef.current.templateId].name}</h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{cardTemplates[dragRef.current.templateId].type}</span>
          </div>
          <div className="space-y-3 text-sm text-gray-300">
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded flex justify-between">
                  <span className="text-gray-500">HP</span> <span className="font-mono font-bold text-green-400">{cardTemplates[dragRef.current.templateId].hp}</span>
                </div>
                <div className="bg-white/5 p-2 rounded flex justify-between">
                  <span className="text-gray-500">ATK</span> <span className="font-mono font-bold text-red-400">{cardTemplates[dragRef.current.templateId].atk}</span>
                </div>
             </div>
             <div className="mt-4 pt-3 border-t border-gray-700 bg-gradient-to-r from-blue-900/20 to-transparent p-2 rounded">
               <p className="text-blue-300 font-bold mb-1">技能</p>
               <p className="text-xs text-blue-100">{skillsConfig[cardTemplates[dragRef.current.templateId].skillId]?.description || '无技能'}</p>
             </div>
          </div>
        </div>
      )}

      {gameState.draggingCardId && (
        <div className="fixed z-50 pointer-events-none opacity-90 shadow-[0_0_30px_rgba(255,255,255,0.3)]" style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%) scale(0.9)' }}>
           {dragRef.current.templateId && cardTemplates[dragRef.current.templateId] && (
               <div className={`w-24 h-32 rounded-xl border-2 border-white ${cardTemplates[dragRef.current.templateId]?.color} flex items-center justify-center`}>
                  <div className="font-bold text-white text-xs text-center px-2">{cardTemplates[dragRef.current.templateId].name}</div>
               </div>
           )}
        </div>
      )}
    </div>
  );
}