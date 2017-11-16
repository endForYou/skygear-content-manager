import { push } from 'react-router-redux';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear, { Query, QueryResult, Record, Reference } from 'skygear';

import {
  AssociationReferenceFieldConfig,
  CmsRecord,
  FieldConfigTypes,
  ReferenceConfig,
  ReferenceFieldConfig,
} from '../cmsConfig';
import { parseReference } from '../recordUtil';
import { RootState } from '../states';
import { groupBy } from '../util';

export type RecordActions =
  | FetchRecordReuest
  | FetchRecordSuccess
  | FetchRecordFailure
  | FetchRecordListReuest
  | FetchRecordListSuccess
  | FetchRecordListFailure
  | SaveRecordReuest
  | SaveRecordSuccess
  | SaveRecordFailure;

export enum RecordActionTypes {
  FetchRequest = 'FETCH_RECORD_REQUEST',
  FetchSuccess = 'FETCH_RECORD_SUCCESS',
  FetchFailure = 'FETCH_RECORD_FAILURE',
  FetchListRequest = 'FETCH_RECORD_LIST_REQUEST',
  FetchListSuccess = 'FETCH_RECORD_LIST_SUCCESS',
  FetchListFailure = 'FETCH_RECORD_LIST_FAILURE',
  SaveRequest = 'SAVE_RECORD_REQUEST',
  SaveSuccess = 'SAVE_RECORD_SUCCESS',
  SaveFailure = 'SAVE_RECORD_FAILURE',
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

export interface SaveRecordReuest {
  type: RecordActionTypes.SaveRequest;
  payload: {
    cmsRecord: CmsRecord;
    record: Record;
  };
}

export interface SaveRecordSuccess {
  type: RecordActionTypes.SaveSuccess;
  payload: {
    cmsRecord: CmsRecord;
    record: Record;
  };
}

export interface SaveRecordFailure {
  type: RecordActionTypes.SaveFailure;
  payload: {
    cmsRecord: CmsRecord;
    record: Record;
    error: Error;
  };
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

function saveRecordRequest(
  cmsRecord: CmsRecord,
  record: Record
): SaveRecordReuest {
  return {
    payload: {
      cmsRecord,
      record,
    },
    type: RecordActionTypes.SaveRequest,
  };
}

function saveRecordSuccess(
  cmsRecord: CmsRecord,
  record: Record
): SaveRecordSuccess {
  return {
    payload: {
      cmsRecord,
      record,
    },
    type: RecordActionTypes.SaveSuccess,
  };
}

function saveRecordFailure(
  cmsRecord: CmsRecord,
  record: Record,
  error: Error
): SaveRecordFailure {
  return {
    payload: {
      cmsRecord,
      error,
      record,
    },
    type: RecordActionTypes.SaveFailure,
  };
}

export function fetchRecord(
  cmsRecord: CmsRecord,
  id: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const RecordCls = Record.extend(cmsRecord.recordType);

    const query = new Query(RecordCls);
    query.equalTo('_id', id);
    query.limit = 1;

    modifyQueryWithReferenceConfigs(query, cmsRecord.references);

    dispatch(fetchRecordRequest(cmsRecord, id));
    return skygear.publicDB
      .query(query)
      .then((queryResult: QueryResult<Record>) => {
        const [record] = queryResult;

        if (record === undefined) {
          throw new Error(`Couldn't find ${cmsRecord.name} with id = ${id}`);
        }

        return record;
      })
      .then(
        (record: Record) => {
          dispatch(fetchRecordSuccess(cmsRecord, id, record));
        },
        (error: Error) => {
          dispatch(fetchRecordFailure(cmsRecord, id, error));
        }
      );
  };
}

function saveRecord(
  cmsRecord: CmsRecord,
  record: Record
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(saveRecordRequest(cmsRecord, record));
    return skygear.publicDB.save(record).then(
      (savedRecord: Record) => {
        dispatch(saveRecordSuccess(cmsRecord, savedRecord));
        dispatch(push(`/record/${cmsRecord.name}/${record._id}`));
      },
      (error: Error) => {
        dispatch(saveRecordFailure(cmsRecord, record, error));
      }
    );
  };
}

