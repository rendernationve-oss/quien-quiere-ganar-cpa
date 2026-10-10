import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncywejhaprkriumfzfyt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeXdlamhhcHJrcml1bWZ6Znl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mzg3NDUsImV4cCI6MjEwNzIxNDc0NX0.qIo6ZfeRgWJkbQbgPZfAzvp_FETd0g33kgtkU4U2PYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GAME_CHANNEL_NAME = 'cpa_live_game_room';

let globalChannel: RealtimeChannel | null = null;
let isChannelReady = false;
let pendingState: any = null;

const getOrCreateChannel = () => {
  if (!globalChannel) {
    globalChannel = supabase.channel(GAME_CHANNEL_NAME, {
      config: {
        broadcast: { ack: true, self: true },
      },
    });

    globalChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        isChannelReady = true;
        if (pendingState) {
          pushGameState(pendingState);
          pendingState = null;
        }
      } else {
        isChannelReady = false;
      }
    });
  }
  return globalChannel;
};

/**
 * Emite el estado desde la PC Máster a cualquier pantalla (Tablet, móvil, proyector)
 */
export const pushGameState = (state: any) => {
  if (!state) return;
  const channel = getOrCreateChannel();

  if (!isChannelReady) {
    pendingState = state;
    return;
  }

  channel
    .send({
      type: 'broadcast',
      event: 'GAME_SYNC',
      payload: state,
    })
    .catch((err) => {
      console.warn('[Supabase Broadcast Error]:', err);
    });
};

/**
 * Escucha los cambios en tiempo real en la Pantalla Pública (Tablet)
 */
export const subscribeToGameState = (onStateChange: (state: any) => void) => {
  const channel = getOrCreateChannel();

  channel.on('broadcast', { event: 'GAME_SYNC' }, (message) => {
    if (message && message.payload) {
      onStateChange(message.payload);
    }
  });

  return () => {
    // Mantenemos la conexión activa durante toda la partida
  };
};