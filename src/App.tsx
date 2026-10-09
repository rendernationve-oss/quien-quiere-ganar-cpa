/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tv,
  ListOrdered,
  Users,
  Trophy,
  Download,
  UserCheck,
  ChevronRight,
  User,
  Play,
  Monitor,
  ExternalLink,
} from 'lucide-react';

import {
  Question,
  OptionLetter,
  LifelinesState,
  RevealedState,
  ParticipantSession,
} from './types/game';
import {
  PRIZE_LADDER,
  INITIAL_PARTICIPANTS,
} from './data/defaultQuestions';
import { sound, audioManager, AUDIO_FILES } from './utils/audio';
import {
  gameBroadcast,
  UnifiedGameState,
  GameStage,
  AnswerStatus,
  broadcastGameState,
  getStoredGameState,
  LIVE_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  GAME_SYNC_CHANNEL_KEY,
} from './utils/broadcastSync';
import { subscribeToGameState } from './utils/firebase';
import { SplashScreen } from './components/SplashScreen';
import { ClubLogo } from './components/ClubLogo';
import { ShowLogo } from './components/ShowLogo';
import { QuestionBox } from './components/QuestionBox';
import { OptionsRow } from './components/OptionsRow';
import { PrizeLadder } from './components/PrizeLadder';
import { LifelinesBar } from './components/LifelinesBar';
import { CorrectModal } from './components/Modals/CorrectModal';
import { IncorrectModal } from './components/Modals/IncorrectModal';
import { WinModal } from './components/Modals/WinModal';
import { AudienceModal } from './components/Modals/AudienceModal';
import { PhoneModal } from './components/Modals/PhoneModal';
import { AdminModal } from './components/Modals/AdminModal';
import { TournamentModal } from './components/Modals/TournamentModal';
import { generateSingleFileHtml } from './utils/singleFileHtmlGenerator';
import {
  LogoConfig,
  getInitialLogoConfig,
  persistLogoConfig,
  syncLogoFromPersistentDB,
  LOGO_EVENT_NAME,
} from './utils/logoStorage';

const TOURNAMENT_STORAGE_KEY = 'puerto_azul_tournament_v2';

// Golden Cup Trophy Icon with rich gold gradients and authentic chalice shapes
const GoldenCupIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="headerCupGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="25%" stopColor="#FCD34D" />
        <stop offset="65%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="headerCupShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Cup Left Handle */}
    <path
      d="M6.5 5.5C4 5.5 2.5 7.2 2.5 9.5C2.5 11.8 4.2 13.5 6.5 13.5V11.5C4.9 11.5 4.2 10.4 4.2 9.5C4.2 8.4 4.9 7.3 6.5 7.3V5.5Z"
      fill="url(#headerCupGold)"
      stroke="#B45309"
      strokeWidth="0.5"
    />

    {/* Cup Right Handle */}
    <path
      d="M17.5 5.5C20 5.5 21.5 7.2 21.5 9.5C21.5 11.8 19.8 13.5 17.5 13.5V11.5C19.1 11.5 19.8 10.4 19.8 9.5C19.8 8.4 19.1 7.3 17.5 7.3V5.5Z"
      fill="url(#headerCupGold)"
      stroke="#B45309"
      strokeWidth="0.5"
    />

    {/* Main Cup Body */}
    <path
      d="M6.5 4H17.5V9.5C17.5 13 15 15 12 15C9 15 6.5 13 6.5 9.5V4Z"
      fill="url(#headerCupGold)"
      stroke="#92400E"
      strokeWidth="0.6"
    />

    {/* Cup Rim Lip */}
    <rect
      x="5.5"
      y="3"
      width="13"
      height="1.8"
      rx="0.9"
      fill="#FEF08A"
      stroke="#B45309"
      strokeWidth="0.5"
    />

    {/* Cup Front Shine */}
    <path
      d="M8 4.5H10.5C9.5 8 10 11.5 11.5 13.5C9.5 13 8 10.5 8 4.5Z"
      fill="url(#headerCupShine)"
    />

    {/* Center Star Emblem */}
    <path
      d="M12 7.2L12.7 8.7L14.3 8.9L13.1 10.1L13.4 11.7L12 10.9L10.6 11.7L10.9 10.1L9.7 8.9L11.3 8.7L12 7.2Z"
      fill="#FFFBEB"
      stroke="#D97706"
      strokeWidth="0.3"
    />

    {/* Stem */}
    <path
      d="M10.5 15H13.5V17.5H10.5V15Z"
      fill="url(#headerCupGold)"
      stroke="#B45309"
      strokeWidth="0.5"
    />

    {/* Pedestal Tier */}
    <path
      d="M8.5 17.5H15.5L16.2 19.2H7.8L8.5 17.5Z"
      fill="url(#headerCupGold)"
      stroke="#92400E"
      strokeWidth="0.5"
    />

    {/* Pedestal Base Slab */}
    <rect
      x="6.5"
      y="19.2"
      width="11"
      height="2.3"
      rx="0.8"
      fill="url(#headerCupGold)"
      stroke="#78350F"
      strokeWidth="0.6"
    />
  </svg>
);

