import { ThunkAction } from 'redux-thunk';
import skygear, { Query, QueryResult, Record } from 'skygear';

import { CmsRecord } from '../cmsConfig';

export type RecordActions =
  | FetchRecordReuest
  | FetchRecordSuccess
  | FetchRecordFailure
  | FetchRecordListReuest
  | FetchRecordListSuccess
  | FetchRecordListFailure;

export enum RecordActionTypes {
  FetchRequest = 'FETCH_RECORD_REQUEST',
  FetchSuccess = 'FETCH_RECORD_SUCCESS',
  FetchFailure = 'FETCH_RECORD_FAILURE',
  FetchListRequest = 'FETCH_RECORD_LIST_REQUEST',
  FetchListSuccess = 'FETCH_RECORD_LIST_SUCCESS',
  FetchListFailure = 'FETCH_RECORD_LIST_FAILURE',
}

export interface FetchRecordReuest {
  type: RecordActionTypes.FetchRequest;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
  };
}

export interface FetchRecordSuccess {
  type: RecordActionTypes.FetchSuccess;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
    record: Record;
  };
}

export interface FetchRecordFailure {
  type: RecordActionTypes.FetchFailure;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
    error: Error;
  };
}

export interface FetchRecordListReuest {
  payload: {
    cmsRecord: CmsRecord;
    page: number;
  };
  type: RecordActionTypes.FetchListRequest;
}

export interface FetchRecordListSuccess {
  payload: {
    cmsRecord: CmsRecord;
    page: number;
    perPage: number;
    queryResult: QueryResult<Record>;
  };
  type: RecordActionTypes.FetchListSuccess;
}

export interface FetchRecordListFailure {
  payload: {
    cmsRecord: CmsRecord;
    error: Error;
  };
  type: RecordActionTypes.FetchListFailure;
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
    type: RecordActionTypes.FetchRequest,
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
    type: RecordActionTypes.FetchSuccess,
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
    type: RecordActionTypes.FetchFailure,
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
    type: RecordActionTypes.FetchListRequest,
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
    type: RecordActionTypes.FetchListSuccess,
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
    type: RecordActionTypes.FetchListFailure,
  };
}

export function fetchRecord(
  cmsRecord: CmsRecord,
  id: string
): ThunkAction<Promise<void>, {}, {}> {
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
): ThunkAction<Promise<void>, {}, {}> {
  const RecordCls = Record.extend(cmsRecord.recordType);

  return dispatch => {
    const query = new Query(RecordCls);
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

  public fetch(id: string): ThunkAction<Promise<void>, {}, {}> {
    return fetchRecord(this.cmsRecord, id);
  }

  public fetchList(page: number = 1): ThunkAction<Promise<void>, {}, {}> {
    return fetchRecordList(this.cmsRecord, page, this.perPage);
  }
}
