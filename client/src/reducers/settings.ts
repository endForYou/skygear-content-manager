import { Actions } from '../actions';
import { initialSettingsState, Settings } from '../states';

import { SettingsActionTypes } from '../actions/settings';

export default function settingsReducer(
  state: Settings = initialSettingsState,
  action: Actions
) {
  switch (action.type) {
    case SettingsActionTypes.UpdateTimezone:
      return {
        ...state,
        timezone: action.payload,
      };
    default:
      return state;
  }
}