export default function App() {
  // Dual-View Mode State:
  // - Modo Operador: default (shows moderator bar, controls, normal cursor)
  // - Modo Pantalla Pública / Clean Feed: triggered if URL has ?view=display or via toggle
  const [isDisplayView, setIsDisplayView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'display';
    }
    return false;
  });

  // Sync body class for display-view
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDisplayView) {
        document.body.classList.add('display-view');
      } else {
        document.body.classList.remove('display-view');
      }
    }
  }, [isDisplayView]);

  // Read immediately stored sync state when opening ?view=display so it never starts in blank/out of sync
  const initialSyncState = isDisplayView ? getStoredGameState() : null;

  // Participants Sessions State (5+ independent participant question sets)
  const [participants, setParticipants] = useState<ParticipantSession[]>(() => {
    if (initialSyncState?.participants && Array.isArray(initialSyncState.participants)) {
      return initialSyncState.participants;
    }
    try {
      const saved = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PARTICIPANTS;
  });

  const [currentParticipantIndex, setCurrentParticipantIndex] = useState<number>(
    () => initialSyncState?.currentParticipantIndex ?? 0
  );
  const [currentLevel, setCurrentLevel] = useState<number>(
    () => initialSyncState?.currentLevel ?? 1
  );
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(
    () => (initialSyncState?.selectedOption as OptionLetter | null) ?? null
  );
  const [revealedState, setRevealedState] = useState<RevealedState>(
    () => initialSyncState?.revealedState ?? 'idle'
  );
  const [hiddenOptions, setHiddenOptions] = useState<OptionLetter[]>(
    () => (initialSyncState?.hiddenOptions as OptionLetter[]) ?? []
  );
  const [lifelines, setLifelines] = useState<LifelinesState>(
    () => initialSyncState?.lifelines ?? {
      fiftyFifty: false,
      audience: false,
      phone: false,
    }
  );

  // Modals & Display State
  const [activeModal, setActiveModal] = useState<
    null | 'admin' | 'audience' | 'phone' | 'correct' | 'incorrect' | 'win' | 'tournament' | 'participants' | 'settings'
  >(() => {
    if (initialSyncState?.activeModal) {
      if (['admin', 'tournament'].includes(initialSyncState.activeModal)) return null;
      return initialSyncState.activeModal as any;
    }
    return null;
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [projectorMode, setProjectorMode] = useState<boolean>(
    () => initialSyncState?.projectorMode ?? false
  );
  const [showLadderMobile, setShowLadderMobile] = useState<boolean>(false);

 const [showSplash, setShowSplash] = useState<boolean>(true);
 const [isInitialSplash, setIsInitialSplash] = useState<boolean>(true);
 
  // Listen to popstate or url changes for view mode
  useEffect(() => {
    const checkView = () => {
      const params = new URLSearchParams(window.location.search);
      setIsDisplayView(params.get('view') === 'display');
    };
    window.addEventListener('popstate', checkView);
    return () => window.removeEventListener('popstate', checkView);
  }, []);

  // Sync background tension music with current active question level
  useEffect(() => {
    if (!showSplash && revealedState === 'idle') {
      audioManager.startTensionForLevel(currentLevel);
    }
  }, [showSplash, currentLevel, revealedState]);

  // Persistent Logo State - fixed always until admin modifies it
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(getInitialLogoConfig);

  useEffect(() => {
    // Asynchronously check persistent IndexedDB to ensure no quota or storage loss
    syncLogoFromPersistentDB((restored) => {
      setLogoConfig(restored);
    });

    const handleLogoEvent = (e: Event) => {
      const customEvt = e as CustomEvent<LogoConfig>;
      if (customEvt.detail) {
        setLogoConfig(customEvt.detail);
      } else {
        setLogoConfig(getInitialLogoConfig());
      }
    };

    window.addEventListener(LOGO_EVENT_NAME, handleLogoEvent);
    window.addEventListener('storage', handleLogoEvent);
    return () => {
      window.removeEventListener(LOGO_EVENT_NAME, handleLogoEvent);
      window.removeEventListener('storage', handleLogoEvent);
    };
  }, []);

  const handleUpdateLogo = useCallback((newConfig: LogoConfig) => {
    setLogoConfig(newConfig);
    persistLogoConfig(newConfig);
  }, []);

  // Active Participant Session
  const currentParticipant: ParticipantSession =
    participants[currentParticipantIndex] || participants[0];

  // Active question for the current participant & level
  const currentQuestion: Question =
    currentParticipant.questions.find((q) => q.id === currentLevel) ||
    currentParticipant.questions[0];

  // Current prize amount
  const currentPrize =
    PRIZE_LADDER.find((p) => p.level === currentLevel)?.amount || '100 Pts';

  // Calculate guaranteed safe haven prize
  const getSecuredPrize = useCallback((): string => {
    if (currentLevel > 10) return '32.000 Pts (Seguro 2)';
    if (currentLevel > 5) return '1.000 Pts (Seguro 1)';
    return '0 Pts';
  }, [currentLevel]);

  // Persist tournament sessions on change
  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(participants));
    } catch {}
  }, [participants]);

  // Sound mute sync
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    audioManager.setMuted(next);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Update participant progress in tournament list
  const updateParticipantRecord = useCallback(
    (
      status: 'in_progress' | 'eliminated' | 'completed',
      finalLevel: number,
      prize: string
    ) => {
      setParticipants((prev) =>
        prev.map((p, idx) =>
          idx === currentParticipantIndex
            ? {
                ...p,
                status,
                currentLevel: finalLevel,
                highestLevelReached: Math.max(p.highestLevelReached, finalLevel),
                prizeWon: prize,
                lifelines,
              }
            : p
        )
      );
    },
    [currentParticipantIndex, lifelines]
  );

  // Unified GameState snapshot generator
  const getCurrentSnapshot = useCallback((): UnifiedGameState => {
    const stage: GameStage = showSplash ? 'SPLASH' : (currentLevel >= 15 && revealedState === 'correct') ? 'GAME_OVER' : 'PLAYING';
    const status: AnswerStatus = revealedState === 'idle'
      ? 'idle'
      : revealedState === 'selected'
      ? 'selected'
      : revealedState === 'correct'
      ? 'correct'
      : 'wrong';

    return {
      logoHeaderData: logoConfig?.mode === 'custom' && logoConfig.customImageData ? logoConfig.customImageData : '/header_logo.png',
      clubLocation: 'NAIGUATÁ, VARGAS',
      clubName: 'CLUB PUERTO AZUL',
      gameStage: stage,
      currentParticipant: currentParticipant || null,
      currentParticipantIndex,
      currentQuestionIndex: Math.max(0, currentLevel - 1),
      currentLevel,
      selectedAnswer: selectedOption,
      answerStatus: status,
      revealedLifelines: lifelines,
      hiddenOptions,
      activeTimer: activeModal === 'phone' ? 30 : null,
      activeModal,
      projectorMode,
      logoConfig,
      participants,
      soundMuted,
      lastUpdated: Date.now(),
    };
  }, [
    showSplash,
    currentLevel,
    revealedState,
    logoConfig,
    currentParticipant,
    currentParticipantIndex,
    selectedOption,
    lifelines,
    hiddenOptions,
    activeModal,
    projectorMode,
    participants,
    soundMuted,
  ]);

  // Open Clean Feed Display in a new window/monitor using exact URL base and port
  const handleOpenDisplayView = useCallback(() => {
    broadcastGameState(getCurrentSnapshot());
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('view', 'display');
    const win = window.open(targetUrl.toString(), 'PuertoAzulCleanFeed');
    if (win) {
      displayWindowRef.current = win;
    }
  }, [getCurrentSnapshot]);

  // Handle Start From Splash
  const handleStartFromSplash = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_started_state', 'true');
    }
    setShowSplash(false);
    setIsInitialSplash(false);
    // 1. Splash Screen / Intro: Al pulsar "INICIAR JUEGO" o entrar al juego, detén la intro con fade-out y reproduce 'presentacion'.
    audioManager.stopIntroWithFadeOut(() => {
      audioManager.playPresentacion();
      setTimeout(() => {
        audioManager.startTensionForLevel(currentLevel);
      }, 1200);
    });
    broadcastGameState({
      ...getCurrentSnapshot(),
      gameStage: 'PLAYING',
      showSplash: false,
      isInitialSplash: false,
    } as any);
  }, [currentLevel, getCurrentSnapshot]);

  // Timestamp tracker to avoid re-applying stale snapshots
  const lastAppliedTimestampRef = useRef<number>(initialSyncState?.lastUpdated ?? 0);
  const displayWindowRef = useRef<Window | null>(null);

  // Centralized State Application for Public Display Receiver
  const applyIncomingState = useCallback(
    (s: any) => {
      if (!s) return;
      const incomingTs = typeof s.lastUpdated === 'number' ? s.lastUpdated : (s.timestamp || 0);
      if (incomingTs && incomingTs <= lastAppliedTimestampRef.current) {
        return;
      }
      if (incomingTs) {
        lastAppliedTimestampRef.current = incomingTs;
      }

      if (s.participants && Array.isArray(s.participants)) {
        setParticipants(s.participants);
      }
      if (typeof s.currentParticipantIndex === 'number') {
        setCurrentParticipantIndex(s.currentParticipantIndex);
      }
      if (typeof s.currentLevel === 'number') {
        setCurrentLevel(s.currentLevel);
      } else if (typeof s.currentQuestionIndex === 'number') {
        setCurrentLevel(s.currentQuestionIndex + 1);
      }

      const incomingOption = s.selectedAnswer !== undefined ? s.selectedAnswer : s.selectedOption;
      if (incomingOption !== undefined) {
        setSelectedOption(incomingOption as OptionLetter | null);
      }

      if (s.answerStatus) {
        if (s.answerStatus === 'idle') setRevealedState('idle');
        else if (s.answerStatus === 'selected') setRevealedState('selected');
        else if (s.answerStatus === 'correct') setRevealedState('correct');
        else if (s.answerStatus === 'wrong') setRevealedState('incorrect');
      } else if (s.revealedState) {
        setRevealedState(s.revealedState);
      }

      if (s.hiddenOptions && Array.isArray(s.hiddenOptions)) {
        setHiddenOptions(s.hiddenOptions as OptionLetter[]);
      }

      const incomingLifelines = s.revealedLifelines || s.lifelines;
      if (incomingLifelines) {
        setLifelines(incomingLifelines);
      }

      if (s.activeModal !== undefined) {
        if (isDisplayView && (s.activeModal === 'admin' || s.activeModal === 'tournament')) {
          setActiveModal(null);
        } else {
          setActiveModal(s.activeModal as any);
        }
      }

      if (s.gameStage) {
        if (s.gameStage === 'SPLASH') {
          setShowSplash(true);
        } else if (s.gameStage === 'PLAYING' && s.actionType === 'START_GAME') {
          setShowSplash(false);
          setIsInitialSplash(false);
        }
      }
      if (s.gameStage) {
        if (s.gameStage === 'SPLASH') {
          setShowSplash(true);
        } else if (s.gameStage === 'PLAYING' && s.actionType === 'START_GAME') {
          setShowSplash(false);
          setIsInitialSplash(false);
        }
      }

      if (s.logoConfig) {
        setLogoConfig(s.logoConfig);
      } else if (s.logoHeaderData && s.logoHeaderData.startsWith('data:image')) {
        setLogoConfig({
          mode: 'custom',
          customImageData: s.logoHeaderData,
          updatedAt: incomingTs,
        });
      }
      if (typeof s.projectorMode === 'boolean') {
        setProjectorMode(s.projectorMode);
      }

      // Audio effects mirroring operator actions
      if (s.actionType === 'START_GAME' || (s.gameStage === 'PLAYING' && showSplash)) {
        audioManager.stopIntroWithFadeOut(() => {
          audioManager.playPresentacion();
          setTimeout(() => {
            audioManager.startTensionForLevel(s.currentLevel || currentLevel);
          }, 1200);
        });
      } else if (s.actionType === 'SELECT_OPTION' || s.answerStatus === 'selected') {
        audioManager.playSelect();
        audioManager.lowerTensionVolume();
      } else if (s.actionType === 'CONFIRM_ANSWER' || s.answerStatus === 'correct' || s.answerStatus === 'wrong') {
        if (s.payload?.isCorrect || s.answerStatus === 'correct') {
          audioManager.playAcierto();
        } else {
          audioManager.playFallo(s.payload?.level || s.currentLevel || currentLevel);
        }
      } else if (s.actionType === 'NEXT_QUESTION') {
        audioManager.playSiguiente();
        setTimeout(() => {
          audioManager.startTensionForLevel(s.currentLevel || currentLevel);
        }, 800);
      } else if (
        s.actionType === 'NEXT_PARTICIPANT' ||
        s.actionType === 'SELECT_PARTICIPANT' ||
        s.actionType === 'RESTART_PARTICIPANT' ||
        s.actionType === 'SHOW_SPLASH' ||
        s.gameStage === 'SPLASH'
      ) {
        audioManager.stopTension();
        audioManager.playIntroSplash();
      } else if (s.actionType === 'USE_FIFTY_FIFTY') {
        audioManager.playComodin5050();
      } else if (s.actionType === 'USE_AUDIENCE') {
        audioManager.playAudiencia();
      } else if (s.actionType === 'USE_PHONE') {
        audioManager.playPhoneRing();
      }
    },
    [isDisplayView, currentLevel, showSplash]
  );

  // 2. RECEPTOR (?view=display): Primary Firebase RTDB Subscription + Hybrid Fallbacks
  useEffect(() => {
    if (!isDisplayView) return;

    // Primary Real-time Network Channel: Firebase Realtime Database
    const unsubscribeFirebase = subscribeToGameState((firebaseState) => {
      if (firebaseState) {
        applyIncomingState(firebaseState);
      }
    });

    const handleWindowMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SYNC_STATE' && e.data.payload) {
        applyIncomingState(e.data.payload);
      }
    };
    window.addEventListener('message', handleWindowMessage);

    // a) Immediate read upon mount: DEBE leer obligatoriamente 'puerto_azul_live_state' desde localStorage
    const initialData = getStoredGameState();
    if (initialData) {
      applyIncomingState(initialData);
    }

    // b) BroadcastChannel Listener: aplica los cambios recibidos al instante
    const unsubscribeBroadcast = gameBroadcast.subscribe((state) => {
      applyIncomingState(state);
    });

    // c) LocalStorage Event Listener: escucha cambios de 'game_sync_channel', 'puerto_azul_live_state' y legacy
    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === GAME_SYNC_CHANNEL_KEY || e.key === LIVE_STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) &&
        e.newValue
      ) {
        try {
          const parsed = JSON.parse(e.newValue);
          applyIncomingState(parsed.fullState || parsed);
        } catch (err) {
          console.warn('[Storage sync parse error]:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // d) Polling Fallback: un setInterval de 100ms que compare la marca de tiempo en localStorage y actualice el estado si cambió
    const pollInterval = setInterval(() => {
      try {
        const raw =
          localStorage.getItem(GAME_SYNC_CHANNEL_KEY) ||
          localStorage.getItem(LIVE_STORAGE_KEY) ||
          localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const incomingTs =
            typeof parsed?.timestamp === 'number'
              ? parsed.timestamp
              : typeof parsed?.lastUpdated === 'number'
              ? parsed.lastUpdated
              : 0;
          if (parsed && incomingTs > lastAppliedTimestampRef.current) {
            applyIncomingState(parsed.fullState || parsed);
          }
        }
      } catch (err) {
        console.warn('[Polling sync error]:', err);
      }
    }, 100);

    return () => {
      unsubscribeFirebase();
      window.removeEventListener('message', handleWindowMessage);
      unsubscribeBroadcast();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [isDisplayView, applyIncomingState]);

  // 1. EMISOR (Ventana del Operador): Guardar y transmitir automáticamente cada cambio de estado
  useEffect(() => {
    if (!isDisplayView) {
      const snapshot = getCurrentSnapshot();
      broadcastGameState(snapshot);
      if (displayWindowRef.current && !displayWindowRef.current.closed) {
        displayWindowRef.current.postMessage({ type: 'SYNC_STATE', payload: snapshot }, '*');
      }
    }
  }, [
    isDisplayView,
    participants,
    currentParticipantIndex,
    currentLevel,
    selectedOption,
    revealedState,
    hiddenOptions,
    lifelines,
    activeModal,
    showSplash,
    isInitialSplash,
    logoConfig,
    projectorMode,
    getCurrentSnapshot,
  ]);

  // Handle Option Click / Confirmation logic:
  // 1st click: selects option -> turns NARANJA (glow-selected-orange)
  // 2nd click on the same option: confirms!
  // If correct: turns VERDE (glow-correct-green), opens CorrectModal.
  // If incorrect: turns ROJO (glow-wrong-red), opens IncorrectModal.
  const handleSelectOption = (letter: OptionLetter) => {
    if (isDisplayView || revealedState !== 'idle' || hiddenOptions.includes(letter)) return;

    if (selectedOption !== letter) {
      setSelectedOption(letter);
      audioManager.playSelect();
      // 3. Selección de respuesta (Amarillo): Baja el volumen de la pista de tensión activa al 30% mientras se espera la confirmación dramática.
      audioManager.lowerTensionVolume();
      broadcastGameState(
        {
          ...getCurrentSnapshot(),
          selectedOption: letter,
        },
        'SELECT_OPTION',
        { letter }
      );
    } else {
      confirmFinalAnswer(letter);
    }
  };

  const confirmFinalAnswer = (letter: OptionLetter) => {
    if (isDisplayView) return;
    const isCorrect = letter === currentQuestion.correctAnswer;
    const secured = getSecuredPrize();

    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        revealedState: isCorrect ? 'correct' : 'incorrect',
      },
      'CONFIRM_ANSWER',
      {
        letter,
        isCorrect,
        level: currentLevel,
        securedPrize: secured,
        prizeWon: currentPrize,
      }
    );

    if (isCorrect) {
      setRevealedState('correct');
      // 4. Revelación de Acierto (Verde): Detén la pista de tensión y reproduce 'acierto'.
      audioManager.playAcierto();

      setTimeout(() => {
        if (currentLevel === 15) {
          audioManager.playGrandWin();
          updateParticipantRecord('completed', 15, '1.000.000 Pts');
          setActiveModal('win');
        } else {
          updateParticipantRecord('in_progress', currentLevel, currentPrize);
          setActiveModal('correct');
        }
      }, 1000);
    } else {
      setRevealedState('incorrect');
      // 5. Revelación de Error (Rojo): Detén la pista de tensión. Si es entre 1 y 14 reproduce 'fallo', si es 15 reproduce 'fallo15'.
      audioManager.playFallo(currentLevel);

      // Suspenso dramático: mantener visible durante exactamente 5 segundos (5000 ms)
      // la respuesta seleccionada (en rojo) y la correcta (en verde) antes de mostrar el modal
      setTimeout(() => {
        updateParticipantRecord('eliminated', currentLevel, secured);
        setActiveModal('incorrect');
      }, 5000);
    }
  };

  // Next Question for the current participant
  const handleNextQuestion = () => {
    setActiveModal(null);
    broadcastGameState({ ...getCurrentSnapshot(), activeModal: null }, 'CLOSE_MODAL');
    if (currentLevel < 15) {
      // 4. Al pulsar "Siguiente Pregunta", reproduce 'siguiente' antes de reiniciar la música del nivel correspondiente.
      audioManager.playSiguiente();
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      setSelectedOption(null);
      setRevealedState('idle');
      setHiddenOptions([]);
      updateParticipantRecord('in_progress', nextLvl, PRIZE_LADDER.find(p => p.level === nextLvl)?.amount || '');
      setTimeout(() => {
        audioManager.startTensionForLevel(nextLvl);
      }, 800);
      broadcastGameState(
        {
          ...getCurrentSnapshot(),
          activeModal: null,
          currentLevel: nextLvl,
          selectedOption: null,
          revealedState: 'idle',
          hiddenOptions: [],
        },
        'NEXT_QUESTION',
        { level: nextLvl }
      );
    }
  };

  // Switch to Next Participant in Tournament
  const handleNextParticipant = () => {
    setActiveModal(null);
    const nextIdx = (currentParticipantIndex + 1) % participants.length;
    setCurrentParticipantIndex(nextIdx);
    setCurrentLevel(1);
    setSelectedOption(null);
    setRevealedState('idle');
    setHiddenOptions([]);
    setLifelines({ fiftyFifty: false, audience: false, phone: false });
    audioManager.stopTension();
    audioManager.playIntroSplash();
    setShowSplash(true);
    setIsInitialSplash(false);
    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        activeModal: null,
        currentParticipantIndex: nextIdx,
        currentLevel: 1,
        selectedOption: null,
        revealedState: 'idle',
        hiddenOptions: [],
        lifelines: { fiftyFifty: false, audience: false, phone: false },
        showSplash: true,
        isInitialSplash: false,
      },
      'NEXT_PARTICIPANT',
      { index: nextIdx }
    );
  };

  // Switch to specific participant
  const handleSelectParticipant = (index: number) => {
    setActiveModal(null);
    setCurrentParticipantIndex(index);
    setCurrentLevel(1);
    setSelectedOption(null);
    setRevealedState('idle');
    setHiddenOptions([]);
    setLifelines({ fiftyFifty: false, audience: false, phone: false });
    audioManager.stopTension();
    audioManager.playIntroSplash();
    setShowSplash(true);
    setIsInitialSplash(false);
    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        activeModal: null,
        currentParticipantIndex: index,
        currentLevel: 1,
        selectedOption: null,
        revealedState: 'idle',
        hiddenOptions: [],
        lifelines: { fiftyFifty: false, audience: false, phone: false },
        showSplash: true,
        isInitialSplash: false,
      },
      'SELECT_PARTICIPANT',
      { index }
    );
  };

  // Restart current participant's session
  const handleRestartCurrentParticipant = () => {
    setActiveModal(null);
    setCurrentLevel(1);
    setSelectedOption(null);
    setRevealedState('idle');
    setHiddenOptions([]);
    setLifelines({ fiftyFifty: false, audience: false, phone: false });
    audioManager.stopTension();
    updateParticipantRecord('in_progress', 1, '0 Pts');
    audioManager.playIntroSplash();
    setShowSplash(true);
    setIsInitialSplash(false);
    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        activeModal: null,
        currentLevel: 1,
        selectedOption: null,
        revealedState: 'idle',
        hiddenOptions: [],
        lifelines: { fiftyFifty: false, audience: false, phone: false },
        showSplash: true,
        isInitialSplash: false,
      },
      'RESTART_PARTICIPANT'
    );
  };

  // Lifelines
  const handleUseFiftyFifty = () => {
    if (isDisplayView || lifelines.fiftyFifty || revealedState !== 'idle') return;
    const incorrectLetters = (['A', 'B', 'C', 'D'] as OptionLetter[]).filter(
      (l) => l !== currentQuestion.correctAnswer
    );
    const shuffled = [...incorrectLetters].sort(() => 0.5 - Math.random());
    const eliminated = shuffled.slice(0, 2);

    setHiddenOptions(eliminated);
    setLifelines((prev) => ({ ...prev, fiftyFifty: true }));
    // 6. Al pulsar 50:50: Reproduce 'comodin5050' (sin cortar la tensión de fondo).
    audioManager.playComodin5050();

    let nextSelected = selectedOption;
    if (selectedOption && eliminated.includes(selectedOption)) {
      nextSelected = null;
      setSelectedOption(null);
      audioManager.restoreTensionVolume();
    }
    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        hiddenOptions: eliminated,
        lifelines: { ...lifelines, fiftyFifty: true },
        selectedOption: nextSelected,
      },
      'USE_FIFTY_FIFTY',
      { eliminated }
    );
  };

  const handleUseAudience = () => {
    if (isDisplayView || lifelines.audience || revealedState !== 'idle') return;
    setLifelines((prev) => ({ ...prev, audience: true }));
    // 6. Al pulsar Audiencia: Reproduce 'audiencia'.
    audioManager.playAudiencia();
    setActiveModal('audience');
    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        lifelines: { ...lifelines, audience: true },
        activeModal: 'audience',
      },
      'USE_AUDIENCE'
    );
  };

  const handleUsePhone = () => {
    if (isDisplayView || lifelines.phone || revealedState !== 'idle') return;
    setLifelines((prev) => ({ ...prev, phone: true }));
    audioManager.playPhoneRing();
    setActiveModal('phone');
    broadcastGameState(
      {
        ...getCurrentSnapshot(),
        lifelines: { ...lifelines, phone: true },
        activeModal: 'phone',
      },
      'USE_PHONE'
    );
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();

      // In Public Display Mode, disable normal input keys to prevent accidental audience clicks
      if (isDisplayView) {
        if (key === 'F') {
          toggleFullscreen();
        } else if (key === 'D' || e.key === 'Escape') {
          // Allow switching back to Operator Mode if testing on same tab
          window.history.replaceState({}, '', window.location.pathname);
          setIsDisplayView(false);
        }
        return;
      }

      if (showSplash) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartFromSplash();
        }
        return;
      }

      if (['A', 'B', 'C', 'D'].includes(key) && !activeModal) {
        handleSelectOption(key as OptionLetter);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (activeModal === 'correct') {
          handleNextQuestion();
        } else if (activeModal === 'incorrect') {
          handleNextParticipant();
        } else if (selectedOption && revealedState === 'idle' && !activeModal) {
          confirmFinalAnswer(selectedOption);
        }
      } else if (e.key === '1' && !activeModal) {
        handleUseFiftyFifty();
      } else if (e.key === '2' && !activeModal) {
        handleUseAudience();
      } else if (e.key === '3' && !activeModal) {
        handleUsePhone();
      } else if (e.key === 'Escape') {
        if (activeModal && !['correct', 'incorrect', 'win'].includes(activeModal)) {
          setActiveModal(null);
          gameBroadcast.send('CLOSE_MODAL');
        }
      } else if (key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, revealedState, activeModal, currentQuestion, lifelines, isDisplayView, showSplash, handleStartFromSplash]);

  // Admin Actions
  const handleSaveParticipantName = (index: number, newName: string) => {
    setParticipants((prev) => {
      const updated = prev.map((p, idx) => (idx === index ? { ...p, name: newName } : p));
      gameBroadcast.send('UPDATE_PARTICIPANTS', updated);
      return updated;
    });
  };

  const handleSaveQuestion = (participantIndex: number, updatedQuestion: Question) => {
    setParticipants((prev) => {
      const updated = prev.map((p, idx) =>
        idx === participantIndex
          ? {
              ...p,
              questions: p.questions.map((q) =>
                q.id === updatedQuestion.id ? updatedQuestion : q
              ),
            }
          : p
      );
      gameBroadcast.send('UPDATE_PARTICIPANTS', updated);
      return updated;
    });
  };

  const handleAddParticipant = () => {
    const newNum = participants.length + 1;
    const newSession: ParticipantSession = {
      id: `participant-${Date.now()}`,
      participantNumber: newNum,
      name: `Participante ${newNum} - Socio Puerto Azul`,
      questions: JSON.parse(JSON.stringify(INITIAL_PARTICIPANTS[0].questions)),
      status: 'not_started',
      currentLevel: 1,
      highestLevelReached: 0,
      prizeWon: '0 Pts',
      lifelines: { fiftyFifty: false, audience: false, phone: false },
    };
    setParticipants((prev) => {
      const updated = [...prev, newSession];
      gameBroadcast.send('UPDATE_PARTICIPANTS', updated);
      return updated;
    });
  };

  const handleDeleteParticipant = (index: number) => {
    if (participants.length <= 5) {
      alert('Se requiere un mínimo de 5 participantes en el torneo.');
      return;
    }
    setParticipants((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      gameBroadcast.send('UPDATE_PARTICIPANTS', updated);
      return updated;
    });
    if (currentParticipantIndex >= participants.length - 1) {
      setCurrentParticipantIndex(0);
    }
  };

  const handleRestoreDefaults = () => {
    setParticipants(INITIAL_PARTICIPANTS);
    setCurrentParticipantIndex(0);
    setCurrentLevel(1);
    try {
      localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
    } catch {}
    gameBroadcast.send('UPDATE_PARTICIPANTS', INITIAL_PARTICIPANTS);
  };

  const handleImportTournament = (imported: ParticipantSession[]) => {
    setParticipants(imported);
    setCurrentParticipantIndex(0);
    setCurrentLevel(1);
    gameBroadcast.send('UPDATE_PARTICIPANTS', imported);
  };

  const handleJumpToParticipantAndLevel = (partIdx: number, lvl: number) => {
    setCurrentParticipantIndex(partIdx);
    setCurrentLevel(lvl);
    setSelectedOption(null);
    setRevealedState('idle');
    setHiddenOptions([]);
    broadcastGameState({
      ...getCurrentSnapshot(),
      currentParticipantIndex: partIdx,
      currentLevel: lvl,
      selectedAnswer: null,
      answerStatus: 'idle',
      hiddenOptions: [],
    });
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateSingleFileHtml(participants, logoConfig);
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

  // Next participant label for buttons
  const nextParticipant =
    participants[(currentParticipantIndex + 1) % participants.length];

  // Bloqueo estricto: mientras showSplash sea true, NUNCA se dibuja el juego ni la cabecera
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#040217] text-white">
        {isDisplayView && (
          <style>{`
            html, body, #root, * {
              cursor: none !important;
              user-select: none !important;
            }
            body.display-view, body.display-view * {
              pointer-events: none !important;
              user-select: none !important;
            }
          `}</style>
        )}
        <SplashScreen
          participantName={currentParticipant.name}
          participantNumber={currentParticipant.participantNumber}
          isInitialStart={isInitialSplash}
          logoConfig={logoConfig}
          soundMuted={soundMuted}
          onToggleSound={toggleSound}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onStartGame={handleStartFromSplash}
          isDisplayView={isDisplayView}
          onOpenDisplayView={handleOpenDisplayView}
          logoHeaderData={logoConfig?.mode === 'custom' && logoConfig.customImageData ? logoConfig.customImageData : '/header_logo.png'}
          clubName="CLUB PUERTO AZUL"
          clubLocation="NAIGUATÁ, VARGAS"
          onOpenTournamentModal={() => setActiveModal('tournament')}
          onOpenParticipantModal={() => setActiveModal('tournament')}
          onOpenSettingsModal={() => setActiveModal('admin')}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0f4c] via-[#09062b] to-[#040217] text-white flex flex-col justify-between overflow-x-hidden relative ${
        projectorMode ? 'text-lg' : ''
      }`}
    >
      {isDisplayView && (
        <style>{`
          html, body, #root, * {
            cursor: none !important;
            user-select: none !important;
          }
          body.display-view, body.display-view * {
            pointer-events: none !important;
            user-select: none !important;
          }
        `}</style>
      )}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* TOP HEADER BAR */}
      <header className="relative z-30 w-full bg-[#040817]/90 backdrop-blur-md border-b border-cyan-500/25 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <img
  src="/header_logo.png"
  alt="Club Puerto Azul"
  className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.4)] select-none pointer-events-none"
/>
          <div>
            <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wider text-cyan-200 uppercase font-['Orbitron',sans-serif] drop-shadow-md">
              ¿Quién Quiere Ganar en Puerto Azul?
            </h1>
            <p className="text-[11px] text-amber-300/90 font-semibold truncate max-w-[280px] sm:max-w-md">
              Turno: <strong>PARTICIPANTE {currentParticipant.participantNumber}</strong>
            </p>
          </div>
        </div>

        {/* Right: Controls & Indicators */}
        {!isDisplayView ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botón Destacado: Abrir Pantalla Pública / Proyector (Clean Feed) */}
            <button
              type="button"
              onClick={handleOpenDisplayView}
              title="Abrir Pantalla Pública / Proyector (Clean Feed para 2do monitor)"
              className="h-9 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.45)] border border-cyan-400/50 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-95 group shrink-0"
            >
              <Monitor className="w-4 h-4 text-cyan-200 group-hover:text-white" />
              <span className="hidden sm:inline">Pantalla Pública</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-300 group-hover:text-white shrink-0" />
            </button>

            {/* Participant Number Indicator: User icon and participant number without '#' */}
            <button
              type="button"
              onClick={() => setActiveModal('tournament')}
              title={`Participante ${currentParticipant.participantNumber} (${currentParticipant.name}) - Clic para cambiar`}
              className="h-9 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer shadow-sm group"
            >
              <User className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 shrink-0 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
              <span className="text-white group-hover:text-cyan-100 font-extrabold text-sm tracking-tight leading-none">
                {currentParticipant.participantNumber}
              </span>
            </button>

            {/* Tournament Button: Golden Cup with circular golden/amber border matching reference */}
            <button
              type="button"
              onClick={() => setActiveModal('tournament')}
              title="Ver Torneo y Clasificación"
              className="h-9 w-9 rounded-full bg-gradient-to-b from-amber-400/20 via-yellow-500/15 to-amber-700/30 border-2 border-amber-400 hover:border-yellow-300 hover:bg-amber-400/30 hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.45)] shrink-0"
            >
              <GoldenCupIcon className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
            </button>

            {/* Projector Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !projectorMode;
                setProjectorMode(next);
                gameBroadcast.send('SET_PROJECTOR_MODE', next);
              }}
              title="Modo Proyector (Textos aumentados)"
              className={`h-9 w-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                projectorMode
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundMuted ? 'Activar sonido sintetizado' : 'Silenciar sonido'}
              className="h-9 w-9 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Pantalla Completa [F]"
              className="h-9 w-9 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Ladder on Mobile */}
            <button
              type="button"
              onClick={() => setShowLadderMobile(!showLadderMobile)}
              className="h-9 w-9 rounded-xl bg-slate-800/80 text-cyan-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer lg:hidden"
              title="Ver Escala de Premios"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Splash Screen / Presentation Curtain Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowSplash(true);
                setIsInitialSplash(false);
                audioManager.stopTension();
                audioManager.playIntroSplash();
                gameBroadcast.send('SHOW_SPLASH');
              }}
              title="Mostrar Cortinilla de Presentación (Splash Screen)"
              className="h-9 w-9 rounded-xl bg-slate-800/80 text-cyan-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>

            {/* Admin Modal Button: only gear icon with TV/sound aesthetic */}
            <button
              type="button"
              onClick={() => setActiveModal('admin')}
              title="Panel de Administración"
              className="h-9 w-9 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* En Modo Pantalla Pública (Clean Feed): Oculta por completo los controles de moderación */
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 tracking-wider uppercase font-['Orbitron',sans-serif]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>En Vivo · Clean Feed</span>
            </div>
          </div>
        )}
      </header>

      {/* MAIN GAME STAGE */}
      <main className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-center p-3 sm:p-5 md:p-6 max-w-7xl mx-auto w-full gap-4 md:gap-8">
        
        {/* CENTER ARENA: Logo, Lifelines, Question Box, 4 Options in 2 Rows */}
        <div className="flex-1 w-full flex flex-col items-center justify-center max-w-4xl">
          
          {/* Logo & Current Prize Banner */}
          <div className="relative mb-1 md:mb-2 flex flex-col items-center">
            {/* Medallón Oficial del Concurso */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 relative flex items-center justify-center">
              <img 
                src="/show_logo.png" 
                alt="Quién Quiere Ganar" 
                className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] select-none pointer-events-none" 
              />
            </div>

            {/* Current Level Prize Tag */}
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider">
                Premio en Juego:
              </span>
              <span className="text-xs md:text-sm font-black text-amber-300 font-['Orbitron',sans-serif] tracking-wider">
                {currentPrize}
              </span>
            </div>
          </div>

          {/* Lifelines Bar */}
          <LifelinesBar
            lifelines={lifelines}
            onUseFiftyFifty={handleUseFiftyFifty}
            onUseAudience={handleUseAudience}
            onUsePhone={handleUsePhone}
            disabled={isDisplayView || revealedState !== 'idle'}
            isDisplayView={isDisplayView}
          />

          {/* Question Box (Precision Lozenge matching reference image) */}
          <QuestionBox
            levelNumber={currentLevel}
            questionText={currentQuestion.question}
          />

          {/* Options Grid: 2 Double-Capsule Vector SVG Rows */}
          <div className="w-full max-w-5xl my-2 space-y-2 sm:space-y-3">
            {/* ROW 1: Options A & B */}
            <OptionsRow
              rowId="row-ab"
              leftOption={{
                letter: 'A',
                text: currentQuestion.options.A,
                isSelected: selectedOption === 'A',
                isCorrect: currentQuestion.correctAnswer === 'A',
                isEliminated: hiddenOptions.includes('A'),
                onClick: () => handleSelectOption('A'),
              }}
              rightOption={{
                letter: 'B',
                text: currentQuestion.options.B,
                isSelected: selectedOption === 'B',
                isCorrect: currentQuestion.correctAnswer === 'B',
                isEliminated: hiddenOptions.includes('B'),
                onClick: () => handleSelectOption('B'),
              }}
              revealedState={revealedState}
            />

            {/* ROW 2: Options C & D */}
            <OptionsRow
              rowId="row-cd"
              leftOption={{
                letter: 'C',
                text: currentQuestion.options.C,
                isSelected: selectedOption === 'C',
                isCorrect: currentQuestion.correctAnswer === 'C',
                isEliminated: hiddenOptions.includes('C'),
                onClick: () => handleSelectOption('C'),
              }}
              rightOption={{
                letter: 'D',
                text: currentQuestion.options.D,
                isSelected: selectedOption === 'D',
                isCorrect: currentQuestion.correctAnswer === 'D',
                isEliminated: hiddenOptions.includes('D'),
                onClick: () => handleSelectOption('D'),
              }}
              revealedState={revealedState}
            />
          </div>
        </div>

        {/* SIDEBAR: Prize Ladder (Desktop / Projector) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <PrizeLadder currentLevel={currentLevel} />
        </aside>

        {/* MOBILE / TABLET DRAWER OVERLAY FOR LADDER */}
        {showLadderMobile && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center lg:hidden">
            <div className="w-full max-w-sm bg-[#050b1d] border-2 border-cyan-400 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
                <span className="font-bold text-sm text-cyan-300 font-['Orbitron',sans-serif]">
                  Escala de Premios
                </span>
                <button
                  type="button"
                  onClick={() => setShowLadderMobile(false)}
                  className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
              <PrizeLadder currentLevel={currentLevel} />
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR: Fast Status & Controls */}
      <footer className="relative z-30 w-full bg-[#030612]/95 border-t border-cyan-500/20 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-amber-300 font-bold font-['Orbitron',sans-serif]">
            {currentParticipant.name}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-slate-300 font-bold font-['Orbitron',sans-serif]">
            Nivel: {currentLevel} / 15
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-cyan-300 font-semibold hidden sm:inline">
            Seguro 1: 1.000 Pts
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-cyan-300 font-semibold hidden sm:inline">
            Seguro 2: 32.000 Pts
          </span>
        </div>

        {!isDisplayView && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNextParticipant}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Pasar a #{nextParticipant.participantNumber}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </footer>

      {/* MODALS */}
      {/* 1. Correct Modal */}
      {activeModal === 'correct' && (
        <CorrectModal
          levelNumber={currentLevel}
          prizeWon={currentPrize}
          onNextQuestion={handleNextQuestion}
        />
      )}

      {/* 2. Incorrect Modal (Supports moving directly to next participant!) */}
      {activeModal === 'incorrect' && (
        <IncorrectModal
          participantName={currentParticipant.name}
          nextParticipantName={nextParticipant.name}
          levelNumber={currentLevel}
          selectedLetter={selectedOption}
          correctLetter={currentQuestion.correctAnswer}
          correctAnswerText={currentQuestion.options[currentQuestion.correctAnswer]}
          securedPrize={getSecuredPrize()}
          onRestartGame={handleRestartCurrentParticipant}
          onNextParticipant={handleNextParticipant}
          onViewTournament={() => setActiveModal('tournament')}
        />
      )}

      {/* 3. Ultimate Winner Modal (Supports moving directly to next participant!) */}
      {activeModal === 'win' && (
        <WinModal
          participantName={currentParticipant.name}
          nextParticipantName={nextParticipant.name}
          onRestartGame={handleRestartCurrentParticipant}
          onNextParticipant={handleNextParticipant}
          onViewTournament={() => setActiveModal('tournament')}
        />
      )}

      {/* 4. Lifeline: Audience Modal */}
      {activeModal === 'audience' && (
        <AudienceModal
          correctOption={currentQuestion.correctAnswer}
          onClose={() => {
            setActiveModal(null);
            gameBroadcast.send('CLOSE_MODAL');
          }}
        />
      )}

      {/* 5. Lifeline: Phone Modal */}
      {activeModal === 'phone' && (
        <PhoneModal
          correctOption={currentQuestion.correctAnswer}
          onClose={() => {
            setActiveModal(null);
            gameBroadcast.send('CLOSE_MODAL');
          }}
        />
      )}

      {/* 6. Tournament Sessions Modal (Hidden in Clean Feed) */}
      {!isDisplayView && activeModal === 'tournament' && (
        <TournamentModal
          participants={participants}
          currentParticipantIndex={currentParticipantIndex}
          onSelectParticipant={handleSelectParticipant}
          onAddParticipant={handleAddParticipant}
          onResetTournament={handleRestoreDefaults}
          onClose={() => {
            setActiveModal(null);
            gameBroadcast.send('CLOSE_MODAL');
          }}
        />
      )}

      {/* 7. Admin Panel Modal (Hidden in Clean Feed) */}
      {!isDisplayView && activeModal === 'admin' && (
        <AdminModal
          participants={participants}
          currentParticipantIndex={currentParticipantIndex}
          logoConfig={logoConfig}
          onUpdateLogo={handleUpdateLogo}
          onSaveParticipantName={handleSaveParticipantName}
          onSaveQuestion={handleSaveQuestion}
          onAddParticipant={handleAddParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          onRestoreDefaults={handleRestoreDefaults}
          onImportTournament={handleImportTournament}
          onJumpToParticipantAndLevel={handleJumpToParticipantAndLevel}
          onClose={() => {
            setActiveModal(null);
            gameBroadcast.send('CLOSE_MODAL');
          }}
        />
      )}
    </div>
  );
}
