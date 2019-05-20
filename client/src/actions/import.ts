import 'whatwg-fetch';

import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { ImportResult, ImportResultItem } from '../types';

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

export interface ImportAttrs {
  atomic: boolean;
  file: File;
}

export interface ImportRequest {
  type: ImportActionTypes.ImportRequest;
  payload: undefined;
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
    payload: undefined,
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
  result: ImportResultItem[];
}
function transformImportResult(result: ImportAPIResult): ImportResult {
  return {
    errorCount: result.error_count,
    result: result.result,
    successCount: result.success_count,
  };
}

export function importRecords(
  name: string,
  attrs: ImportAttrs
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(importRequest());

    return performImportRecord(name, attrs)
      .then((result: ImportAPIResult) => {
        dispatch(importSuccess(transformImportResult(result)));
      })
      .catch((error: Error) => {
        dispatch(importFailure(error));
      });
  };
}

function performImportRecord(
  name: string,
  attrs: ImportAttrs
): Promise<ImportAPIResult> {
  return callImportRecordAPI(name, attrs.file, attrs.atomic);
}

function callImportRecordAPI(
  name: string,
  data: Blob,
  atomic: boolean
): Promise<ImportAPIResult> {
  return Promise.resolve()
    .then(() => {
      const formData = new FormData();
      formData.append('file', data);
      formData.append('key', skygear.auth.accessToken!);
      formData.append('import_name', name);

      const options = { atomic };
      formData.append('options', JSON.stringify(options));
      return formData;
    })
    .then((formData: FormData) => {
      return fetch(`${skygear.endPoint}import`, {
        body: formData,
        method: 'POST',
      });
    })
    .then((response: Response) => {
      return response.json().then(json => ({ json, status: response.status }));
    })
    .then(({ json, status }) => {
      if (status >= 400) {
        return Promise.reject({
          error: json.error,
          status,
        });
      }

      return json;
    });
}
