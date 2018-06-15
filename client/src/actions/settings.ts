import { updateSettings } from '../settings';
import { Settings } from '../states';

export type SettingsActions = UpdateTimezone;

export enum SettingsActionTypes {
  UpdateTimezone = 'UPDATE_TIMEZONE',
}

interface UpdateSettings<T> {
  payload: T;
  context: undefined;
}

export interface UpdateTimezone extends UpdateSettings<string> {
  type: SettingsActionTypes.UpdateTimezone;
}

function createUpdateSetting<T>(
  key: keyof (Settings),
  type: SettingsActionTypes
) {
  return (value: T) => {
    updateSettings(key, value);

    return {
      context: undefined,
      payload: value,
      type,
    };
  };
}

export const updateTimezone = createUpdateSetting<string>(
  'timezone',
  SettingsActionTypes.UpdateTimezone
);
