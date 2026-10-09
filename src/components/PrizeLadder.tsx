import React from 'react';
import { PRIZE_LADDER } from '../data/defaultQuestions';

interface PrizeLadderProps {
  currentLevel: number;
}

export const PrizeLadder: React.FC<PrizeLadderProps> = ({ currentLevel }) => {
  return (
    <div className="w-full bg-[#050b1d]/90 backdrop-blur-md rounded-xl p-3 border border-cyan-500/30 shadow-[0_0_20px_rgba(3,105,161,0.25)] flex flex-col justify-between select-none">
      <div className="text-center pb-2 border-b border-cyan-500/20 mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 font-['Orbitron',sans-serif]">
          Escala de Premios
        </h3>
      </div>

      <div className="flex flex-col justify-between flex-1 h-full w-full">
        {PRIZE_LADDER.map((item) => {
          const isCurrent = item.level === currentLevel;
          const isPassed = item.level < currentLevel;
          const isSafe = item.isSafeHaven;

          // Safe Haven badge text
          let safeBadge = '';
          if (item.level === 5) safeBadge = 'Seguro 1';
          if (item.level === 10) safeBadge = 'Seguro 2';
          if (item.level === 15) safeBadge = 'Gran Premio';

          return (
            <div
              key={item.level}
              className={`relative flex items-center justify-between px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-bold transition-all duration-300 ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-600/90 via-blue-600 to-cyan-600/90 text-white shadow-[0_0_15px_rgba(6,182,212,0.7)] border border-cyan-300 scale-[1.02] z-10'
                  : isPassed
                  ? 'text-amber-400 bg-amber-950/20'
                  : isSafe
                  ? 'text-white bg-slate-800/40 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Level Number & Diamond */}
              <div className="flex items-center gap-2">
                <span className={`w-5 text-right font-['Orbitron',sans-serif] ${isCurrent ? 'text-white font-black' : isSafe ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {item.level}
                </span>
                <span className={`text-[10px] ${isCurrent ? 'text-yellow-300 animate-spin' : isPassed ? 'text-amber-400' : isSafe ? 'text-cyan-300' : 'text-slate-600'}`}>
                  ◆
                </span>
                {safeBadge && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                    isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {safeBadge}
                  </span>
                )}
              </div>

              {/* Prize Amount */}
              <div className="font-['Orbitron',sans-serif] tracking-wider text-right">
                <span className={isSafe ? 'text-amber-300 font-extrabold' : ''}>
                  {item.amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
