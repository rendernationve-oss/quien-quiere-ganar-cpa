/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LogoMode = 'puerto_azul' | 'millonario' | 'farito' | 'custom';

export interface LogoConfig {
  mode: LogoMode;
  customImageData?: string;
  updatedAt?: number;
}

export const LOGO_STORAGE_KEY = 'puerto_azul_logo_config_v1';
export const CUSTOM_LOGO_STORAGE_KEY = 'puerto_azul_custom_logo';
export const LOGO_EVENT_NAME = 'puerto_azul_logo_changed';

const DB_NAME = 'PuertoAzulAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'settings';
const LOGO_DB_KEY = 'permanent_logo_config';

/**
 * Open IndexedDB for robust, quota-free long-term storage
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save logo config to IndexedDB
 */
async function saveToIndexedDB(config: LogoConfig): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(config, LOGO_DB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save logo to IndexedDB:', err);
  }
}

/**
 * Load logo config from IndexedDB
 */
async function loadFromIndexedDB(): Promise<LogoConfig | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(LOGO_DB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read logo from IndexedDB:', err);
    return null;
  }
}

/**
 * Synchronous read from localStorage (instant on boot)
 * Prioritizes custom logo string stored in 'puerto_azul_custom_logo' if available
 */
export function getInitialLogoConfig(): LogoConfig {
  if (typeof window === 'undefined') {
    return { mode: 'puerto_azul' };
  }
  try {
    // 1. Direct priority check: puerto_azul_custom_logo
    const customData = localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
    if (customData && customData.length > 20) {
      return {
        mode: 'custom',
        customImageData: customData,
        updatedAt: Date.now(),
      };
    }

    // 2. Read full LogoConfig object from LOGO_STORAGE_KEY
    const saved = localStorage.getItem(LOGO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (parsed.customImageData) {
          return {
            mode: 'custom',
            customImageData: parsed.customImageData,
            updatedAt: parsed.updatedAt || Date.now(),
          };
        }
        if (parsed.mode) {
          return parsed as LogoConfig;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading logo config from localStorage:', e);
  }
  return { mode: 'puerto_azul' };
}

/**
 * Asynchronous sync with IndexedDB to guarantee persistence
 * even if localStorage was emptied or QuotaExceeded occurred
 */
export async function syncLogoFromPersistentDB(
  onRestored: (config: LogoConfig) => void
): Promise<void> {
  try {
    const idbConfig = await loadFromIndexedDB();
    if (idbConfig && idbConfig.mode) {
      const local = getInitialLogoConfig();
      // If IndexedDB has custom image and localStorage doesn't, or IndexedDB is newer
      const idbTime = idbConfig.updatedAt || 0;
      const localTime = local.updatedAt || 0;
      if (
        (idbConfig.mode === 'custom' && idbConfig.customImageData && !local.customImageData) ||
        idbTime > localTime ||
        (local.mode === 'puerto_azul' && idbConfig.mode !== 'puerto_azul')
      ) {
        // Restore to localStorage as well
        try {
          localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(idbConfig));
        } catch {}
        onRestored(idbConfig);
      }
    } else {
      // If IndexedDB is empty but localStorage has config, seed IndexedDB
      const current = getInitialLogoConfig();
      if (current.customImageData || current.mode !== 'puerto_azul') {
        saveToIndexedDB(current);
      }
    }
  } catch (err) {
    console.warn('Error syncing logo from persistent DB:', err);
  }
}

/**
 * Optimizes an uploaded image file (PNG, JPG, SVG, WEBP)
 * Resizes huge camera/phone photos to max 900x900 while keeping full transparency
 * and crystal-clear quality. This ensures it never exceeds localStorage quotas
 * and loads at lightning speed.
 */
export function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // For SVG files, read directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        if (res) resolve(res);
        else reject(new Error('Failed to read SVG file'));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
      return;
    }

    // For raster images, draw to canvas and scale appropriately
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIM = 900;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to direct file reader
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(fallbackReader.result as string);
        fallbackReader.readAsDataURL(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Prefer PNG to keep transparency intact
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(fallbackReader.result as string);
        fallbackReader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error processing image'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Permanently save the logo config across localStorage, IndexedDB, and broadcast event
 */
export function persistLogoConfig(config: LogoConfig): void {
  const toSave: LogoConfig = {
    ...config,
    updatedAt: Date.now(),
  };

  // 1. Save to localStorage
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(toSave));
    if (config.mode === 'custom' && config.customImageData) {
      localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, config.customImageData);
      localStorage.setItem('club_header_logo', config.customImageData);
    } else if (config.mode !== 'custom') {
      localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
      localStorage.removeItem('club_header_logo');
    }
  } catch (e) {
    console.warn('LocalStorage error saving logo (will rely on IndexedDB):', e);
  }

  // 2. Save to IndexedDB (safe against storage quota errors)
  saveToIndexedDB(toSave);

  // 3. Dispatch broadcast event for all components and windows
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(LOGO_EVENT_NAME, { detail: toSave })
    );
  }
}

/**
 * Reset logo back to default Puerto Azul
 */
export function resetLogoConfig(): LogoConfig {
  const defConfig: LogoConfig = {
    mode: 'puerto_azul',
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(defConfig));
    localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
    localStorage.removeItem('club_header_logo');
  } catch {}
  saveToIndexedDB(defConfig);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(LOGO_EVENT_NAME, { detail: defConfig })
    );
  }
  return defConfig;
}
