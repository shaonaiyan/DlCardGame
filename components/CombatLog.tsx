import React, { useEffect, useRef } from 'react';
import { CombatLogEntry, Side } from '../types';
import { X, FileText } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs, isOpen, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update or when opened
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLogStyle = (type: CombatLogEntry['type'], side: Side) => {
    switch (type) {
      case 'DAMAGE':
        return side === Side.PLAYER ? 'text-orange-300' : 'text-red-400';
      case 'HEAL':
        return 'text-green-400';
      case 'SKILL':
        return 'text-yellow-400 font-bold';
      case 'DEATH':
        return 'text-gray-500 line-through';
      case 'SYSTEM':
        return 'text-blue-300 italic';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 md:p-10 pointer-events-auto">
      {/* Overlay Background */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Log Window */}
      <div className="relative w-full max-w-3xl h-[80vh] bg-gray-900 border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <FileText className="text-yellow-500" />
            <h2 className="text-xl font-bold text-white">战斗记录</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Log List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-sm md:text-base scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">暂无战斗记录</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors">
                <span className="text-gray-500 min-w-[50px] select-none">[{log.time}]</span>
                <span className={`${getLogStyle(log.type, log.side)} break-words flex-1`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-black/40 border-t border-white/10 text-center text-xs text-gray-500">
           游戏暂停中 · 点击右上角关闭继续战斗
        </div>
      </div>
    </div>
  );
};
