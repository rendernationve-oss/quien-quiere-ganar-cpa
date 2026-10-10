import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncywejhaprkriumfzfyt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeXdlamhhcHJrcml1bWZ6Znl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mzg3NDUsImV4cCI6MjEwNzIxNDc0NX0.qIo6ZfeRgWJkbQbgPZfAzvp_FETd0g33kgtkU4U2PYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GAME_CHANNEL_NAME = 'cpa_live_game_room';

// Canal global de WebSockets en tiempo real
const gameChannel = supabase.channel(GAME_CHANNEL_NAME, {
  config: {
    broadcast: { ack: false, self: false },
  },
});

gameChannel.subscribe();

/**
 * Emite el estado desde la PC Máster a cualquier pantalla conectada (Tablet, Proyector)
 */
export const pushGameState = (state: any) => {
  if (!state) return;
  gameChannel.send({
    type: 'broadcast',
    event: 'GAME_SYNC',
    payload: state,
  }).catch((err) => {
    console.warn('[Supabase Realtime Send Error]:', err);
  });
};

/**
 * Escucha los cambios en tiempo real en la Pantalla Pública (Tablet)
 */
export const subscribeToGameState = (onStateChange: (state: any) => void) => {
  const listenerChannel = supabase
    .channel(GAME_CHANNEL_NAME)
    .on('broadcast', { event: 'GAME_SYNC' }, (response) => {
      if (response && response.payload) {
        onStateChange(response.payload);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(listenerChannel);
  };
};