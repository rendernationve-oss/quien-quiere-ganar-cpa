import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, Database } from 'firebase/database';
import { UnifiedGameState } from './broadcastSync';

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyPuertoAzul2026Temp',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'quien-quiere-ganar-puerto-azul.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://quien-quiere-ganar-puerto-azul-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'quien-quiere-ganar-puerto-azul',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'quien-quiere-ganar-puerto-azul.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '100000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:100000000000:web:demo1234567890',
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Realtime Database Instance
export const rtdb: Database = getDatabase(app);

const GAME_SESSION_REF = 'gameSession/current';

/**
 * pushGameState: Writes/updates game state in real time to Firebase Realtime Database
 * @param stateData Partial or full UnifiedGameState
 */
export async function pushGameState(stateData: Partial<UnifiedGameState> | any): Promise<void> {
  try {
    const sessionRef = ref(rtdb, GAME_SESSION_REF);
    const payload = {
      ...stateData,
      lastUpdated: Date.now(),
    };
    await set(sessionRef, payload);
  } catch (error) {
    console.warn('[Firebase RTDB pushGameState error]:', error);
  }
}

/**
 * subscribeToGameState: Subscribes to continuous updates on 'gameSession/current'
 * @param callback Callback function executed whenever state mutates
 * @returns Unsubscribe function to clean up listener
 */
export function subscribeToGameState(callback: (state: UnifiedGameState) => void): () => void {
  const sessionRef = ref(rtdb, GAME_SESSION_REF);

  const unsubscribe = onValue(
    sessionRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val) {
          callback(val as UnifiedGameState);
        }
      }
    },
    (error) => {
      console.warn('[Firebase RTDB subscribeToGameState error]:', error);
    }
  );

  return () => {
    try {
      off(sessionRef);
    } catch (e) {
      // Fallback
      unsubscribe();
    }
  };
}
