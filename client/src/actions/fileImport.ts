import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { Filter } from '../cmsConfig';
import { RootState } from '../states';
import { deserializeImportedFile, ImportedFile } from '../types/importedFile';

export type FileImportActions =
  | FetchImportedFileListRequest
  | FetchImportedFileListSuccess
  | FetchImportedFileListFailure;

export enum FileImportActionTypes {
  FetchListRequest = 'FETCH_IMPORTED_FILE_LIST_REQUEST',
  FetchListSuccess = 'FETCH_IMPORTED_FILE_LIST_SUCCESS',
  FetchListFailure = 'FETCH_IMPORTED_FILE_LIST_FAILURE',
}

interface ImportedFileQueryResult {
  files: ImportedFile[];
  overallCount: number;
}

export interface FetchImportedFileListRequest {
  payload: {
    page: number;
  };
  type: FileImportActionTypes.FetchListRequest;
  context: undefined;
}

export interface FetchImportedFileListSuccess {
  payload: {
    page: number;
    perPage: number;
    files: ImportedFile[];
    overallCount: number;
  };
  type: FileImportActionTypes.FetchListSuccess;
  context: undefined;
}

export interface FetchImportedFileListFailure {
  payload: {
    error: Error;
  };
  type: FileImportActionTypes.FetchListFailure;
  context: undefined;
}

function fetchImportedFileListRequest(
  page: number
): FetchImportedFileListRequest {
  return {
    context: undefined,
    payload: {
      page,
    },
    type: FileImportActionTypes.FetchListRequest,
  };
}

function fetchImportedFileListSuccess(
  page: number,
  perPage: number,
  queryResult: ImportedFileQueryResult
): FetchImportedFileListSuccess {
  return {
    context: undefined,
    payload: {
      files: queryResult.files,
      overallCount: queryResult.overallCount,
      page,
      perPage,
    },
    type: FileImportActionTypes.FetchListSuccess,
  };
}

function fetchImportedFileListFailure(
  error: Error
): FetchImportedFileListFailure {
  return {
    context: undefined,
    payload: {
      error,
    },
    type: FileImportActionTypes.FetchListFailure,
  };
}

function fetchImportedFilesImpl(
  page: number = 1,
  perPage: number = 25,
  filters: Filter[],
  sortByName: string | undefined,
  isAscending: boolean
): Promise<ImportedFileQueryResult> {
  // TODO: handle filter and sort
  return skygear.lambda('imported_file:get_all', { page, perPage }).then(
    // tslint:disable-next-line: no-any
    (queryResult: any) => {
      return {
        files: queryResult.importedFiles.map(deserializeImportedFile),
        overallCount: queryResult.totalCount,
      };
    }
  );
}

function fetchImportedFiles(
  page: number,
  perPage: number,
  filters: Filter[],
  sortByName: string | undefined,
  isAscending: boolean
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(fetchImportedFileListRequest(page));

    return fetchImportedFilesImpl(
      page,
      perPage,
      filters,
      sortByName,
      isAscending
    )
      .then((result: ImportedFileQueryResult) => {
        dispatch(fetchImportedFileListSuccess(page, perPage, result));
      })
      .catch((error: Error) => {
        dispatch(fetchImportedFileListFailure(error));
      });
  };
}

export class FileImportActionDispatcher {
  private dispatch: Dispatch<RootState>;

  constructor(dispatch: Dispatch<RootState>) {
    this.dispatch = dispatch;
  }

  public fetchList(
    page: number,
    perPage: number,
    filters: Filter[],
    sortByName: string | undefined,
    isAscending: boolean
  ) {
    this.dispatch(
      fetchImportedFiles(page, perPage, filters, sortByName, isAscending)
    );
  }
}
