import { ThunkAction } from 'redux-thunk';
import skygear, { QueryResult, Record } from 'skygear';

import { CmsRecord } from '../cmsConfig';

export const FETCH_RECORD_REQUEST = 'FETCH_RECORD_REQUEST';
export type FETCH_RECORD_REQUEST = typeof FETCH_RECORD_REQUEST;
export interface FetchRecordReuest {
  type: FETCH_RECORD_REQUEST;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
  };
}

export const FETCH_RECORD_SUCCESS = 'FETCH_RECORD_SUCCESS';
export type FETCH_RECORD_SUCCESS = typeof FETCH_RECORD_SUCCESS;
export interface FetchRecordSuccess {
  type: FETCH_RECORD_SUCCESS;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
    record: Record;
  };
}

export const FETCH_RECORD_FAILURE = 'FETCH_RECORD_FAILURE';
export type FETCH_RECORD_FAILURE = typeof FETCH_RECORD_FAILURE;
export interface FetchRecordFailure {
  type: FETCH_RECORD_FAILURE;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
    error: Error;
  };
}

export const FETCH_RECORD_LIST_REQUEST = 'FETCH_RECORD_LIST_REQUEST';
export type FETCH_RECORD_LIST_REQUEST = typeof FETCH_RECORD_LIST_REQUEST;
export interface FetchRecordListReuest {
  payload: {
    cmsRecord: CmsRecord;
    page: number;
  };
  type: FETCH_RECORD_LIST_REQUEST;
}

export const FETCH_RECORD_LIST_SUCCESS = 'FETCH_RECORD_LIST_SUCCESS';
export type FETCH_RECORD_LIST_SUCCESS = typeof FETCH_RECORD_LIST_SUCCESS;
export interface FetchRecordListSuccess {
  payload: {
    cmsRecord: CmsRecord;
    page: number;
    perPage: number;
    queryResult: QueryResult<Record>;
  };
  type: FETCH_RECORD_LIST_SUCCESS;
}

export const FETCH_RECORD_LIST_FAILURE = 'FETCH_RECORD_LIST_FAILURE';
export type FETCH_RECORD_LIST_FAILURE = typeof FETCH_RECORD_LIST_FAILURE;
export interface FetchRecordListFailure {
  payload: {
    cmsRecord: CmsRecord;
    error: Error;
  };
  type: FETCH_RECORD_LIST_FAILURE;
}

export type RecordAction =
  | FetchRecordReuest
  | FetchRecordSuccess
  | FetchRecordFailure
  | FetchRecordListReuest
  | FetchRecordListSuccess
  | FetchRecordListFailure;

export interface RecordNamed {
  recordName: string;
}

function fetchRecordRequest(
  cmsRecord: CmsRecord,
  id: string
): FetchRecordReuest {
  return {
    payload: {
      cmsRecord,
      id,
    },
    type: FETCH_RECORD_REQUEST,
  };
}

function fetchRecordSuccess(
  cmsRecord: CmsRecord,
  id: string,
  record: Record
): FetchRecordSuccess {
  return {
    payload: {
      cmsRecord,
      id,
      record,
    },
    type: FETCH_RECORD_SUCCESS,
  };
}

function fetchRecordFailure(
  cmsRecord: CmsRecord,
  id: string,
  error: Error
): FetchRecordFailure {
  return {
    payload: {
      cmsRecord,
      error,
      id,
    },
    type: FETCH_RECORD_FAILURE,
  };
}

function fetchRecordListRequest(
  cmsRecord: CmsRecord,
  page: number
): FetchRecordListReuest {
  return {
    payload: {
      cmsRecord,
      page,
    },
    type: FETCH_RECORD_LIST_REQUEST,
  };
}

function fetchRecordListSuccess(
  cmsRecord: CmsRecord,
  page: number,
  perPage: number,
  queryResult: QueryResult<Record>
): FetchRecordListSuccess {
  return {
    payload: {
      cmsRecord,
      page,
      perPage,
      queryResult,
    },
    type: FETCH_RECORD_LIST_SUCCESS,
  };
}

function fetchRecordListFailure(
  cmsRecord: CmsRecord,
  error: Error
): FetchRecordListFailure {
  return {
    payload: {
      cmsRecord,
      error,
    },
    type: FETCH_RECORD_LIST_FAILURE,
  };
}

export function fetchRecord(
  cmsRecord: CmsRecord,
  id: string
): ThunkAction<Promise<QueryResult<Record>>, void, void> {
  return dispatch => {
    dispatch(fetchRecordRequest(cmsRecord, id));
    return skygear.publicDB.getRecordByID(`${cmsRecord.recordType}/${id}`).then(
      (record: Record) => {
        dispatch(fetchRecordSuccess(cmsRecord, id, record));
      },
      (error: Error) => {
        dispatch(fetchRecordFailure(cmsRecord, id, error));
      }
    );
  };
}

export function fetchRecordList(
  cmsRecord: CmsRecord,
  page: number = 1,
  perPage: number = 25
): ThunkAction<Promise<QueryResult<Record>>, void, void> {
  const RecordCls = skygear.Record.extend(cmsRecord.recordType);

  return dispatch => {
    const query = new skygear.Query(RecordCls);
    query.overallCount = true;
    query.limit = perPage;
    query.offset = (page - 1) * perPage;

    dispatch(fetchRecordListRequest(cmsRecord, page));
    return skygear.publicDB.query(query).then(
      (queryResult: QueryResult<Record>) => {
        dispatch(fetchRecordListSuccess(cmsRecord, page, perPage, queryResult));
      },
      (error: Error) => {
        dispatch(fetchRecordListFailure(cmsRecord, error));
      }
    ) as Promise<Record>;
  };
}

export class RecordActionCreator {
  private cmsRecord: CmsRecord;
  private perPage: number;

  constructor(cmsRecord: CmsRecord, perPage: number) {
    this.cmsRecord = cmsRecord;
    this.perPage = perPage;
  }

  public fetch(
    id: string
  ): ThunkAction<Promise<QueryResult<Record>>, void, void> {
    return fetchRecord(this.cmsRecord, id);
  }

  public fetchList(
    page: number = 1
  ): ThunkAction<Promise<QueryResult<Record>>, void, void> {
    return fetchRecordList(this.cmsRecord, page, this.perPage);
  }
}
