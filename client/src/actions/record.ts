import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear, {
  Query,
  QueryResult,
  Record,
  RecordCls,
  Reference,
} from 'skygear';

import {
  AssociationReferenceFieldConfig,
  BooleanFilter,
  BooleanFilterQueryType,
  CmsRecord,
  DateTimeFilter,
  DateTimeFilterQueryType,
  FieldConfigTypes,
  Filter,
  FilterType,
  GeneralFilter,
  GeneralFilterQueryType,
  IntegerFilter,
  IntegerFilterQueryType,
  ReferenceConfig,
  ReferenceFieldConfig,
  StringFilter,
  StringFilterQueryType,
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
  references: ReferenceConfig[],
  id: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const recordCls = Record.extend(cmsRecord.recordType);

    const query = new Query(recordCls);
    query.equalTo('_id', id);
    query.limit = 1;

    dispatch(fetchRecordRequest(cmsRecord, id));
    return queryWithTarget(query, references)
      .then((queryResult: QueryResult<Record>) => {
        const [record] = queryResult;

        if (record === undefined) {
          throw new Error(`Couldn't find ${cmsRecord.name} with id = ${id}`);
        }

        return record;
      })
      .then(
        record => {
          dispatch(fetchRecordSuccess(cmsRecord, id, record));
        },
        error => {
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
      },
      (error: Error) => {
        dispatch(saveRecordFailure(cmsRecord, record, error));
      }
    );
  };
}

function fetchRecordList(
  cmsRecord: CmsRecord,
  references: ReferenceConfig[],
  filters: Filter[],
  page: number = 1,
  perPage: number = 25
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const recordCls = Record.extend(cmsRecord.recordType);

    let query: Query;
    if (
      filters.length === 1 &&
      filters[0].type === FilterType.GeneralFilterType
    ) {
      query = createGeneralFilterQuery(filters[0] as GeneralFilter, recordCls);
    } else {
      query = new Query(recordCls);
      filters.forEach(filter => {
        addFilterToQuery(query, filter, recordCls);
      });
    }

    query.overallCount = true;
    query.limit = perPage;
    query.offset = (page - 1) * perPage;
    query.addDescending('_created_at');

    dispatch(fetchRecordListRequest(cmsRecord, page));
    return queryWithTarget(query, references).then(
      queryResult => {
        dispatch(fetchRecordListSuccess(cmsRecord, page, perPage, queryResult));
      },
      error => {
        dispatch(fetchRecordListFailure(cmsRecord, error));
      }
    );
  };
}

function addFilterToQuery(
  query: Query,
  filter: Filter,
  recordCls: RecordCls
) {
  switch (filter.type) {
    case FilterType.StringFilterType:
      addStringFilterToQuery(query, filter as StringFilter);
      break;
    case FilterType.IntegerFilterType:
      addIntegerFilterToQuery(query, filter as IntegerFilter);
      break;
    case FilterType.BooleanFilterType:
      addBooleanFilterToQuery(query, filter as BooleanFilter);
      break;
    case FilterType.DateTimeFilterType:
      addDatetimeFilterToQuery(query, filter as DateTimeFilter);
      break;
  }
}

function addStringFilterToQuery(query: Query, filter: StringFilter) {
  switch (filter.query) {
    case StringFilterQueryType.EqualTo:
      query.equalTo(filter.name, filter.value);
      break;
    case StringFilterQueryType.NotEqualTo:
      query.notEqualTo(filter.name, filter.value);
      break;
    case StringFilterQueryType.Like:
      query.like(filter.name, filter.value);
      break;
    case StringFilterQueryType.NotLike:
      query.notLike(filter.name, filter.value);
      break;
  }
}

