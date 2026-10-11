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
const TOURNAMENT_TABLE = 'cpa_tournament_store';
const TOURNAMENT_ROW_ID = 'active_tournament';

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

/**
 * Guarda de forma persistente los participantes y sus preguntas en la base de datos de Supabase
 */
export const saveTournamentToSupabase = async (participants: any[]): Promise<boolean> => {
  if (!participants || !Array.isArray(participants)) return false;
  try {
    const { error } = await supabase
      .from(TOURNAMENT_TABLE)
      .upsert(
        {
          id: TOURNAMENT_ROW_ID,
          participants,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('[Supabase DB Save Warning]:', error.message);
      return false;
    }
    console.log('[Supabase DB]: Preguntas y participantes guardados en la nube.');
    return true;
  } catch (err) {
    console.warn('[Supabase DB Save Error]:', err);
    return false;
  }
};

/**
 * Obtiene los participantes y preguntas guardados en la base de datos de Supabase al iniciar
 */
export const fetchTournamentFromSupabase = async (): Promise<any[] | null> => {
  try {
    const { data, error } = await supabase
      .from(TOURNAMENT_TABLE)
      .select('participants')
      .eq('id', TOURNAMENT_ROW_ID)
      .single();

    if (error || !data || !Array.isArray(data.participants)) {
      return null;
    }
    return data.participants;
  } catch (err) {
    console.warn('[Supabase DB Fetch Error]:', err);
    return null;
  }
};
