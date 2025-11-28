import React from 'react';
import { GAME_CONFIG } from '../constants';

export const EnergyBar = ({ current }: { current: number }) => {
  const filled = Math.floor(current);
  
  // Color stages
  const getColor = (idx: number) => {
    if (idx < 10) return 'bg-blue-400 shadow-[0_0_8px_#60a5fa]';
    if (idx < 20) return 'bg-orange-400 shadow-[0_0_8px_#fb923c]';
    return 'bg-purple-400 shadow-[0_0_12px_#c084fc] animate-pulse';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 flex items-center gap-4 px-4">
      {/* Bar container */}
      <div className="flex-1 h-4 md:h-5 bg-black/60 backdrop-blur rounded-full border border-white/20 flex p-1 gap-0.5 shadow-lg relative overflow-hidden">
         {/* Gloss effect */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
         
        {Array.from({ length: GAME_CONFIG.MAX_ENERGY }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full rounded-[1px] transition-all duration-200 ${i < filled ? getColor(i) : 'bg-white/5'}`}
          />
        ))}
      </div>
      
      {/* Number Gem */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-md rounded-full opacity-50"></div>
        <div className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-800 to-black border-2 border-blue-400 rounded-lg rotate-45 flex items-center justify-center shadow-2xl z-10">
          <div className="-rotate-45 font-black text-xl md:text-2xl text-white drop-shadow-[0_0_5px_rgba(59,130,246,1)]">
            {filled}
          </div>
        </div>
      </div>
    </div>
  );
};