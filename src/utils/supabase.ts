import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncywejhaprkriumfzfyt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeXdlamhhcHJrcml1bWZ6Znl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mzg3NDUsImV4cCI6MjEwNzIxNDc0NX0.qIo6ZfeRgWJkbQbgPZfAzvp_FETd0g33kgtkU4U2PYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GAME_CHANNEL_NAME = 'room_puerto_azul_live';

let channelStatus = 'CONNECTING';
let lastOutgoingState: any = null;
const listeners: Array<(state: any) => void> = [];

export const gameChannel = supabase.channel(GAME_CHANNEL_NAME, {
  config: {
    broadcast: { ack: true, self: true },
  },
});

gameChannel
  .on('broadcast', { event: 'GAME_SYNC' }, (payload: any) => {
    console.log('[Supabase Realtime] Mensaje recibido:', payload);
    if (payload && payload.payload) {
      listeners.forEach((fn) => fn(payload.payload));
    }
  })
  .subscribe((status) => {
    channelStatus = status;
    console.log('[Supabase Realtime Estado]:', status);
    if (status === 'SUBSCRIBED' && lastOutgoingState) {
      pushGameState(lastOutgoingState);
    }
  });

export const pushGameState = async (state: any) => {
  if (!state) return;
  lastOutgoingState = state;

  if (channelStatus !== 'SUBSCRIBED') {
    console.warn('[Supabase Realtime] Esperando conexión para enviar...');
    return;
  }

  try {
    const res = await gameChannel.send({
      type: 'broadcast',
      event: 'GAME_SYNC',
      payload: state,
    });
    console.log('[Supabase Realtime] Enviado exitosamente:', res);
  } catch (err) {
    console.error('[Supabase Realtime Error al enviar]:', err);
  }
};

export const subscribeToGameState = (onStateChange: (state: any) => void) => {
  listeners.push(onStateChange);

  return () => {
    const idx = listeners.indexOf(onStateChange);
    if (idx > -1) listeners.splice(idx, 1);
  };
};
