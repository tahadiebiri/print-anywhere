const SETTINGS_KEY = 'silaprint_app_settings';

export interface AppSettings {
  appName: string;
  logoUrl: string; // data URL or empty
  primaryColor: string; // HSL string e.g. "262 83% 58%"
  accentColor: string;
  adminPassword: string;
  pwaName: string;
  pwaShortName: string;
  pwaDescription: string;
}

const defaults: AppSettings = {
  appName: 'SılaPrint',
  logoUrl: '',
  primaryColor: '262 83% 58%',
  accentColor: '262 60% 94%',
  adminPassword: 'silaprint2026',
  pwaName: 'SılaPrint - Termal Yazıcı',
  pwaShortName: 'SılaPrint',
  pwaDescription: 'Bluetooth termal yazıcı uygulaması',
};

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return { ...defaults };
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function applyThemeColors(settings: AppSettings) {
  const root = document.documentElement;
  root.style.setProperty('--primary', settings.primaryColor);
  root.style.setProperty('--ring', settings.primaryColor);
  root.style.setProperty('--accent', settings.accentColor);
}

export function getDefaultSettings(): AppSettings {
  return { ...defaults };
}
