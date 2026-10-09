import { ParticipantSession, Question } from '../types/game';
import { LogoConfig } from './logoStorage';

/**
 * Generates a 100% self-contained single-file HTML version
 * of "¿Quién quiere ganar en Puerto Azul?" with 5+ participant sessions,
 * non-repeating questions, lozenges, chrome connector beams, and Web Audio API synth.
 */
export function generateSingleFileHtml(
  data: ParticipantSession[] | Question[],
  logoConfigParam?: LogoConfig
): string {
  let participantsData: ParticipantSession[];

  // If passed an array of questions, wrap into session format for backwards compatibility
  if (data.length > 0 && 'participantNumber' in data[0]) {
    participantsData = data as ParticipantSession[];
  } else {
    participantsData = [
      {
        id: 'participant-1',
        participantNumber: 1,
        name: 'Participante 1 - Socio Puerto Azul',
        questions: data as Question[],
        status: 'not_started',
        currentLevel: 1,
        highestLevelReached: 0,
        prizeWon: '0 Pts',
        lifelines: { fiftyFifty: false, audience: false, phone: false },
      },
    ];
  }

  const jsonParticipants = JSON.stringify(participantsData, null, 2);
  const activeLogo = logoConfigParam || { mode: 'puerto_azul' as const };
  const jsonLogo = JSON.stringify(activeLogo);

  let logoInnerHtml = '';
  if (activeLogo.mode === 'custom' && activeLogo.customImageData) {
    logoInnerHtml = `<img src="${activeLogo.customImageData}" alt="Logotipo Personalizado" class="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.35)]" />`;
  } else if (activeLogo.mode === 'millonario') {
    logoInnerHtml = `<svg class="w-full h-full" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="millGoldHtml" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="35%" stop-color="#fef08a" />
          <stop offset="70%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#a16207" />
        </linearGradient>
        <linearGradient id="millChromeHtml" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="25%" stop-color="#f8fafc" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="75%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        <radialGradient id="millCoreGlowHtml" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45" />
          <stop offset="40%" stop-color="#1e1b4b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#030712" stop-opacity="1" />
        </radialGradient>
        <path id="millTopPathHtml" d="M 34,76 A 68,68 0 0,1 166,76" />
        <path id="millBottomPathHtml" d="M 38,124 A 68,68 0 0,0 162,124" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#millCoreGlowHtml)" />
      <circle cx="100" cy="100" r="94" fill="none" stroke="#0ea5e9" stroke-width="1" opacity="0.6" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="url(#millChromeHtml)" stroke-width="2.5" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7" />
      <circle cx="100" cy="100" r="18" fill="#090d26" stroke="url(#millGoldHtml)" stroke-width="2" />
      <text x="100" y="106" text-anchor="middle" font-size="18" font-weight="900" fill="url(#millGoldHtml)" font-family="system-ui, sans-serif">?</text>
      <text fill="#ffffff" font-size="9.5" font-weight="900" letter-spacing="2.5" font-family="'Orbitron', sans-serif">
        <textPath href="#millTopPathHtml" startOffset="50%" text-anchor="middle">¿QUIÉN QUIERE SER?</textPath>
      </text>
      <text fill="url(#millGoldHtml)" font-size="11" font-weight="900" letter-spacing="3" font-family="'Orbitron', sans-serif">
        <textPath href="#millBottomPathHtml" startOffset="50%" text-anchor="middle">MILLONARIO</textPath>
      </text>
    </svg>`;
  } else if (activeLogo.mode === 'farito') {
    logoInnerHtml = `<svg class="w-full h-full" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="cpaBlueHtml" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#034078" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="#08182b" stroke="#38bdf8" stroke-width="3" />
      <circle cx="100" cy="100" r="84" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4 2" />
      <polygon points="40,65 160,100 40,135" fill="#f8fafc" stroke="#0284c7" stroke-width="2.5" />
      <polygon points="40,94 150,100 40,106" fill="url(#cpaBlueHtml)" />
      <polygon points="75,76 87,79 87,121 75,124" fill="url(#cpaBlueHtml)" />
      <text x="100" y="162" text-anchor="middle" font-size="10" font-weight="900" fill="#f8fafc" font-family="'Orbitron', sans-serif" letter-spacing="1.5">CLUB PUERTO AZUL</text>
      <text x="100" y="176" text-anchor="middle" font-size="8" font-weight="700" fill="#38bdf8" font-family="'Orbitron', sans-serif" letter-spacing="1">NAIGUATÁ 1955</text>
    </svg>`;
  } else {
    logoInnerHtml = `<svg class="w-full h-full" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="goldVortexHtml" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="30%" stop-color="#fef08a" />
          <stop offset="70%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
        <linearGradient id="chromeOuterHtml" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="20%" stop-color="#f8fafc" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="80%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        <radialGradient id="deepCenterGlowHtml" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.5" />
          <stop offset="45%" stop-color="#1e1b4b" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#020617" stop-opacity="1" />
        </radialGradient>
        <path id="tvTopArcHtml" d="M 34,75 A 68,68 0 0,1 166,75" />
        <path id="tvBottomArcHtml" d="M 40,125 A 68,68 0 0,0 160,125" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#deepCenterGlowHtml)" />
      <circle cx="100" cy="100" r="93" fill="none" stroke="url(#chromeOuterHtml)" stroke-width="2.5" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.6" />
      <circle cx="100" cy="100" r="77" fill="none" stroke="#facc15" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.75" />
      <g class="animate-[spin_65s_linear_infinite]" style="transform-origin: 100px 100px">
        <g transform="rotate(0 100 100)"><path d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42" fill="none" stroke="url(#goldVortexHtml)" stroke-width="2.8" stroke-linecap="round" opacity="0.9" /><circle cx="100" cy="18" r="2.2" fill="#fef08a" /></g>
        <g transform="rotate(60 100 100)"><path d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42" fill="none" stroke="url(#goldVortexHtml)" stroke-width="2.8" stroke-linecap="round" opacity="0.9" /><circle cx="100" cy="18" r="2.2" fill="#fef08a" /></g>
        <g transform="rotate(120 100 100)"><path d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42" fill="none" stroke="url(#goldVortexHtml)" stroke-width="2.8" stroke-linecap="round" opacity="0.9" /><circle cx="100" cy="18" r="2.2" fill="#fef08a" /></g>
        <g transform="rotate(180 100 100)"><path d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42" fill="none" stroke="url(#goldVortexHtml)" stroke-width="2.8" stroke-linecap="round" opacity="0.9" /><circle cx="100" cy="18" r="2.2" fill="#fef08a" /></g>
        <g transform="rotate(240 100 100)"><path d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42" fill="none" stroke="url(#goldVortexHtml)" stroke-width="2.8" stroke-linecap="round" opacity="0.9" /><circle cx="100" cy="18" r="2.2" fill="#fef08a" /></g>
        <g transform="rotate(300 100 100)"><path d="M 100,90 C 104,74 122,62 122,46 C 122,34 112,25 100,25 C 89,25 81,32 79,42" fill="none" stroke="url(#goldVortexHtml)" stroke-width="2.8" stroke-linecap="round" opacity="0.9" /><circle cx="100" cy="18" r="2.2" fill="#fef08a" /></g>
      </g>
      <text fill="#f8fafc" font-size="9" font-weight="900" letter-spacing="2.2" font-family="'Orbitron', sans-serif">
        <textPath href="#tvTopArcHtml" startOffset="50%" text-anchor="middle">¿QUIÉN QUIERE GANAR?</textPath>
      </text>
      <g>
        <polygon points="20,100 35,92 165,92 180,100 165,108 35,108" fill="#030712" stroke="url(#chromeOuterHtml)" stroke-width="1.6" />
        <polygon points="26,100 37,94 163,94 174,100 163,106 37,106" fill="#0b1736" stroke="#38bdf8" stroke-width="0.8" opacity="0.8" />
        <text x="100" y="104.5" text-anchor="middle" font-size="12.5" font-weight="900" letter-spacing="2.5" fill="url(#goldVortexHtml)" font-family="'Orbitron', sans-serif">PUERTO AZUL</text>
      </g>
      <text fill="#38bdf8" font-size="8" font-weight="800" letter-spacing="2.5" font-family="'Orbitron', sans-serif">
        <textPath href="#tvBottomArcHtml" startOffset="50%" text-anchor="middle">CLUB NAIGUATÁ</textPath>
      </text>
    </svg>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script>
    (function() {
      try {
        var _origFetch = window.fetch ? window.fetch.bind(window) : null;
        var _activeFetch = _origFetch;
        Object.defineProperty(window, 'fetch', {
          get: function() { return _activeFetch; },
          set: function(val) { _activeFetch = val; },
          configurable: true,
          enumerable: true
        });
      } catch (e) {}
    })();
  </script>
  <title>¿Quién Quiere Ganar en Puerto Azul? - Torneo 5 Socios</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: #040217;
      color: #ffffff;
      user-select: none;
      overflow-x: hidden;
    }
    .font-orbitron { font-family: 'Orbitron', sans-serif; }

    /* Precision TV Lozenge Shapes */
    .lozenge-outer {
      clip-path: polygon(
        28px 0%,
        calc(100% - 28px) 0%,
        100% 50%,
        calc(100% - 28px) 100%,
        28px 100%,
        0% 50%
      );
    }
    .lozenge-inner {
      clip-path: polygon(
        26px 0%,
        calc(100% - 26px) 0%,
        100% 50%,
        calc(100% - 26px) 100%,
        26px 100%,
        0% 50%
      );
    }
    @media (max-width: 640px) {
      .lozenge-outer {
        clip-path: polygon(18px 0%, calc(100% - 18px) 0%, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0% 50%) !important;
      }
      .lozenge-inner {
        clip-path: polygon(16px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0% 50%) !important;
      }
    }

    /* Metallic Chrome Border Gradient */
    .border-chrome-silver {
      background: linear-gradient(
        180deg,
        #ffffff 0%,
        #e2e8f0 18%,
        #94a3b8 42%,
        #475569 58%,
        #cbd5e1 82%,
        #ffffff 100%
      );
      filter: drop-shadow(0 0 7px rgba(226, 232, 240, 0.5));
    }

    /* Horizontal Connector Beams */
    .connector-beam {
      height: 2.5px;
      background: linear-gradient(
        180deg,
        #ffffff 0%,
        #cbd5e1 35%,
        #64748b 65%,
        #ffffff 100%
      );
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.7), 0 0 12px rgba(148, 163, 184, 0.4);
    }

    /* Neutral Deep Midnight / Indigo Fill */
    .bg-tv-deep-indigo {
      background: radial-gradient(
        ellipse at center,
        #150e42 0%,
        #0c082b 60%,
        #05041a 100%
      );
    }

    /* User's specified card style */
    .casilla-pregunta-respuesta {
      border-radius: 12px;
      border: 1px solid #E5E7EB;
      background-color: #FFFFFF;
      padding: 1.25rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    /* Interactive States (Amarillo selección inicial, Verde acierto, Rojo fallo) */
    .glow-selected-yellow {
      background: linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%) !important;
      box-shadow: 0 0 25px rgba(234, 179, 8, 0.95), inset 0 0 15px rgba(255, 255, 255, 0.6);
      filter: drop-shadow(0 0 16px rgba(234, 179, 8, 0.9)) !important;
      color: #0f172a !important;
    }
    .glow-selected-orange {
      background: linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%) !important;
      box-shadow: 0 0 25px rgba(234, 179, 8, 0.95), inset 0 0 15px rgba(255, 255, 255, 0.6);
      filter: drop-shadow(0 0 16px rgba(234, 179, 8, 0.9)) !important;
      color: #0f172a !important;
    }

    .glow-correct-green {
      background: linear-gradient(180deg, #10b981 0%, #059669 45%, #047857 100%) !important;
      box-shadow: 0 0 35px rgba(16, 185, 129, 0.95), inset 0 0 18px rgba(255, 255, 255, 0.6);
      filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.95)) !important;
      color: #ffffff !important;
      animation: pulse-green 1.2s infinite alternate ease-in-out;
    }

    .glow-wrong-red {
      background: linear-gradient(180deg, #ef4444 0%, #dc2626 45%, #991b1b 100%) !important;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.95), inset 0 0 15px rgba(255, 255, 255, 0.5);
      filter: drop-shadow(0 0 18px rgba(239, 68, 68, 0.9)) !important;
      color: #ffffff !important;
    }

    /* Refined elegant SVG metallic frame strokes (1.5px Non-Scaling Stroke) */
    svg path[class*="cls-"] {
      stroke-width: 1.5px !important;
      vector-effect: non-scaling-stroke !important;
    }

    @keyframes pulse-green {
      0% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.7); }
      100% { transform: scale(1.012); box-shadow: 0 0 40px rgba(16, 185, 129, 1); }
    }
  </style>
</head>
<body class="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0f4c] via-[#09062b] to-[#040217] flex flex-col justify-between">

  <!-- Header -->
  <header class="w-full bg-[#040817]/90 border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <img src="/header_logo.png" alt="Club Puerto Azul" style="height: 48px; width: auto; object-fit: contain; display: block;" onerror="this.style.display='none'">
      <div>
        <span class="font-bold text-sm text-cyan-200 tracking-wider font-orbitron hidden sm:inline">
          ¿QUIÉN QUIERE GANAR EN PUERTO AZUL?
        </span>
        <div id="lblCurrentParticipantName" class="text-xs text-slate-300 font-medium truncate max-w-[260px] sm:max-w-md">
          Participante 1
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Participant Indicator with User icon and number without '#' -->
      <button id="badgeCurrentParticipant" onclick="openModal('tournamentModal')" title="Ver Torneo" class="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center gap-2 cursor-pointer shadow-sm group">
        <svg class="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 shrink-0 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span id="badgeCurrentParticipantNumber" class="text-white font-extrabold text-sm tracking-tight leading-none">1</span>
      </button>

      <!-- Tournament Button: Golden Cup with circular golden/yellow border matching reference -->
      <button id="btnTournament" title="Ver Torneo y Clasificación" class="h-9 w-9 rounded-full bg-gradient-to-b from-amber-400/20 via-yellow-500/15 to-amber-700/30 border-2 border-amber-400 hover:border-yellow-300 hover:bg-amber-400/30 transition flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.45)] shrink-0">
        <svg class="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="cupGoldHtml" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFBEB" />
              <stop offset="25%" stop-color="#FCD34D" />
              <stop offset="65%" stop-color="#F59E0B" />
              <stop offset="100%" stop-color="#B45309" />
            </linearGradient>
            <linearGradient id="cupShineHtml" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#D97706" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M6.5 5.5C4 5.5 2.5 7.2 2.5 9.5C2.5 11.8 4.2 13.5 6.5 13.5V11.5C4.9 11.5 4.2 10.4 4.2 9.5C4.2 8.4 4.9 7.3 6.5 7.3V5.5Z" fill="url(#cupGoldHtml)" stroke="#B45309" stroke-width="0.5"/>
          <path d="M17.5 5.5C20 5.5 21.5 7.2 21.5 9.5C21.5 11.8 19.8 13.5 17.5 13.5V11.5C19.1 11.5 19.8 10.4 19.8 9.5C19.8 8.4 19.1 7.3 17.5 7.3V5.5Z" fill="url(#cupGoldHtml)" stroke="#B45309" stroke-width="0.5"/>
          <path d="M6.5 4H17.5V9.5C17.5 13 15 15 12 15C9 15 6.5 13 6.5 9.5V4Z" fill="url(#cupGoldHtml)" stroke="#92400E" stroke-width="0.6"/>
          <rect x="5.5" y="3" width="13" height="1.8" rx="0.9" fill="#FEF08A" stroke="#B45309" stroke-width="0.5"/>
          <path d="M8 4.5H10.5C9.5 8 10 11.5 11.5 13.5C9.5 13 8 10.5 8 4.5Z" fill="url(#cupShineHtml)"/>
          <path d="M12 7.2L12.7 8.7L14.3 8.9L13.1 10.1L13.4 11.7L12 10.9L10.6 11.7L10.9 10.1L9.7 8.9L11.3 8.7L12 7.2Z" fill="#FFFBEB" stroke="#D97706" stroke-width="0.3"/>
          <path d="M10.5 15H13.5V17.5H10.5V15Z" fill="url(#cupGoldHtml)" stroke="#B45309" stroke-width="0.5"/>
          <path d="M8.5 17.5H15.5L16.2 19.2H7.8L8.5 17.5Z" fill="url(#cupGoldHtml)" stroke="#92400E" stroke-width="0.5"/>
          <rect x="6.5" y="19.2" width="11" height="2.3" rx="0.8" fill="url(#cupGoldHtml)" stroke="#78350F" stroke-width="0.6"/>
        </svg>
      </button>

      <!-- Sound Toggle -->
      <button id="btnSound" title="Silenciar / Activar sonido" class="h-9 w-9 rounded-xl bg-slate-800 text-cyan-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
      </button>

      <!-- Fullscreen Toggle -->
      <button id="btnFullscreen" title="Pantalla Completa" class="h-9 w-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
      </button>

      <!-- Admin Modal Button: only gear icon with TV/sound aesthetic -->
      <button id="btnAdmin" title="Panel de Administración" class="h-9 w-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </button>
    </div>
  </header>

  <!-- Main Game Stage -->
  <main class="flex-1 flex flex-col lg:flex-row items-center justify-center p-3 md:p-6 max-w-7xl mx-auto w-full gap-6">
    <div class="flex-1 w-full flex flex-col items-center justify-center max-w-4xl">
      
      <!-- Iconic Logo (TV Game Show Medallion / Custom Logo) -->
      <div id="gameLogoContainer" class="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-slate-300 bg-gradient-to-b from-[#1b1035] via-[#090b24] to-[#081538] shadow-[0_0_35px_rgba(59,130,246,0.7)] flex items-center justify-center mb-2 hover:scale-105 transition-transform duration-300">
        ${logoInnerHtml}
      </div>

      <!-- Lifelines -->
      <div class="flex items-center gap-6 my-2">
        <button id="btnLifeline50" class="w-14 h-14 rounded-full border-2 border-cyan-400 bg-blue-950 flex flex-col items-center justify-center font-orbitron font-black text-xs text-cyan-200 shadow-lg hover:border-yellow-300 transition">
          50:50
        </button>
        <button id="btnLifelineAudience" class="w-14 h-14 rounded-full border-2 border-cyan-400 bg-blue-950 flex flex-col items-center justify-center font-bold text-[10px] text-cyan-200 shadow-lg hover:border-yellow-300 transition">
          AUDIENCIA
        </button>
        <button id="btnLifelinePhone" class="w-14 h-14 rounded-full border-2 border-cyan-400 bg-blue-950 flex flex-col items-center justify-center font-bold text-[10px] text-cyan-200 shadow-lg hover:border-yellow-300 transition">
          CONSEJO
        </button>
      </div>

      <!-- 1. Question Box with refined 1.5px non-scaling stroke SVG -->
      <div class="relative w-full max-w-5xl my-3 sm:my-4 flex items-center justify-center select-none">
        <svg id="qboxSvg" class="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" viewBox="0 0 1920 178.93" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <defs>
            <style>
              .cls-1 { fill: url(#qbox_indigo_html); }
              .cls-2 { stroke: url(#qbox_chrome_top_html); }
              .cls-2, .cls-3 {
                fill: none;
                stroke-miterlimit: 10;
                stroke-width: 1.5px !important;
                vector-effect: non-scaling-stroke;
              }
              .cls-3 { stroke: url(#qbox_chrome_bottom_html); }
            </style>
            <linearGradient id="qbox_indigo_html" x1="960.02" y1="176.96" x2="960.02" y2="2.18" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#090622"/>
              <stop offset=".3" stop-color="#120c3a"/>
              <stop offset=".7" stop-color="#130c3c"/>
              <stop offset="1" stop-color="#080622"/>
            </linearGradient>
            <linearGradient id="qbox_chrome_top_html" x1="66.42" y1="-160.41" x2="1858.8" y2="319.86" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#fff"/>
              <stop offset=".15" stop-color="#635e69"/>
              <stop offset=".29" stop-color="#cfcdd1"/>
              <stop offset=".38" stop-color="#70697b"/>
              <stop offset=".42" stop-color="#55515c"/>
              <stop offset=".48" stop-color="#726e77"/>
              <stop offset=".57" stop-color="#433e4a"/>
              <stop offset=".69" stop-color="#aeacb1"/>
              <stop offset=".85" stop-color="#5e5964"/>
              <stop offset="1" stop-color="#e2e1e4"/>
            </linearGradient>
            <linearGradient id="qbox_chrome_bottom_html" x1="66.42" y1="-72.7" x2="1858.8" y2="407.57" gradientTransform="translate(0 266.64) scale(1 -1)" xlink:href="#qbox_chrome_top_html"/>
          </defs>
          <path class="cls-1" d="M1773.86,89.46c-1.94-1.06-3.1-2.13-3.91-3.19l-72.12-69.03c-10.82-10.85-19.4-15.06-29.17-15.06H253.34c-9.76,0-18.04,3.1-31.17,15.07l-.38.59-71.74,68.43c-.81,1.06-1.95,2.12-3.87,3.19h.88l-.88.22c1.92,1.07,3.06,2.13,3.87,3.19l71.74,68.43.38.59c13.13,11.97,21.41,15.07,31.17,15.07h1415.32c9.77,0,18.35-4.21,29.17-15.06l72.12-69.03c.81-1.06,1.97-2.13,3.91-3.19l-.47-.22h.47Z"/>
          <g>
            <path class="cls-2" vector-effect="non-scaling-stroke" stroke-width="1.5" d="M0,89.47h137.41c6.63,0,12.99-2.57,17.68-7.16L226.72,12.27c6.75-6.6,15.91-10.31,25.46-10.31h1414.06c9.42,0,18.47,3.61,25.2,10.06l73.55,70.46c4.67,4.48,10.95,6.98,17.5,6.98h137.51"/>
            <path class="cls-3" vector-effect="non-scaling-stroke" stroke-width="1.5" d="M0,89.47h137.41c6.63,0,12.99,2.57,17.68,7.16l71.64,70.03c6.75,6.6,15.91,10.31,25.46,10.31h1414.06c9.42,0,18.47-3.61,25.2-10.06l73.55-70.46c4.67-4.48,10.95-6.98,17.5-6.98h137.51"/>
          </g>
        </svg>
        <div class="relative z-[2] w-full min-h-[96px] sm:min-h-[118px] md:min-h-[135px] flex flex-col items-center justify-center text-center px-10 sm:px-16 md:px-24 py-4 sm:py-6">
          <div id="levelLabel" class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-orbitron mb-1">NIVEL 1 / 15</div>
          <h2 id="questionText" class="text-base sm:text-xl md:text-2xl font-bold text-white leading-relaxed max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            Cargando pregunta...
          </h2>
        </div>
      </div>

      <!-- 2. Options Grid: 2 Double-Capsule Vector SVG Rows -->
      <div class="w-full max-w-5xl my-2 space-y-2 sm:space-y-3 select-none">
        
        <!-- Row 1: Options A & B with SVG 2 -->
        <div class="relative w-full flex items-center justify-center min-h-[58px] sm:min-h-[66px] md:min-h-[74px]">
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" viewBox="0 0 1932.24 125" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
              <linearGradient id="grad_chrome_top_html" x1="12.24" y1="0" x2="1932.24" y2="62.5" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fff"/>
                <stop offset=".15" stop-color="#635e69"/>
                <stop offset=".29" stop-color="#cfcdd1"/>
                <stop offset=".38" stop-color="#70697b"/>
                <stop offset=".42" stop-color="#55515c"/>
                <stop offset=".48" stop-color="#726e77"/>
                <stop offset=".57" stop-color="#433e4a"/>
                <stop offset=".69" stop-color="#aeacb1"/>
                <stop offset=".85" stop-color="#5e5964"/>
                <stop offset="1" stop-color="#e2e1e4"/>
              </linearGradient>
              <linearGradient id="grad_chrome_bottom_html" x1="12.24" y1="125" x2="1932.24" y2="62.5" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fff"/>
                <stop offset=".15" stop-color="#635e69"/>
                <stop offset=".29" stop-color="#cfcdd1"/>
                <stop offset=".38" stop-color="#70697b"/>
                <stop offset=".42" stop-color="#55515c"/>
                <stop offset=".48" stop-color="#726e77"/>
                <stop offset=".57" stop-color="#433e4a"/>
                <stop offset=".69" stop-color="#aeacb1"/>
                <stop offset=".85" stop-color="#5e5964"/>
                <stop offset="1" stop-color="#e2e1e4"/>
              </linearGradient>
              <linearGradient id="grad_deep_html" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stop-color="#090622"/>
                <stop offset=".3" stop-color="#120c3a"/>
                <stop offset=".7" stop-color="#130c3c"/>
                <stop offset="1" stop-color="#080622"/>
              </linearGradient>
              <linearGradient id="grad_sel_html" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fef08a"/>
                <stop offset="30%" stop-color="#f59e0b"/>
                <stop offset="70%" stop-color="#ea580c"/>
                <stop offset="100%" stop-color="#c2410c"/>
              </linearGradient>
              <linearGradient id="grad_correct_html" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6ee7b7"/>
                <stop offset="30%" stop-color="#10b981"/>
                <stop offset="70%" stop-color="#059669"/>
                <stop offset="100%" stop-color="#047857"/>
              </linearGradient>
              <linearGradient id="grad_wrong_html" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fca5a5"/>
                <stop offset="30%" stop-color="#ef4444"/>
                <stop offset="70%" stop-color="#dc2626"/>
                <stop offset="100%" stop-color="#991b1b"/>
              </linearGradient>
            </defs>
            <path id="optPathA" fill="url(#grad_deep_html)" d="M132.5,62.5 L172.24,21.81 C178.19,15.68 187.83,12.02 197.93,12.02 H869.30 C879.40,12.02 888.99,15.62 894.94,21.65 L934.81,62.5 L894.94,103.35 C888.99,109.38 879.40,112.98 869.30,112.98 H197.93 C187.83,112.98 178.19,109.32 172.24,103.19 Z"/>
            <path id="optPathB" fill="url(#grad_deep_html)" d="M997.43,62.5 L1037.30,21.65 C1043.25,15.62 1052.84,12.02 1063.07,12.02 H1734.44 C1744.54,12.02 1754.18,15.68 1760.13,21.81 L1799.95,62.5 L1760.13,103.19 C1754.18,109.32 1744.54,112.98 1734.44,112.98 H1063.07 C1052.84,112.98 1043.25,109.38 1037.30,103.35 Z"/>
            <g>
              <path class="cls-2" stroke="url(#grad_chrome_top_html)" fill="none" stroke-miterlimit="10" stroke-width="1.5" vector-effect="non-scaling-stroke" d="M0,62.5 H132.5 L172.24,21.81 C178.19,15.68 187.83,12.02 197.93,12.02 H869.30 C879.40,12.02 888.99,15.62 894.94,21.65 L934.81,62.5 H997.43 L1037.30,21.65 C1043.25,15.62 1052.84,12.02 1063.07,12.02 H1734.44 C1744.54,12.02 1754.18,15.68 1760.13,21.81 L1799.95,62.5 H1932.24"/>
              <path class="cls-3" stroke="url(#grad_chrome_bottom_html)" fill="none" stroke-miterlimit="10" stroke-width="1.5" vector-effect="non-scaling-stroke" d="M0,62.5 H132.5 L172.24,103.19 C178.19,109.32 187.83,112.98 197.93,112.98 H869.30 C879.40,112.98 888.99,109.38 894.94,103.35 L934.81,62.5 H997.43 L1037.30,103.35 C1043.25,109.38 1052.84,112.98 1063.07,112.98 H1734.44 C1744.54,112.98 1754.18,109.32 1760.13,103.19 L1799.95,62.5 H1932.24"/>
            </g>
          </svg>
          <div class="relative z-10 w-full min-h-[58px] sm:min-h-[66px] md:min-h-[74px] flex items-center">
            <div class="w-[6.39%] shrink-0 pointer-events-none"></div>
            <button id="optBtnA" class="w-[40.35%] shrink-0 h-full py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 md:px-8 flex items-center justify-between text-left focus:outline-none transition-transform duration-150 select-none cursor-pointer active:scale-[0.985]">
              <div class="flex items-center gap-2 sm:gap-3 md:gap-3.5 flex-1 pr-1 truncate">
                <span class="text-slate-300 text-xs sm:text-sm drop-shadow font-serif shrink-0">◆</span>
                <span id="optLetterA" class="font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-amber-400">A:</span>
                <span id="optTextA" class="font-bold text-white tracking-wide text-xs sm:text-sm md:text-base leading-tight truncate">---</span>
              </div>
            </button>
            <div class="w-[6.52%] shrink-0 pointer-events-none"></div>
            <button id="optBtnB" class="w-[40.35%] shrink-0 h-full py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 md:px-8 flex items-center justify-between text-left focus:outline-none transition-transform duration-150 select-none cursor-pointer active:scale-[0.985]">
              <div class="flex items-center gap-2 sm:gap-3 md:gap-3.5 flex-1 pr-1 truncate">
                <span class="text-slate-300 text-xs sm:text-sm drop-shadow font-serif shrink-0">◆</span>
                <span id="optLetterB" class="font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-amber-400">B:</span>
                <span id="optTextB" class="font-bold text-white tracking-wide text-xs sm:text-sm md:text-base leading-tight truncate">---</span>
              </div>
            </button>
            <div class="w-[6.39%] shrink-0 pointer-events-none"></div>
          </div>
        </div>

        <!-- Row 2: Options C & D with SVG 2 -->
        <div class="relative w-full flex items-center justify-center min-h-[58px] sm:min-h-[66px] md:min-h-[74px]">
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" viewBox="0 0 1932.24 125" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <path id="optPathC" fill="url(#grad_deep_html)" d="M132.5,62.5 L172.24,21.81 C178.19,15.68 187.83,12.02 197.93,12.02 H869.30 C879.40,12.02 888.99,15.62 894.94,21.65 L934.81,62.5 L894.94,103.35 C888.99,109.38 879.40,112.98 869.30,112.98 H197.93 C187.83,112.98 178.19,109.32 172.24,103.19 Z"/>
            <path id="optPathD" fill="url(#grad_deep_html)" d="M997.43,62.5 L1037.30,21.65 C1043.25,15.62 1052.84,12.02 1063.07,12.02 H1734.44 C1744.54,12.02 1754.18,15.68 1760.13,21.81 L1799.95,62.5 L1760.13,103.19 C1754.18,109.32 1744.54,112.98 1734.44,112.98 H1063.07 C1052.84,112.98 1043.25,109.38 1037.30,103.35 Z"/>
            <g>
              <path class="cls-2" stroke="url(#grad_chrome_top_html)" fill="none" stroke-miterlimit="10" stroke-width="1.5" vector-effect="non-scaling-stroke" d="M0,62.5 H132.5 L172.24,21.81 C178.19,15.68 187.83,12.02 197.93,12.02 H869.30 C879.40,12.02 888.99,15.62 894.94,21.65 L934.81,62.5 H997.43 L1037.30,21.65 C1043.25,15.62 1052.84,12.02 1063.07,12.02 H1734.44 C1744.54,12.02 1754.18,15.68 1760.13,21.81 L1799.95,62.5 H1932.24"/>
              <path class="cls-3" stroke="url(#grad_chrome_bottom_html)" fill="none" stroke-miterlimit="10" stroke-width="1.5" vector-effect="non-scaling-stroke" d="M0,62.5 H132.5 L172.24,103.19 C178.19,109.32 187.83,112.98 197.93,112.98 H869.30 C879.40,112.98 888.99,109.38 894.94,103.35 L934.81,62.5 H997.43 L1037.30,103.35 C1043.25,109.38 1052.84,112.98 1063.07,112.98 H1734.44 C1744.54,112.98 1754.18,109.32 1760.13,103.19 L1799.95,62.5 H1932.24"/>
            </g>
          </svg>
          <div class="relative z-10 w-full min-h-[58px] sm:min-h-[66px] md:min-h-[74px] flex items-center">
            <div class="w-[6.39%] shrink-0 pointer-events-none"></div>
            <button id="optBtnC" class="w-[40.35%] shrink-0 h-full py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 md:px-8 flex items-center justify-between text-left focus:outline-none transition-transform duration-150 select-none cursor-pointer active:scale-[0.985]">
              <div class="flex items-center gap-2 sm:gap-3 md:gap-3.5 flex-1 pr-1 truncate">
                <span class="text-slate-300 text-xs sm:text-sm drop-shadow font-serif shrink-0">◆</span>
                <span id="optLetterC" class="font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-amber-400">C:</span>
                <span id="optTextC" class="font-bold text-white tracking-wide text-xs sm:text-sm md:text-base leading-tight truncate">---</span>
              </div>
            </button>
            <div class="w-[6.52%] shrink-0 pointer-events-none"></div>
            <button id="optBtnD" class="w-[40.35%] shrink-0 h-full py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 md:px-8 flex items-center justify-between text-left focus:outline-none transition-transform duration-150 select-none cursor-pointer active:scale-[0.985]">
              <div class="flex items-center gap-2 sm:gap-3 md:gap-3.5 flex-1 pr-1 truncate">
                <span class="text-slate-300 text-xs sm:text-sm drop-shadow font-serif shrink-0">◆</span>
                <span id="optLetterD" class="font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-amber-400">D:</span>
                <span id="optTextD" class="font-bold text-white tracking-wide text-xs sm:text-sm md:text-base leading-tight truncate">---</span>
              </div>
            </button>
            <div class="w-[6.39%] shrink-0 pointer-events-none"></div>
          </div>
        </div>
      </div>

      <!-- Hint status bar -->
      <div id="statusBar" class="mt-4 text-xs font-semibold text-cyan-300/80 bg-black/40 px-4 py-1.5 rounded-full border border-cyan-500/20 text-center">
        Pulsa A, B, C o D (o haz clic) para seleccionar. Luego pulsa nuevamente para confirmar.
      </div>
    </div>

    <!-- Prize Ladder Sidebar -->
    <div class="w-full lg:w-72 bg-[#050b1d]/90 backdrop-blur-md rounded-xl p-3 border border-cyan-500/30 shadow-lg">
      <div class="text-center font-bold text-xs uppercase tracking-widest text-cyan-300 font-orbitron pb-2 border-b border-cyan-500/20 mb-2">
        Escala de Premios
      </div>
      <div id="ladderContainer" class="space-y-1 text-xs"></div>
    </div>
  </main>

  <!-- Modals -->
  <!-- Correct Modal -->
  <div id="modalCorrect" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="max-w-md w-full bg-gradient-to-b from-[#091b42] to-[#040d21] border-2 border-amber-400 rounded-2xl p-6 text-center shadow-2xl">
      <div class="text-3xl font-black text-amber-300 font-orbitron mb-2">¡CORRECTO!</div>
      <p class="text-sm text-slate-300 mb-4">¡Nivel superado con éxito!</p>
      <div class="bg-black/50 p-4 rounded-xl mb-6">
        <span class="text-xs text-slate-400 block mb-1">Premio Acumulado</span>
        <span id="correctPrizeText" class="text-2xl font-bold text-yellow-300 font-orbitron">100 Pts</span>
      </div>
      <button id="btnNextLevel" class="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl uppercase tracking-wider font-orbitron shadow-lg hover:brightness-110 transition cursor-pointer">
        Siguiente Pregunta (Enter)
      </button>
    </div>
  </div>

  <!-- Incorrect Modal (With direct button to next participant!) -->
  <div id="modalIncorrect" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/85 backdrop-blur-md">
    <div class="max-w-md w-full bg-gradient-to-b from-[#2a0c12] to-[#15060a] border-2 border-red-500 rounded-2xl p-6 text-center shadow-2xl">
      <div class="text-2xl font-black text-red-500 font-orbitron mb-2">RESPUESTA INCORRECTA</div>
      <div id="incorrectCorrectAnswer" class="bg-black/50 p-3 rounded-xl mb-3 text-xs text-amber-300"></div>
      <div class="bg-black/50 p-3 rounded-xl mb-4">
        <span class="text-xs text-slate-400 block mb-1">Premio Seguro Alcanzado</span>
        <span id="incorrectSecuredPrize" class="text-xl font-bold text-yellow-300 font-orbitron">0 Pts</span>
      </div>
      <div class="space-y-2">
        <button id="btnNextParticipantModal" class="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl uppercase tracking-wider font-orbitron shadow-lg hover:brightness-110 transition cursor-pointer text-sm">
          Pasar al Siguiente Participante ➜
        </button>
        <button id="btnRestartCurrentModal" class="w-full py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700 transition cursor-pointer">
          Reintentar con este participante
        </button>
      </div>
    </div>
  </div>

  <!-- Tournament Leaderboard Modal -->
  <div id="modalTournament" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/85 backdrop-blur-md">
    <div class="max-w-2xl w-full bg-[#0a142c] border-2 border-cyan-400 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
        <h3 class="text-lg font-bold font-orbitron text-cyan-300">🏆 Torneo de Socios (5 Sesiones)</h3>
        <button id="btnCloseTournament" class="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
      </div>
      <div id="tournamentListContainer" class="space-y-2 my-3"></div>
      <div class="pt-3 border-t border-cyan-500/30 flex justify-end">
        <button id="btnCloseTournamentBottom" class="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <script>
    const defaultParticipants = ${jsonParticipants};
    const bakedLogo = ${jsonLogo};
    try {
      localStorage.setItem('puerto_azul_logo_config_v1', JSON.stringify(bakedLogo));
    } catch (e) {}
    let participants = JSON.parse(localStorage.getItem('puerto_azul_tournament_v2') || 'null') || defaultParticipants;
    let currentParticipantIndex = 0;
    let currentLevel = 1;
    let selectedOption = null;
    let revealedState = 'idle';
    let hiddenOptions = [];
    let lifelines = { fiftyFifty: false, audience: false, phone: false };

    const PRIZE_LADDER = [
      { level: 15, amount: '1.000.000 Pts', isSafe: true },
      { level: 14, amount: '500.000 Pts', isSafe: false },
      { level: 13, amount: '250.000 Pts', isSafe: false },
      { level: 12, amount: '125.000 Pts', isSafe: false },
      { level: 11, amount: '64.000 Pts', isSafe: false },
      { level: 10, amount: '32.000 Pts', isSafe: true },
      { level: 9, amount: '16.000 Pts', isSafe: false },
      { level: 8, amount: '8.000 Pts', isSafe: false },
      { level: 7, amount: '4.000 Pts', isSafe: false },
      { level: 6, amount: '2.000 Pts', isSafe: false },
      { level: 5, amount: '1.000 Pts', isSafe: true },
      { level: 4, amount: '500 Pts', isSafe: false },
      { level: 3, amount: '300 Pts', isSafe: false },
      { level: 2, amount: '200 Pts', isSafe: false },
      { level: 1, amount: '100 Pts', isSafe: false }
    ];

    let audioCtx = null;
    let isMuted = false;
    function getAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }
    function playTone(freq, duration, type='sine') {
      if (isMuted) return;
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    }
    function soundSelect() { playTone(587.33, 0.15, 'sine'); }
    function soundCorrect() {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.5, 'triangle'), i * 80);
      });
    }
    function soundWrong() {
      [155.56, 110.00].forEach(f => playTone(f, 0.8, 'sawtooth'));
    }

    function saveState() {
      try {
        localStorage.setItem('puerto_azul_tournament_v2', JSON.stringify(participants));
      } catch (e) {}
    }

    function renderHeader() {
      const p = participants[currentParticipantIndex] || participants[0];
      const badge = document.getElementById('badgeCurrentParticipant');
      if (badge) {
        badge.innerHTML = '<svg class="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 shrink-0 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span id="badgeCurrentParticipantNumber" class="text-white font-extrabold text-sm tracking-tight leading-none">' + p.participantNumber + '</span>';
      }
      document.getElementById('lblCurrentParticipantName').innerText = p.name;
    }

    function renderLadder() {
      const container = document.getElementById('ladderContainer');
      container.innerHTML = '';
      PRIZE_LADDER.forEach(item => {
        const isCurrent = item.level === currentLevel;
        const isPassed = item.level < currentLevel;
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center px-2 py-1 rounded font-bold transition-all ' +
          (isCurrent ? 'bg-cyan-600 text-white font-extrabold shadow-md scale-105' :
           isPassed ? 'text-amber-400 bg-amber-950/20' :
           item.isSafe ? 'text-white bg-slate-800/40' : 'text-slate-400');
        div.innerHTML = '<span>' + item.level + ' ◆ ' + (item.level === 5 ? 'SEGURO 1' : item.level === 10 ? 'SEGURO 2' : item.level === 15 ? 'PREMIO' : '') + '</span><span class="font-orbitron">' + item.amount + '</span>';
        container.appendChild(div);
      });
    }

    function loadQuestion() {
      const p = participants[currentParticipantIndex] || participants[0];
      const q = p.questions.find(item => item.id === currentLevel) || p.questions[0];
      renderHeader();
      document.getElementById('levelLabel').innerText = 'NIVEL ' + currentLevel + ' / 15';
      document.getElementById('questionText').innerText = q.question;
      ['A', 'B', 'C', 'D'].forEach(letter => {
        document.getElementById('optText' + letter).innerText = q.options[letter];
      });
      selectedOption = null;
      revealedState = 'idle';
      hiddenOptions = [];
      updateOptionStyles();
      renderLadder();
      document.getElementById('statusBar').innerText = 'Turno de ' + p.name + ' · Selecciona A, B, C o D.';
    }

    function updateOptionStyles() {
      const p = participants[currentParticipantIndex] || participants[0];
      const q = p.questions.find(item => item.id === currentLevel) || p.questions[0];
      ['A', 'B', 'C', 'D'].forEach(letter => {
        const btn = document.getElementById('optBtn' + letter);
        const path = document.getElementById('optPath' + letter);
        const letterEl = document.getElementById('optLetter' + letter);

        if (hiddenOptions.includes(letter)) {
          if (btn) {
            btn.style.opacity = '0.15';
            btn.style.pointerEvents = 'none';
          }
          if (path) path.style.opacity = '0.15';
        } else {
          if (btn) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
          }
          if (path) path.style.opacity = '1';
        }

        if (selectedOption === letter && revealedState === 'idle') {
          if (path) path.setAttribute('fill', 'url(#grad_sel_html)');
          if (letterEl) letterEl.className = 'font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-white';
        } else if (revealedState === 'correct' && q.correctAnswer === letter) {
          if (path) path.setAttribute('fill', 'url(#grad_correct_html)');
          if (letterEl) letterEl.className = 'font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-white';
        } else if (revealedState === 'incorrect') {
          if (selectedOption === letter) {
            if (path) path.setAttribute('fill', 'url(#grad_wrong_html)');
            if (letterEl) letterEl.className = 'font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-white';
          } else if (q.correctAnswer === letter) {
            if (path) path.setAttribute('fill', 'url(#grad_correct_html)');
            if (letterEl) letterEl.className = 'font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-white';
          } else {
            if (path) path.setAttribute('fill', 'url(#grad_deep_html)');
            if (letterEl) letterEl.className = 'font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-amber-400';
          }
        } else {
          if (path) path.setAttribute('fill', 'url(#grad_deep_html)');
          if (letterEl) letterEl.className = 'font-black font-orbitron tracking-wider text-xs sm:text-sm md:text-base shrink-0 text-amber-400';
        }
      });
    }

    function handleOptionClick(letter) {
      if (hiddenOptions.includes(letter) || revealedState !== 'idle') return;
      const p = participants[currentParticipantIndex] || participants[0];
      const q = p.questions.find(item => item.id === currentLevel) || p.questions[0];

      if (selectedOption !== letter) {
        selectedOption = letter;
        soundSelect();
        updateOptionStyles();
        document.getElementById('statusBar').innerText = 'Opción ' + letter + ' seleccionada en naranja. ¡Toca de nuevo o presiona Enter para confirmar!';
      } else {
        if (letter === q.correctAnswer) {
          revealedState = 'correct';
          updateOptionStyles();
          soundCorrect();
          setTimeout(() => {
            const prize = PRIZE_LADDER.find(item => item.level === currentLevel)?.amount || '';
            document.getElementById('correctPrizeText').innerText = prize;
            document.getElementById('modalCorrect').classList.remove('hidden');
            document.getElementById('modalCorrect').classList.add('flex');
          }, 800);
        } else {
          revealedState = 'incorrect';
          updateOptionStyles();
          soundWrong();
          setTimeout(() => {
            let secured = '0 Pts';
            if (currentLevel > 10) secured = '32.000 Pts';
            else if (currentLevel > 5) secured = '1.000 Pts';
            p.status = 'eliminated';
            p.prizeWon = secured;
            saveState();

            document.getElementById('incorrectCorrectAnswer').innerText = 'La respuesta correcta era ' + q.correctAnswer + ': ' + q.options[q.correctAnswer];
            document.getElementById('incorrectSecuredPrize').innerText = secured;
            document.getElementById('modalIncorrect').classList.remove('hidden');
            document.getElementById('modalIncorrect').classList.add('flex');
          }, 5000);
        }
      }
    }

    ['A', 'B', 'C', 'D'].forEach(letter => {
      document.getElementById('optBtn' + letter).addEventListener('click', () => handleOptionClick(letter));
    });

    document.getElementById('btnNextLevel').addEventListener('click', () => {
      document.getElementById('modalCorrect').classList.add('hidden');
      document.getElementById('modalCorrect').classList.remove('flex');
      if (currentLevel < 15) {
        currentLevel++;
        loadQuestion();
      } else {
        alert('¡FELICIDADES! ¡HAS GANADO EL GRAN PREMIO DE 1.000.000 PUNTOS!');
        const p = participants[currentParticipantIndex];
        p.status = 'completed';
        p.prizeWon = '1.000.000 Pts';
        saveState();
        passToNextParticipant();
      }
    });

    function passToNextParticipant() {
      currentParticipantIndex = (currentParticipantIndex + 1) % participants.length;
      currentLevel = 1;
      lifelines = { fiftyFifty: false, audience: false, phone: false };
      document.getElementById('btnLifeline50').style.opacity = '1';
      document.getElementById('btnLifelineAudience').style.opacity = '1';
      document.getElementById('btnLifelinePhone').style.opacity = '1';
      loadQuestion();
    }

    document.getElementById('btnNextParticipantModal').addEventListener('click', () => {
      document.getElementById('modalIncorrect').classList.add('hidden');
      document.getElementById('modalIncorrect').classList.remove('flex');
      passToNextParticipant();
    });

    document.getElementById('btnRestartCurrentModal').addEventListener('click', () => {
      document.getElementById('modalIncorrect').classList.add('hidden');
      document.getElementById('modalIncorrect').classList.remove('flex');
      currentLevel = 1;
      lifelines = { fiftyFifty: false, audience: false, phone: false };
      loadQuestion();
    });

    // 50:50 Lifeline
    document.getElementById('btnLifeline50').addEventListener('click', () => {
      if (lifelines.fiftyFifty || revealedState !== 'idle') return;
      lifelines.fiftyFifty = true;
      document.getElementById('btnLifeline50').style.opacity = '0.3';
      const p = participants[currentParticipantIndex];
      const q = p.questions.find(item => item.id === currentLevel) || p.questions[0];
      const wrong = ['A', 'B', 'C', 'D'].filter(l => l !== q.correctAnswer);
      wrong.sort(() => 0.5 - Math.random());
      hiddenOptions = wrong.slice(0, 2);
      if (hiddenOptions.includes(selectedOption)) selectedOption = null;
      updateOptionStyles();
    });

    // Audience Lifeline
    document.getElementById('btnLifelineAudience').addEventListener('click', () => {
      if (lifelines.audience || revealedState !== 'idle') return;
      lifelines.audience = true;
      document.getElementById('btnLifelineAudience').style.opacity = '0.3';
      const p = participants[currentParticipantIndex];
      const q = p.questions.find(item => item.id === currentLevel) || p.questions[0];
      alert('Votación del Público en Vivo:\\nLa opción ' + q.correctAnswer + ' recibió el 68% de los votos del Club Puerto Azul.');
    });

    // Phone Lifeline
    document.getElementById('btnLifelinePhone').addEventListener('click', () => {
      if (lifelines.phone || revealedState !== 'idle') return;
      lifelines.phone = true;
      document.getElementById('btnLifelinePhone').style.opacity = '0.3';
      const p = participants[currentParticipantIndex];
      const q = p.questions.find(item => item.id === currentLevel) || p.questions[0];
      alert('Llamada a un Socio Experto:\\n"¡Hola! Te habla el Capitán del Faro. Según mis conocimientos, la respuesta con mayor probabilidad es la ' + q.correctAnswer + '."');
    });

    // Tournament Modal
    function renderTournamentList() {
      const container = document.getElementById('tournamentListContainer');
      container.innerHTML = '';
      participants.forEach((p, idx) => {
        const isCurrent = idx === currentParticipantIndex;
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-3 rounded-xl border ' + (isCurrent ? 'bg-cyan-950/40 border-cyan-400' : 'bg-slate-900 border-slate-800');
        row.innerHTML = '<div><div class="font-bold text-white text-sm">#' + p.participantNumber + ' ' + p.name + '</div><div class="text-xs text-amber-300 font-orbitron">Premio: ' + (p.prizeWon || '0 Pts') + '</div></div><button class="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-bold text-white cursor-pointer" onclick="selectParticipantDirect(' + idx + ')">' + (isCurrent ? 'En Curso' : 'Jugar') + '</button>';
        container.appendChild(row);
      });
    }

    window.selectParticipantDirect = function(idx) {
      currentParticipantIndex = idx;
      currentLevel = 1;
      document.getElementById('modalTournament').classList.add('hidden');
      document.getElementById('modalTournament').classList.remove('flex');
      loadQuestion();
    };

    document.getElementById('btnTournament').addEventListener('click', () => {
      renderTournamentList();
      document.getElementById('modalTournament').classList.remove('hidden');
      document.getElementById('modalTournament').classList.add('flex');
    });
    document.getElementById('btnCloseTournament').addEventListener('click', () => {
      document.getElementById('modalTournament').classList.add('hidden');
      document.getElementById('modalTournament').classList.remove('flex');
    });
    document.getElementById('btnCloseTournamentBottom').addEventListener('click', () => {
      document.getElementById('modalTournament').classList.add('hidden');
      document.getElementById('modalTournament').classList.remove('flex');
    });

    // Sound and Fullscreen
    document.getElementById('btnSound').addEventListener('click', () => {
      isMuted = !isMuted;
      document.getElementById('btnSound').innerText = isMuted ? '🔇 Silenciado' : '🔊 Sonido';
    });
    document.getElementById('btnFullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    });

    loadQuestion();
  </script>
</body>
</html>`;
}
