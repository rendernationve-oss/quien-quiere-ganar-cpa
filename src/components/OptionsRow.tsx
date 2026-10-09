import React from 'react';
import { OptionLetter, RevealedState } from '../types/game';

export interface OptionItemData {
  letter: OptionLetter;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isEliminated: boolean;
  onClick: () => void;
}

interface OptionsRowProps {
  rowId: 'row-ab' | 'row-cd';
  leftOption: OptionItemData;
  rightOption: OptionItemData;
  revealedState: RevealedState;
}

export const OptionsRow: React.FC<OptionsRowProps> = ({
  rowId,
  leftOption,
  rightOption,
  revealedState,
}) => {
  // Determine state for left option
  type VisualState = 'idle' | 'selected' | 'correct' | 'wrong';

  let leftState: VisualState = 'idle';
  if (leftOption.isSelected && (revealedState === 'idle' || revealedState === 'selected')) {
    leftState = 'selected';
  } else if (revealedState === 'correct' && leftOption.isCorrect) {
    leftState = 'correct';
  } else if (revealedState === 'incorrect') {
    if (leftOption.isSelected) leftState = 'wrong';
    else if (leftOption.isCorrect) leftState = 'correct';
  }

  // Determine state for right option
  let rightState: VisualState = 'idle';
  if (rightOption.isSelected && (revealedState === 'idle' || revealedState === 'selected')) {
    rightState = 'selected';
  } else if (revealedState === 'correct' && rightOption.isCorrect) {
    rightState = 'correct';
  } else if (revealedState === 'incorrect') {
    if (rightOption.isSelected) rightState = 'wrong';
    else if (rightOption.isCorrect) rightState = 'correct';
  }

  // Get fill ID for left path
  const getLeftFill = () => {
    switch (leftState) {
      case 'selected':
        return `url(#grad_sel_left_${rowId})`;
      case 'correct':
        return `url(#grad_correct_left_${rowId})`;
      case 'wrong':
        return `url(#grad_wrong_left_${rowId})`;
      default:
        return `url(#grad_deep_left_${rowId})`;
    }
  };

  // Get fill ID for right path
  const getRightFill = () => {
    switch (rightState) {
      case 'selected':
        return `url(#grad_sel_right_${rowId})`;
      case 'correct':
        return `url(#grad_correct_right_${rowId})`;
      case 'wrong':
        return `url(#grad_wrong_right_${rowId})`;
      default:
        return `url(#grad_deep_right_${rowId})`;
    }
  };

  // Text & letter styling based on state
  const getLetterColor = (state: VisualState) => {
    if (state === 'idle') return 'text-amber-400 group-hover:text-amber-300';
    return 'text-white';
  };

  const getTextColor = (state: VisualState) => {
    if (state === 'selected') return 'text-white font-extrabold';
    if (state === 'correct') return 'text-white font-black';
    if (state === 'wrong') return 'text-white font-bold';
    return 'text-white font-bold';
  };

  return (
    <div className="relative w-full max-w-5xl my-2 sm:my-3 select-none flex items-center justify-center">
      {/* 2. SVG: caja_respuestas (Fila doble A-B o C-D) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        viewBox="0 0 1932.24 125"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <style>
            {`
              .cls-2 { stroke: url(#grad_chrome_top_${rowId}); }
              .cls-3 { stroke: url(#grad_chrome_bottom_${rowId}); }
              .cls-2, .cls-3 {
                fill: none;
                stroke-miterlimit: 10;
                stroke-width: 1.5px !important;
                vector-effect: non-scaling-stroke;
              }
            `}
          </style>
          {/* Metallic Chrome Silver Gradient Top */}
          <linearGradient
            id={`grad_chrome_top_${rowId}`}
            x1="12.24"
            y1="0"
            x2="1932.24"
            y2="62.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#fff" />
            <stop offset=".15" stopColor="#635e69" />
            <stop offset=".29" stopColor="#cfcdd1" />
            <stop offset=".38" stopColor="#70697b" />
            <stop offset=".42" stopColor="#55515c" />
            <stop offset=".48" stopColor="#726e77" />
            <stop offset=".57" stopColor="#433e4a" />
            <stop offset=".69" stopColor="#aeacb1" />
            <stop offset=".85" stopColor="#5e5964" />
            <stop offset="1" stopColor="#e2e1e4" />
          </linearGradient>

          {/* Metallic Chrome Silver Gradient Bottom */}
          <linearGradient
            id={`grad_chrome_bottom_${rowId}`}
            x1="12.24"
            y1="125"
            x2="1932.24"
            y2="62.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#fff" />
            <stop offset=".15" stopColor="#635e69" />
            <stop offset=".29" stopColor="#cfcdd1" />
            <stop offset=".38" stopColor="#70697b" />
            <stop offset=".42" stopColor="#55515c" />
            <stop offset=".48" stopColor="#726e77" />
            <stop offset=".57" stopColor="#433e4a" />
            <stop offset=".69" stopColor="#aeacb1" />
            <stop offset=".85" stopColor="#5e5964" />
            <stop offset="1" stopColor="#e2e1e4" />
          </linearGradient>

          {/* Neutral Deep Midnight Blue - Left Capsule */}
          <linearGradient
            id={`grad_deep_left_${rowId}`}
            x1="533.94"
            y1="112.98"
            x2="533.94"
            y2="12.02"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#090622" />
            <stop offset=".3" stopColor="#120c3a" />
            <stop offset=".7" stopColor="#130c3c" />
            <stop offset="1" stopColor="#080622" />
          </linearGradient>

          {/* Neutral Deep Midnight Blue - Right Capsule */}
          <linearGradient
            id={`grad_deep_right_${rowId}`}
            x1="1410.53"
            y1="112.98"
            x2="1410.53"
            y2="12.02"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#090622" />
            <stop offset=".3" stopColor="#120c3a" />
            <stop offset=".7" stopColor="#130c3c" />
            <stop offset="1" stopColor="#080622" />
          </linearGradient>

          {/* Selected Orange / Gold - Left Capsule */}
          <linearGradient
            id={`grad_sel_left_${rowId}`}
            x1="533.94"
            y1="12.02"
            x2="533.94"
            y2="112.98"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Selected Orange / Gold - Right Capsule */}
          <linearGradient
            id={`grad_sel_right_${rowId}`}
            x1="1410.53"
            y1="12.02"
            x2="1410.53"
            y2="112.98"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Correct Emerald Green - Left Capsule */}
          <linearGradient
            id={`grad_correct_left_${rowId}`}
            x1="533.94"
            y1="12.02"
            x2="533.94"
            y2="112.98"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="30%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Correct Emerald Green - Right Capsule */}
          <linearGradient
            id={`grad_correct_right_${rowId}`}
            x1="1410.53"
            y1="12.02"
            x2="1410.53"
            y2="112.98"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="30%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Wrong Ruby Red - Left Capsule */}
          <linearGradient
            id={`grad_wrong_left_${rowId}`}
            x1="533.94"
            y1="12.02"
            x2="533.94"
            y2="112.98"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="30%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Wrong Ruby Red - Right Capsule */}
          <linearGradient
            id={`grad_wrong_right_${rowId}`}
            x1="1410.53"
            y1="12.02"
            x2="1410.53"
            y2="112.98"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="30%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Left Capsule Interior Fill */}
        <path
          fill={getLeftFill()}
          opacity={leftOption.isEliminated ? 0.15 : 1}
          className={`transition-colors duration-200 ${
            leftState === 'correct'
              ? 'animate-[pulse_1.2s_infinite_ease-in-out]'
              : ''
          }`}
          d="M132.5,62.5 L172.24,21.81 C178.19,15.68 187.83,12.02 197.93,12.02 H869.30 C879.40,12.02 888.99,15.62 894.94,21.65 L934.81,62.5 L894.94,103.35 C888.99,109.38 879.40,112.98 869.30,112.98 H197.93 C187.83,112.98 178.19,109.32 172.24,103.19 Z"
        />

        {/* Right Capsule Interior Fill (Perfect Alignment - 100% confined inside metallic frame) */}
        <path
          fill={getRightFill()}
          opacity={rightOption.isEliminated ? 0.15 : 1}
          className={`transition-colors duration-200 ${
            rightState === 'correct'
              ? 'animate-[pulse_1.2s_infinite_ease-in-out]'
              : ''
          }`}
          d="M997.43,62.5 L1037.30,21.65 C1043.25,15.62 1052.84,12.02 1063.07,12.02 H1734.44 C1744.54,12.02 1754.18,15.68 1760.13,21.81 L1799.95,62.5 L1760.13,103.19 C1754.18,109.32 1744.54,112.98 1734.44,112.98 H1063.07 C1052.84,112.98 1043.25,109.38 1037.30,103.35 Z"
        />

        {/* Continuous Silver Chrome Outer Border Frame + Center Connector + Side Beams */}
        <g>
          <path
            className="cls-2"
            stroke={`url(#grad_chrome_top_${rowId})`}
            fill="none"
            strokeMiterlimit="10"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            d="M0,62.5 H132.5 L172.24,21.81 C178.19,15.68 187.83,12.02 197.93,12.02 H869.30 C879.40,12.02 888.99,15.62 894.94,21.65 L934.81,62.5 H997.43 L1037.30,21.65 C1043.25,15.62 1052.84,12.02 1063.07,12.02 H1734.44 C1744.54,12.02 1754.18,15.68 1760.13,21.81 L1799.95,62.5 H1932.24"
          />
          <path
            className="cls-3"
            stroke={`url(#grad_chrome_bottom_${rowId})`}
            fill="none"
            strokeMiterlimit="10"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            d="M0,62.5 H132.5 L172.24,103.19 C178.19,109.32 187.83,112.98 197.93,112.98 H869.30 C879.40,112.98 888.99,109.38 894.94,103.35 L934.81,62.5 H997.43 L1037.30,103.35 C1043.25,109.38 1052.84,112.98 1063.07,112.98 H1734.44 C1744.54,112.98 1754.18,109.32 1760.13,103.19 L1799.95,62.5 H1932.24"
          />
        </g>
      </svg>

      {/* Interactive Layer: 2 Buttons placed directly over the capsules */}
      <div className="relative z-10 w-full min-h-[58px] sm:min-h-[66px] md:min-h-[74px] flex items-center">
        {/* Left Side Beam Spacer (Exact ratio 6.39%) */}
        <div className="w-[6.39%] shrink-0 pointer-events-none" />

        {/* Left Option Interactive Button (Exact ratio 40.35%) */}
        <button
          type="button"
          disabled={leftOption.isEliminated}
          onClick={leftOption.onClick}
          style={{ background: 'transparent' }}
          className={`w-[40.35%] shrink-0 h-full py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 md:px-8 flex items-center justify-between text-left focus:outline-none transition-all duration-150 select-none bg-transparent !bg-transparent ${
            leftOption.isEliminated
              ? 'opacity-15 cursor-default pointer-events-none'
              : 'cursor-pointer active:scale-[0.985] group'
          }`}
          aria-label={`Opción ${leftOption.letter}: ${leftOption.text}`}
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-3.5 flex-1 pr-1 truncate">
            {/* Small Diamond Bullet */}
            <span className="text-slate-300 text-xs sm:text-sm drop-shadow font-serif shrink-0 select-none">
              ◆
            </span>

            {/* Letter with Colon */}
            <span
              className={`font-black font-['Orbitron',sans-serif] tracking-wider text-xs sm:text-sm md:text-base shrink-0 select-none transition-colors drop-shadow-sm ${getLetterColor(
                leftState
              )}`}
            >
              {leftOption.letter}:
            </span>

            {/* Option Text */}
            <span
              className={`tracking-wide text-xs sm:text-sm md:text-base leading-tight truncate select-none transition-colors ${getTextColor(
                leftState
              )}`}
            >
              {leftOption.isEliminated ? '---' : leftOption.text}
            </span>
          </div>
        </button>

        {/* Central Connector Beam Spacer (Exact ratio 6.52%) */}
        <div className="w-[6.52%] shrink-0 pointer-events-none" />

        {/* Right Option Interactive Button (Exact ratio 40.35%) */}
        <button
          type="button"
          disabled={rightOption.isEliminated}
          onClick={rightOption.onClick}
          style={{ background: 'transparent' }}
          className={`w-[40.35%] shrink-0 h-full py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 md:px-8 flex items-center justify-between text-left focus:outline-none transition-all duration-150 select-none bg-transparent !bg-transparent ${
            rightOption.isEliminated
              ? 'opacity-15 cursor-default pointer-events-none'
              : 'cursor-pointer active:scale-[0.985] group'
          }`}
          aria-label={`Opción ${rightOption.letter}: ${rightOption.text}`}
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-3.5 flex-1 pr-1 truncate">
            {/* Small Diamond Bullet */}
            <span className="text-slate-300 text-xs sm:text-sm drop-shadow font-serif shrink-0 select-none">
              ◆
            </span>

            {/* Letter with Colon */}
            <span
              className={`font-black font-['Orbitron',sans-serif] tracking-wider text-xs sm:text-sm md:text-base shrink-0 select-none transition-colors drop-shadow-sm ${getLetterColor(
                rightState
              )}`}
            >
              {rightOption.letter}:
            </span>

            {/* Option Text */}
            <span
              className={`tracking-wide text-xs sm:text-sm md:text-base leading-tight truncate select-none transition-colors ${getTextColor(
                rightState
              )}`}
            >
              {rightOption.isEliminated ? '---' : rightOption.text}
            </span>
          </div>
        </button>

        {/* Right Side Beam Spacer (Exact ratio 6.39%) */}
        <div className="w-[6.39%] shrink-0 pointer-events-none" />
      </div>
    </div>
  );
};
