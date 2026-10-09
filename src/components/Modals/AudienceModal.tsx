import React, { useMemo } from 'react';
import { Users, X } from 'lucide-react';
import { OptionLetter } from '../../types/game';

interface AudienceModalProps {
  correctOption: OptionLetter;
  onClose: () => void;
}

export const AudienceModal: React.FC<AudienceModalProps> = ({
  correctOption,
  onClose,
}) => {
  // Compute realistic audience poll percentages favoring the correct answer
  const poll = useMemo(() => {
    const letters: OptionLetter[] = ['A', 'B', 'C', 'D'];
    const correctScore = Math.floor(Math.random() * 20) + 55; // 55% - 74%
    let remaining = 100 - correctScore;

    const otherScores: number[] = [];
    const others = letters.filter(l => l !== correctOption);

    // Distribute remaining between 3 others
    const p1 = Math.floor(Math.random() * (remaining - 10)) + 4;
    remaining -= p1;
    const p2 = Math.floor(Math.random() * (remaining - 5)) + 3;
    const p3 = remaining - p2;
    otherScores.push(p1, p2, p3);

    const result: Record<OptionLetter, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };

    result[correctOption] = correctScore;
    let idx = 0;
    others.forEach(l => {
      result[l] = otherScores[idx++];
    });

    return result;
  }, [correctOption]);

  const letters: OptionLetter[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0a183b] via-[#040b1c] to-[#071330] border-2 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.5)] p-6 sm:p-7 text-center">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2 text-cyan-400">
          <Users className="w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black uppercase tracking-wider font-['Orbitron',sans-serif]">
            Consulta al Público
          </h3>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          Votación en vivo de la audiencia presente en el Club Puerto Azul
        </p>

        {/* Bar Chart */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 h-56 px-4 pb-2 border-b border-cyan-500/30">
          {letters.map((letter) => {
            const percentage = poll[letter];
            const isHighest = percentage === Math.max(...Object.values(poll));

            return (
              <div key={letter} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                {/* Percentage label */}
                <span className={`text-xs font-black font-['Orbitron',sans-serif] ${isHighest ? 'text-amber-300 scale-110' : 'text-slate-300'}`}>
                  {percentage}%
                </span>

                {/* Vertical Bar */}
                <div className="w-full max-w-[48px] h-40 bg-slate-800/80 rounded-t-lg p-0.5 flex flex-col justify-end overflow-hidden border border-slate-700">
                  <div
                    style={{ height: `${percentage}%` }}
                    className={`w-full rounded-t transition-all duration-700 ease-out shadow-lg ${
                      isHighest
                        ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                        : 'bg-gradient-to-t from-cyan-600 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                    }`}
                  />
                </div>

                {/* Option Letter */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm font-['Orbitron',sans-serif] border ${
                  isHighest ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                }`}>
                  {letter}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer advice */}
        <div className="mt-5 text-xs text-slate-400 flex items-center justify-between">
          <span>Total participantes: 250 socios</span>
          <span className="text-amber-300 font-semibold">Mayoría: Opción {Object.entries(poll).sort((a,b) => b[1]-a[1])[0][0]}</span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer transition"
        >
          Cerrar y Continuar (Esc)
        </button>
      </div>
    </div>
  );
};
