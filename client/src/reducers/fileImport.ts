import { combineReducers, Reducer } from 'redux';
import { Actions } from '../actions';
import { FileImportActionTypes } from '../actions/fileImport';
import {
  FileImportState,
  ImportedFileListState,
  initialImportedFileListState,
} from '../states';
import { ImportedFile } from '../types/importedFile';

// fix issue with incorrect redux definition file.
// See https://github.com/reactjs/redux/issues/2709
// tslint:disable: no-any
export const fileImportViewsReducer = combineReducers<FileImportState>({
  list: importedFileListReducer as Reducer<any>,
});
// tslint:enable: no-any

function importedFileListReducer(
  state: ImportedFileListState = initialImportedFileListState,
  action: Actions
): ImportedFileListState {
  switch (action.type) {
    case FileImportActionTypes.FetchListRequest:
      return { ...state, page: action.payload.page };
    case FileImportActionTypes.FetchListSuccess:
      const { files, overallCount } = action.payload;
      return {
        ...state,
        files: files.map((file: ImportedFile) => file),
        isLoading: false,
        totalCount: overallCount,
      };
    case FileImportActionTypes.FetchListFailure:
      return { ...state, isLoading: false, error: action.payload.error };
    default:
      return state;
  }
}
