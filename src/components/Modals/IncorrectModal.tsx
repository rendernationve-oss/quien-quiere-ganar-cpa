import React from 'react';
import { XCircle, RotateCcw, ShieldCheck, CheckCircle2, UserCheck, Trophy } from 'lucide-react';
import { OptionLetter } from '../../types/game';

interface IncorrectModalProps {
  participantName: string;
  nextParticipantName?: string;
  levelNumber: number;
  selectedLetter: OptionLetter | null;
  correctLetter: OptionLetter;
  correctAnswerText: string;
  securedPrize: string;
  onRestartGame: () => void;
  onNextParticipant?: () => void;
  onViewTournament?: () => void;
}

export const IncorrectModal: React.FC<IncorrectModalProps> = ({
  participantName,
  nextParticipantName,
  levelNumber,
  selectedLetter,
  correctLetter,
  correctAnswerText,
  securedPrize,
  onRestartGame,
  onNextParticipant,
  onViewTournament,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2a0c12] via-[#15060a] to-[#250910] border-2 border-red-500 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.5)] p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top X Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-rose-600 to-red-400 p-0.5 shadow-[0_0_25px_rgba(239,68,68,0.8)] flex items-center justify-center animate-pulse">
          <div className="w-full h-full rounded-full bg-[#20080d] flex items-center justify-center text-red-400">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>

        {/* Banner "RESPUESTA INCORRECTA" */}
        <div className="inline-block px-5 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-lg sm:text-xl tracking-widest uppercase mb-2 shadow-lg font-['Orbitron',sans-serif]">
          RESPUESTA INCORRECTA
        </div>

        {/* Participant Name */}
        <div className="text-xs font-bold text-amber-300 mb-2 font-['Orbitron',sans-serif]">
          {participantName}
        </div>

        <p className="text-slate-300 text-xs sm:text-sm mb-3">
          Has fallado en el nivel <strong className="text-white">{levelNumber}</strong>
          {selectedLetter && (
            <span> (elegiste la opción <strong className="text-red-400 font-bold">{selectedLetter}</strong>)</span>
          )}
        </p>

        {/* True correct answer highlight */}
        <div className="bg-[#120509] border border-amber-500/50 rounded-xl p-3 mb-3 text-left shadow-inner">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>La respuesta correcta era:</span>
          </div>
          <div className="flex items-start gap-2.5 mt-1">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-amber-400 text-slate-950 font-black text-xs font-['Orbitron',sans-serif] shrink-0">
              {correctLetter}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white leading-snug">
              {correctAnswerText}
            </span>
          </div>
        </div>

        {/* Secured prize box */}
        <div className="bg-[#14060b] border border-slate-700 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-bold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Premio Seguro Alcanzado</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-yellow-300 font-['Orbitron',sans-serif]">
            {securedPrize}
          </span>
        </div>

        {/* Multi-Participant Actions */}
        <div className="space-y-2">
          {onNextParticipant && (
            <button
              type="button"
              onClick={onNextParticipant}
              autoFocus
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-['Orbitron',sans-serif]"
            >
              <UserCheck className="w-4 h-4 stroke-[3]" />
              <span>Pasar a: {nextParticipantName || 'Siguiente Participante'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestartGame}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar con este socio</span>
            </button>

            {onViewTournament && (
              <button
                type="button"
                onClick={onViewTournament}
                className="py-2.5 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Torneo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
