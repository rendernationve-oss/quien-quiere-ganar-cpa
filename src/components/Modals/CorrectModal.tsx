import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, Sparkles } from 'lucide-react';

interface CorrectModalProps {
  levelNumber: number;
  prizeWon: string;
  onNextQuestion: () => void;
}

export const CorrectModal: React.FC<CorrectModalProps> = ({
  levelNumber,
  prizeWon,
  onNextQuestion,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#38bdf8', '#34d399', '#ffffff'],
      });
    } catch {
      // Fallback if canvas is not ready
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#091b42] via-[#040d21] to-[#081738] border-2 border-amber-400 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.5)] p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 text-amber-400/60 font-['Orbitron',sans-serif] text-xs">◆ ◆</div>
        <div className="absolute top-2 right-2 text-amber-400/60 font-['Orbitron',sans-serif] text-xs">◆ ◆</div>

        {/* Top Trophy Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.8)] flex items-center justify-center animate-bounce">
          <div className="w-full h-full rounded-full bg-[#091b42] flex items-center justify-center text-amber-300">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          </div>
        </div>

        {/* Banner "¡CORRECTO!" */}
        <div className="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xl sm:text-2xl tracking-widest uppercase mb-3 shadow-lg font-['Orbitron',sans-serif]">
          ¡CORRECTO!
        </div>

        <p className="text-slate-300 text-sm sm:text-base font-medium mb-4 flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-400 inline" />
          Has superado el nivel <strong className="text-white font-bold">{levelNumber} de 15</strong>
        </p>

        {/* Prize card */}
        <div className="bg-[#050b1d]/80 border border-amber-400/40 rounded-xl p-4 mb-6 shadow-inner">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mb-1">
            Premio Acumulado
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 font-['Orbitron',sans-serif] tracking-wider drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]">
            {prizeWon}
          </span>
          {levelNumber === 5 && (
            <div className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 py-1 px-3 rounded-full inline-block">
              ✓ ¡SEGURO 1 ALCANZADO! (1.000 Pts garantizados)
            </div>
          )}
          {levelNumber === 10 && (
            <div className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 py-1 px-3 rounded-full inline-block">
              ✓ ¡SEGURO 2 ALCANZADO! (32.000 Pts garantizados)
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onNextQuestion}
          autoFocus
          className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_25px_rgba(251,191,36,0.6)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-['Orbitron',sans-serif]"
        >
          <span>Siguiente Pregunta</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
          <span className="text-xs font-semibold text-slate-800 ml-1 opacity-75">(Enter)</span>
        </button>
      </div>
    </div>
  );
};
