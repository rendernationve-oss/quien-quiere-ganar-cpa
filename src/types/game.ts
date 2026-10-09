export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: OptionLetter;
  explanation?: string;
}

export interface PrizeLevel {
  level: number;
  amount: string;
  isSafeHaven: boolean;
}

export interface LifelinesState {
  fiftyFifty: boolean;
  audience: boolean;
  phone: boolean;
}

export type RevealedState = 'idle' | 'selected' | 'correct' | 'incorrect';

export type GameStatus = 'playing' | 'modal_correct' | 'modal_incorrect' | 'modal_win';

export type ParticipantStatus = 'not_started' | 'in_progress' | 'eliminated' | 'completed';

export interface ParticipantSession {
  id: string; // e.g., 'participant-1'
  participantNumber: number; // 1, 2, 3, 4, 5...
  name: string; // e.g., "Socio 1: Juan Pérez"
  questions: Question[]; // 15 unique questions
  status: ParticipantStatus;
  currentLevel: number; // 1 to 15
  highestLevelReached: number;
  prizeWon: string;
  lifelines: LifelinesState;
}
