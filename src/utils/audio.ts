/**
 * Audio System & Manager for "¿Quién Quiere Ganar en Puerto Azul?"
 * Centralized track management, level-based tension loops, sound effects, and mute control.
 */

export const AUDIO_FILES = {
  introSplash: '/audio/Theme Quien Quiere Ser Millonario.mp3',
  mainThemeExt: '/audio/MainThemeExt.mp3',
  presentacion: '/audio/presentacion.mp3',
  tension1_5: '/audio/preguntas1a5.mp3',
  tension6_10: '/audio/preguntas6a10.mp3',
  tension11_14: '/audio/preguntas11a14.mp3',
  tension15: '/audio/pregunta15.mp3',
  acierto: '/audio/correcta.mp3',
  fallo: '/audio/incorrecta.mp3',
  fallo15: '/audio/15incorrecta.mp3',
  comodin5050: '/audio/comodin5050.mp3',
  audiencia: '/audio/audiencia.mp3',
  siguiente: '/audio/siguientePregunta.mp3',
  comerciales: '/audio/comerciales.mp3',
  regreso: '/audio/regreso.mp3',
} as const;

export type AudioTrackKey = keyof typeof AUDIO_FILES;

export const AUDIO_PATHS = {
  suspenso: '/audio/suspenso.mp3',
  acierto: '/audio/acierto.mp3',
  fallo: '/audio/fallo.mp3',
  comodin50: '/audio/5050.mp3',
  audiencia: '/audio/audiencia.mp3',
  intro: '/audio/intro.mp3',
  nextquestion: '/audio/nextquestion.mp3',
};

class AudioManager {
  private isMuted: boolean = false;
  private introAudio: HTMLAudioElement | null = null;
  private tensionAudio: HTMLAudioElement | null = null;
  private currentTensionKey: string | null = null;
  private cachedAudios: Map<string, HTMLAudioElement> = new Map();
  private fadeInterval: number | null = null;

  // Web Audio Context fallback for effects if audio files are unavailable or restricted
  private synthCtx: AudioContext | null = null;

