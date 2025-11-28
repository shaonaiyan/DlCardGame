import React from 'react';
import { CardInstance, CardTemplate } from '../types';
import { Shield, Sword, Heart, Zap, Crosshair, Axe } from 'lucide-react';

interface HandProps {
  hand: (CardInstance | null)[];
  currentEnergy: number;
  onDragStart: (cardId: string, templateId: string) => void;
  templates: Record<string, CardTemplate>;
}

const Card = ({ 
  card, 
  canAfford, 
  onDragStart,
  templates
}: { 
  card: CardInstance; 
  canAfford: boolean; 
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void; 
  templates: Record<string, CardTemplate>;
}) => {
  const template = templates[card.templateId];
  if (!template) return null;

  const getIcon = () => {
     switch(template.type) {
       case 'TANK': return <Shield size={28} strokeWidth={1.5} />;
       case 'PALADIN': return <Shield size={28} strokeWidth={1.5} className="text-yellow-200" />;
       case 'ASSASSIN': return <Sword size={28} strokeWidth={1.5} />;
       case 'BERSERKER': return <Axe size={28} strokeWidth={1.5} />;
       case 'ARCHER': return <Crosshair size={28} strokeWidth={1.5} />;
       case 'HEALER': return <Heart size={28} strokeWidth={1.5} />;
       case 'MAGE': return <Zap size={28} strokeWidth={1.5} />;
       default: return <Sword size={28} />;
     }
  };

  return (
    <div
      onMouseDown={canAfford ? onDragStart : undefined}
      onTouchStart={canAfford ? onDragStart : undefined}
      className={`
        group relative w-22 h-32 md:w-28 md:h-36 rounded-xl border flex flex-col items-center justify-between p-2 select-none transition-all duration-200 overflow-hidden
        ${canAfford ? 'cursor-grab active:cursor-grabbing hover:-translate-y-3 hover:scale-105 shadow-xl border-yellow-200/40 hover:border-yellow-300' : 'cursor-not-allowed opacity-60 grayscale border-gray-700'}
        ${template.color || 'bg-gray-800'}
      `}
    >
       {/* Background Noise/Gradient */}
       <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/40 pointer-events-none"></div>

       {/* Cost */}
       <div className={`absolute top-1 left-1 w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-white text-lg shadow-lg z-10 ${canAfford ? 'bg-blue-600' : 'bg-gray-600'}`}>
         {template.cost}
       </div>

       {/* Icon */}
       <div className="flex-1 flex items-center justify-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10 transform group-hover:scale-110 transition-transform duration-300">
         {getIcon()}
       </div>

       {/* Name */}
       <div className="w-full bg-black/40 backdrop-blur-sm rounded py-1 px-1 z-10">
         <div className="text-[10px] md:text-xs text-white font-bold text-center leading-tight tracking-wide">
           {template.name}
         </div>
       </div>
       
       {/* CD Overlay */}
       {card.isCoolingDown && (
         <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 backdrop-blur-[2px]">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
         </div>
       )}
    </div>
  );
};

export const Hand: React.FC<HandProps> = ({ hand, currentEnergy, onDragStart, templates }) => {
  return (
    <div className="flex justify-center gap-3 md:gap-6 py-4 px-6 bg-gradient-to-t from-gray-950 via-gray-900/95 to-transparent backdrop-blur-md rounded-t-3xl border-t border-white/10 mx-auto max-w-4xl shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">
      {hand.map((card, idx) => (
        <div key={idx} className="w-22 h-32 md:w-28 md:h-36 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-700/50 flex items-center justify-center shadow-inner">
          {card ? (
            <Card 
              card={card} 
              canAfford={currentEnergy >= (templates[card.templateId]?.cost || 99)} 
              onDragStart={() => onDragStart(card.instanceId, card.templateId)}
              templates={templates}
            />
          ) : (
            <span className="text-gray-600/50 text-xs font-bold uppercase tracking-widest">空</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Hand;