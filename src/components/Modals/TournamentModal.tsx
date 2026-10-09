import React from 'react';
import { Trophy, X, Play, Plus, RotateCcw, Award } from 'lucide-react';
import { ParticipantSession } from '../../types/game';

interface TournamentModalProps {
  participants: ParticipantSession[];
  currentParticipantIndex: number;
  onSelectParticipant: (index: number) => void;
  onAddParticipant: () => void;
  onResetTournament: () => void;
  onClose: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  participants,
  currentParticipantIndex,
  onSelectParticipant,
  onAddParticipant,
  onResetTournament,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#120938] via-[#09062b] to-[#040217] border-2 border-cyan-400 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.6)] p-5 sm:p-7 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              <div className="w-full h-full rounded-full bg-[#0a072c] flex items-center justify-center text-amber-300">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-cyan-300 font-['Orbitron',sans-serif]">
                Torneo de Socios · Puerto Azul
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Sesiones individuales sin preguntas repetidas (mínimo 5 participantes)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Participant List */}
        <div className="overflow-y-auto pr-1 my-4 space-y-2.5">
          {participants.map((session, idx) => {
            const isCurrent = idx === currentParticipantIndex;
            let statusBadge = (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Pendiente
              </span>
            );

            if (session.status === 'in_progress') {
              statusBadge = (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-400/50 animate-pulse">
                  En Juego (Nivel {session.currentLevel})
                </span>
              );
            } else if (session.status === 'completed') {
              statusBadge = (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-md">
                  👑 ¡CAMPEÓN! (1.000.000 Pts)
                </span>
              );
            } else if (session.status === 'eliminated') {
              statusBadge = (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                  Finalizado: {session.prizeWon}
                </span>
              );
            }

            return (
              <div
                key={session.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-['Orbitron',sans-serif] text-sm shrink-0 border ${
                    isCurrent ? 'bg-cyan-500 text-slate-950 border-cyan-300' : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}>
                    #{session.participantNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-white">
                        {session.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold uppercase bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded font-['Orbitron',sans-serif]">
                          Turno Actual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {statusBadge}
                      <span className="text-[11px] text-slate-400">
                        15 preguntas asignadas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prize and Select Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Premio
                    </span>
                    <span className="text-sm font-black text-amber-300 font-['Orbitron',sans-serif]">
                      {session.prizeWon}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectParticipant(idx);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition ${
                      isCurrent
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCurrent ? 'Continuar' : 'Jugar este'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddParticipant}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Otro Participante</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar todas las sesiones y empezar el torneo desde cero?')) {
                  onResetTournament();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Torneo</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