function fetchRecordList(
  cmsRecord: CmsRecord,
  page: number = 1,
  perPage: number = 25
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const RecordCls = Record.extend(cmsRecord.recordType);

    const query = new Query(RecordCls);
    query.overallCount = true;
    query.limit = perPage;
    query.offset = (page - 1) * perPage;

    query.addDescending('_created_at');

    const [refs, assoRefs] = separateReferenceConfigs(cmsRecord.references);

    refs.forEach(config => {
      query.transientInclude(config.name);
    });

    dispatch(fetchRecordListRequest(cmsRecord, page));
    return skygear.publicDB
      .query(query)
      .then((queryResult: QueryResult<Record>) => {
        const sources = queryResult.map(r => r);

        return fetchToManyRecordsWithAssociations(
          sources,
          assoRefs
        ).then(refAssoRecordsPairs => {
          // mutate queryResult s.t. it has target records and association
          // records in $transient

          refAssoRecordsPairs.forEach(([ref, assoRecords]) => {
            const sourceById = new Map(
              sources.map(r => [r._id, r] as [string, Record])
            );

            distributeAssociationRecords(sourceById, ref, assoRecords);
          });

          return queryResult;
        });
      })
      .then(
        queryResult => {
          dispatch(
            fetchRecordListSuccess(cmsRecord, page, perPage, queryResult)
          );
        },
        error => {
          dispatch(fetchRecordListFailure(cmsRecord, error));
        }
      );
  };
}

function fetchToManyRecordsWithAssociations(
  sources: Record[],
  refs: AssociationReferenceFieldConfig[]
): Promise<Array<[AssociationReferenceFieldConfig, Record[]]>> {
  if (refs.length === 0) {
    return Promise.resolve([]);
  }

  const sourceIds = sources.map(r => r._id);

  const assoRecordsPromises = refs.map(ref => {
    return fetchAssociationRecordsWithTarget(sourceIds, ref).then(
      assoRecords =>
        [ref, assoRecords] as [AssociationReferenceFieldConfig, Record[]]
    );
  });

  return Promise.all(assoRecordsPromises);
}

// assign association records and its transient target records into
// `${ref.name}_associations` and ref.name record.$transient respectively
function distributeAssociationRecords(
  sourceById: Map<string, Record>,
  ref: AssociationReferenceFieldConfig,
  associationRecords: Record[]
): void {
  const assoRecordsBySourceId = groupBy(associationRecords, assoRecord => {
    const sourceRef: Reference = assoRecord[ref.sourceReference.name];
    return parseReference(sourceRef).recordId;
  });
  assoRecordsBySourceId.forEach((assoRecords, sourceId) => {
    const source = sourceById.get(sourceId);
    if (source === undefined) {
      console.warn(`Couldn't find source.id = ${sourceId} for association`);
    }

    const targetRecords = assoRecords.map(
      r => r.$transient[ref.targetReference.name]
    );

    source.$transient[ref.name] = targetRecords;
    source.$transient[`${ref.name}_associations`] = targetRecords;
  });
}

function fetchAssociationRecordsWithTarget(
  sourceIds: string[],
  assoRefConfig: AssociationReferenceFieldConfig
): Promise<Record[]> {
  const {
    associationRecordConfig: assoRecordConfig,
    sourceReference: sourceRef,
    targetReference: targetRef,
  } = assoRefConfig;

  const associationRecordCls = Record.extend(assoRecordConfig.recordType);
  const query = new Query(associationRecordCls);
  query.limit = 1024;
  query.addDescending('_created_at');

  query.contains(sourceRef.name, sourceIds);
  query.transientInclude(targetRef.name);

  return skygear.publicDB
    .query(query)
    .then(queryResult => queryResult.map(r => r));
}

function modifyQueryWithReferenceConfigs(
  query: Query,
  configs: ReferenceConfig[]
) {
  configs.forEach(config => {
    switch (config.type) {
      case FieldConfigTypes.Reference:
        query.transientInclude(config.name);
        break;
      default:
        throw new Error(`unknown ReferenceConfig.type = ${config.type}`);
    }
  });
}

function separateReferenceConfigs(
  configs: ReferenceConfig[]
): [ReferenceFieldConfig[], AssociationReferenceFieldConfig[]] {
  const refs: ReferenceFieldConfig[] = [];
  const assoRefs: AssociationReferenceFieldConfig[] = [];

  configs.forEach(config => {
    switch (config.type) {
      case FieldConfigTypes.Reference:
        refs.push(config);
        break;
      case FieldConfigTypes.AssociationReference:
        assoRefs.push(config);
        break;
    }
  });

  return [refs, assoRefs];
}

export class RecordActionDispatcher {
  private dispatch: Dispatch<RootState>;
  private cmsRecord: CmsRecord;

  constructor(dispatch: Dispatch<RootState>, cmsRecord: CmsRecord) {
    this.dispatch = dispatch;
    this.cmsRecord = cmsRecord;
  }

  public fetch(id: string): Promise<void> {
    return this.dispatch(fetchRecord(this.cmsRecord, id));
  }

  public fetchList(page: number, perPage: number): Promise<void> {
    return this.dispatch(fetchRecordList(this.cmsRecord, page, perPage));
  }

  public save(record: Record): Promise<void> {
    return this.dispatch(saveRecord(this.cmsRecord, record));
  }
}
