import moment from 'moment-timezone';
import { Settings } from './states';

export function getSettings(): Settings {
  const i = JSON.parse(localStorage.getItem('settings') || '{}');
  const timezone =
    typeof i.timezone === 'string' ? i.timezone : moment.tz.guess();

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
