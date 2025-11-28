import React from 'react';
import { Unit, Side, UnitType, FloatingTextInstance, CardTemplate } from '../types';
import { Shield, Sword, Heart, Zap, Crown, Skull, Crosshair, Axe } from 'lucide-react';

interface UnitComponentProps {
    unit: Unit;
    templates: Record<string, CardTemplate>;
}

const UnitComponent: React.FC<UnitComponentProps> = ({ unit, templates }) => {
  const isEnemy = unit.side === Side.ENEMY;
  
  // Use the passed templates instead of static import
  const template = templates[unit.templateId] || 
    (unit.type === UnitType.CAPTAIN ? (isEnemy ? {icon: 'Skull', color: 'bg-rose-950'} : {icon: 'Crown', color: 'bg-yellow-700'}) : {});
  
  // Icon mapping
  const getIcon = () => {
    const s = 22;
    const style = "drop-shadow-md";
    switch(unit.type) {
      case UnitType.TANK: return <Shield size={s} className={style} />;
      case UnitType.PALADIN: return <Shield size={s} className={`${style} text-yellow-200`} />;
      case UnitType.ASSASSIN: return <Sword size={s} className={style} />;
      case UnitType.BERSERKER: return <Axe size={s} className={style} />;
      case UnitType.ARCHER: return <Crosshair size={s} className={style} />;
      case UnitType.HEALER: return <Heart size={s} className={style} />;
      case UnitType.MAGE: return <Zap size={s} className={style} />;
      case UnitType.CAPTAIN: return isEnemy ? <Skull size={32} className={style} /> : <Crown size={32} className={style} />;
      default: return <Sword size={s} />;
    }
  };

  // Stats calculation
  const hpPct = Math.max(0, Math.min(100, (unit.stats.hp / unit.stats.maxHp) * 100));
  const shieldPct = Math.max(0, Math.min(100, (unit.stats.shield / unit.stats.maxHp) * 100)); 
  const ragePct = Math.max(0, Math.min(100, (unit.stats.rage / unit.stats.maxRage) * 100));

  // Dynamic Styles
  let containerStyle = `relative w-full h-full flex flex-col items-center justify-center p-1 rounded-lg shadow-xl border-2 overflow-visible transition-all duration-200 ${template.color || 'bg-gray-800'}`;
  
  // Border & Glow based on state
  if (unit.stats.rage >= 1000) {
    containerStyle += ' border-yellow-300 shadow-[0_0_20px_yellow] z-10';
  } else if (unit.tauntUntil && unit.tauntUntil > Date.now()) {
    containerStyle += ' border-orange-500 shadow-[0_0_15px_orange] scale-105'; 
  } else {
    containerStyle += isEnemy ? ' border-red-900/50' : ' border-blue-900/50';
  }

  // Animation Classes
  let animClass = "";
  if (unit.fx?.isAttacking) {
    animClass += isEnemy ? " animate-lunge-left" : " animate-lunge-right";
  }
  if (unit.fx?.isHit) {
    animClass += " animate-shake brightness-200 saturate-0"; 
  }
  if (unit.fx?.isHealing) {
    animClass += " shadow-[0_0_30px_#4ade80] brightness-125"; 
  }
  if (unit.fx?.isSkill) {
    animClass += " animate-skill brightness-150 z-20"; 
  }
  if (unit.isDead) {
    animClass += " opacity-0 scale-50 filter grayscale blur-sm duration-700 ease-out";
  }

  return (
    <div className={`${containerStyle} ${animClass}`}>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/40 pointer-events-none rounded-lg"></div>

      {/* Unit Icon */}
      <div className="text-white relative z-10 mb-1 transform transition-transform duration-500 hover:scale-110">
        {getIcon()}
      </div>

      {/* Bars */}
      <div className="w-full space-y-1 px-1 relative z-10">
        {/* HP & Shield */}
        <div className="w-full h-2 bg-gray-900/90 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
          {/* Shield Bar */}
          <div 
            className="absolute top-0 left-0 h-full bg-blue-300/90 z-10 transition-all duration-300" 
            style={{ width: `${shieldPct}%` }} 
          />
          {/* HP Bar */}
          <div 
            className={`h-full transition-all duration-300 relative z-0 ${isEnemy ? 'bg-red-600' : 'bg-emerald-500'}`} 
            style={{ width: `${hpPct}%` }}
          />
        </div>
        
        {/* Rage */}
        <div className="w-full h-1.5 bg-gray-900/90 rounded-full overflow-hidden border border-white/10">
           <div 
            className={`h-full transition-all duration-300 ${unit.stats.rage >= 1000 ? 'bg-yellow-300 animate-pulse shadow-[0_0_5px_yellow]' : 'bg-yellow-600'}`}
            style={{ width: `${ragePct}%` }}
          />
        </div>
      </div>

      {/* Taunt Indicator */}
      {unit.tauntUntil && unit.tauntUntil > Date.now() && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
             <Shield size={16} className="text-orange-400 fill-orange-900 animate-pulse" />
        </div>
      )}

      {/* Floating Text Container - Positioned absolutely above unit */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 overflow-visible z-50">
        {unit.fx?.floatingText && unit.fx.floatingText.map(ft => (
          <FloatingText key={ft.id} data={ft} />
        ))}
      </div>
      
      {/* Ready Indicator */}
      {unit.stats.rage >= 1000 && !unit.isDead && (
        <div className="absolute -top-3 -right-3 text-yellow-300 animate-bounce drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-20">
          <Zap size={20} fill="currentColor" className="stroke-black stroke-2" />
        </div>
      )}
    </div>
  );
};

const FloatingText: React.FC<{ data: FloatingTextInstance }> = ({ data }) => {
  let styleClass = "text-white text-lg font-bold";
  let text = data.text;

  switch(data.type) {
    case 'CRIT':
      styleClass = "text-yellow-300 text-3xl font-black drop-shadow-[0_2px_0_rgba(200,50,0,1)]";
      text = `💥${data.text}`;
      break;
    case 'HEAL':
      styleClass = "text-emerald-400 text-xl font-bold drop-shadow-md";
      text = `+${data.text}`;
      break;
    case 'BLOCK':
      styleClass = "text-gray-400 text-sm font-bold border border-gray-500 bg-gray-900/80 px-1 rounded";
      break;
    case 'TEXT':
      styleClass = "text-blue-200 text-lg font-bold drop-shadow-[0_0_5px_blue]";
      break;
    case 'DAMAGE':
    default:
      styleClass = "text-white text-xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
  }

  return (
    <div 
      className={`absolute animate-floatUp whitespace-nowrap pointer-events-none ${styleClass}`}
      style={{ top: 0, left: 0 }}
    >
      {text}
    </div>
  );
};

export default UnitComponent;