import { Actions } from '../actions';
import { ImportActionTypes } from '../actions/import';
import { ImportState, initialImportState } from '../states';

export default function importReducer(
  state: ImportState = initialImportState,
  action: Actions
) {
  switch (action.type) {
    case ImportActionTypes.ImportRequest:
      return state;
    case ImportActionTypes.ImportSuccess:
      return state;
    case ImportActionTypes.ImportFailure:
      return state;
    default:
      return state;
  }
}
