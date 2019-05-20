import 'whatwg-fetch';

import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { LargeCsvConfig } from '../config';
import { RootState } from '../states';
import { ImportResult, ImportResultItem } from '../types';

const CSV_NEWLINE = '\n';
const CSV_NEWLINE_REGEX = /\r?\n/g;

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
function mergeImportAPIResult(
  partialResults: ImportAPIResult[]
): ImportAPIResult {
  const finalResult: ImportAPIResult = {
    success_count: 0,
    error_count: 0,
    result: ([] as ImportResultItem[]).concat.apply(
      [],
      partialResults.map(partialResult => partialResult.result)
    ),
  };
  for (const partialResult of partialResults) {
    finalResult.success_count += partialResult.success_count;
    finalResult.error_count += partialResult.error_count;
  }
  return finalResult;
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
): ThunkAction<Promise<void>, RootState, {}> {
  return (dispatch, getState) => {
    dispatch(importRequest());

    return performImportRecord(name, attrs, getState().appConfig.largeCsv)
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
  attrs: ImportAttrs,
  largeCsvConfig: LargeCsvConfig
): Promise<ImportAPIResult> {
  if (!attrs.atomic && attrs.file.size > largeCsvConfig.fileSize) {
    return performImportRecordByBatch(
      name,
      attrs.file,
      largeCsvConfig.importBatchSize
    );
  }
  return callImportRecordAPI(name, attrs.file, attrs.atomic);
}

function performImportRecordByBatch(
  name: string,
  csvData: Blob,
  batchSize: number
): Promise<ImportAPIResult> {
  return new Response(csvData).text().then(csv => {
    const lines = csv.split(CSV_NEWLINE_REGEX);
    if (lines.length < 1) {
      // imported CSV must have header
      throw new Error('Malformed CSV');
    }
    const headerLine = `${lines.shift()}${CSV_NEWLINE}`;

    const pendingRecords = lines;
    const uploadResults: ImportAPIResult[] = [];

    const finalizeResult = (): Promise<ImportAPIResult> => {
      return Promise.resolve(mergeImportAPIResult(uploadResults));
    };

    const uploadBatch = (): Promise<ImportAPIResult> => {
      const batch = pendingRecords.splice(0, batchSize);
      return callImportRecordAPI(
        name,
        new Blob([headerLine, batch.join(CSV_NEWLINE)]),
        false
      ).then(result => {
        uploadResults.push(result);

        if (pendingRecords.length > 0) {
          return uploadBatch();
        } else {
          return finalizeResult();
        }
      });
    };

    return uploadBatch();
  });
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
