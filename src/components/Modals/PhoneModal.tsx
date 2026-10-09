import React, { useState, useEffect } from 'react';
import { PhoneCall, X, Clock, HelpCircle, MessageSquare } from 'lucide-react';
import { OptionLetter } from '../../types/game';
import { sound } from '../../utils/audio';

interface PhoneModalProps {
  correctOption: OptionLetter;
  onClose: () => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({
  correctOption,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [status, setStatus] = useState<'calling' | 'connected'>('calling');
  const [hostNotes, setHostNotes] = useState<string>('');

  useEffect(() => {
    // Play ring tone
    sound.playPhoneRing();

    // Connect after 2.5 seconds
    const connectTimer = setTimeout(() => {
      setStatus('connected');
    }, 2200);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (status !== 'connected' || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        sound.playClockTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, secondsLeft]);

  // Suggested character opinion based on correct option
  const adviceList = [
    `"¡Hola! Estuve repasando los anales del Club Puerto Azul... estoy 85% seguro de que la respuesta correcta es la opción ${correctOption}."`,
    `"¡Buenas noches desde la Marina de Puerto Azul! Sin dudarlo mucho, yo me iría con la opción ${correctOption}."`,
    `"Recuerdo claramente esa historia contada en el Faro: apunta con firmeza hacia la opción ${correctOption}."`,
  ];
  const advice = adviceList[Math.floor(Math.random() * adviceList.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0a183b] via-[#040b1c] to-[#071330] border-2 border-emerald-400 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.5)] p-6 sm:p-7 text-center">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
          <PhoneCall className={`w-6 h-6 ${status === 'calling' ? 'animate-bounce' : 'animate-pulse'}`} />
          <h3 className="text-lg font-black uppercase tracking-wider font-['Orbitron',sans-serif]">
            Llamada a un Socio
          </h3>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          {status === 'calling' ? 'Conectando llamada con Naiguatá...' : '¡Llamada en curso! Tienes 30 segundos.'}
        </p>

        {/* 30s Countdown Ring / Timer */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-slate-800 flex items-center justify-center relative bg-[#040b1d] p-1">
            {/* SVG circular progress with overflow visible and safely bounded radius */}
            <svg
              viewBox="0 0 112 112"
              className="w-full h-full -rotate-90 absolute inset-0 overflow-visible"
              style={{ overflow: 'visible' }}
            >
              <circle
                cx="56"
                cy="56"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray="282.74"
                strokeDashoffset={282.74 * (1 - secondsLeft / 30)}
                className={`transition-all duration-1000 ${
                  secondsLeft <= 5
                    ? 'text-red-500 animate-pulse'
                    : secondsLeft <= 10
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-black font-['Orbitron',sans-serif] ${
                secondsLeft <= 5 ? 'text-red-400' : 'text-white'
              }`}>
                {secondsLeft}s
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> Tiempo
              </span>
            </div>
          </div>
        </div>

        {/* Status Box */}
        {status === 'calling' ? (
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 my-3 text-xs text-slate-300 animate-pulse">
            Marcando al socio experto... Por favor espere.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Simulated Voice Advice */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Consejo del Socio (Capitán de Velero):</span>
              </div>
              <p className="text-xs text-white italic font-medium leading-relaxed">
                {advice}
              </p>
            </div>

            {/* Live host notes if conducting real telephone call */}
            <div className="text-left">
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                <MessageSquare className="w-3 h-3 text-cyan-400" />
                Notas del Moderador / Llamada en Vivo:
              </label>
              <input
                type="text"
                value={hostNotes}
                onChange={(e) => setHostNotes(e.target.value)}
                placeholder="Escribe lo que dice la llamada en directo..."
                className="w-full text-xs bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer transition"
        >
          Colgar y Decidir (Esc)
        </button>
      </div>
    </div>
  );
};
