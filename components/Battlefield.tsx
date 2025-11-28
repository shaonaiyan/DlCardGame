import React from 'react';
import { Unit, Side, GameState, GridId, CardTemplate } from '../types';
import { getGridCoords } from '../utils';
import UnitComponent from './Unit';

interface BattlefieldProps {
  gameState: GameState;
  onDropCard: (gridId: GridId) => void;
  templates: Record<string, CardTemplate>;
}

interface GridCellProps {
  side: Side;
  id: GridId;
  unit?: Unit;
  isDragging: boolean;
  isValidDrop: boolean;
  onDrop: (id: GridId) => void;
  templates: Record<string, CardTemplate>;
}

const GridCell: React.FC<GridCellProps> = ({ 
  side, 
  id, 
  unit, 
  isDragging, 
  isValidDrop, 
  onDrop,
  templates
}) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleMouseEnter = () => {
    if (isDragging) setIsOver(true);
  };
  
  const handleMouseLeave = () => {
    setIsOver(false);
  };

  const handleMouseUp = () => {
    if (isDragging && isValidDrop) {
      onDrop(id);
    }
    setIsOver(false);
  };

  let bgClass = "bg-gray-800/30 border border-gray-700/50";
  let contentClass = "";

  if (isDragging) {
    if (side === Side.PLAYER) {
      if (unit && !unit.isDead) { // If there is a live unit, it's blocked
        bgClass = "bg-red-900/20 border-red-500/50"; 
        contentClass = "opacity-50";
      } else {
         // Valid slot logic
         if (isOver) {
             bgClass = "bg-yellow-100/20 border-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.3)] scale-105";
         } else {
             bgClass = "bg-green-900/20 border-green-500/30 animate-pulse";
         }
      }
    }
  }

  return (
    <div
      className={`relative w-20 h-20 md:w-28 md:h-28 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${bgClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      {/* Grid number watermark */}
      {!unit && <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white/5 select-none">{id}</div>}
      
      {/* Unit Content */}
      <div className={`w-full h-full p-1 ${contentClass}`}>
        {unit && <UnitComponent unit={unit} templates={templates} />}
      </div>
    </div>
  );
};

export const Battlefield: React.FC<BattlefieldProps> = ({ gameState, onDropCard, templates }) => {
  // Helper to render columns
  const renderGrid = (side: Side) => {
    // Player: [7,8,9] [4,5,6] [1,2,3] -> Left to Right on screen
    // Enemy: [1,2,3] [4,5,6] [7,8,9] -> Left to Right on screen (mirrored view)
    const cols = side === Side.PLAYER 
      ? [[7,8,9], [4,5,6], [1,2,3]]
      : [[1,2,3], [4,5,6], [7,8,9]];

    return (
      <div className="flex gap-3 md:gap-4">
        {cols.map((colIds, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-3 md:gap-4 my-auto">
             {colIds.map(id => {
               // Find unit (including dying ones so they can play anim)
               const unit = gameState.units.find(u => u.side === side && u.gridId === id);
               
               // Logic: Can only drop if no unit OR unit is dead (and visually disappearing)
               const isValidDrop = side === Side.PLAYER && !unit;
               
               return (
                 <GridCell 
                   key={id} 
                   side={side} 
                   id={id} 
                   unit={unit} 
                   isDragging={!!gameState.draggingCardId}
                   isValidDrop={isValidDrop}
                   onDrop={onDropCard}
                   templates={templates}
                 />
               );
             })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center gap-6 md:gap-20 w-full px-4 relative z-0 perspective-[1000px]">
      
      {/* Environment Lines */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center opacity-10">
         <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
         <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>

      {/* Player Grid */}
      <div className={`transition-all duration-300 transform ${gameState.draggingCardId ? 'scale-[1.02] translate-x-2' : ''}`}>
        {renderGrid(Side.PLAYER)}
      </div>

      {/* VS Divider */}
      <div className="flex flex-col items-center justify-center z-10">
          <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">VS</div>
      </div>

      {/* Enemy Grid */}
      <div className="opacity-90">
        {renderGrid(Side.ENEMY)}
      </div>
    </div>
  );
};

export default Battlefield;