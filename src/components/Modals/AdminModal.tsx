import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Download, Upload, CheckCircle, Play, Plus, Trash2 } from 'lucide-react';
import { ParticipantSession, Question, OptionLetter } from '../../types/game';
import { generateSingleFileHtml } from '../../utils/singleFileHtmlGenerator';
import { getInitialLogoConfig } from '../../utils/logoStorage';

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
    const pm = l.match(/^P(\d+)$/i); if (pm) { flushP(); pNum = parseInt(pm[1], 10); continue; }
    const qm = l.match(/^(\d+)\s*[-.]\s*(.+)$/); if (qm) { flushQ(); qId = parseInt(qm[1], 10); qTxt = qm[2].trim(); continue; }
    const rm = l.match(/^R[:\s]+([ABCD])$/i); if (rm) { corr = rm[1].toUpperCase() as OptionLetter; continue; }
    const om = l.match(/^([ABCD])[)\s.:-]+(.+)$/); if (om && qId !== null) opts[om[1].toUpperCase() as OptionLetter] = om[2].trim();
  }
  flushP();
  return out;
}

export const AdminModal: React.FC<any> = ({
  participants, currentParticipantIndex, logoConfig: propLogo,
  onSaveParticipantName, onSaveQuestion, onAddParticipant, onDeleteParticipant,
  onRestoreDefaults, onImportTournament, onJumpToParticipantAndLevel, onClose,
}) => {
  const [pIdx, setPIdx] = useState<number>(currentParticipantIndex || 0);
  const [pName, setPName] = useState<string>
