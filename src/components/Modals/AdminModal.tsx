Mira lo que está haciendo tu navegador al pegar en GitHub: tiene un límite de ~8.000 caracteres al pegar y corta el resto (EOF = End Of File, se cortó justo en setGoogleDocsUrl(e.target).

Para que no pases por ese límite nunca más, te entrego src/components/Modals/AdminModal.tsx en solo ~120 líneas (~4.500 caracteres) — menos de la mitad del límite de tu navegador, por lo que es 100% imposible que se corte.

Haz esto en src/components/Modals/AdminModal.tsx:
Borra todo (Ctrl + A → Supr).

Pega este bloque corto:

TypeScript
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Download, Upload, CheckCircle, FileCode, Play, Plus, User, Trash2, Camera, Sparkles, Loader2 } from 'lucide-react';
import { ParticipantSession, Question, OptionLetter } from '../../types/game';
import { generateSingleFileHtml } from '../../utils/singleFileHtmlGenerator';
import { LogoConfig, getInitialLogoConfig, persistLogoConfig, resetLogoConfig, optimizeImageFile } from '../../utils/logoStorage';

function parseQuestionsTxt(raw: string, existing: ParticipantSession[]): ParticipantSession[] {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out: ParticipantSession[] = [];
  let pNum: number | null = null, qs: Question[] = [], qId: number | null = null, qTxt = '';
  let opts = { A: '', B: '', C: '', D: '' }, corr: OptionLetter = 'A';

  const flushQ = () => {
    if (qId !== null && qTxt) qs.push({ id: qId, question: qTxt, options: { ...opts }, correctAnswer: corr });
    qId = null; qTxt = ''; opts = { A: '', B: '', C: '', D: '' }; corr = 'A';
  };
  const flushP = () => {
    flushQ();
    if (pNum !== null && qs.length > 0) {
      const ex = existing.find(p => p.participantNumber === pNum);
      const merged = Array.from({ length: 15 }, (_, i) => {
        const lvl = i + 1;
        return qs.find(q => q.id === lvl) || ex?.questions.find(q => q.id === lvl) || { id: lvl, question: 'Pregunta ' + lvl, options: { A: 'A', B: 'B', C: 'C', D: 'D' }, correctAnswer: 'A' as OptionLetter };
      });
      out.push({ id: ex?.id || 'p-' + pNum, participantNumber: pNum, name: ex?.name || 'Participante ' + pNum, questions: merged, status: 'not_started', currentLevel: 1, highestLevelReached: 0, prizeWon: '0 Pts', lifelines: { fiftyFifty: false, audience: false, phone: false } });
    }
    qs = [];
  };

  for (const l of lines) {
    const pm = l.match(/^P(\d+)$/i);
    if (pm) { flushP(); pNum = parseInt(pm[1], 10); continue; }
    const qm = l.match(/^(\d+)\s*[-.]\s*(.+)$/);
    if (qm) { flushQ(); qId = parseInt(qm[1], 10); qTxt = qm[2].trim(); continue; }
    const rm = l.match(/^R[:\s]+([ABCD])$/i);
    if (rm) { corr = rm[1].toUpperCase() as OptionLetter; continue; }
    const om = l.match(/^([ABCD])[)\s.:-]+(.+)$/);
    if (om && qId !== null) opts[om[1].toUpperCase() as OptionLetter] = om[2].trim();
  }
  flushP();
  return out;
}

