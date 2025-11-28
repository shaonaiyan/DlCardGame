import React from 'react';
import { GameState, Side, UnitType, GameConfig, CardTemplate, SkillTemplate } from '../types';
import { Pause, Play, Crown, Skull } from 'lucide-react';
import { ConfigPanel } from './ConfigPanel';

interface HUDProps {
  gameState: GameState;
  onPause: () => void;
  onToggleSpeed: () => void;
  onCaptainSkill: () => void;
  onUpdateConfig: (newConfig: GameConfig, newTemplates: Record<string, CardTemplate>, newSkills: Record<number, SkillTemplate>) => void;
  currentConfig: GameConfig;
  currentTemplates: Record<string, CardTemplate>;
  currentSkills: Record<number, SkillTemplate>;
}

const CaptainInfo = ({ unit, isRight, onSkill }: { unit?: any, isRight?: boolean, onSkill?: () => void }) => {
  if (!unit) return <div className="w-32 md:w-48 h-12"></div>;

  const hpPct = (unit.stats.hp / unit.stats.maxHp) * 100;
  const ragePct = (unit.stats.rage / unit.stats.maxRage) * 100;
  const isSkillReady = unit.stats.rage >= 1000 && !isRight;

  return (
    <div className={`flex items-center gap-3 ${isRight ? 'flex-row-reverse text-right' : ''} transition-all duration-300`}>
      {/* Avatar */}
      <div className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full border-4 ${isRight ? 'border-red-600 bg-red-950' : 'border-yellow-500 bg-yellow-900'} flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden z-10`}>
         {isRight ? <Skull className="text-white w-8 h-8 md:w-10 md:h-10" /> : <Crown className="text-white w-8 h-8 md:w-10 md:h-10" />}
         
         {/* Skill Button Overlay for Player */}
         {isSkillReady && (
           <button 
             onClick={onSkill}
             className="absolute inset-0 bg-yellow-500/90 animate-pulse cursor-pointer flex flex-col items-center justify-center border-4 border-white/50"
           >
             <span className="font-black text-white text-xs md:text-sm drop-shadow-md">必杀</span>
           </button>
         )}
      </div>

      {/* Bars */}
      <div className="w-36 md:w-56 flex flex-col gap-1.5 p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg">
        {/* Name */}
        <div className={`text-xs font-bold text-white/90 ${isRight ? 'mr-1' : 'ml-1'}`}>
           {unit.name}
        </div>
        {/* HP Bar */}
        <div className="h-3 md:h-4 bg-gray-900 rounded-full border border-gray-700 overflow-hidden relative shadow-inner">
           <div className={`h-full transition-all duration-300 ${isRight ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gradient-to-r from-green-700 to-green-500'}`} style={{ width: `${hpPct}%` }}></div>
           <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 font-mono shadow-black drop-shadow-md">
             {Math.ceil(unit.stats.hp)}
           </div>
        </div>
        {/* Rage Bar */}
        <div className="h-1.5 md:h-2 bg-gray-900 rounded-full border border-gray-700 overflow-hidden relative">
           <div className={`h-full transition-all duration-300 ${ragePct >= 100 ? 'bg-yellow-300 animate-pulse shadow-[0_0_10px_yellow]' : 'bg-yellow-600'}`} style={{ width: `${ragePct}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export const HUD: React.FC<HUDProps> = ({ 
    gameState, onPause, onToggleSpeed, onCaptainSkill, 
    onUpdateConfig, currentConfig, currentTemplates, currentSkills 
}) => {
  const playerCaptain = gameState.units.find(u => u.type === UnitType.CAPTAIN && u.side === Side.PLAYER);
  const enemyCaptain = gameState.units.find(u => u.type === UnitType.CAPTAIN && u.side === Side.ENEMY);

  return (
    <div className="w-full p-2 md:p-4 flex justify-between items-start pointer-events-auto relative z-10">
      <CaptainInfo unit={playerCaptain} onSkill={onCaptainSkill} />
      
      {/* Center Timer */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 md:top-6 flex flex-col items-center z-0">
        <div className={`text-3xl md:text-5xl font-black ${gameState.timeRemaining <= 30 ? 'text-red-500 animate-pulse' : 'text-white'} drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-mono tracking-wider`}>
          {Math.ceil(gameState.timeRemaining)}
        </div>
        <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1">Time Remaining</div>
      </div>

      <div className="flex flex-col items-end gap-2">
         <CaptainInfo unit={enemyCaptain} isRight />
         
         {/* Controls */}
         <div className="flex gap-2 mt-2">
            <ConfigPanel 
                onUpdateConfig={onUpdateConfig} 
                currentConfig={currentConfig} 
                currentTemplates={currentTemplates}
                currentSkills={currentSkills}
            />
            <button onClick={onToggleSpeed} className="w-10 h-10 flex items-center justify-center bg-gray-800/80 text-white rounded-full hover:bg-gray-700 border border-gray-600 shadow-lg backdrop-blur">
               {gameState.timeScale > 1.5 ? <span className="font-bold text-yellow-400 text-xs">2x</span> : <span className="font-bold text-xs">1x</span>}
            </button>
            <button onClick={onPause} className="w-10 h-10 flex items-center justify-center bg-gray-800/80 text-white rounded-full hover:bg-gray-700 border border-gray-600 shadow-lg backdrop-blur">
               {gameState.isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            </button>
         </div>
      </div>
    </div>
  );
};

export default HUD;
