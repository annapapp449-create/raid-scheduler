import AV from 'leancloud-storage';

const APP_ID = import.meta.env.VITE_LEANCLOUD_APP_ID;
const APP_KEY = import.meta.env.VITE_LEANCLOUD_APP_KEY;

// 占位符值不算真正配置
const PLACEHOLDER_VALUES = ['your_app_id_here', 'your_app_key_here', '', undefined, null];

let initialized = false;

export function initLeanCloud() {
  if (initialized) return;

  if (!isConfigured()) {
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
  return !!(
    APP_ID && APP_KEY &&
    !PLACEHOLDER_VALUES.includes(APP_ID) &&
    !PLACEHOLDER_VALUES.includes(APP_KEY)
  );
}

export default AV;
