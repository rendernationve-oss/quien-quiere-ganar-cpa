import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Download, Upload, CheckCircle, FileCode, Play, Plus, User, Trash2, Camera, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { ParticipantSession, Question, OptionLetter } from '../../types/game';
import { generateSingleFileHtml } from '../../utils/singleFileHtmlGenerator';
import { LogoMode, LogoConfig, getInitialLogoConfig, persistLogoConfig, resetLogoConfig, optimizeImageFile } from '../../utils/logoStorage';

function parseQuestionsTxt(rawText: string, existingParticipants: ParticipantSession[]): ParticipantSession[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const parsedParticipants: ParticipantSession[] = [];
  let currentPartNumber: number | null = null;
  let currentQuestions: Question[] = [];
  let currentQId: number | null = null;
  let currentQText = '';
  let currentOptions: { A: string; B: string; C: string; D: string } = { A: '', B: '', C: '', D: '' };
  let currentCorrect: OptionLetter = 'A';

  const flushQuestion = () => {
    if (currentQId !== null && currentQText) {
      currentQuestions.push({ id: currentQId, question: currentQText, options: { ...currentOptions }, correctAnswer: currentCorrect });
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
        mergedQuestions.push(foundNew || foundOld || { id: lvl, question: 'Pregunta ' + lvl, options: { A: 'A', B: 'B', C: 'C', D: 'D' }, correctAnswer: 'A' });
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
    if (partMatch) { flushParticipant(); currentPartNumber = parseInt(partMatch[1], 10); continue; }
    const qMatch = line.match(/^(\d+)\s*[-.]\s*(.+)$/);
    if (qMatch) { flushQuestion(); currentQId = parseInt(qMatch[1], 10); currentQText = qMatch[2].trim(); continue; }
    const rMatch = line.match(/^R[:\s]+([ABCD])$/i);
    if (rMatch) { currentCorrect = rMatch[1].toUpperCase() as OptionLetter; continue; }
    const optMatch = line.match(/^([ABCD])[)\s.:-]+(.+)$/);
    if (optMatch && currentQId !== null) {
      const letter = optMatch[1].toUpperCase() as OptionLetter;
      currentOptions[letter] = optMatch[2].trim();
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
  participants, currentParticipantIndex, logoConfig: propLogoConfig, onUpdateLogo,
  onSaveParticipantName, onSaveQuestion, onAddParticipant, onDeleteParticipant,
  onRestoreDefaults, onImportTournament, onJumpToParticipantAndLevel, onClose,
}) => {
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(currentParticipantIndex);
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [questionText, setQuestionText] = useState<string>('');
  const [options, setOptions] = useState<{ A: string; B: string; C: string; D: string }>({ A: '', B: '', C: '', D: '' });
  const [correctAnswer, setCorrectAnswer] = useState<OptionLetter>('A');
  const [explanation, setExplanation] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [googleDocsUrl, setGoogleDocsUrl] = useState<string>('');
  const [isLoadingGoogleDoc, setIsLoadingGoogleDoc] = useState<boolean>(false);
  const [internalLogoConfig, setInternalLogoConfig] = useState<LogoConfig>(() => propLogoConfig || getInitialLogoConfig());
  const activeLogoConfig = propLogoConfig || internalLogoConfig;
  const [showLogoSection, setShowLogoSection] = useState(false);
  const [isOptimizingLogo, setIsOptimizingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (msg: string) => { setSaveToast(msg); setTimeout(() => setSaveToast(null), 3500); };

  const handleUpdateLogoMode = (mode: LogoMode) => {
    const updated: LogoConfig = { ...activeLogoConfig, mode, updatedAt: Date.now() };
    setInternalLogoConfig(updated); persistLogoConfig(updated); onUpdateLogo?.(updated);
    showNotice('Logotipo fijado en modo: ' + mode);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsOptimizingLogo(true);
      const optimized = await optimizeImageFile(file);
      const updated: LogoConfig = { mode: 'custom', customImageData: optimized, updatedAt: Date.now() };
      setInternalLogoConfig(updated); persistLogoConfig(updated); onUpdateLogo?.(updated);
      showNotice('Logotipo personalizado guardado.');
    } catch { alert('Error al procesar la imagen.'); } finally { setIsOptimizingLogo(false); }
  };

  const handleResetLogo = () => {
    const def = resetLogoConfig();
    setInternalLogoConfig(def); onUpdateLogo?.(def);
    showNotice('Logotipo restaurado.');
  };

  const currentSession = participants[selectedPartIndex] || participants[0];

  useEffect(() => { if (currentSession) setParticipantName(currentSession.name); }, [selectedPartIndex, currentSession]);

  useEffect(() => {
    if (!currentSession) return;
    const q = currentSession.questions.find((item) => item.id === selectedLevel);
    if (q) {
      setQuestionText(q.question); setOptions({ ...q.options });
      setCorrectAnswer(q.correctAnswer); setExplanation(q.explanation || '');
    }
  }, [selectedPartIndex, selectedLevel, currentSession]);

  const handleSaveQuestion = () => {
    if (!questionText.trim() || !options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) {
      alert('Completa la pregunta y las 4 opciones.'); return;
    }
    onSaveQuestion(selectedPartIndex, { id: selectedLevel, question: questionText, options, correctAnswer, explanation });
    if (participantName.trim() && participantName !== currentSession.name) {
      onSaveParticipantName(selectedPartIndex, participantName.trim());
    }
    showNotice('¡Pregunta del Nivel ' + selectedLevel + ' guardada en Supabase!');
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateSingleFileHtml(participants, activeLogoConfig);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'quien-quiere-ganar-puerto-azul.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify({ tournament: participants, logoConfig: activeLogoConfig }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'puerto_azul_sesiones.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const processTxtRawContent = (rawContent: string, sourceLabel: string) => {
    const parsed = parseQuestionsTxt(rawContent.replace(/^\uFEFF/, ''), participants);
    if (parsed.length === 0) {
      alert('No se reconocieron bloques P1, P2... desde ' + sourceLabel); return false;
    }
    const merged = participants.map((p) => parsed.find((item) => item.participantNumber === p.participantNumber) || p);
    parsed.forEach((p) => { if (!merged.some((m) => m.participantNumber === p.participantNumber)) merged.push(p); });
    onImportTournament(merged);
    showNotice('¡Carga exitosa desde ' + sourceLabel + '! Guardado en Supabase.');
    return true;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = event.target?.result as string;
      if (file.name.endsWith('.txt') || rawContent.includes('P1')) {
        processTxtRawContent(rawContent, file.name);
      } else {
        try {
          const parsed = JSON.parse(rawContent);
          const list = Array.isArray(parsed) ? parsed : parsed?.tournament;
          if (Array.isArray(list) && list.length > 0) {
            onImportTournament(list);
            showNotice('¡Sesiones importadas y guardadas en Supabase!');
          } else alert('Formato inválido.');
        } catch { alert('Error al leer archivo.'); }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportFromGoogleDocs = async () => {
    const trimmedUrl = googleDocsUrl.trim();
    if (!trimmedUrl) { alert('Pega el enlace de Google Docs.'); return; }
    setIsLoadingGoogleDoc(true);
    try {
      const m = trimmedUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      const fetchUrl = m?.[1] ? 'https://docs.google.com/document/d/' + m[1] + '/export?format=txt' : trimmedUrl;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (processTxtRawContent(text, 'Google Docs')) setGoogleDocsUrl('');
    } catch {
      alert('No se pudo leer el Google Docs. Verifica que esté en modo público ("Cualquier persona con el enlace puede ver").');
    } finally { setIsLoadingGoogleDoc(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#07112b] border-2 border-cyan-400 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-cyan-300">Panel Administrativo (Supabase Sync)</h2>
            <p className="text-[11px] text-slate-400">Edición manual, carga de archivo .TXT y enlace de Google Docs</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {saveToast && (
          <div className="my-2 p-2 bg-emerald-950 border border-emerald-400 rounded-lg text-xs font-bold text-emerald-200 flex items-center gap-2 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" /><span>{saveToast}</span>
          </div>
        )}

        <div className="overflow-y-auto pr-1 space-y-3 my-3 text-left">
          <div className="bg-[#040b24] p-3 rounded-2xl border border-cyan-500/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase text-cyan-300">Carga Masiva (.TXT o Google Docs - Formato bloquepreguntas1.txt)</span>
              </div>
              <label className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /><span>Subir Archivo .TXT</span>
                <input type="file" accept=".txt,.json,text/plain,application/json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="url" value={googleDocsUrl} onChange={(e) => setGoogleDocsUrl(e.target
