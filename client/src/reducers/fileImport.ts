import { combineReducers, Reducer } from 'redux';
import { Actions } from '../actions';
import { FileImportActionTypes } from '../actions/fileImport';
import {
  FileImportState,
  ImportedFileListState,
  ImportFileState,
  initialImportedFileListState,
  initialImportFileState,
} from '../states';
import { ImportedFile } from '../types/importedFile';

// fix issue with incorrect redux definition file.
// See https://github.com/reactjs/redux/issues/2709
// tslint:disable: no-any
export const fileImportViewsReducer = combineReducers<FileImportState>({
  import: fileImportReducer as Reducer<any>,
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

function fileImportReducer(
  state: ImportFileState = initialImportFileState,
  action: Actions
): ImportFileState {
  switch (action.type) {
    case FileImportActionTypes.ImportFilesRequest:
      return {
        ...state,
        importError: undefined,
        importing: true,
        uploadingFileNames: [...state.fileNames],
      };
    case FileImportActionTypes.UploadFileSuccess:
      return {
        ...state,
        uploadingFileNames: state.uploadingFileNames.filter(
          name => name !== action.payload.name
        ),
      };
    case FileImportActionTypes.UploadFileFailure:
      return state;
    case FileImportActionTypes.ImportFilesSuccess:
      return {
        ...state,
        fileNames: [],
        filesByName: {},
        importing: false,
      };
    case FileImportActionTypes.ImportFilesFailure:
      return {
        ...state,
        importError: action.payload.error,
        importing: false,
        uploadingFileNames: [],
      };
    case FileImportActionTypes.ImportAddFiles: {
      const files = action.payload.files;
      const { fileNames, filesByName } = state;
      const filesToAdd = files.filter(
        f => !!!fileNames.find(n => n === f.name)
      );
      return {
        ...state,
        fileNames: [...fileNames, ...filesToAdd.map(f => f.name)],
        filesByName: files.reduce(
          (acc, file) => ({
            ...acc,
            [file.name]: file,
          }),
          filesByName
        ),
      };
    }
    case FileImportActionTypes.ImportRemoveFile: {
      const file = action.payload.file;
      const { fileNames, filesByName, importError } = state;
      if (filesByName[file.name] == null) {
        return state;
      }

      const newFileNames = fileNames.filter(name => name !== file.name);

      return {
        ...state,
        fileNames: newFileNames,
        filesByName: {
          ...filesByName,
          [file.name]: undefined,
        },
        importError: newFileNames.length === 0 ? undefined : importError,
      };
    }
    case FileImportActionTypes.ImportRemoveAllFiles:
      return {
        ...state,
        fileNames: [],
        filesByName: {},
        importError: undefined,
      };
    default:
      return state;
  }
}