  constructor() {
    // Read mute preference from localStorage if available
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cpa_sound_muted');
        if (stored !== null) {
          this.isMuted = stored === 'true';
        }
      }
    } catch {}
  }

  private getAudio(src: string): HTMLAudioElement {
    if (typeof window === 'undefined') {
      return {} as HTMLAudioElement;
    }
    let audio = this.cachedAudios.get(src);
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      this.cachedAudios.set(src, audio);
    }
    return audio;
  }

  private getSynthContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.synthCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.synthCtx = new AudioCtx();
      }
    }
    if (this.synthCtx && this.synthCtx.state === 'suspended') {
      this.synthCtx.resume().catch(() => {});
    }
    return this.synthCtx;
  }

  // --- MUTE & VOLUME CONTROLS ---

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('cpa_sound_muted', String(muted));
    } catch {}

    if (this.introAudio) {
      this.introAudio.volume = muted ? 0 : 0.6;
    }
    if (this.tensionAudio) {
      this.tensionAudio.volume = muted ? 0 : 0.8;
    }
    this.cachedAudios.forEach((audio) => {
      if (audio !== this.introAudio && audio !== this.tensionAudio) {
        audio.volume = muted ? 0 : 0.85;
      }
    });
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  // --- 1. SPLASH SCREEN / INTRO ---

  /**
   * Al mostrar el Splash Screen, reproduce en loop 'introSplash' a volumen moderado (0.6).
   */
  public playIntroSplash() {
    if (typeof window === 'undefined') return;
    this.stopTension();

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    try {
      if (!this.introAudio) {
        this.introAudio = new Audio(AUDIO_FILES.introSplash);
        this.introAudio.loop = true;
      }
      this.introAudio.volume = this.isMuted ? 0 : 0.6;
      this.introAudio.currentTime = 0;
      this.introAudio.play().catch(() => {});
    } catch {}
  }

  /**
   * Al pulsar "INICIAR JUEGO" o entrar al juego, detén la intro con fade-out y reproduce 'presentacion'.
   */
  public stopIntroWithFadeOut(onComplete?: () => void) {
    if (!this.introAudio) {
      onComplete?.();
      return;
    }

    const audio = this.introAudio;
    const startVol = audio.volume;
    const steps = 10;
    let step = 0;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    this.fadeInterval = window.setInterval(() => {
      step++;
      const nextVol = Math.max(0, startVol * (1 - step / steps));
      try {
        audio.volume = this.isMuted ? 0 : nextVol;
      } catch {}

      if (step >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
        this.introAudio = null;
        onComplete?.();
      }
    }, 50);
  }

  public playPresentacion() {
    this.playOneShot(AUDIO_FILES.presentacion, 0.85);
  }

  // --- 2. MÚSICA DE FONDO / TENSIÓN DINÁMICA POR NIVEL ---

  /**
   * Reproduce en loop la pista de tensión correspondiente al nivel:
   * - Preguntas 1 a 5: 'tension1_5'
   * - Preguntas 6 a 10: 'tension6_10'
   * - Preguntas 11 a 14: 'tension11_14'
   * - Pregunta 15: 'tension15'
   */
  public startTensionForLevel(level: number) {
    if (typeof window === 'undefined') return;

    let targetKey: AudioTrackKey = 'tension1_5';
    if (level >= 1 && level <= 5) {
      targetKey = 'tension1_5';
    } else if (level >= 6 && level <= 10) {
      targetKey = 'tension6_10';
    } else if (level >= 11 && level <= 14) {
      targetKey = 'tension11_14';
    } else if (level >= 15) {
      targetKey = 'tension15';
    }

    const targetSrc = AUDIO_FILES[targetKey];

    // If already playing this track, ensure full volume and continue
    if (this.tensionAudio && this.currentTensionKey === targetKey) {
      this.tensionAudio.volume = this.isMuted ? 0 : 0.8;
      if (this.tensionAudio.paused) {
        this.tensionAudio.play().catch(() => {});
      }
      return;
    }

    // Stop current track if switching
    this.stopTension();

    try {
      const audio = new Audio(targetSrc);
      audio.loop = true;
      audio.volume = this.isMuted ? 0 : 0.8;
      audio.play().catch(() => {
        // Fallback to synthesized tension if audio file is restricted
        this.startSynthTension();
      });
      this.tensionAudio = audio;
      this.currentTensionKey = targetKey;
    } catch {
      this.startSynthTension();
    }
  }

  /**
   * 3. Selección de respuesta (Amarillo):
   * Baja el volumen de la pista de tensión activa al 30% mientras se espera la confirmación dramática.
   */
  public lowerTensionVolume() {
    if (this.tensionAudio) {
      try {
        this.tensionAudio.volume = this.isMuted ? 0 : 0.8 * 0.3; // 24%
      } catch {}
    }
  }

  /**
   * Restaura el volumen de tensión al 100% (si se deselecciona o cambia de opinión)
   */
  public restoreTensionVolume() {
    if (this.tensionAudio) {
      try {
        this.tensionAudio.volume = this.isMuted ? 0 : 0.8;
      } catch {}
    }
  }

  /**
   * Detiene la pista de tensión activa
   */
  public stopTension() {
    if (this.tensionAudio) {
      try {
        this.tensionAudio.pause();
        this.tensionAudio.currentTime = 0;
      } catch {}
      this.tensionAudio = null;
      this.currentTensionKey = null;
    }
    this.stopSynthTension();
  }

  // --- 4. REVELACIÓN DE ACIERTO (VERDE) ---

  /**
   * Detén la pista de tensión y reproduce 'acierto'.
   */
  public playAcierto() {
    this.stopTension();
    this.playOneShot(AUDIO_FILES.acierto, 0.9);
  }

  /**
   * Al pulsar "Siguiente Pregunta", reproduce 'siguiente' antes de reiniciar la música del nivel correspondiente.
   */
  public playSiguiente() {
    this.playOneShot(AUDIO_FILES.siguiente, 0.85);
  }

  // --- 5. REVELACIÓN DE ERROR (ROJO) ---

  /**
   * Detén la pista de tensión.
   * Si es entre las preguntas 1 y 14, reproduce 'fallo'.
   * Si es la pregunta 15, reproduce 'fallo15'.
   */
  public playFallo(level: number) {
    this.stopTension();
    const track = level === 15 ? AUDIO_FILES.fallo15 : AUDIO_FILES.fallo;
    this.playOneShot(track, 0.95);
  }

  // --- 6. COMODINES ---

  /**
   * Al pulsar 50:50: Reproduce 'comodin5050' (sin cortar la tensión de fondo).
   */
  public playComodin5050() {
    this.playOneShot(AUDIO_FILES.comodin5050, 0.85);
  }

  /**
   * Al pulsar Audiencia: Reproduce 'audiencia'.
   */
  public playAudiencia() {
    this.playOneShot(AUDIO_FILES.audiencia, 0.85);
  }

  // --- OTHER TRACKS & EFFECTS ---

  public playMainThemeExt() {
    this.playOneShot(AUDIO_FILES.mainThemeExt, 0.7);
  }

  public playComerciales() {
    this.playOneShot(AUDIO_FILES.comerciales, 0.8);
  }

  public playRegreso() {
    this.playOneShot(AUDIO_FILES.regreso, 0.8);
  }

  public playSelect() {
    // Subtle click/select
    this.playSynthBeep(650, 0.08);
  }

  public playGrandWin() {
    this.stopTension();
    this.playOneShot(AUDIO_FILES.mainThemeExt, 0.9);
  }

  public playPhoneRing() {
    this.playSynthPhoneRing();
  }

  public playClockTick() {
    this.playSynthBeep(880, 0.04);
  }

  // Generic one-shot audio player with silent catch
  private playOneShot(src: string, volume: number = 0.8) {
    if (typeof window === 'undefined') return;
    try {
      const audio = new Audio(src);
      audio.volume = this.isMuted ? 0 : volume;
      audio.play().catch(() => {});
    } catch {}
  }

  // --- WEB AUDIO API SYNTHESIZER FALLBACKS ---
  private synthTensionOsc: OscillatorNode | null = null;
  private synthTensionGain: GainNode | null = null;

  private startSynthTension() {
    if (this.isMuted) return;
    const ctx = this.getSynthContext();
    if (!ctx) return;
    try {
      this.stopSynthTension();
      this.synthTensionGain = ctx.createGain();
      this.synthTensionGain.gain.setValueAtTime(0.08, ctx.currentTime);
      this.synthTensionOsc = ctx.createOscillator();
      this.synthTensionOsc.type = 'sawtooth';
      this.synthTensionOsc.frequency.setValueAtTime(65, ctx.currentTime);
      this.synthTensionOsc.connect(this.synthTensionGain);
      this.synthTensionGain.connect(ctx.destination);
      this.synthTensionOsc.start();
    } catch {}
  }

  private stopSynthTension() {
    if (this.synthTensionOsc) {
      try {
        this.synthTensionOsc.stop();
        this.synthTensionOsc.disconnect();
      } catch {}
      this.synthTensionOsc = null;
    }
    if (this.synthTensionGain) {
      try {
        this.synthTensionGain.disconnect();
      } catch {}
      this.synthTensionGain = null;
    }
  }

  private playSynthBeep(freq: number, dur: number) {
    if (this.isMuted) return;
    const ctx = this.getSynthContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  private playSynthPhoneRing() {
    if (this.isMuted) return;
    const ctx = this.getSynthContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      [440, 480].forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.setValueAtTime(0.1, t + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch {}
  }
}

export const audioManager = new AudioManager();

/**
 * Backward compatibility adapter for components referencing `sound`
 */
export const sound = {
  setMuted: (muted: boolean) => audioManager.setMuted(muted),
  getMuted: () => audioManager.getMuted(),
  toggleMute: () => audioManager.toggleMute(),
  playSelect: () => audioManager.playSelect(),
  startTension: (level: number = 1) => audioManager.startTensionForLevel(level),
  lowerTension: () => audioManager.lowerTensionVolume(),
  restoreTension: () => audioManager.restoreTensionVolume(),
  stopTension: () => audioManager.stopTension(),
  playCorrect: () => audioManager.playAcierto(),
  playWrong: (level: number = 1) => audioManager.playFallo(level),
  playFiftyFifty: () => audioManager.playComodin5050(),
  playAudience: () => audioManager.playAudiencia(),
  playPhoneRing: () => audioManager.playPhoneRing(),
  playClockTick: () => audioManager.playClockTick(),
  playGrandWin: () => audioManager.playGrandWin(),
  playIntro: () => audioManager.playPresentacion(),
  playIntroSplash: () => audioManager.playIntroSplash(),
  stopIntroWithFadeOut: (cb?: () => void) => audioManager.stopIntroWithFadeOut(cb),
  playSiguiente: () => audioManager.playSiguiente(),
};
