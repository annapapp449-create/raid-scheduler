import AV from 'leancloud-storage';

const APP_ID = import.meta.env.VITE_LEANCLOUD_APP_ID;
const APP_KEY = import.meta.env.VITE_LEANCLOUD_APP_KEY;

let initialized = false;

export function initLeanCloud() {
  if (initialized) return;

  if (!APP_ID || !APP_KEY) {
    console.warn('LeanCloud credentials not configured. Using localStorage fallback.');
    return;
  }

  AV.init({
    appId: APP_ID,
    appKey: APP_KEY,
  });

  initialized = true;
}

export function isConfigured() {
  return !!(APP_ID && APP_KEY);
}

export default AV;
