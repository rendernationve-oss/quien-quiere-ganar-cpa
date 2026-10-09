import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Maximize, Minimize, User, Monitor, ExternalLink, Settings, Trophy, Users } from 'lucide-react';
import { LogoConfig } from '../utils/logoStorage';
import { ClubLogo } from './ClubLogo';
import { audioManager } from '../utils/audio';

interface SplashScreenProps {
  participantName: string;
  participantNumber: number;
  isInitialStart: boolean;
  logoConfig?: LogoConfig;
  soundMuted?: boolean;
  onToggleSound?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onStartGame: () => void;
  isDisplayView?: boolean;
  onOpenDisplayView?: () => void;
  logoHeaderData?: string;
  clubName?: string;
  clubLocation?: string;
  onOpenTournamentModal?: () => void;
  onOpenParticipantModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  participantName,
  participantNumber,
  isInitialStart,
  logoConfig,
  soundMuted,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onStartGame,
  isDisplayView = false,
  onOpenDisplayView,
  logoHeaderData,
  clubName = 'CLUB PUERTO AZUL',
  clubLocation = 'NAIGUATÁ, VARGAS',
  onOpenTournamentModal,
  onOpenParticipantModal,
  onOpenSettingsModal,
}) => {
  const [logoLoadFailed, setLogoLoadFailed] = useState<boolean>(false);

  // Play introSplash in loop (0.6 volume) whenever SplashScreen is mounted
  useEffect(() => {
    audioManager.playIntroSplash();
  }, []);

  // If custom logo was uploaded by admin in logoConfig, use it
  const customImg = logoConfig?.mode === 'custom' ? logoConfig.customImageData : null;

  return (
    <div
      onClick={() => audioManager.playIntroSplash()}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none"
    >
      {/* 16:9 Letterboxed Container */}
      <div className="relative w-full max-w-[177.78vh] h-full max-h-[56.25vw] aspect-[16/9] bg-gradient-to-b from-[#050314] via-[#080520] to-[#0a0624] flex flex-col items-center justify-between overflow-hidden shadow-2xl border border-cyan-950/40">
        
        {/* Continuous Animated Stage Lighting & Volumetric Spotlights */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep Stage Gradient Backing */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0e0938_0%,_#06041c_55%,_#030210_100%)] opacity-95" />

          {/* Volumetric Spotlight Left (Sweeping) */}
          <div 
            className="absolute -top-32 -left-20 w-[900px] h-[900px] bg-gradient-to-br from-cyan-400/20 via-blue-600/10 to-transparent rounded-full blur-[110px] animate-[pulse_6s_ease-in-out_infinite]"
          />

          {/* Volumetric Spotlight Right (Sweeping) */}
          <div 
            className="absolute -top-32 -right-20 w-[900px] h-[900px] bg-gradient-to-bl from-indigo-500/20 via-purple-600/10 to-transparent rounded-full blur-[110px] animate-[pulse_7s_ease-in-out_infinite_reverse]"
          />

          {/* Center Stage Downlight Cone */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-gradient-to-b from-cyan-400/15 via-blue-500/5 to-transparent blur-[70px] pointer-events-none"
          />

          {/* Rotating Constellation Particles (Cyan & Gold at 60fps) */}
          <div className="absolute inset-0 opacity-40 animate-[spin_60s_linear_infinite]">
            <svg className="w-full h-full" viewBox="0 0 1000 562.5">
              <defs>
                <radialGradient id="particleGold" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="particleCyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Scattered particles */}
              <circle cx="200" cy="120" r="3" fill="url(#particleGold)" className="animate-pulse" />
              <circle cx="820" cy="140" r="4" fill="url(#particleCyan)" />
              <circle cx="340" cy="420" r="2.5" fill="url(#particleCyan)" />
              <circle cx="680" cy="390" r="3.5" fill="url(#particleGold)" className="animate-pulse" />
              <circle cx="150" cy="300" r="2" fill="url(#particleGold)" />
              <circle cx="850" cy="320" r="2.8" fill="url(#particleCyan)" />
              <circle cx="500" cy="70" r="3" fill="url(#particleGold)" />
              <circle cx="430" cy="480" r="3.2" fill="url(#particleGold)" />
              <circle cx="260" cy="220" r="2.2" fill="url(#particleCyan)" />
              <circle cx="740" cy="240" r="2.6" fill="url(#particleCyan)" />
              <circle cx="580" cy="110" r="2" fill="url(#particleCyan)" />
              <circle cx="480" cy="430" r="2.5" fill="url(#particleCyan)" />
            </svg>
          </div>

          {/* Second Counter-Rotating Particle Layer */}
          <div className="absolute inset-0 opacity-30 animate-[spin_80s_linear_infinite_reverse]">
            <svg className="w-full h-full" viewBox="0 0 1000 562.5">
              <circle cx="280" cy="180" r="3.5" fill="#38bdf8" />
              <circle cx="720" cy="160" r="2.5" fill="#facc15" />
              <circle cx="390" cy="350" r="3" fill="#facc15" />
              <circle cx="610" cy="340" r="2" fill="#38bdf8" />
              <circle cx="180" cy="420" r="2.5" fill="#facc15" />
              <circle cx="820" cy="440" r="3" fill="#38bdf8" />
            </svg>
          </div>

          {/* Stage floor grid / horizon glow */}
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#020108] via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-16 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        </div>

        {/* Top Controls Bar (Subtle & Elegant) */}
        <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between">
          <img
  src="/header_logo.png"
  alt="Club Puerto Azul"
  className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.45)] select-none pointer-events-none"
/>

          {!isDisplayView && (
          <div className="flex items-center gap-2">
            {/* Botón Gestión de Torneo */}
            {onOpenTournamentModal && (
              <button
                type="button"
                onClick={onOpenTournamentModal}
                title="Gestión de Torneo"
                className="h-8 px-2.5 rounded-lg bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Torneo</span>
              </button>
            )}

            {/* Botón Participantes */}
            {onOpenParticipantModal && (
              <button
                type="button"
                onClick={onOpenParticipantModal}
                title="Participantes"
                className="h-8 px-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Participantes</span>
              </button>
            )}

            {/* Botón Configuración */}
            {onOpenSettingsModal && (
              <button
                type="button"
                onClick={onOpenSettingsModal}
                title="Configuración General"
                className="w-8 h-8 rounded-lg bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-cyan-300" />
              </button>
            )}

            {/* Botón Pantalla Pública */}
            {onOpenDisplayView && (
              <button
                type="button"
                onClick={onOpenDisplayView}
                title="Abrir Pantalla Pública / Proyector (Clean Feed para 2do monitor)"
                className="h-8 px-3 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.45)] border border-cyan-400/50 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-95 group shrink-0"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-200 group-hover:text-white" />
                <span className="hidden sm:inline">Pantalla Pública</span>
                <ExternalLink className="w-3 h-3 text-cyan-300 group-hover:text-white shrink-0" />
              </button>
            )}

            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                className="w-8 h-8 rounded-lg bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title={soundMuted ? 'Activar sonido' : 'Silenciar sonido'}
              >
                {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
              </button>
            )}

            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="w-8 h-8 rounded-lg bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Pantalla Completa [F]"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
        </div>

        {/* Center Arena: Dramatic Breathing Medallion + Participant Announcement */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl my-auto">
          
          {/* Medallion with Breathing (Scale 1.0 to 1.03) & Cyan Glow Pulse */}
          <div className="relative mb-5 sm:mb-6 group cursor-pointer transition-transform duration-300">
            {/* Outer Cyan Neon Glow Halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 blur-2xl animate-[pulse_3s_ease-in-out_infinite] scale-110 pointer-events-none" />

            <div 
              className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full flex items-center justify-center p-1"
              style={{
                animation: 'splashBreathe 4s ease-in-out infinite alternate',
              }}
            >
              <img
                src="/show_logo.png"
                alt="Quién quiere ganar en Puerto Azul"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_0_30px_rgba(6,182,212,0.7)]"
              />
            </div>
          </div>

          {/* Heading / Participant Banner */}
          <div className="space-y-1.5 mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-300 font-['Orbitron',sans-serif] tracking-wider uppercase drop-shadow-[0_2px_12px_rgba(6,182,212,0.6)]">
              ¿Quién Quiere Ganar en Puerto Azul?
            </h1>

            {/* Turn Announcement */}
            <div className="flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-slate-950/85 border border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.4)] mt-1">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span className="text-xs sm:text-sm md:text-base font-black text-amber-300 font-['Orbitron',sans-serif] tracking-wider uppercase">
                  PARTICIPANTE {participantNumber}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 font-medium">
                {isInitialStart
                  ? 'Torneo oficial de trivia y conocimientos generales'
                  : `Preparado para iniciar la ronda desde la Pregunta 1`}
              </p>
            </div>
          </div>

          {/* Primary Action Button ("INICIAR JUEGO") */}
          <button
            type="button"
            onClick={onStartGame}
            autoFocus
            className="group relative inline-flex items-center justify-center px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg md:text-xl font-black text-slate-950 uppercase tracking-widest font-['Orbitron',sans-serif] cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.7)] bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 border-2 border-amber-300"
          >
            {/* Shimmer sweep effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            </span>

            <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3 fill-slate-950 stroke-slate-950" />
            <span>INICIAR JUEGO</span>
          </button>
        </div>

        {/* Footer info in 16:9 frame */}
        <div className="relative z-20 w-full px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-cyan-950/40 bg-black/40">
          <span>15 Preguntas · 3 Comodines · 1.000.000 Puntos</span>
          <span>{isDisplayView ? 'Señal de Transmisión Clean Feed' : 'Presiona [Espacio] o [Enter] para continuar'}</span>
        </div>
      </div>
    </div>
  );
};
