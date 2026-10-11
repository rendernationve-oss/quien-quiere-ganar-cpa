import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Download, Upload, CheckCircle, FileCode, Play, Plus, User, Trash2, Camera, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
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

function parseQuestionsTxt(rawText: string, existingParticipants: ParticipantSession[]): ParticipantSession[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsedParticipants: ParticipantSession[] = [];
  let currentPartNumber: number | null = null;
  let currentQuestions: Question[] = [];

  let currentQId: number | null = null;
  let currentQText = '';
  let currentOptions: { A: string; B: string; C: string; D: string } = { A: '', B: '', C: '', D: '' };
  let currentCorrect: OptionLetter = 'A';

  const flushQuestion = () => {
    if (currentQId !== null && currentQText) {
      currentQuestions.push({
        id: currentQId,
        question: currentQText,
        options: { ...currentOptions },
        correctAnswer: currentCorrect,
      });
    }
    currentQId = null;
    currentQText = '';
    currentOptions = { A: '', B: '', C: '', D: '' };
    currentCorrect = 'A';
  };

  const flushParticipant = () => {
    flushQuestion();
    if (currentPartNumber !== null && currentQuestions.length > 0) {
      const existing = existingParticipants.find((p) => p.participantNumber === currentPartNumber);
      const mergedQuestions: Question[] = [];

      for (let lvl = 1; lvl <= 15; lvl++) {
        const foundNew = currentQuestions.find((q) => q.id === lvl);
        const foundOld = existing?.questions.find((q) => q.id === lvl);
        if (foundNew) {
          mergedQuestions.push(foundNew);
        } else if (foundOld) {
          mergedQuestions.push(foundOld);
        } else {
          mergedQuestions.push({
            id: lvl,
            question: 'Pregunta nivel ' + lvl,
            options: { A: 'Opción A', B: 'Opción B', C: 'Opción C', D: 'Opción D' },
            correctAnswer: 'A',
          });
        }
      }

      parsedParticipants.push({
        id: existing?.id || 'participant-' + currentPartNumber + '-' + Date.now(),
        participantNumber: currentPartNumber,
        name: existing?.name || 'Participante ' + currentPartNumber + ' - Socio Puerto Azul',
        questions: mergedQuestions,
        status: 'not_started',
        currentLevel: 1,
        highestLevelReached: 0,
        prizeWon: '0 Pts',
        lifelines: { fiftyFifty: false, audience: false, phone: false },
      });
    }
    currentQuestions = [];
  };

  for (const line of lines) {
    const partMatch = line.match(/^P(\d+)$/i);
    if (partMatch) {
      flushParticipant();
      currentPartNumber = parseInt(partMatch[1], 10);
      continue;
    }

    const qMatch = line.match(/^(\d+)\s*[-.]\s*(.+)$/);
    if (qMatch) {
      flushQuestion();
      currentQId = parseInt(qMatch[1], 10);
      currentQText = qMatch[2].trim();
      continue;
    }

    const rMatch = line.match(/^R[:\s]+([ABCD])$/i);
    if (rMatch) {
      currentCorrect = rMatch[1].toUpperCase() as OptionLetter;
      continue;
    }

    const optMatch = line.match(/^([ABCD])[)\s.:-]+(.+)$/);
    if (optMatch && currentQId !== null) {
      const letter = optMatch[1].toUpperCase() as OptionLetter;
      currentOptions[letter] = optMatch[2].trim();
      continue;
    }
  }

  flushParticipant();
  return parsedParticipants;
}

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

  const [googleDocsUrl, setGoogleDocsUrl] = useState<string>('');
  const [isLoadingGoogleDoc, setIsLoadingGoogleDoc] = useState<boolean>(false);

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
    const modeLabel = mode === 'custom' ? 'Imagen personalizada' : mode;
    setSaveToast('¡Logotipo fijado permanentemente en modo: ' + modeLabel + '!');
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

  useEffect(() => {
    if (currentSession) {
      setParticipantName(currentSession.name);
    }
  }, [selectedPartIndex, currentSession]);

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

    setSaveToast('¡Pregunta del Nivel ' + selectedLevel + ' guardada en Supabase y Local!');
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

  const processTxtRawContent = (rawContent: string, sourceLabel: string) => {
    const cleanedContent = rawContent.replace(/^\uFEFF/, '');
    const parsed = parseQuestionsTxt(cleanedContent, participants);

    if (parsed.length === 0) {
      alert('No se reconocieron bloques de preguntas válidos (P1, P2...) desde ' + sourceLabel + '. Revisa que tenga la estructura de bloquepreguntas1.txt.');
      return false;
    }

    const mergedParticipants = participants.map((p) => {
      const found = parsed.find((item) => item.participantNumber === p.participantNumber);
      return found ? found : p;
    });

    parsed.forEach((p) => {
      if (!mergedParticipants.some((m) => m.participantNumber === p.participantNumber)) {
        mergedParticipants.push(p);
      }
    });

    onImportTournament(mergedParticipants);
    setSaveToast('¡Carga exitosa desde ' + sourceLabel + '! Se actualizaron y guardaron en Supabase ' + parsed.length + ' participantes.');
    setTimeout(() => setSaveToast(null), 4000);
    return true;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = event.target?.result as string;

      if (file.name.endsWith('.txt') || rawContent.includes('P1')) {
        try {
          processTxtRawContent(rawContent, 'archivo ' + file.name);
        } catch (err) {
          console.error(err);
          alert('Hubo un error al procesar el archivo .txt.');
        }
      } else {
        try {
          const parsed = JSON.parse(rawContent);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onImportTournament(parsed);
            setSaveToast('¡Sesiones del torneo importadas y guardadas en Supabase desde JSON!');
            setTimeout(() => setSaveToast(null), 3000);
          } else if (parsed && parsed.tournament && Array.isArray(parsed.tournament)) {
            onImportTournament(parsed.tournament);
            if (parsed.logoConfig) {
              setInternalLogoConfig(parsed.logoConfig);
              persistLogoConfig(parsed.logoConfig);
              onUpdateLogo?.(parsed.logoConfig);
            }
            setSaveToast('¡Sesiones y logotipo importados y guardados en Supabase con éxito!');
            setTimeout(() => setSaveToast(null), 3000);
          } else {
            alert('El archivo no tiene un formato válido (esperado JSON o TXT).');
          }
        } catch {
          alert('Error al leer el archivo. Asegúrate de que sea un .txt válido o .json estructurado.');
        }
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportFromGoogleDocs = async () => {
    const trimmedUrl = googleDocsUrl.trim();
    if (!trimmedUrl) {
      alert('Por favor pega el enlace del documento de Google Docs.');
      return;
    }

    setIsLoadingGoogleDoc(true);
    try {
      let fetchUrl = trimmedUrl;
      const docIdMatch = trimmedUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);

      if (docIdMatch && docIdMatch[1]) {
        fetchUrl = 'https://docs.google.com/document/d/' + docIdMatch[1] + '/export?format=txt';
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error('Error HTTP ' + response.status);
      }

      const rawText = await response.text();
      const ok = processTxtRawContent(rawText, 'Google Docs');
      if (ok) {
        setGoogleDocsUrl('');
      }
    } catch (err) {
      console.error('Error al importar desde Google Docs:', err);
      alert(
        'No se pudo descargar el documento de Google Docs. Asegúrate de que el documento tenga acceso público ("Cualquier persona con el enlace puede ver") y siga la estructura de bloquepreguntas1.txt.'
      );
    } finally {
      setIsLoadingGoogleDoc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0a1533] via-[#050b1f] to-[#081335] border-2 border-cyan-400 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.6)] p-5 sm:p-7 max-h-[92vh] flex flex-col overflow-hidden">
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
                Configuración sincronizada con Supabase · 5+ sesiones con 15 preguntas cada una
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

        {saveToast && (
          <div className="my-2 p-2 bg-emerald-950/90 border border-emerald-400/80 rounded-lg text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{saveToast}</span>
          </div>
        )}

        <div className="overflow-y-auto pr-1 sm:pr-2 space-y-4 my-3 text-left">
          <div className="bg-[#040b24] p-3.5 rounded-2xl border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 font-['Orbitron',sans-serif]">
                    Carga Masiva de Preguntas (.TXT / Google Docs)
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Sube un archivo <code className="text-amber-300">.txt</code> o pega un enlace de Google Docs con la nomenclatura <code className="text-cyan-300">P1, 1-Pregunta, A/B/C/D, R Letra</code>
                  </p>
                </div>
              </div>

              <label className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Subir Archivo .TXT</span>
                <input
                  type="file"
                  accept=".txt,.json,text/plain,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1.5 border-t border-cyan-500/20">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={googleDocsUrl}
                  onChange={(e) => setGoogleDocsUrl(e.target.value)}
                  placeholder="Pega aquí el enlace compartido de Google Docs (https://docs.google.com/document/d/...)"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled={isLoadingGoogleDoc}
                onClick={handleImportFromGoogleDocs}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-60
