import 'whatwg-fetch';

import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { ImportResult } from '../types';

export type ImportActions =
  | ImportRequest
  | ImportSuccess
  | ImportFailure
  | DismissImport;

export enum ImportActionTypes {
  ImportRequest = 'IMPORT_REQUEST',
  ImportSuccess = 'IMPORT_SUCCESS',
  ImportFailure = 'IMPORT_FAILURE',
  DismissImport = 'DISMISS_IMPORT',
}

export interface ImportRequest {
  type: ImportActionTypes.ImportRequest;
  context: undefined;
}

export interface ImportSuccess {
  type: ImportActionTypes.ImportSuccess;
  payload: {
    result: ImportResult;
  };
  context: undefined;
}

export interface ImportFailure {
  context: undefined;
  payload: {
    error: Error;
  };
  type: ImportActionTypes.ImportFailure;
}

export interface DismissImport {
  context: undefined;
  payload: undefined;
  type: ImportActionTypes.DismissImport;
}

function importRequest(): ImportRequest {
  return {
    context: undefined,
    type: ImportActionTypes.ImportRequest,
  };
}

function importSuccess(result: ImportResult): ImportSuccess {
  return {
    context: undefined,
    payload: { result },
    type: ImportActionTypes.ImportSuccess,
  };
}

function importFailure(error: Error): ImportFailure {
  return {
    context: undefined,
    payload: { error },
    type: ImportActionTypes.ImportFailure,
  };
}

export function dismissImport(): DismissImport {
  return {
    context: undefined,
    payload: undefined,
    type: ImportActionTypes.DismissImport,
  };
}

interface ImportAPIResult {
  success_count: number;
  error_count: number;
}
function transformImportResult(result: ImportAPIResult): ImportResult {
  return {
    errorCount: result.error_count,
    successCount: result.success_count,
  };
}

export function importRecords(
  name: string,
  file: File
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const data = new FormData();
    data.append('file', file);
    data.append('key', skygear.auth.accessToken!);
    data.append('import_name', name);

    dispatch(importRequest());

    let status: number = 500;
    return fetch(`${skygear.endPoint}import`, {
      body: data,
      method: 'POST',
    })
      .then((response: Response) => {
        status = response.status;
        return response.json();
      })
      .then(json => {
        if (status >= 400) {
          return Promise.reject({
            error: json.error,
            status,
          });
        }

        return json;
      })
      .then((result: ImportAPIResult) => {
        dispatch(importSuccess(transformImportResult(result)));
      })
      .catch((error: Error) => {
        dispatch(importFailure(error));
      });
  };
}
