import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncywejhaprkriumfzfyt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeXdlamhhcHJrcml1bWZ6Znl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mzg3NDUsImV4cCI6MjEwNzIxNDc0NX0.qIo6ZfeRgWJkbQbgPZfAzvp_FETd0g33kgtkU4U2PYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GAME_CHANNEL_NAME = 'cpa_live_game_room';

let gameChannel: RealtimeChannel | null = null;

export const initGameChannel = () => {
  if (!gameChannel) {
    gameChannel = supabase.channel(GAME_CHANNEL_NAME, {
      config: {
        broadcast: { ack: true, self: false },
      },
    });

    gameChannel.subscribe((status) => {
      console.log('[Supabase Realtime Status]:', status);
    });
  }
  return gameChannel;
};

// Inicializamos el canal de inmediato
initGameChannel();

/**
 * Emite el estado desde la PC Máster
 */
export const pushGameState = async (state: any) => {
  if (!state) return;
  const channel = initGameChannel();

  try {
    await channel.send({
      type: 'broadcast',
      event: 'GAME_SYNC',
      payload: state,
    });
  } catch (err) {
    console.warn('[Supabase Broadcast Error]:', err);
  }
};

/**
 * Escucha los cambios en tiempo real en la Pantalla Pública
 */
export const subscribeToGameState = (onStateChange: (state: any) => void) => {
  const channel = initGameChannel();

  channel.on('broadcast', { event: 'GAME_SYNC' }, (payload: any) => {
    if (payload && payload.payload) {
      onStateChange(payload.payload);
    } else if (payload) {
      onStateChange(payload);
    }
  });

  return () => {
    // Mantener canal activo durante toda la sesión
  };
};