function addIntegerFilterToQuery(query: Query, filter: IntegerFilter) {
  switch (filter.query) {
    case IntegerFilterQueryType.EqualTo:
      query.equalTo(filter.name, filter.value);
      break;
    case IntegerFilterQueryType.NotEqualTo:
      query.notEqualTo(filter.name, filter.value);
      break;
    case IntegerFilterQueryType.LessThan:
      query.lessThan(filter.name, filter.value);
      break;
    case IntegerFilterQueryType.GreaterThan:
      query.greaterThan(filter.name, filter.value);
      break;
    case IntegerFilterQueryType.LessThanOrEqualTo:
      query.lessThanOrEqualTo(filter.name, filter.value);
      break;
    case IntegerFilterQueryType.GreaterThanOrEqualTo:
      query.greaterThanOrEqualTo(filter.name, filter.value);
      break;
  }
}

function addBooleanFilterToQuery(query: Query, filter: BooleanFilter) {
  switch (filter.query) {
    case BooleanFilterQueryType.True:
      query.equalTo(filter.name, true);
      break;
    case BooleanFilterQueryType.False:
      query.equalTo(filter.name, false);
      break;
  }
}

function addDatetimeFilterToQuery(query: Query, filter: DateTimeFilter) {
  switch (filter.query) {
    case DateTimeFilterQueryType.Before:
      query.lessThan(filter.name, filter.value);
      break;
    case DateTimeFilterQueryType.After:
      query.greaterThan(filter.name, filter.value);
      break;
  }
}

function createGeneralFilterQuery(filter: GeneralFilter, recordCls: RecordCls) {
  switch (filter.query) {
    case GeneralFilterQueryType.Contains:
      const generalQuery = filter.names
        .map(name => {
          const q = new Query(recordCls);
          q.like(name, `%${filter.value}%`);
          return q;
        })
        .reduce((accumulator, currentValue) =>
          Query.or(accumulator, currentValue)
        );

      return generalQuery;
  }
}

function queryWithTarget(
  query: Query,
  references: ReferenceConfig[]
): Promise<QueryResult<Record>> {
  const [refs, assoRefs] = separateReferenceConfigs(references);

  refs.forEach(config => {
    query.transientInclude(config.name);
  });

  return skygear.publicDB
    .query(query)
    .then((queryResult: QueryResult<Record>) => {
      const sources = queryResult.map(r => r);

      return fetchAllAssociationRecordsWithTarget(
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
    });
}

function fetchAllAssociationRecordsWithTarget(
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
// `${ref.name}Associations` and ref.name record.$transient respectively
function distributeAssociationRecords(
  sourceById: Map<string, Record>,
  ref: AssociationReferenceFieldConfig,
  associationRecords: Record[]
): void {
  const assoRecordsBySourceId = groupBy(associationRecords, assoRecord => {
    const sourceRef: Reference = assoRecord[ref.sourceReference.name];
    return parseReference(sourceRef).recordId;
  });
  sourceById.forEach((source, sourceId) => {
    const assoRecords = assoRecordsBySourceId.get(sourceId) || [];
    const targetRecords = assoRecords.map(
      r => r.$transient[ref.targetReference.name]
    );

    source.$transient[ref.name] = targetRecords;
    source.$transient[`${ref.name}Associations`] = assoRecords;
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

  const associationRecordCls = Record.extend(
    assoRecordConfig.cmsRecord.recordType
  );
  const query = new Query(associationRecordCls);
  query.limit = 1024;
  query.addDescending('_created_at');

  query.contains(sourceRef.name, sourceIds);
  query.transientInclude(targetRef.name);

  return skygear.publicDB
    .query(query)
    .then(queryResult => queryResult.map(r => r));
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
  private references: ReferenceConfig[];

  constructor(
    dispatch: Dispatch<RootState>,
    cmsRecord: CmsRecord,
    references: ReferenceConfig[]
  ) {
    this.dispatch = dispatch;
    this.cmsRecord = cmsRecord;
    this.references = references;
  }

  public fetch(id: string): Promise<void> {
    return this.dispatch(fetchRecord(this.cmsRecord, this.references, id));
  }

  public fetchList(
    page: number,
    perPage: number,
    filters: Filter[] = []
  ): Promise<void> {
    return this.dispatch(
      fetchRecordList(this.cmsRecord, this.references, filters, page, perPage)
    );
  }

  public save(record: Record): Promise<void> {
    return this.dispatch(saveRecord(this.cmsRecord, record));
  }
}
