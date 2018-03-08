import { Actions } from '../actions';
import { ImportActionTypes } from '../actions/import';
import { isOutlawError } from '../recordUtil';
import { ImportState, initialImportState } from '../states';
import {
  ImportResult,
  RemoteFailure,
  RemoteLoading,
  RemoteSuccess,
} from '../types';

function errorMessageFromError(error: Error) {
  if (isOutlawError(error)) {
    return `Failed to import: ${error.error.message}`;
  }

  return `Failed to import: ${error}`;
}

export default function importReducer(
  state: ImportState = initialImportState,
  action: Actions
) {
  switch (action.type) {
    case ImportActionTypes.DismissImport:
      return {
        ...state,
        importResult: undefined,
      };
    case ImportActionTypes.ImportRequest:
      return {
        ...state,
        importResult: RemoteLoading,
      };
    case ImportActionTypes.ImportSuccess:
      return {
        ...state,
        importResult: RemoteSuccess<ImportResult>(action.payload.result),
      };
    case ImportActionTypes.ImportFailure:
      return {
        ...state,
        errorMessage: errorMessageFromError(action.payload.error),
        importResult: RemoteFailure(action.payload.error),
      };
    default:
      return state;
  }
}
