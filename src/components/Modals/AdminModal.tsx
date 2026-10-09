import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Download, Upload, CheckCircle, FileCode, Play, Plus, User, Trash2, Camera, Image as ImageIcon, Sparkles, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { ParticipantSession, Question, OptionLetter } from '../../types/game';
import { generateSingleFileHtml } from '../../utils/singleFileHtmlGenerator';
import {
  LogoMode,
  LogoConfig,
  getInitialLogoConfig,
  persistLogoConfig,
  resetLogoConfig,
  optimizeImageFile,
} from '../../utils/logoStorage';

interface AdminModalProps {
  participants: ParticipantSession[];
  currentParticipantIndex: number;
  logoConfig?: LogoConfig;
  onUpdateLogo?: (config: LogoConfig) => void;
  onSaveParticipantName: (index: number, newName: string) => void;
  onSaveQuestion: (participantIndex: number, updatedQuestion: Question) => void;
  onAddParticipant: () => void;
  onDeleteParticipant?: (index: number) => void;
  onRestoreDefaults: () => void;
  onImportTournament: (importedParticipants: ParticipantSession[]) => void;
  onJumpToParticipantAndLevel: (participantIndex: number, level: number) => void;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  participants,
  currentParticipantIndex,
  logoConfig: propLogoConfig,
  onUpdateLogo,
  onSaveParticipantName,
  onSaveQuestion,
  onAddParticipant,
  onDeleteParticipant,
  onRestoreDefaults,
  onImportTournament,
  onJumpToParticipantAndLevel,
  onClose,
}) => {
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(currentParticipantIndex);
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [questionText, setQuestionText] = useState<string>('');
  const [options, setOptions] = useState<{ A: string; B: string; C: string; D: string }>({
    A: '',
    B: '',
    C: '',
    D: '',
  });
  const [correctAnswer, setCorrectAnswer] = useState<OptionLetter>('A');
  const [explanation, setExplanation] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Logo configuration state
  const [internalLogoConfig, setInternalLogoConfig] = useState<LogoConfig>(() =>
    propLogoConfig || getInitialLogoConfig()
  );
  const activeLogoConfig = propLogoConfig || internalLogoConfig;

  const [showLogoSection, setShowLogoSection] = useState(false);
  const [isOptimizingLogo, setIsOptimizingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateLogoMode = (mode: LogoMode) => {
    const updated: LogoConfig = {
      ...activeLogoConfig,
      mode,
      updatedAt: Date.now(),
    };
    setInternalLogoConfig(updated);
    persistLogoConfig(updated);
    onUpdateLogo?.(updated);
    setSaveToast(`¡Logotipo fijado permanentemente en modo: ${mode === 'custom' ? 'Imagen personalizada' : mode}!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsOptimizingLogo(true);
        const optimized = await optimizeImageFile(file);
        const updated: LogoConfig = {
          mode: 'custom',
          customImageData: optimized,
          updatedAt: Date.now(),
        };
        setInternalLogoConfig(updated);
        persistLogoConfig(updated);
        onUpdateLogo?.(updated);
        setSaveToast('¡Logotipo personalizado cargado y fijado de forma permanente!');
        setTimeout(() => setSaveToast(null), 3000);
      } catch (err) {
        console.error('Error optimizing logo image:', err);
        alert('Hubo un error al procesar la imagen del logotipo. Intenta con otro archivo.');
      } finally {
        setIsOptimizingLogo(false);
      }
    }
  };

  const handleResetLogo = () => {
    const def = resetLogoConfig();
    setInternalLogoConfig(def);
    onUpdateLogo?.(def);
    setSaveToast('Logotipo restaurado al diseño oficial de Puerto Azul.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const currentSession = participants[selectedPartIndex] || participants[0];

  // Sync participant name when selectedPartIndex changes
  useEffect(() => {
    if (currentSession) {
      setParticipantName(currentSession.name);
    }
  }, [selectedPartIndex, currentSession]);

  // Load question fields when selectedPartIndex or selectedLevel changes
  useEffect(() => {
    if (!currentSession) return;
    const q = currentSession.questions.find((item) => item.id === selectedLevel);
    if (q) {
      setQuestionText(q.question);
      setOptions({ ...q.options });
      setCorrectAnswer(q.correctAnswer);
      setExplanation(q.explanation || '');
    }
  }, [selectedPartIndex, selectedLevel, currentSession]);

  const handleSaveQuestion = () => {
    if (!questionText.trim()) {
      alert('Por favor ingresa el enunciado de la pregunta.');
      return;
    }
    if (!options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) {
      alert('Por favor completa las 4 opciones de respuesta (A, B, C, D).');
      return;
    }

    const updated: Question = {
      id: selectedLevel,
      question: questionText,
      options,
      correctAnswer,
      explanation,
    };

    onSaveQuestion(selectedPartIndex, updated);
    if (participantName.trim() && participantName !== currentSession.name) {
      onSaveParticipantName(selectedPartIndex, participantName.trim());
    }

    setSaveToast(`¡Pregunta del Nivel ${selectedLevel} para "${participantName}" guardada con éxito!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateSingleFileHtml(participants, activeLogoConfig);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quien-quiere-ganar-puerto-azul-torneo.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const payload = {
      tournament: participants,
      logoConfig: activeLogoConfig,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'puerto_azul_torneo_sesiones.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportTournament(parsed);
          setSaveToast('¡Sesiones del torneo importadas correctamente!');
          setTimeout(() => setSaveToast(null), 3000);
        } else if (parsed && parsed.tournament && Array.isArray(parsed.tournament)) {
          onImportTournament(parsed.tournament);
          if (parsed.logoConfig) {
            setInternalLogoConfig(parsed.logoConfig);
            persistLogoConfig(parsed.logoConfig);
            onUpdateLogo?.(parsed.logoConfig);
          }
          setSaveToast('¡Sesiones y logotipo importados y fijados con éxito!');
          setTimeout(() => setSaveToast(null), 3000);
        } else {
          alert('El archivo JSON no tiene un formato válido.');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0a1533] via-[#050b1f] to-[#081335] border-2 border-cyan-400 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.6)] p-5 sm:p-7 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              ⚙️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-cyan-300 font-['Orbitron',sans-serif]">
                Panel Administrativo Multijugador
              </h2>
              <p className="text-[11px] text-slate-400">
                Configuración de 5+ sesiones de socios con 15 preguntas independientes cada uno
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

        {/* Toast Alert */}
        {saveToast && (
          <div className="my-2 p-2 bg-emerald-950/90 border border-emerald-400/80 rounded-lg text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 sm:pr-2 space-y-4 my-3 text-left">
          
          {/* Logo Customization Banner & Controls */}
          <div className="bg-[#04081c] p-3 rounded-2xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-['Orbitron',sans-serif] flex items-center gap-1.5">
                    <span>Logotipo Permanente del Programa</span>
                    <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Fijo
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Modo actual: <strong className="text-cyan-300 uppercase">{activeLogoConfig.mode === 'custom' ? 'Imagen personalizada' : activeLogoConfig.mode}</strong> (se mantiene fijo hasta que lo modifiques)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isOptimizingLogo}
                  onClick={() => logoFileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow"
                >
                  {isOptimizingLogo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <span>{activeLogoConfig.customImageData ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoSection(!showLogoSection)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition cursor-pointer"
                >
                  {showLogoSection ? 'Ocultar Opciones' : 'Cambiar Modo'}
                </button>
              </div>
            </div>

            {showLogoSection && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateLogoMode('puerto_azul')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      activeLogoConfig.mode === 'puerto_azul'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px]">¿Quién Quiere Ganar?</div>
                    <div className="text-[9px] text-cyan-400">Puerto Azul TV</div>
                    {activeLogoConfig.mode === 'puerto_azul' && (
                      <span className="text-[9px] text-amber-400 font-bold block mt-0.5">✓ Fijo Activo</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateLogoMode('millonario')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      activeLogoConfig.mode === 'millonario'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px]">¿Quién Quiere Ser...?</div>
                    <div className="text-[9px] text-amber-400">Millonario Clásico</div>
                    {activeLogoConfig.mode === 'millonario' && (
                      <span className="text-[9px] text-amber-400 font-bold block mt-0.5">✓ Fijo Activo</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateLogoMode('farito')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      activeLogoConfig.mode === 'farito'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px]">El Farito</div>
                    <div className="text-[9px] text-sky-400">Escudo Club CPA</div>
                    {activeLogoConfig.mode === 'farito' && (
                      <span className="text-[9px] text-amber-400 font-bold block mt-0.5">✓ Fijo Activo</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeLogoConfig.customImageData) {
                        handleUpdateLogoMode('custom');
                      } else {
                        logoFileInputRef.current?.click();
                      }
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      activeLogoConfig.mode === 'custom'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px]">Imagen Adjunta</div>
                    <div className="text-[9px] text-slate-400">Subir de archivo</div>
                    {activeLogoConfig.mode === 'custom' && (
                      <span className="text-[9px] text-amber-400 font-bold block mt-0.5">✓ Fijo Activo</span>
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar logotipo oficial por defecto</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Standalone HTML Export Banner */}
          <div className="bg-[#030b20] p-3 rounded-2xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                <Download className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-['Orbitron',sans-serif]">
                  Exportar Juego en HTML Autocontenido
                </h4>
                <p className="text-[10px] text-slate-400">
                  Descarga un archivo .html único con todas las preguntas y sesiones listo para abrir en cualquier navegador o proyector sin conexión a internet.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.35)] transition cursor-pointer font-['Orbitron',sans-serif] shrink-0"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Exportar HTML</span>
            </button>
          </div>
          
          {/* Participant Session Selector Tabs */}
          <div className="bg-[#04081c] p-3 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-cyan-300 font-['Orbitron',sans-serif] flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>Sesión de Participante:</span>
              </label>

              <button
                type="button"
                onClick={onAddParticipant}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Agregar Participante</span>
              </button>
            </div>

            {/* Horizontal Session Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {participants.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPartIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedPartIndex === idx
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] font-black'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span className="font-['Orbitron',sans-serif]">#{p.participantNumber}</span>
                  <span className="truncate max-w-[130px]">{p.name}</span>
                </button>
              ))}
            </div>

            {/* Editable Name & Quick Jump */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20">
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  Nombre del Socio / Participante:
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  onBlur={() => {
                    if (participantName.trim()) {
                      onSaveParticipantName(selectedPartIndex, participantName.trim());
                    }
                  }}
                  placeholder="Ej: Dr. Fernando Mendoza"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToParticipantAndLevel(selectedPartIndex, selectedLevel);
                    onClose();
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-cyan-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Jugar con este socio (Nivel {selectedLevel})</span>
                </button>

                {participants.length > 5 && onDeleteParticipant && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la sesión del participante #${currentSession.participantNumber}?`)) {
                        onDeleteParticipant(selectedPartIndex);
                        setSelectedPartIndex(0);
                      }
                    }}
                    title="Eliminar este participante"
                    className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Level Selector for this participant */}
          <div className="flex items-center gap-3 bg-[#060f26] p-3 rounded-xl border border-cyan-500/20">
            <label htmlFor="level-select" className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-['Orbitron',sans-serif] shrink-0">
              Nivel de la Pregunta:
            </label>
            <select
              id="level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              className="bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-300 font-['Orbitron',sans-serif] focus:outline-none focus:border-cyan-300 cursor-pointer flex-1"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (
                <option key={lvl} value={lvl}>
                  Nivel {lvl} {lvl === 5 ? '★ Seguro 1 (1.000 Pts)' : lvl === 10 ? '★ Seguro 2 (32.000 Pts)' : lvl === 15 ? '👑 Gran Premio (1.000.000 Pts)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Question Statement Input */}
          <div>
            <label className="text-xs font-bold text-cyan-300 block mb-1 uppercase tracking-wide">
              Enunciado de la Pregunta ({currentSession.name} · Nivel {selectedLevel}):
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Escribe la pregunta para este nivel..."
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner leading-relaxed"
            />
          </div>

          {/* 4 Answer Inputs with Radio Buttons */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                Respuestas (Marca el círculo para la Correcta):
              </label>
              <span className="text-[11px] text-amber-300 font-semibold">
                Correcta actual: Opción {correctAnswer}
              </span>
            </div>

            {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => {
              const isChecked = correctAnswer === letter;
              return (
                <div
                  key={letter}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="radio"
                      name="correctOption"
                      value={letter}
                      checked={isChecked}
                      onChange={() => setCorrectAnswer(letter)}
                      className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs font-['Orbitron',sans-serif] ${
                      isChecked ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'
                    }`}>
                      {letter}
                    </span>
                  </label>

                  <input
                    type="text"
                    value={options[letter]}
                    onChange={(e) => setOptions({ ...options, [letter]: e.target.value })}
                    placeholder={`Respuesta opción ${letter}...`}
                    className="flex-1 bg-slate-900/80 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Dato curioso / Explicación histórica (opcional):
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Ej: Naiguatá fue fundado en... / El Faro data de..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Pregunta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Restaurar las 75 preguntas oficiales para las 5 sesiones de participantes?')) {
                  onRestoreDefaults();
                  setSaveToast('¡75 preguntas oficiales para 5 participantes restauradas!');
                  setTimeout(() => setSaveToast(null), 3000);
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar 75 Oficiales</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              title="Descargar Juego completo con todas las sesiones en un solo archivo HTML para jugar offline"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer font-['Orbitron',sans-serif]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Exportar HTML</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              title="Exportar todas las sesiones a JSON"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              title="Importar torneo desde JSON"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
