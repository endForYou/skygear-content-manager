import mime from 'mime-types';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear, { Asset, DatabaseContainer } from 'skygear';

import { Filter, StringFilterQueryType } from '../cmsConfig';
import { RootState } from '../states';
import { deserializeImportedFile, ImportedFile } from '../types/importedFile';
import { wrapValueForLike } from './record';

export type FileImportActions =
  | FetchImportedFileListRequest
  | FetchImportedFileListSuccess
  | FetchImportedFileListFailure
  | ImportFilesRequest
  | UploadFileSuccess
  | UploadFileFailure
  | ImportFilesSuccess
  | ImportFilesFailure
  | ImportAddFiles
  | ImportRemoveFile
  | ImportRemoveAllFiles;

export enum FileImportActionTypes {
  FetchListRequest = 'FETCH_IMPORTED_FILE_LIST_REQUEST',
  FetchListSuccess = 'FETCH_IMPORTED_FILE_LIST_SUCCESS',
  FetchListFailure = 'FETCH_IMPORTED_FILE_LIST_FAILURE',
  ImportFilesRequest = 'IMPORT_FILES_REQUEST',
  UploadFileSuccess = 'UPLOAD_FILE_SUCCESS',
  UploadFileFailure = 'UPLOAD_FILE_FAILURE',
  ImportFilesSuccess = 'IMPORT_FILES_SUCCESS',
  ImportFilesFailure = 'IMPORT_FILES_FAILURE',
  ImportAddFiles = 'IMPORT_ADD_FILES',
  ImportRemoveFile = 'IMPORT_REMOVE_FILE',
  ImportRemoveAllFiles = 'IMPORT_REMOVE_ALL_FILES',
}

export enum FileImportHandleTypes {
  error,
  ignore,
  replace,
}

interface ImportedFileQueryResult {
  files: ImportedFile[];
  overallCount: number;
}

