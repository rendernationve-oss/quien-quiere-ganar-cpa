import React from 'react';

interface QuestionBoxProps {
  levelNumber: number;
  questionText: string;
}

export const QuestionBox: React.FC<QuestionBoxProps> = ({ levelNumber, questionText }) => {
  return (
    <div className="relative w-full max-w-5xl my-3 sm:my-4 flex items-center justify-center select-none">
      {/* 1. SVG: caja_pregunta with refined 1.5px non-scaling stroke */}
      <svg
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1920 178.93"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <style>
            {`
              .cls-1 { fill: url(#Degradado_sin_nombre_44); }
              .cls-2 { stroke: url(#Degradado_sin_nombre_14); }
              .cls-2, .cls-3 {
                fill: none;
                stroke-miterlimit: 10;
                stroke-width: 1.5px !important;
                vector-effect: non-scaling-stroke;
              }
              .cls-3 { stroke: url(#Degradado_sin_nombre_14-2); }
            `}
          </style>
          <linearGradient
            id="Degradado_sin_nombre_44"
            data-name="Degradado sin nombre 44"
            x1="960.02"
            y1="176.96"
            x2="960.02"
            y2="2.18"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#090622" />
            <stop offset=".3" stopColor="#120c3a" />
            <stop offset=".7" stopColor="#130c3c" />
            <stop offset="1" stopColor="#080622" />
          </linearGradient>
          <linearGradient
            id="Degradado_sin_nombre_14"
            data-name="Degradado sin nombre 14"
            x1="66.42"
            y1="-160.41"
            x2="1858.8"
            y2="319.86"
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
          <linearGradient
            id="Degradado_sin_nombre_14-2"
            data-name="Degradado sin nombre 14"
            x1="66.42"
            y1="-72.7"
            x2="1858.8"
            y2="407.57"
            gradientTransform="translate(0 266.64) scale(1 -1)"
            xlinkHref="#Degradado_sin_nombre_14"
          />
        </defs>
        <path
          className="cls-1"
          d="M1773.86,89.46c-1.94-1.06-3.1-2.13-3.91-3.19l-72.12-69.03c-10.82-10.85-19.4-15.06-29.17-15.06H253.34c-9.76,0-18.04,3.1-31.17,15.07l-.38.59-71.74,68.43c-.81,1.06-1.95,2.12-3.87,3.19h.88l-.88.22c1.92,1.07,3.06,2.13,3.87,3.19l71.74,68.43.38.59c13.13,11.97,21.41,15.07,31.17,15.07h1415.32c9.77,0,18.35-4.21,29.17-15.06l72.12-69.03c.81-1.06,1.97-2.13,3.91-3.19l-.47-.22h.47Z"
        />
        <g>
          <path
            className="cls-2"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1.5"
            d="M0,89.47h137.41c6.63,0,12.99-2.57,17.68-7.16L226.72,12.27c6.75-6.6,15.91-10.31,25.46-10.31h1414.06c9.42,0,18.47,3.61,25.2,10.06l73.55,70.46c4.67,4.48,10.95,6.98,17.5,6.98h137.51"
          />
          <path
            className="cls-3"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1.5"
            d="M0,89.47h137.41c6.63,0,12.99,2.57,17.68,7.16l71.64,70.03c6.75,6.6,15.91,10.31,25.46,10.31h1414.06c9.42,0,18.47-3.61,25.2-10.06l73.55-70.46c4.67-4.48,10.95-6.98,17.5-6.98h137.51"
          />
        </g>
      </svg>

      {/* Question Content Layer sitting directly above the SVG */}
      <div className="relative z-[2] w-full min-h-[96px] sm:min-h-[118px] md:min-h-[135px] flex flex-col items-center justify-center text-center px-10 sm:px-16 md:px-24 py-4 sm:py-6">
        {/* Subtle Level Watermark */}
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-300/80 mb-1.5 font-['Orbitron',sans-serif] flex items-center gap-1.5 drop-shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          NIVEL {levelNumber} / 15
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wide leading-snug md:leading-relaxed max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
          {questionText}
        </h2>
      </div>
    </div>
  );
};
