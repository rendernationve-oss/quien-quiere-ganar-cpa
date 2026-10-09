import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, Sparkles, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import {
  LogoMode,
  LogoConfig,
  LOGO_STORAGE_KEY,
  LOGO_EVENT_NAME,
  getInitialLogoConfig,
  persistLogoConfig,
  resetLogoConfig,
  optimizeImageFile,
} from '../utils/logoStorage';

export type { LogoMode, LogoConfig };

interface ShowLogoProps {
  compact?: boolean;
  logoConfig?: LogoConfig;
  onUpdateLogo?: (config: LogoConfig) => void;
  onOpenSelector?: () => void;
  isDisplayView?: boolean;
}

export const ShowLogo: React.FC<ShowLogoProps> = ({
  compact = false,
  logoConfig: propLogoConfig,
  onUpdateLogo,
  isDisplayView = false,
}) => {
  const [internalConfig, setInternalConfig] = useState<LogoConfig>(() =>
    propLogoConfig || getInitialLogoConfig()
  );

  const activeConfig = propLogoConfig || internalConfig;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewCustom, setPreviewCustom] = useState<string | null>(
    activeConfig.customImageData || null
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal preview when activeConfig changes
  useEffect(() => {
    if (activeConfig.customImageData) {
      setPreviewCustom(activeConfig.customImageData);
    }
  }, [activeConfig.customImageData]);

  // Listen to broadcast events so changes in AdminModal or another tab update immediately
  useEffect(() => {
    const handleLogoChange = (e: Event) => {
      const customEvt = e as CustomEvent<LogoConfig>;
      if (customEvt.detail) {
        setInternalConfig(customEvt.detail);
        if (customEvt.detail.customImageData) {
          setPreviewCustom(customEvt.detail.customImageData);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOGO_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setInternalConfig(parsed);
          if (parsed.customImageData) {
            setPreviewCustom(parsed.customImageData);
          }
        } catch (err) {}
      }
    };

    window.addEventListener(LOGO_EVENT_NAME, handleLogoChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(LOGO_EVENT_NAME, handleLogoChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsOptimizing(true);
        const optimized = await optimizeImageFile(file);
        const updated: LogoConfig = {
          mode: 'custom',
          customImageData: optimized,
          updatedAt: Date.now(),
        };
        setPreviewCustom(optimized);
        setInternalConfig(updated);
        persistLogoConfig(updated);
        onUpdateLogo?.(updated);
        setSuccessToast('¡Logotipo fijado permanentemente con éxito!');
        setTimeout(() => setSuccessToast(null), 3000);
      } catch (err) {
        console.error('Error optimizing image:', err);
        alert('No se pudo procesar la imagen seleccionada. Por favor intenta con otra.');
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const handleSelectMode = (mode: LogoMode) => {
    const updated: LogoConfig = {
      ...activeConfig,
      mode,
      updatedAt: Date.now(),
    };
    setInternalConfig(updated);
    persistLogoConfig(updated);
    onUpdateLogo?.(updated);
    setSuccessToast(`¡Logotipo fijado en modo: ${mode === 'custom' ? 'Imagen personalizada' : mode}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleResetDefaults = () => {
    const def = resetLogoConfig();
    setInternalConfig(def);
    setPreviewCustom(null);
    onUpdateLogo?.(def);
    setSuccessToast('Logotipo restaurado al diseño oficial de Puerto Azul.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const sizeClasses = compact
    ? 'w-24 h-24 md:w-28 md:h-28'
    : 'w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48';

  return (
    <>
      <div
        className={`relative group flex items-center justify-center select-none ${sizeClasses} mx-auto ${
          isDisplayView ? '' : 'transition-transform duration-300 hover:scale-105'
        }`}
      >
        {/* Outer ambient glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-35 blur-xl animate-pulse pointer-events-none" />

        {/* Interactive hover quick button to customize logo */}
        {!isDisplayView && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Personalizar Logotipo Fijo (Permanente)"
            className="absolute -top-1 -right-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-slate-900/90 border border-amber-400/80 text-amber-300 hover:text-white hover:bg-slate-800 shadow-lg cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}

        {/* LOGO CONTENT DISPLAY */}
        {activeConfig.mode === 'custom' && activeConfig.customImageData ? (
          /* Custom Uploaded Image from user */
          <div
            onClick={() => !isDisplayView && setIsModalOpen(true)}
            className={`w-full h-full flex items-center justify-center relative ${
              isDisplayView ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <img
              src={activeConfig.customImageData}
              alt="Logotipo Personalizado"
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.35)]"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : activeConfig.mode === 'millonario' ? (
          /* Official Classic "¿QUIÉN QUIERE SER MILLONARIO?" Medallion */
          <div
            onClick={() => !isDisplayView && setIsModalOpen(true)}
            className={`w-full h-full rounded-full border-4 border-slate-300 shadow-[0_0_25px_rgba(59,130,246,0.7)] bg-gradient-to-b from-[#180d33] via-[#090b24] to-[#0d163a] flex items-center justify-center p-0.5 relative ${
              isDisplayView ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="millGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="35%" stopColor="#fef08a" />
                  <stop offset="70%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>

                <linearGradient id="millChrome" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="25%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="75%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>

                <radialGradient id="millCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="40%" stopColor="#1e1b4b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="1" />
                </radialGradient>

                {/* Curved paths for textPath */}
                <path id="millTopPath" d="M 34,76 A 68,68 0 0,1 166,76" />
                <path id="millBottomPath" d="M 38,124 A 68,68 0 0,0 162,124" />
              </defs>

              {/* Background circular plate */}
              <circle cx="100" cy="100" r="96" fill="url(#millCoreGlow)" />
              <circle cx="100" cy="100" r="94" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
              <circle cx="100" cy="100" r="91" fill="none" stroke="url(#millChrome)" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />

              {/* Metallic Rivets / Studs along the rim */}
              {[...Array(16)].map((_, idx) => {
                const angle = (idx * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x = 100 + 86 * Math.cos(rad);
                const y = 100 + 86 * Math.sin(rad);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="#e2e8f0"
                    stroke="#0f172a"
                    strokeWidth="0.6"
                  />
                );
              })}

              {/* Swirling Question Marks Vortex */}
              <g className="animate-[spin_70s_linear_infinite]" style={{ transformOrigin: '100px 100px' }}>
                {[...Array(12)].map((_, i) => (
                  <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                    <path
                      d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42"
                      fill="none"
                      stroke="url(#millGold)"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <circle cx="100" cy="18" r="2.2" fill="#fef08a" />
                  </g>
                ))}
              </g>

              {/* Center Diamond & Question Mark */}
              <circle cx="100" cy="100" r="18" fill="#090d26" stroke="url(#millGold)" strokeWidth="2" />
              <polygon points="100,84 116,100 100,116 84,100" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
              <text
                x="100"
                y="106"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill="url(#millGold)"
                fontFamily="system-ui, sans-serif"
              >
                ?
              </text>

              {/* Top Arched Text: ¿QUIÉN QUIERE SER */}
              <text fill="#ffffff" fontSize="9.5" fontWeight="900" letterSpacing="2.5" fontFamily="'Orbitron', sans-serif">
                <textPath href="#millTopPath" startOffset="50%" textAnchor="middle">
                  ¿QUIÉN QUIERE SER?
                </textPath>
              </text>

              {/* Bottom Arched Text: MILLONARIO */}
              <text fill="url(#millGold)" fontSize="11" fontWeight="900" letterSpacing="3" fontFamily="'Orbitron', sans-serif">
                <textPath href="#millBottomPath" startOffset="50%" textAnchor="middle">
                  MILLONARIO
                </textPath>
              </text>
            </svg>
          </div>
        ) : activeConfig.mode === 'farito' ? (
          /* Club Puerto Azul Crest: Nautical Burgee & El Farito */
          <div 
            onClick={() => !isDisplayView && setIsModalOpen(true)}
            className={`w-full h-full rounded-full border-4 border-slate-300 shadow-[0_0_25px_rgba(59,130,246,0.7)] bg-gradient-to-b from-[#0a1931] via-[#051125] to-[#020b18] flex items-center justify-center p-2 relative ${
              isDisplayView ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="cpaBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#034078" />
                </linearGradient>
              </defs>

              <circle cx="100" cy="100" r="92" fill="#08182b" stroke="#38bdf8" strokeWidth="3" />
              <circle cx="100" cy="100" r="84" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Nautical Triangular Burgee (Grímpola) */}
              <polygon points="40,65 160,100 40,135" fill="#f8fafc" stroke="#0284c7" strokeWidth="2.5" />
              {/* Blue cross on the burgee */}
              <polygon points="40,94 150,100 40,106" fill="url(#cpaBlue)" />
              <polygon points="75,76 87,79 87,121 75,124" fill="url(#cpaBlue)" />

              {/* The Iconic Farito (Lighthouse) */}
              <g transform="translate(100, 100) scale(0.7) translate(-100, -100)">
                {/* Light beam */}
                <polygon points="100,55 30,20 30,60" fill="#fef08a" fillOpacity="0.4" />
                <polygon points="100,55 170,20 170,60" fill="#fef08a" fillOpacity="0.4" />
                
                {/* Lighthouse tower */}
                <polygon points="90,140 110,140 106,70 94,70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
                <polygon points="92,115 108,115 106,95 94,95" fill="#ef4444" />
                {/* Lantern room */}
                <rect x="91" y="55" width="18" height="15" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
                {/* Cap */}
                <polygon points="88,55 112,55 100,42" fill="#0f172a" />
              </g>

              {/* Text around bottom */}
              <text x="100" y="162" textAnchor="middle" fontSize="10" fontWeight="900" fill="#f8fafc" fontFamily="'Orbitron', sans-serif" letterSpacing="1.5">
                CLUB PUERTO AZUL
              </text>
              <text x="100" y="176" textAnchor="middle" fontSize="8" fontWeight="700" fill="#38bdf8" fontFamily="'Orbitron', sans-serif" letterSpacing="1">
                NAIGUATÁ 1955
              </text>
            </svg>
          </div>
        ) : (
          /* Default: Broadcast-Grade "¿QUIÉN QUIERE GANAR EN PUERTO AZUL?" Medallion */
          <div 
            onClick={() => !isDisplayView && setIsModalOpen(true)}
            className={`w-full h-full rounded-full border-4 border-slate-300 shadow-[0_0_25px_rgba(59,130,246,0.7)] bg-gradient-to-b from-[#1b1035] via-[#090b24] to-[#081538] flex items-center justify-center p-0.5 relative ${
              isDisplayView ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="goldVortex" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="30%" stopColor="#fef08a" />
                  <stop offset="70%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                <linearGradient id="chromeOuter" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="20%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="80%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>

                <radialGradient id="deepCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
                  <stop offset="45%" stopColor="#1e1b4b" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                </radialGradient>

                {/* Curved paths for circular text */}
                <path id="tvTopArc" d="M 34,75 A 68,68 0 0,1 166,75" />
                <path id="tvBottomArc" d="M 40,125 A 68,68 0 0,0 160,125" />
              </defs>

              {/* Background dark sphere */}
              <circle cx="100" cy="100" r="96" fill="url(#deepCenterGlow)" />
              <circle cx="100" cy="100" r="93" fill="none" stroke="url(#chromeOuter)" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="91" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
              <circle cx="100" cy="100" r="77" fill="none" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.75" />

              {/* Metallic Rivets / Studs around the rim */}
              {[...Array(16)].map((_, idx) => {
                const angle = (idx * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x = 100 + 86 * Math.cos(rad);
                const y = 100 + 86 * Math.sin(rad);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="#e2e8f0"
                    stroke="#020617"
                    strokeWidth="0.6"
                  />
                );
              })}

              {/* Rotating Spiral of Golden Question Marks */}
              <g className="animate-[spin_65s_linear_infinite]" style={{ transformOrigin: '100px 100px' }}>
                {[...Array(12)].map((_, i) => (
                  <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                    <path
                      d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42"
                      fill="none"
                      stroke="url(#goldVortex)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <circle cx="100" cy="18" r="2.2" fill="#fef08a" />
                  </g>
                ))}
              </g>

              {/* Top Curved Text: ¿QUIÉN QUIERE GANAR? */}
              <text fill="#f8fafc" fontSize="9" fontWeight="900" letterSpacing="2.2" fontFamily="'Orbitron', sans-serif">
                <textPath href="#tvTopArc" startOffset="50%" textAnchor="middle">
                  ¿QUIÉN QUIERE GANAR?
                </textPath>
              </text>

              {/* Center 3D metallic plate for "PUERTO AZUL" */}
              <g>
                {/* Horizontal side points / lozenge extensions */}
                <polygon
                  points="20,100 35,92 165,92 180,100 165,108 35,108"
                  fill="#030712"
                  stroke="url(#chromeOuter)"
                  strokeWidth="1.6"
                />
                <polygon
                  points="26,100 37,94 163,94 174,100 163,106 37,106"
                  fill="#0b1736"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  opacity="0.8"
                />
                <text
                  x="100"
                  y="104.5"
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight="900"
                  letterSpacing="2.5"
                  fill="url(#goldVortex)"
                  fontFamily="'Orbitron', sans-serif"
                >
                  PUERTO AZUL
                </text>
              </g>

              {/* Bottom Curved Text: CLUB NAIGUATÁ */}
              <text fill="#38bdf8" fontSize="8" fontWeight="800" letterSpacing="2.5" fontFamily="'Orbitron', sans-serif">
                <textPath href="#tvBottomArc" startOffset="50%" textAnchor="middle">
                  CLUB NAIGUATÁ
                </textPath>
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* QUICK LOGO SELECTOR & UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-white relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-black font-['Orbitron',sans-serif] text-cyan-300">
                Seleccionar Logotipo del Programa
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Selecciona uno de los logotipos oficiales o sube la imagen que prefieras (PNG, JPG o SVG) para personalizar el juego en vivo.
            </p>

            {/* Toast Alert */}
            {successToast && (
              <div className="mb-4 p-2.5 bg-emerald-950/90 border border-emerald-400/80 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200 shadow-md">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Permanent Guarantee Notice */}
            <div className="mb-4 p-2.5 bg-blue-950/40 border border-cyan-500/30 rounded-xl flex items-start gap-2.5 text-[11px] text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Fijación Permanente Activa</strong>
                El logotipo o imagen que selecciones quedará fijo en todas las pantallas, turnos de participantes y sesiones futuras hasta que tú como administrador lo cambies nuevamente.
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Preset 1: Puerto Azul Show */}
              <button
                type="button"
                onClick={() => handleSelectMode('puerto_azul')}
                className={`p-3 rounded-xl border text-left flex flex-col items-center gap-2 transition cursor-pointer ${
                  activeConfig.mode === 'puerto_azul'
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                }`}
              >
                <div className="w-14 h-14 rounded-full border-2 border-cyan-400 bg-[#0a0f26] flex items-center justify-center text-center p-1 text-[8px] font-black text-amber-300 font-['Orbitron',sans-serif]">
                  PUERTO AZUL
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">¿Quién Quiere Ganar?</div>
                  <div className="text-[10px] text-cyan-400">Edición Puerto Azul</div>
                </div>
                {activeConfig.mode === 'puerto_azul' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Check className="w-3 h-3" /> Fijo Activo
                  </span>
                )}
              </button>

              {/* Preset 2: Classic Millonario */}
              <button
                type="button"
                onClick={() => handleSelectMode('millonario')}
                className={`p-3 rounded-xl border text-left flex flex-col items-center gap-2 transition cursor-pointer ${
                  activeConfig.mode === 'millonario'
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                }`}
              >
                <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-[#160d2e] flex items-center justify-center text-center p-1 text-[8px] font-black text-amber-300 font-['Orbitron',sans-serif]">
                  MILLONARIO
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">¿Quién Quiere Ser...?</div>
                  <div className="text-[10px] text-amber-400">Clásico Televisión</div>
                </div>
                {activeConfig.mode === 'millonario' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Check className="w-3 h-3" /> Fijo Activo
                  </span>
                )}
              </button>

              {/* Preset 3: Club Puerto Azul Crest */}
              <button
                type="button"
                onClick={() => handleSelectMode('farito')}
                className={`p-3 rounded-xl border text-left flex flex-col items-center gap-2 transition cursor-pointer ${
                  activeConfig.mode === 'farito'
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                }`}
              >
                <div className="w-14 h-14 rounded-full border-2 border-sky-400 bg-[#08182b] flex items-center justify-center text-center p-1 text-[8px] font-black text-white font-['Orbitron',sans-serif]">
                  EL FARITO
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">Escudo Oficial</div>
                  <div className="text-[10px] text-sky-400">Club Puerto Azul</div>
                </div>
                {activeConfig.mode === 'farito' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Check className="w-3 h-3" /> Fijo Activo
                  </span>
                )}
              </button>

              {/* Preset 4: Custom Image */}
              <button
                type="button"
                onClick={() => {
                  if (activeConfig.customImageData) {
                    handleSelectMode('custom');
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`p-3 rounded-xl border text-left flex flex-col items-center gap-2 transition cursor-pointer ${
                  activeConfig.mode === 'custom'
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                }`}
              >
                <div className="w-14 h-14 rounded-lg bg-slate-900/50 flex items-center justify-center p-1 overflow-hidden">
                  {previewCustom ? (
                    <img src={previewCustom} alt="Custom" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">Imagen Adjuntada</div>
                  <div className="text-[10px] text-slate-400">Subir tu archivo</div>
                </div>
                {activeConfig.mode === 'custom' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Check className="w-3 h-3" /> Fijo Activo
                  </span>
                )}
              </button>
            </div>

            {/* Custom Image Upload Section */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {isOptimizing ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : previewCustom ? (
                    <img src={previewCustom} alt="Vista previa" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {previewCustom ? 'Imagen personalizada guardada' : 'Subir logotipo adjuntado'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sube cualquier PNG, JPG o SVG. Se guardará de forma fija e inmutable.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isOptimizing}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition shadow flex items-center gap-1.5"
                >
                  {isOptimizing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{previewCustom ? 'Cambiar Imagen' : 'Explorar Archivo...'}</span>
                </button>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar por defecto</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs font-['Orbitron',sans-serif] cursor-pointer shadow-md transition"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
