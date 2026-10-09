/**
 * BroadcastChannel & LocalStorage Unified State Sync for "¿Quién Quiere Ganar en Puerto Azul?"
 * Provides zero-latency real-time synchronization between Operator (Moderator) and Public Display (Clean Feed)
 * across windows, tabs, and multimonitor setups.
 */

import { ParticipantSession } from '../types/game';
import { LogoConfig } from './logoStorage';
import { pushGameState } from './firebase';

export const CHANNEL_NAME = 'puerto_azul_game_channel';
export const GAME_SYNC_CHANNEL_KEY = 'game_sync_channel';
export const LIVE_STORAGE_KEY = 'puerto_azul_live_state';
// Backward compatibility key
export const LEGACY_STORAGE_KEY = 'puerto_azul_sync_state';

export type GameStage = 'SPLASH' | 'PLAYING' | 'GAME_OVER';
export type AnswerStatus = 'idle' | 'selected' | 'correct' | 'wrong';

export interface UnifiedGameState {
  logoHeaderData: string; // URL or base64 of the header logo
  clubLocation: string; // e.g. "NAIGUATÁ, VARGAS"
  clubName: string; // e.g. "CLUB PUERTO AZUL"
  gameStage: GameStage;
  currentParticipant: ParticipantSession | null;
  currentParticipantIndex: number;
  currentQuestionIndex: number; // 0-based question index (0 to 14)
  currentLevel: number; // 1-based question level (1 to 15)
  selectedAnswer: string | null; // e.g. 'A', 'B', 'C', 'D' or null
  answerStatus: AnswerStatus;
  revealedLifelines: {
    fiftyFifty: boolean;
    audience: boolean;
    phone: boolean;
  };
  hiddenOptions: string[]; // e.g. ['A', 'C'] for 50:50
  activeTimer: number | null; // active timer in seconds if any (e.g. 30s phone)
  activeModal: string | null;
  projectorMode: boolean;
  logoConfig?: LogoConfig;
  participants: ParticipantSession[];
  soundMuted?: boolean;
  lastUpdated: number;
  senderId?: string;
  // Backward compatibility convenience fields
  selectedOption?: string | null;
  revealedState?: any;
  lifelines?: any;
  showSplash?: boolean;
  isInitialSplash?: boolean;
  actionType?: string;
  payload?: any;
}

