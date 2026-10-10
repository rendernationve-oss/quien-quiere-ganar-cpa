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

  useEffect(() => {
    if (activeConfig.customImageData) {
      setPreviewCustom(activeConfig.customImageData);
    }
  }, [activeConfig.customImageData]);

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
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-35 blur-xl animate-pulse pointer-events-none" />

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

                <path id="millTopPath" d="M 34,76 A 68,68 0 0,1 166,76" />
                <path id="millBottomPath" d="M 38,124 A 68,68 0 0,0 162,124" />
              </defs>

              <circle cx="100" cy="100" r="96" fill="url(#millCoreGlow)" />
              <circle cx="100" cy="100" r="94" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.6" />
              <circle cx="100" cy="100" r="91" fill="none" stroke="url(#millChrome)" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />

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