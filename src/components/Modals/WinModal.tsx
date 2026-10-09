import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Crown, UserCheck } from 'lucide-react';

interface WinModalProps {
  participantName: string;
  nextParticipantName?: string;
  onRestartGame: () => void;
  onNextParticipant?: () => void;
  onViewTournament?: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  participantName,
  nextParticipantName,
  onRestartGame,
  onNextParticipant,
  onViewTournament,
}) => {
  useEffect(() => {
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#facc15', '#38bdf8', '#fb7185', '#ffffff'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#facc15', '#38bdf8', '#fb7185', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1c1404] via-[#090f2b] to-[#120a26] border-4 border-yellow-400 rounded-3xl shadow-[0_0_80px_rgba(250,204,21,0.8)] p-6 sm:p-9 text-center overflow-hidden">
        
        {/* Glow radiance */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/25 via-transparent to-transparent pointer-events-none" />

        {/* Crown & Trophy */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 flex items-center justify-center">
          <div className="absolute -top-3 text-amber-300 animate-bounce">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
          </div>
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 shadow-[0_0_40px_rgba(250,204,21,0.9)]">
            <div className="w-full h-full rounded-full bg-[#0d1633] flex items-center justify-center text-yellow-300">
              <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Grand Banner */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 font-['Orbitron',sans-serif] tracking-wider uppercase mb-1 drop-shadow-[0_2px_10px_rgba(250,204,21,0.6)]">
          ¡CAMPEÓN DE PUERTO AZUL!
        </h1>

        <div className="text-sm font-black text-amber-300 mb-2 font-['Orbitron',sans-serif]">
          {participantName}
        </div>

        <p className="text-cyan-200 text-xs sm:text-sm font-semibold mb-5">
          ¡Ha completado con éxito las 15 preguntas y conquistado el gran premio!
        </p>

        {/* Million prize display */}
        <div className="bg-[#050b1d]/90 border-2 border-yellow-400/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
          <span className="text-xs uppercase tracking-widest text-slate-300 font-extrabold block mb-1">
            Premio Máximo Otorgado
          </span>
          <span className="text-3xl sm:text-5xl font-black text-yellow-300 font-['Orbitron',sans-serif] tracking-widest drop-shadow-[0_2px_15px_rgba(250,204,21,0.8)]">
            1.000.000 PUNTOS
          </span>
        </div>

        {/* Multi-Participant Actions */}
        <div className="space-y-2">
          {onNextParticipant && (
            <button
              type="button"
              onClick={onNextParticipant}
              autoFocus
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(250,204,21,0.8)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-['Orbitron',sans-serif]"
            >
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
              <span>Pasar a: {nextParticipantName || 'Siguiente Participante'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestartGame}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar este jugador</span>
            </button>

            {onViewTournament && (
              <button
                type="button"
                onClick={onViewTournament}
                className="py-2.5 px-4 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Torneo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