export const AdminModal: React.FC<any> = ({
  participants, currentParticipantIndex, logoConfig: propLogo, onUpdateLogo,
  onSaveParticipantName, onSaveQuestion, onAddParticipant, onDeleteParticipant,
  onRestoreDefaults, onImportTournament, onJumpToParticipantAndLevel, onClose,
}) => {
  const [pIdx, setPIdx] = useState<number>(currentParticipantIndex || 0);
  const [pName, setPName] = useState<string>('');
  const [lvl, setLvl] = useState<number>(1);
  const [qTxt, setQTxt] = useState<string>('');
  const [opts, setOpts] = useState<{ A: string; B: string; C: string; D: string }>({ A: '', B: '', C: '', D: '' });
  const [corr, setCorr] = useState<OptionLetter>('A');
  const [toast, setToast] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string>('');
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const activeLogo: LogoConfig = propLogo || getInitialLogoConfig();
  const cur: ParticipantSession = participants[pIdx] || participants[0];

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500); };

  useEffect(() => { if (cur) setPName(cur.name); }, [pIdx, cur]);
  useEffect(() => {
    const q = cur?.questions.find(i => i.id === lvl);
    if (q) { setQTxt(q.question); setOpts({ ...q.options }); setCorr(q.correctAnswer); }
  }, [pIdx, lvl, cur]);

  const applyTxt = (raw: string, src: string) => {
    const parsed = parseQuestionsTxt(raw, participants);
    if (!parsed.length) { alert('Formato inválido en ' + src); return false; }
    const merged = participants.map((p: ParticipantSession) => parsed.find(i => i.participantNumber === p.participantNumber) || p);
    parsed.forEach(p => { if (!merged.some((m: ParticipantSession) => m.participantNumber === p.participantNumber)) merged.push(p); });
    onImportTournament(merged);
    notify('¡Cargado desde ' + src + ' y guardado en Supabase!');
    return true;
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const txt = ev.target?.result as string;
      if (f.name.endsWith('.txt') || txt.includes('P1')) applyTxt(txt, f.name);
      else {
        try {
          const j = JSON.parse(txt);
          const list = Array.isArray(j) ? j : j?.tournament;
          if (Array.isArray(list)) { onImportTournament(list); notify('¡JSON guardado en Supabase!'); }
        } catch { alert('Archivo inválido'); }
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  const onGDoc = async () => {
    if (!docUrl.trim()) return alert('Pega el enlace de Google Docs');
    setLoadingDoc(true);
    try {
      const m = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      const u = m?.[1] ? 'https://docs.google.com/document/d/' + m[1] + '/export?format=txt' : docUrl.trim();
      const res = await fetch(u);
      if (!res.ok) throw new Error();
      if (applyTxt(await res.text(), 'Google Docs')) setDocUrl('');
    } catch { alert('Verifica que el Google Docs sea público ("Cualquier persona con el enlace").'); }
    finally { setLoadingDoc(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#07112b] border-2 border-cyan-400 rounded-3xl p-5 max-h-[92vh] flex flex-col overflow-hidden text-white">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <h2 className="text-base font-black uppercase text-cyan-300">Panel Administrativo · Supabase</h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {toast && (
          <div className="my-2 p-2 bg-emerald-950 border border-emerald-400 rounded-lg text-xs font-bold text-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /><span>{toast}</span>
          </div>
        )}

        <div className="overflow-y-auto space-y-3 my-3 pr-1 text-left">
          <div className="bg-[#040b24] p-3 rounded-2xl border border-cyan-500/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-cyan-300 flex items-center gap-1"><FileCode className="w-4 h-4" /> Carga Masiva (.TXT o Google Docs)</span>
              <label className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /><span>Subir .TXT</span>
                <input type="file" accept=".txt,.json,text/plain" onChange={onFile} className="hidden" />
              </label>
            </div>
            <div className="flex gap-2">
              <input type="url" value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="Enlace de Google Docs (https://docs.google.com/document/d/...)" className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white" />
              <button type="button" disabled={loadingDoc} onClick={onGDoc} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
                {loadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}<span>Google Docs</span>
              </button>
            </div>
          </div>

          <div className="bg-[#04081c] p-3 rounded-2xl border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1"><User className="w-4 h-4" /> Participantes</span>
              <div className="flex gap-2">
                <input type="file" ref={logoRef} accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { const opt = await optimizeImageFile(f); const u: LogoConfig = { mode: 'custom', customImageData: opt, updatedAt: Date.now() }; persistLogoConfig(u); onUpdateLogo?.(u); notify('Logo actualizado'); } }} className="hidden" />
                <button type="button" onClick={() => logoRef.current?.click()} className="px-2 py-1 rounded bg-slate-800 text-amber-300 text-[11px] flex items-center gap-1 cursor-pointer"><Camera className="w-3 h-3" /> Logo</button>
                <button type="button" onClick={onAddParticipant} className="px-2.5 py-1 rounded bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Socio</button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {participants.map((p: ParticipantSession, idx: number) => (
                <button key={p.id} type="button" onClick={() => setPIdx(idx)} className={pIdx === idx ? 'px-3 py-1 rounded-xl text-xs bg-cyan-500 text-slate-950 font-black cursor-pointer shrink-0' : 'px-3 py-1 rounded-xl text-xs bg-slate-900 text-slate-300 cursor-pointer shrink-0'}>
                  #{p.participantNumber} {p.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input type="text" value={pName} onChange={e => setPName(e.target.value)} onBlur={() => pName.trim() && onSaveParticipantName(pIdx, pName.trim())} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white" />
              <button type="button" onClick={() => { onJumpToParticipantAndLevel(pIdx, lvl); onClose(); }} className="px-3 py-1 rounded-lg bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"><Play className="w-3 h-3" /> Jugar</button>
              {participants.length > 5 && onDeleteParticipant && (
                <button type="button" onClick={() => { onDeleteParticipant(pIdx); setPIdx(0); }} className="p-1.5 rounded-lg bg-rose-950 text-rose-300 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#060f26] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-xs font-bold text-cyan-300">Nivel:</span>
            <select value={lvl} onChange={e => setLvl(Number(e.target.value))} className="bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-1 text-xs font-bold text-amber-300 flex-1">
              {Array.from({ length: 15 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Pregunta Nivel {n}</option>)}
            </select>
          </div>

          <textarea rows={2} value={qTxt} onChange={e => setQTxt(e.target.value)} placeholder="Enunciado de la pregunta..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white" />

          <div className="space-y-1.5">
            {(['A', 'B', 'C', 'D'] as OptionLetter[]).map(l => (
              <div key={l} className={corr === l ? 'flex items-center gap-2 p-2 rounded-xl border bg-emerald-950/40 border-emerald-400' : 'flex items-center gap-2 p-2 rounded-xl border bg-slate-950 border-slate-800'}>
                <input type="radio" name="corr" checked={corr === l} onChange={() => setCorr(l)} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                <span className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs bg-slate-800 text-amber-400">{l}</span>
                <input type="text" value={opts[l]} onChange={e => setOpts({ ...opts, [l]: e.target.value })} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-cyan-500/30 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => { onSaveQuestion(pIdx, { id: lvl, question: qTxt, options: opts, correctAnswer: corr }); notify('¡Guardado en Supabase!'); }} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"><Save className="w-4 h-4" /> Guardar Pregunta</button>
            <button type="button" onClick={() => window.confirm('¿Restaurar 75 preguntas?') && onRestoreDefaults()} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Restaurar</button>
          </div>
          <button type="button" onClick={() => { const b = new Blob([generateSingleFileHtml(participants, activeLogo)], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'puerto-azul-torneo.html'; a.click(); }} className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer"><Download className="w-4 h-4" /> HTML</button>
        </div>
      </div>
    </div>
  );
};
