import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncywejhaprkriumfzfyt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeXdlamhhcHJrcml1bWZ6Znl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mzg3NDUsImV4cCI6MjEwNzIxNDc0NX0.qIo6ZfeRgWJkbQbgPZfAzvp_FETd0g33kgtkU4U2PYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

const GAME_CHANNEL_NAME = 'cpa_live_game_room';

// Canal único global inicializado inmediatamente
export const gameChannel = supabase.channel(GAME_CHANNEL_NAME, {
  config: {
    broadcast: { ack: false, self: true },
  },
});

let isSubscribed = false;

gameChannel.subscribe((status) => {
  console.log('[Supabase Realtime Status]:', status);
  if (status === 'SUBSCRIBED') {
    isSubscribed = true;
  }
});

/**
 * Emite el estado desde la PC Máster a cualquier pantalla (Tablet, móvil, proyector)
 */
export const pushGameState = async (state: any) => {
  if (!state) return;
  try {
    await gameChannel.send({
      type: 'broadcast',
      event: 'GAME_SYNC',
      payload: state,
    });
  } catch (err) {
    console.warn('[Supabase Broadcast Error]:', err);
  }
};

/**
 * Escucha los cambios en tiempo real en la Pantalla Pública (Tablet)
 */
export const subscribeToGameState = (onStateChange: (state: any) => void) => {
  gameChannel.on('broadcast', { event: 'GAME_SYNC' }, (message: any) => {
    const payload = message?.payload ?? message;
    if (payload) {
      console.log('[Sincronización recibida]:', payload.currentLevel ?? payload);
      onStateChange(payload);
    }
  });

  return () => {
    // Mantener la conexión activa durante toda la partida
  };
};