// Unique instance ID for the current window/tab
export const INSTANCE_ID = `win_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

class GameBroadcastChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: UnifiedGameState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<UnifiedGameState | any>) => {
          const data = event.data;
          if (!data) return;
          // Ignore messages sent by self
          if (data.senderId && data.senderId === INSTANCE_ID) return;

          // Normalize if payload came in wrapper format
          const state: UnifiedGameState = data.state || data;
          if (state && (typeof state.lastUpdated === 'number' || (state as any).actionType)) {
            this.listeners.forEach((listener) => {
              try {
                listener(state);
              } catch (err) {
                console.warn('[BroadcastChannel listener error]:', err);
              }
            });
          }
        };
      } catch (err) {
        console.warn('[BroadcastChannel init error]:', err);
      }
    }
  }

  public subscribe(listener: (state: UnifiedGameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public postMessage(state: UnifiedGameState) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        ...state,
        senderId: INSTANCE_ID,
      });
    } catch (err) {
      console.warn('[BroadcastChannel send error]:', err);
    }
  }

  /**
   * Backward compatibility send method
   */
  public send(actionType: string, payload?: any) {
    if (!this.channel) return;
    try {
      const stateObj: any = {
        actionType,
        payload,
        senderId: INSTANCE_ID,
        lastUpdated: Date.now(),
      };
      this.channel.postMessage(stateObj);
    } catch (err) {
      console.warn('[BroadcastChannel send error]:', err);
    }
  }

  public close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const gameBroadcast = new GameBroadcastChannel();

/**
 * Emisor (Ventana Moderador):
 * Cada vez que cambie CUALQUIER propiedad:
 * 1. Guarda en localStorage.setItem('puerto_azul_live_state', JSON.stringify(fullState));
 * 2. Emite vía broadcastChannel.postMessage(fullState);
 */
export function broadcastGameState(
  fullState: Partial<UnifiedGameState> | any,
  actionType?: string,
  payloadData?: any
) {
  const isStarted = fullState.gameStage === 'PLAYING' || fullState.showSplash === false;
  const now = Date.now();
  const payload: UnifiedGameState = {
    ...fullState,
    actionType: actionType || fullState.actionType,
    payload: payloadData || fullState.payload,
    lastUpdated: now,
    senderId: INSTANCE_ID,
  };

  // Structured direct payload for game_sync_channel
  const directPayload = {
    stage: isStarted ? 'GAME' : 'SPLASH',
    questionIndex: fullState.currentQuestionIndex ?? (fullState.currentLevel ? fullState.currentLevel - 1 : 0),
    currentLevel: fullState.currentLevel ?? 1,
    selectedOption: fullState.selectedAnswer ?? fullState.selectedOption ?? null,
    answerStatus: fullState.answerStatus || 'idle',
    logo: fullState.logoHeaderData || fullState.logo || '/header_logo.png',
    clubName: fullState.clubName || 'CLUB PUERTO AZUL',
    timer: fullState.activeTimer ?? null,
    lifelines: fullState.revealedLifelines || fullState.lifelines || { fiftyFifty: false, audience: false, phone: false },
    timestamp: now,
    fullState: payload,
  };

  // 1. LocalStorage (Cross-tab, cross-window & initial sync on boot)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const serialized = JSON.stringify(payload);
      localStorage.setItem(LIVE_STORAGE_KEY, serialized);
      localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
      localStorage.setItem(GAME_SYNC_CHANNEL_KEY, JSON.stringify(directPayload));
    } catch (err) {
      console.warn('[broadcastGameState localStorage error]:', err);
    }
  }

  // 2. BroadcastChannel (0ms memory transport)
  gameBroadcast.postMessage(payload);
  if (typeof window !== 'undefined' && (window as any).broadcastChannel) {
    try {
      (window as any).broadcastChannel.postMessage(directPayload);
    } catch {}
  }

  // 3. Primary Network Sync via Firebase Realtime Database
  pushGameState(payload);
}

/**
 * Receptor (Ventana ?view=display):
 * Lee de inmediato 'puerto_azul_live_state' o 'game_sync_channel' desde localStorage al iniciar
 */
export function getStoredGameState(): UnifiedGameState | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    // 1. Direct game_sync_channel check
    const rawDirect = localStorage.getItem(GAME_SYNC_CHANNEL_KEY);
    if (rawDirect) {
      const parsedDirect = JSON.parse(rawDirect);
      if (parsedDirect && parsedDirect.fullState) {
        return parsedDirect.fullState as UnifiedGameState;
      } else if (parsedDirect && typeof parsedDirect.timestamp === 'number') {
        const isGame = parsedDirect.stage === 'GAME';
        return {
          logoHeaderData: parsedDirect.logo || '/header_logo.png',
          clubLocation: 'NAIGUATÁ, VARGAS',
          clubName: parsedDirect.clubName || 'CLUB PUERTO AZUL',
          gameStage: isGame ? 'PLAYING' : 'SPLASH',
          showSplash: !isGame,
          currentParticipant: null,
          currentParticipantIndex: 0,
          currentQuestionIndex: parsedDirect.questionIndex ?? 0,
          currentLevel: (parsedDirect.questionIndex ?? 0) + 1,
          selectedAnswer: parsedDirect.selectedOption ?? null,
          selectedOption: parsedDirect.selectedOption ?? null,
          answerStatus: parsedDirect.answerStatus || 'idle',
          revealedLifelines: parsedDirect.lifelines || { fiftyFifty: false, audience: false, phone: false },
          hiddenOptions: [],
          activeTimer: parsedDirect.timer ?? null,
          activeModal: null,
          projectorMode: false,
          participants: [],
          lastUpdated: parsedDirect.timestamp,
        };
      }
    }

    const raw = localStorage.getItem(LIVE_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lastUpdated === 'number') {
        return parsed as UnifiedGameState;
      }
    }
  } catch (err) {
    console.warn('[getStoredGameState error]:', err);
  }
  return null;
}
