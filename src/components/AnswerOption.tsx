import React from 'react';
import { OptionLetter } from '../types/game';

interface AnswerOptionProps {
  letter: OptionLetter;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  revealedState: 'idle' | 'selected' | 'correct' | 'incorrect';
  isEliminated: boolean;
  onClick: () => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  letter,
  text,
  isSelected,
  isCorrect,
  revealedState,
  isEliminated,
  onClick,
}) => {
  if (isEliminated) {
    return (
      <div className="relative w-full opacity-15 pointer-events-none select-none transition-opacity duration-300">
        <div className="lozenge-outer border-chrome-silver p-[2px]">
          <div className="lozenge-inner bg-[#05041a] px-8 py-3.5 min-h-[58px] sm:min-h-[66px] flex items-center gap-3">
            <span className="text-slate-600 text-xs">◆</span>
            <span className="text-slate-600 font-extrabold font-['Orbitron',sans-serif]">{letter}:</span>
            <span className="text-slate-700 font-medium line-through">---</span>
          </div>
        </div>
      </div>
    );
  }

  // Determine appearance based on exact TV game show specifications:
  // - Neutral: Deep indigo / purple
  // - Selected: Naranja al seleccionar
  // - Correct: Verde al acertar
  // - Incorrect: Rojo al fallar
  let innerClass = 'bg-tv-deep-indigo text-white hover:brightness-125';
  let letterColor = 'text-amber-400';

  // 1. Participant Selected (First click / active choice -> NARANJA / AMARILLO)
  if (isSelected && (revealedState === 'idle' || revealedState === 'selected')) {
    innerClass = 'glow-selected-orange text-white font-bold scale-[1.01]';
    letterColor = 'text-white';
  }

  // 2. Second click confirmed -> VERDE si acierta
  if (revealedState === 'correct' && isCorrect) {
    innerClass = 'glow-correct-green text-white font-black scale-[1.02]';
    letterColor = 'text-white';
  }

  // 3. Second click confirmed -> ROJO si falla
  if (revealedState === 'incorrect') {
    if (isSelected) {
      innerClass = 'glow-wrong-red text-white font-bold';
      letterColor = 'text-white';
    } else if (isCorrect) {
      // Reveal the true correct answer in green
      innerClass = 'glow-correct-green text-white font-black';
      letterColor = 'text-white';
    }
  }

  return (
    <div className="relative w-full group select-none">
      {/* Button with Lozenge shape */}
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left relative focus:outline-none cursor-pointer transition-all duration-200 active:scale-[0.98]"
        aria-label={`Opción ${letter}: ${text}`}
      >
        {/* Outer metallic chrome beveled frame */}
        <div className="lozenge-outer border-chrome-silver p-[2.5px] transition-all duration-200">
          
          {/* Inner option surface */}
          <div
            className={`lozenge-inner ${innerClass} relative px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 min-h-[58px] sm:min-h-[64px] md:min-h-[72px] flex items-center justify-between transition-all duration-200`}
          >
            {/* Top specular reflection */}
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />
            
            {/* Option text content matching '◆ A: Lorem' format from image */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 pr-2">
              {/* Small metallic diamond bullet */}
              <span className="text-slate-300 text-xs sm:text-sm drop-shadow-[0_0_3px_rgba(255,255,255,0.8)] font-serif select-none shrink-0">
                ◆
              </span>

              {/* Amber / Golden Letter with colon */}
              <span
                className={`font-black ${letterColor} font-['Orbitron',sans-serif] tracking-wider text-sm sm:text-base md:text-lg select-none shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}
              >
                {letter}:
              </span>

              {/* Crisp White Option Text */}
              <span className="font-bold text-white tracking-wide text-sm sm:text-base md:text-lg leading-tight drop-shadow-sm select-none">
                {text}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
