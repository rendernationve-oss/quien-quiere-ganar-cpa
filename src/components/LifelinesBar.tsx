import React from 'react';
import { Users, Phone, Slash } from 'lucide-react';
import { LifelinesState } from '../types/game';

interface LifelinesBarProps {
  lifelines: LifelinesState;
  onUseFiftyFifty: () => void;
  onUseAudience: () => void;
  onUsePhone: () => void;
  disabled?: boolean;
  isDisplayView?: boolean;
}

export const LifelinesBar: React.FC<LifelinesBarProps> = ({
  lifelines,
  onUseFiftyFifty,
  onUseAudience,
  onUsePhone,
  disabled = false,
  isDisplayView = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 my-2 select-none">
      {/* 1. 50:50 */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={isDisplayView ? undefined : onUseFiftyFifty}
          disabled={disabled || lifelines.fiftyFifty || isDisplayView}
          title={isDisplayView ? undefined : 'Comodín 50:50 (Tecla 1)'}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            isDisplayView ? 'cursor-default' : 'cursor-pointer'
          } ${
            lifelines.fiftyFifty
              ? 'border-slate-700 bg-slate-900/60 opacity-40 cursor-not-allowed'
              : isDisplayView
              ? 'border-cyan-400 bg-gradient-to-b from-[#0e214d] to-[#050b1a] shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'border-cyan-400 bg-gradient-to-b from-[#0e214d] to-[#050b1a] shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 hover:border-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]'
          }`}
        >
          <span className={`font-['Orbitron',sans-serif] font-black text-xs sm:text-sm md:text-base text-cyan-200 tracking-tighter ${
            isDisplayView ? '' : 'group-hover:text-yellow-200'
          }`}>
            50:50
          </span>
          {lifelines.fiftyFifty && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500">
              <Slash className="w-10 h-10 -rotate-45 stroke-[2.5]" />
            </div>
          )}
        </button>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          50:50
        </span>
      </div>

      {/* 2. Audiencia (Público) */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={isDisplayView ? undefined : onUseAudience}
          disabled={disabled || lifelines.audience || isDisplayView}
          title={isDisplayView ? undefined : 'Consulta a la Audiencia (Tecla 2)'}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            isDisplayView ? 'cursor-default' : 'cursor-pointer'
          } ${
            lifelines.audience
              ? 'border-slate-700 bg-slate-900/60 opacity-40 cursor-not-allowed'
              : isDisplayView
              ? 'border-cyan-400 bg-gradient-to-b from-[#0e214d] to-[#050b1a] shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'border-cyan-400 bg-gradient-to-b from-[#0e214d] to-[#050b1a] shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 hover:border-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]'
          }`}
        >
          <Users className={`w-6 h-6 sm:w-7 sm:h-7 text-cyan-200 ${
            isDisplayView ? '' : 'group-hover:text-yellow-200'
          }`} />
          {lifelines.audience && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500">
              <Slash className="w-10 h-10 -rotate-45 stroke-[2.5]" />
            </div>
          )}
        </button>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Audiencia
        </span>
      </div>

      {/* 3. Consejo / Llamada */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={isDisplayView ? undefined : onUsePhone}
          disabled={disabled || lifelines.phone || isDisplayView}
          title={isDisplayView ? undefined : 'Llamada a un Socio / Consejo (Tecla 3)'}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            isDisplayView ? 'cursor-default' : 'cursor-pointer'
          } ${
            lifelines.phone
              ? 'border-slate-700 bg-slate-900/60 opacity-40 cursor-not-allowed'
              : isDisplayView
              ? 'border-cyan-400 bg-gradient-to-b from-[#0e214d] to-[#050b1a] shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'border-cyan-400 bg-gradient-to-b from-[#0e214d] to-[#050b1a] shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 hover:border-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]'
          }`}
        >
          <Phone className={`w-6 h-6 sm:w-7 sm:h-7 text-cyan-200 ${
            isDisplayView ? '' : 'group-hover:text-yellow-200'
          }`} />
          {lifelines.phone && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500">
              <Slash className="w-10 h-10 -rotate-45 stroke-[2.5]" />
            </div>
          )}
        </button>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          Consejo
        </span>
      </div>
    </div>
  );
};