interface CreateImportedFileRequestData {
  id: string; // file path / name
  asset: string; // asset id
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

export interface ImportFilesRequest {
  payload: {
    files: File[];
  };
  type: FileImportActionTypes.ImportFilesRequest;
  context: undefined;
}

export interface UploadFileSuccess {
  payload: {
    name: string;
  };
  type: FileImportActionTypes.UploadFileSuccess;
  context: undefined;
}

export interface UploadFileFailure {
  payload: {
    name: string;
    error: Error;
  };
  type: FileImportActionTypes.UploadFileFailure;
  context: undefined;
}

export interface ImportFilesSuccess {
  payload: {
    files: File[];
  };
  type: FileImportActionTypes.ImportFilesSuccess;
  context: undefined;
}

export interface ImportFilesFailure {
  payload: {
    error: Error;
  };
  type: FileImportActionTypes.ImportFilesFailure;
  context: undefined;
}

export interface ImportAddFiles {
  payload: {
    files: File[];
  };
  type: FileImportActionTypes.ImportAddFiles;
  context: undefined;
}

export interface ImportRemoveFile {
  payload: {
    file: File;
  };
  type: FileImportActionTypes.ImportRemoveFile;
  context: undefined;
}

export interface ImportRemoveAllFiles {
  payload: undefined;
  type: FileImportActionTypes.ImportRemoveAllFiles;
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

function importFilesRequest(files: File[]): ImportFilesRequest {
  return {
    context: undefined,
    payload: { files },
    type: FileImportActionTypes.ImportFilesRequest,
  };
}

function uploadFileSuccess(name: string): UploadFileSuccess {
  return {
    context: undefined,
    payload: { name },
    type: FileImportActionTypes.UploadFileSuccess,
  };
}

function uploadFileFailure(name: string, error: Error): UploadFileFailure {
  return {
    context: undefined,
    payload: { name, error },
    type: FileImportActionTypes.UploadFileFailure,
  };
}

function importFilesSuccess(files: File[]): ImportFilesSuccess {
  return {
    context: undefined,
    payload: { files },
    type: FileImportActionTypes.ImportFilesSuccess,
  };
}

function importFilesFailure(error: Error): ImportFilesFailure {
  return {
    context: undefined,
    payload: { error },
    type: FileImportActionTypes.ImportFilesFailure,
  };
}

function importAddFiles(files: File[]): ImportAddFiles {
  return {
    context: undefined,
    payload: { files },
    type: FileImportActionTypes.ImportAddFiles,
  };
}

function importRemoveFile(file: File): ImportRemoveFile {
  return {
    context: undefined,
    payload: { file },
    type: FileImportActionTypes.ImportRemoveFile,
  };
}

function importRemoveAllFiles(): ImportRemoveAllFiles {
  return {
    context: undefined,
    payload: undefined,
    type: FileImportActionTypes.ImportRemoveAllFiles,
  };
}

function getSortByName(name: string | undefined): string | undefined {
  switch (name) {
    case 'name':
      return 'id';
    case 'uploadedAt':
      return 'uploaded_at';
    case 'size':
      return 'size';
    default:
      return undefined;
  }
}

interface ImportedFileFilter {
  name: string;
  query: string;
  value: string;
}

// tslint:disable-next-line:no-any
function getImportedFileFilter(filters: any[]): ImportedFileFilter[] {
  return filters.map(filter => {
    const nameMap = {
      name: 'id',
      size: 'size',
      uploadedAt: 'uploaded_at',
    };

    const name = nameMap[filter.name];
    const query = filter.query;
    const value =
      query === StringFilterQueryType.Contain ||
      query === StringFilterQueryType.NotContain
        ? wrapValueForLike(filter.value)
        : filter.value;

    if (name == null || query == null) {
      throw new Error(`Unexpected imported file list filter, name: ${name}`);
    }

    return {
      name,
      query,
      value,
    };
  });
}

function fetchImportedFilesImpl(
  page: number = 1,
  perPage: number = 25,
  filters: Filter[],
  sortByName: string | undefined,
  isAscending: boolean
): Promise<ImportedFileQueryResult> {
  const params = {
    filter: getImportedFileFilter(filters),
    isAscending,
    page,
    perPage,
    sortByName: getSortByName(sortByName),
  };
  return skygear.lambda('imported_file:get_all', params).then(
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

function getContentType(
  file: File,
  defaultType: string = 'application/octet-stream'
): string {
  if (file.type) {
    return file.type;
  }

  const result = mime.lookup(file.name);
  if (typeof result === 'string') {
    return result;
  }

  return defaultType;
}

function uploadFilesImpl(file: File): Promise<Asset> {
  const dbContainer = new DatabaseContainer(skygear);

  return dbContainer.uploadAsset(
    new Asset({ contentType: getContentType(file), name: file.name, file })
  );
}

function createImportedFilesImpl(
  data: CreateImportedFileRequestData[]
): Promise<void> {
  return skygear.lambda('imported_file:create', { importedFiles: data });
}

function importFiles(files: File[]): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(importFilesRequest(files));

    const uploadFilesPromise = files.map(file => {
      return Promise.resolve()
        .then(() => uploadFilesImpl(file))
        .then(asset => {
          dispatch(uploadFileSuccess(file.name));
          return { id: file.name, asset: asset.name };
        })
        .catch(error => {
          dispatch(uploadFileFailure(file.name, error));
          throw error;
        });
    });

    return Promise.all(uploadFilesPromise)
      .then((data: CreateImportedFileRequestData[]) => {
        return createImportedFilesImpl(data);
      })
      .then(() => {
        dispatch(importFilesSuccess(files));
      })
      .catch(error => {
        dispatch(importFilesFailure(error));
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

  public addFiles(files: File[]) {
    this.dispatch(importAddFiles(files));
  }

  public removeFile(file: File) {
    this.dispatch(importRemoveFile(file));
  }

  public removeAllFile() {
    this.dispatch(importRemoveAllFiles());
  }

  public importFiles(files: File[]) {
    this.dispatch(importFiles(files));
  }
}
