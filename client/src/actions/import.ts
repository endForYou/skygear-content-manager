import 'whatwg-fetch';

import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { ImportResult } from '../types';

export type ImportActions = ImportRequest | ImportSuccess | ImportFailure;

export enum ImportActionTypes {
  ImportRequest = 'IMPORT_REQUEST',
  ImportSuccess = 'IMPORT_SUCCESS',
  ImportFailure = 'IMPORT_FAILURE',
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

    return fetch(`${skygear.endPoint}import`, {
      body: data,
      method: 'POST',
    })
      .then((response: Response) => {
        return response.json();
      })
      // tslint:disable-next-line: no-any
      .then((json: any) => {
        dispatch(importSuccess(json));
      })
      .catch((error: Error) => {
        dispatch(importFailure(error));
      });
  };
}
