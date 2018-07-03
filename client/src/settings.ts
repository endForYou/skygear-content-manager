import moment from 'moment-timezone';

import { getCmsConfig, RootState, Settings } from './states';

export function getSettings(): Partial<Settings> {
  const i = JSON.parse(localStorage.getItem('settings') || '{}');
  const timezone = typeof i.timezone === 'string' ? i.timezone : null;

  return {
    timezone,
  };
}

// tslint:disable-next-line:no-any
export function updateSettings(key: keyof (Settings), value: any) {
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem('settings', JSON.stringify(settings));
}

const settingsDefault = {
  timezone: moment.tz.guess(),
};

export function combineSettings(
  a: Partial<Settings>,
  b: Partial<Settings>,
  base?: Settings
): Settings {
  const settings = base == null ? { ...settingsDefault } : base;

  Object.keys(settings).forEach(k => {
    if (a[k] != null) {
      settings[k] = a[k];
    } else if (b[k] != null) {
      settings[k] = b[k];
    }
  });

  return settings;
}

export function getCombinedSettings(state: RootState): Settings {
  return combineSettings(state.settings, getCmsConfig(state).defaultSettings);
}
