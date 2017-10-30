import { ThunkAction } from 'redux-thunk';
import skygear, { QueryResult, Record } from 'skygear';

export const FETCH_RECORD_REQUEST = 'FETCH_RECORD_REQUEST';
export type FETCH_RECORD_REQUEST = typeof FETCH_RECORD_REQUEST;
export interface FetchRecordReuest {
  type: FETCH_RECORD_REQUEST;
  payload: {
    recordName: string;
    recordType: string;
    id: string;
  };
}

export const FETCH_RECORD_SUCCESS = 'FETCH_RECORD_SUCCESS';
export type FETCH_RECORD_SUCCESS = typeof FETCH_RECORD_SUCCESS;
export interface FetchRecordSuccess {
  type: FETCH_RECORD_SUCCESS;
  payload: {
    recordName: string;
    recordType: string;
    id: string;
    record: Record;
  };
}

export const FETCH_RECORD_FAILURE = 'FETCH_RECORD_FAILURE';
export type FETCH_RECORD_FAILURE = typeof FETCH_RECORD_FAILURE;
export interface FetchRecordFailure {
  type: FETCH_RECORD_FAILURE;
  payload: {
    recordName: string;
    recordType: string;
    id: string;
    error: Error;
  };
}

export const FETCH_RECORD_LIST_REQUEST = 'FETCH_RECORD_LIST_REQUEST';
export type FETCH_RECORD_LIST_REQUEST = typeof FETCH_RECORD_LIST_REQUEST;
export interface FetchRecordListReuest {
  payload: {
    recordName: string;
    recordType: string;
    page: number;
  };
  type: FETCH_RECORD_LIST_REQUEST;
}

export const FETCH_RECORD_LIST_SUCCESS = 'FETCH_RECORD_LIST_SUCCESS';
export type FETCH_RECORD_LIST_SUCCESS = typeof FETCH_RECORD_LIST_SUCCESS;
export interface FetchRecordListSuccess {
  payload: {
    recordName: string;
    recordType: string;
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
    recordName: string;
    recordType: string;
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
  recordName: string,
  recordType: string,
  id: string
): FetchRecordReuest {
  return {
    payload: {
      id,
      recordName,
      recordType,
    },
    type: FETCH_RECORD_REQUEST,
  };
}

function fetchRecordSuccess(
  recordName: string,
  recordType: string,
  id: string,
  record: Record
): FetchRecordSuccess {
  return {
    payload: {
      id,
      record,
      recordName,
      recordType,
    },
    type: FETCH_RECORD_SUCCESS,
  };
}

function fetchRecordFailure(
  recordName: string,
  recordType: string,
  id: string,
  error: Error
): FetchRecordFailure {
  return {
    payload: {
      error,
      id,
      recordName,
      recordType,
    },
    type: FETCH_RECORD_FAILURE,
  };
}

function fetchRecordListRequest(
  recordName: string,
  recordType: string,
  page: number
): FetchRecordListReuest {
  return {
    payload: {
      page,
      recordName,
      recordType,
    },
    type: FETCH_RECORD_LIST_REQUEST,
  };
}

function fetchRecordListSuccess(
  recordName: string,
  recordType: string,
  page: number,
  perPage: number,
  queryResult: QueryResult<Record>
): FetchRecordListSuccess {
  return {
    payload: {
      page,
      perPage,
      queryResult,
      recordName,
      recordType,
    },
    type: FETCH_RECORD_LIST_SUCCESS,
  };
}

function fetchRecordListFailure(
  recordName: string,
  recordType: string,
  error: Error
): FetchRecordListFailure {
  return {
    payload: {
      error,
      recordName,
      recordType,
    },
    type: FETCH_RECORD_LIST_FAILURE,
  };
}

export function fetchRecord(
  recordName: string,
  recordType: string,
  id: string
): ThunkAction<Promise<QueryResult<Record>>, void, void> {
  return dispatch => {
    dispatch(fetchRecordRequest(recordName, recordType, id));
    return skygear.publicDB.getRecordByID(id).then(
      (record: Record) => {
        dispatch(fetchRecordSuccess(recordName, recordType, id, record));
      },
      (error: Error) => {
        dispatch(fetchRecordFailure(recordName, recordType, id, error));
      }
    );
  };
}

export function fetchRecordList(
  recordName: string,
  recordType: string,
  page: number = 1,
  perPage: number = 25
): ThunkAction<Promise<QueryResult<Record>>, void, void> {
  const RecordCls = skygear.Record.extend(recordType);

  return dispatch => {
    const query = new skygear.Query(RecordCls);
    query.overallCount = true;
    query.limit = perPage;
    query.offset = (page - 1) * perPage;

    dispatch(fetchRecordListRequest(recordName, recordType, page));
    return skygear.publicDB.query(query).then(
      (queryResult: QueryResult<Record>) => {
        dispatch(
          fetchRecordListSuccess(
            recordName,
            recordType,
            page,
            perPage,
            queryResult
          )
        );
      },
      (error: Error) => {
        dispatch(fetchRecordListFailure(recordName, recordType, error));
      }
    ) as Promise<Record>;
  };
}

export class RecordActionCreator {
  private recordName: string;
  private recordType: string;
  private perPage: number;

  constructor(recordName: string, recordType: string, perPage: number) {
    this.recordName = recordName;
    this.recordType = recordType;
    this.perPage = perPage;
  }

  public fetch(
    id: string
  ): ThunkAction<Promise<QueryResult<Record>>, void, void> {
    return fetchRecord(this.recordName, this.recordType, id);
  }

  public fetchList(
    page: number = 1
  ): ThunkAction<Promise<QueryResult<Record>>, void, void> {
    return fetchRecordList(
      this.recordName,
      this.recordType,
      page,
      this.perPage
    );
  }
}
