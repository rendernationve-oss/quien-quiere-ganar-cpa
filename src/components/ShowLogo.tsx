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
        setSuccessToast('¡Logotipo fijado con éxito!');
        setTimeout(() => setSuccessToast(null), 3000);
      } catch (err) {
        alert('No se pudo procesar la imagen seleccionada.');
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
    setSuccessToast('Logotipo actualizado.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleResetDefaults = () => {
    const def = resetLogoConfig();
    setInternalConfig(def);
    setPreviewCustom(null);
    onUpdateLogo?.(def);
    setSuccessToast('Logotipo restaurado.');
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
            title="Personalizar Logotipo"
            className="absolute -top-1 -right-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-slate-900/90 border border-amber-400/80 text-amber-300 hover:text-white hover:bg-slate-800 shadow-lg cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Renderizado de imagen directa */}
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
            />
          </div>
        ) : (
          <div 
            onClick={() => !isDisplayView && setIsModalOpen(true)}
            className={`w-full h-full flex items-center justify-center p-1 relative ${
              isDisplayView ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <img
              src="/Quien_Logo.png"
              alt="Quién Quiere Ganar"
              className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(6,182,212,0.65)] select-none pointer-events-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/header_logo.png';
              }}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-white relative">
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
                Seleccionar Logotipo
              </h3>
            </div>

            {successToast && (
              <div className="mb-4 p-2.5 bg-emerald-950/90 border border-emerald-400/80 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {isOptimizing ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : previewCustom ? (
                    <img src={previewCustom} alt="Vista previa" className="w-full h-full object-contain" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {previewCustom ? 'Imagen personalizada guardada' : 'Subir logotipo oficial'}
                  </div>
                  <div className="text-[10px] text-slate-400">PNG, JPG o SVG</div>
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
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition shadow"
                >
                  {isOptimizing ? 'Procesando...' : previewCustom ? 'Cambiar Imagen' : 'Subir Imagen'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar oficial</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs font-['Orbitron',sans-serif] cursor-pointer shadow-md"
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