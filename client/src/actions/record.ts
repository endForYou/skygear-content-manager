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
  BackReferenceFieldConfig,
  BaseFilterQueryType,
  BooleanFilter,
  BooleanFilterQueryType,
  CmsRecord,
  DateTimeFilter,
  DateTimeFilterQueryType,
  EmbeddedBackReferenceFieldConfig,
  FieldConfigTypes,
  Filter,
  FilterType,
  GeneralFilter,
  GeneralFilterQueryType,
  IntegerFilter,
  IntegerFilterQueryType,
  ReferenceConfig,
  ReferenceFieldConfig,
  ReferenceFilter,
  ReferenceFilterQueryType,
  SortOrder,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';
import { parseReference } from '../recordUtil';
import { RootState } from '../states';
import { groupBy } from '../util';

export type RecordActions =
  | FetchRecordRequest
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

export interface FetchRecordRequest {
  type: RecordActionTypes.FetchRequest;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
  };
  context: string;
}

export interface FetchRecordSuccess {
  type: RecordActionTypes.FetchSuccess;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
    record: Record;
  };
  context: string;
}

export interface FetchRecordFailure {
  type: RecordActionTypes.FetchFailure;
  payload: {
    cmsRecord: CmsRecord;
    id: string;
    error: Error;
  };
  context: string;
}

export interface FetchRecordListReuest {
  payload: {
    cmsRecord: CmsRecord;
    page: number;
  };
  type: RecordActionTypes.FetchListRequest;
  context: string;
}

export interface FetchRecordListSuccess {
  payload: {
    cmsRecord: CmsRecord;
    page: number;
    perPage: number;
    queryResult: QueryResult<Record>;
  };
  type: RecordActionTypes.FetchListSuccess;
  context: string;
}

export interface FetchRecordListFailure {
  payload: {
    cmsRecord: CmsRecord;
    error: Error;
  };
  type: RecordActionTypes.FetchListFailure;
  context: string;
}

export interface SaveRecordReuest {
  type: RecordActionTypes.SaveRequest;
  payload: {
    cmsRecord: CmsRecord;
    record: Record;
  };
  context: string;
}

export interface SaveRecordSuccess {
  type: RecordActionTypes.SaveSuccess;
  payload: {
    cmsRecord: CmsRecord;
    record: Record;
  };
  context: string;
}

export interface SaveRecordFailure {
  type: RecordActionTypes.SaveFailure;
  payload: {
    cmsRecord: CmsRecord;
    record: Record;
    error: Error;
  };
  context: string;
}

function fetchRecordRequest(
  cmsRecord: CmsRecord,
  id: string,
  context: string
): FetchRecordRequest {
  return {
    context,
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
  record: Record,
  context: string
): FetchRecordSuccess {
  return {
    context,
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
  error: Error,
  context: string
): FetchRecordFailure {
  return {
    context,
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
  page: number,
  context: string
): FetchRecordListReuest {
  return {
    context,
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
  queryResult: QueryResult<Record>,
  context: string
): FetchRecordListSuccess {
  return {
    context,
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
  error: Error,
  context: string
): FetchRecordListFailure {
  return {
    context,
    payload: {
      cmsRecord,
      error,
    },
    type: RecordActionTypes.FetchListFailure,
  };
}

function saveRecordRequest(
  cmsRecord: CmsRecord,
  record: Record,
  context: string
): SaveRecordReuest {
  return {
    context,
    payload: {
      cmsRecord,
      record,
    },
    type: RecordActionTypes.SaveRequest,
  };
}

function saveRecordSuccess(
  cmsRecord: CmsRecord,
  record: Record,
  context: string
): SaveRecordSuccess {
  return {
    context,
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
  error: Error,
  context: string
): SaveRecordFailure {
  return {
    context,
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
  id: string,
  context: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const recordCls = Record.extend(cmsRecord.recordType);

    const query = new Query(recordCls);
    query.equalTo('_id', id);
    query.limit = 1;

    dispatch(fetchRecordRequest(cmsRecord, id, context));
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
          dispatch(fetchRecordSuccess(cmsRecord, id, record, context));
        },
        error => {
          dispatch(fetchRecordFailure(cmsRecord, id, error, context));

          throw error;
        }
      );
  };
}

function saveRecord(
  cmsRecord: CmsRecord,
  record: Record,
  context: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(saveRecordRequest(cmsRecord, record, context));
    return skygear.publicDB.save(record).then(
      (savedRecord: Record) => {
        dispatch(saveRecordSuccess(cmsRecord, savedRecord, context));
      },
      (error: Error) => {
        dispatch(saveRecordFailure(cmsRecord, record, error, context));

        throw error;
      }
    );
  };
}

function fetchRecordList(
  cmsRecord: CmsRecord,
  references: ReferenceConfig[],
  filters: Filter[],
  page: number = 1,
  perPage: number = 25,
  sortByName: string | undefined,
  isAscending: boolean,
  context: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const recordCls = Record.extend(cmsRecord.recordType);
    const query = queryWithFilters(filters, recordCls);

    query.overallCount = true;
    query.limit = perPage;
    query.offset = (page - 1) * perPage;

    if (!sortByName) {
      // default sorting
      query.addDescending('_created_at');
    } else if (isAscending) {
      query.addAscending(sortByName);
    } else {
      query.addDescending(sortByName);
    }

    dispatch(fetchRecordListRequest(cmsRecord, page, context));
    return queryWithTarget(query, references).then(
      queryResult => {
        dispatch(
          fetchRecordListSuccess(cmsRecord, page, perPage, queryResult, context)
        );
      },
      error => {
        dispatch(fetchRecordListFailure(cmsRecord, error, context));

        throw error;
      }
    );
  };
}

export function queryWithFilters(
  filters: Filter[],
  recordCls: RecordCls
): Query {
  const firstFilter = filters[0];

  if (
    filters.length === 1 &&
    firstFilter.type === FilterType.GeneralFilterType
  ) {
    return createGeneralFilterQuery(firstFilter, recordCls);
  } else {
    const query = new Query(recordCls);
    filters.forEach(filter => {
      addFilterToQuery(query, filter, recordCls);
    });
    return query;
  }
}

function addFilterToQuery(query: Query, filter: Filter, recordCls: RecordCls) {
  switch (filter.query) {
    case BaseFilterQueryType.IsNull:
      query.equalTo(filter.name, null);
      return;
    case BaseFilterQueryType.IsNotNull:
      query.notEqualTo(filter.name, null);
      return;
  }
  switch (filter.type) {
    case FilterType.StringFilterType:
      addStringFilterToQuery(query, filter);
      break;
    case FilterType.IntegerFilterType:
      addIntegerFilterToQuery(query, filter);
      break;
    case FilterType.BooleanFilterType:
      addBooleanFilterToQuery(query, filter);
      break;
    case FilterType.DateTimeFilterType:
      addDatetimeFilterToQuery(query, filter);
      break;
    case FilterType.ReferenceFilterType:
      addReferenceFilterToQuery(query, filter);
      break;
    default:
      throw new Error(
        `addFilterToQuery does not support FilterType ${filter.type}`
      );
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
    default:
      throw new Error(
        `addStringFilterToQuery does not support StringFilterQueryType ${filter.type}`
      );
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
    default:
      throw new Error(
        `addIntegerFilterToQuery does not support IntegerFilterQueryType ${filter.type}`
      );
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
    default:
      throw new Error(
        `addBooleanFilterToQuery does not support BooleanFilterQueryType ${filter.type}`
      );
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
    default:
      throw new Error(
        `addDatetimeFilterToQuery does not support DateTimeFilterQueryType ${filter.type}`
      );
  }
}

function addReferenceFilterToQuery(query: Query, filter: ReferenceFilter) {
  switch (filter.query) {
    case ReferenceFilterQueryType.Contains:
      filter.values.forEach(value => {
        query.like(`${filter.name}.${filter.displayFieldName}`, `%${value}%`);
      });
      break;
    default:
      throw new Error(
        `addDatetimeFilterToQuery does not support DateTimeFilterQueryType ${filter.type}`
      );
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
    default:
      throw new Error(
        `createGeneralFilterQuery does not support GeneralFilterQueryType ${filter.query}`
      );
  }
}

interface BackReferenceAttrs {
  name: string;
  positionFieldName: string;
  sortOrder: SortOrder;
  sourceFieldName: string;
  targetCmsRecord: CmsRecord;
}

// BackReferenceFieldConfig and EmbeddedBackReferenceFieldConfig are using the
// same logic to fetch the referent
function BackReferenceAttrs(
  a: BackReferenceFieldConfig | EmbeddedBackReferenceFieldConfig
): BackReferenceAttrs {
  let positionFieldName: string;
  let sortOrder: SortOrder;
  if (a.type === FieldConfigTypes.BackReference) {
    positionFieldName = '_created_at';
    sortOrder = SortOrder.Desc;
  } else {
    // since EmbeddedBackReference would create new child record
    // to display the new child record at last, the default sorting is asc for _created_at
    positionFieldName = a.positionFieldName || '_created_at';
    sortOrder = a.positionFieldName != null ? a.sortOrder : SortOrder.Asc;
  }

  return {
    name: a.name,
    positionFieldName,
    sortOrder,
    sourceFieldName: a.sourceFieldName,
    targetCmsRecord: a.targetCmsRecord,
  };
}

// This function would query records and include one layer of reference.
// For references inside embedded reference, this function would be called
// recursively for each layer of reference.
function queryWithTarget(
  query: Query,
  references: ReferenceConfig[]
): Promise<QueryResult<Record>> {
  const [refs, backRefs, assoRefs, embeddedBackRefs] = separateReferenceConfigs(
    references
  );

  refs.forEach(config => {
    query.transientInclude(config.name);
  });

  let queryResult: QueryResult<Record>;
  let sources: Record[];

  return skygear.publicDB
    .query(query)
    .then((qr: QueryResult<Record>) => {
      queryResult = qr;
      sources = qr.map(r => r);

      // group back reference and embedded back reference
      const backRefsAttrs = [...backRefs, ...embeddedBackRefs].map(
        BackReferenceAttrs
      );

      return Promise.all([
        fetchAllReferentsWithTarget(sources, backRefsAttrs),
        fetchAllAssociationRecordsWithTarget(sources, assoRefs),
      ]);
    })
    .then(([refReferentsPair, refAssoRecordsPairs]) => {
      const sourceById = new Map(
        sources.map(r => [r._id, r] as [string, Record])
      );

      // mutate queryResult s.t. it has target records and association
      // records in $transient
      refReferentsPair.forEach(([ref, referents]) => {
        distributeReferents(sourceById, ref, referents);
      });
      refAssoRecordsPairs.forEach(([ref, assoRecords]) => {
        distributeAssociationRecords(sourceById, ref, assoRecords);
      });

      // For each embedded reference,
      // - fetch reference within embedded references
      // - replace the original record(s) in $transient with the fetched result
      //   which includes one more level of reference
      //
      // TODO (Steven-Chan):
      // Handle EmbeddedReference for one-to-one and many-to-many
      const nextLevelQueries = embeddedBackRefs.map(ref => {
        // const isSingleEmbeddedRef = ref.type === FieldConfigTypes.Reference;
        const isSingleEmbeddedRef = false;
        const ids: string[] = [];
        sources.forEach(r => {
          if (isSingleEmbeddedRef) {
            ids.push(r.$transient[ref.name]._id);
          } else {
            r.$transient[ref.name].forEach((tr: Record) => ids.push(tr._id));
          }
        });

        const recordCls = Record.extend(ref.targetCmsRecord.recordType);
        const nextLevelQuery = new Query(recordCls);
        nextLevelQuery.contains('_id', ids);
        nextLevelQuery.limit = ids.length;

        return queryWithTarget(
          nextLevelQuery,
          ref.references
        ).then(transientQueryResult => {
          const transientQueryResultById = groupBy(
            transientQueryResult.map(qr => qr),
            r => r._id
          );

          // mutate the original queryResult
          sources.forEach(r => {
            const targetEmbeddedRecords = r.$transient[ref.name];
            r.$transient[ref.name] = isSingleEmbeddedRef
              ? transientQueryResultById.get(targetEmbeddedRecords._id)![0]
              : targetEmbeddedRecords.map((embeddedRecord: Record) => {
                  return transientQueryResultById.get(embeddedRecord._id)![0];
                });
          });
        });
      });

      return Promise.all(nextLevelQueries);
    })
    .then(() => queryResult);
}

function fetchAllReferentsWithTarget(
  sources: Record[],
  refs: BackReferenceAttrs[]
): Promise<Array<[BackReferenceAttrs, Record[]]>> {
  if (refs.length === 0) {
    return Promise.resolve([]);
  }

  const sourceIds = sources.map(r => r._id);

  const referentPromises = refs.map(ref => {
    return fetchReferentsWithTarget(sourceIds, ref).then(
      referents => [ref, referents] as [BackReferenceAttrs, Record[]]
    );
  });

  return Promise.all(referentPromises);
}

function distributeReferents(
  sourceById: Map<string, Record>,
  ref: BackReferenceAttrs,
  referents: Record[]
): void {
  const referentsBySourceId = groupBy(referents, referent => {
    const sourceRef: Reference = referent[ref.sourceFieldName];
    return parseReference(sourceRef).recordId;
  });
  sourceById.forEach((source, sourceId) => {
    source.$transient[ref.name] = referentsBySourceId.get(sourceId) || [];
  });
}

function fetchReferentsWithTarget(
  sourceIds: string[],
  backRefConfig: BackReferenceAttrs
): Promise<Record[]> {
  return fetchReferentRecords(
    sourceIds,
    backRefConfig.targetCmsRecord.recordType,
    backRefConfig.sourceFieldName,
    {
      sortAscending: backRefConfig.sortOrder === SortOrder.Asc,
      sortByField: backRefConfig.positionFieldName,
    }
  );
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
  return fetchReferentRecords(
    sourceIds,
    assoRefConfig.associationRecordConfig.cmsRecord.recordType,
    assoRefConfig.sourceReference.name,
    {
      transientIncludeFieldName: assoRefConfig.targetReference.name,
    }
  );
}

function fetchReferentRecords(
  sourceIds: string[],
  recordType: string,
  sourceFieldName: string,
  option?: {
    transientIncludeFieldName?: string;
    sortByField?: string;
    sortAscending?: boolean;
  }
): Promise<Record[]> {
  const query = new Query(Record.extend(recordType));
  query.limit = 1024;

  const sortByField =
    option && option.sortByField ? option.sortByField : '_created_at';
  const sortAscending = !!(option && option.sortAscending);
  if (sortAscending) {
    query.addAscending(sortByField);
  } else {
    query.addDescending(sortByField);
  }

  query.contains(sourceFieldName, sourceIds);
  if (option && option.transientIncludeFieldName) {
    query.transientInclude(option.transientIncludeFieldName);
  }

  return skygear.publicDB
    .query(query)
    .then(queryResult => queryResult.map(r => r));
}

function separateReferenceConfigs(
  configs: ReferenceConfig[]
): [
  ReferenceFieldConfig[],
  BackReferenceFieldConfig[],
  AssociationReferenceFieldConfig[],
  EmbeddedBackReferenceFieldConfig[]
] {
  const refs: ReferenceFieldConfig[] = [];
  const backRefs: BackReferenceFieldConfig[] = [];
  const assoRefs: AssociationReferenceFieldConfig[] = [];
  const embeddedBackRefs: EmbeddedBackReferenceFieldConfig[] = [];

  configs.forEach(config => {
    switch (config.type) {
      case FieldConfigTypes.Reference:
        refs.push(config);
        break;
      case FieldConfigTypes.BackReference:
        backRefs.push(config);
        break;
      case FieldConfigTypes.AssociationReference:
        assoRefs.push(config);
        break;
      case FieldConfigTypes.EmbeddedBackReference:
        embeddedBackRefs.push(config);
        break;
    }
  });

  return [refs, backRefs, assoRefs, embeddedBackRefs];
}

export class RecordActionDispatcher {
  private dispatch: Dispatch<RootState>;
  private cmsRecord: CmsRecord;
  private references: ReferenceConfig[];
  private context: string;

  constructor(
    dispatch: Dispatch<RootState>,
    cmsRecord: CmsRecord,
    references: ReferenceConfig[],
    context: string
  ) {
    this.dispatch = dispatch;
    this.cmsRecord = cmsRecord;
    this.references = references;
    this.context = context;
  }

  public fetch(id: string): Promise<void> {
    return this.dispatch(
      fetchRecord(this.cmsRecord, this.references, id, this.context)
    );
  }

  public fetchList(
    page: number,
    perPage: number,
    filters: Filter[] = [],
    sortByName: string | undefined,
    isAscending: boolean
  ): Promise<void> {
    // TODO (Steven-Chan):
    // Handle reserved field sorting in a better way
    if (sortByName === 'createdAt') {
      sortByName = '_created_at';
    } else if (sortByName === 'updatedAt') {
      sortByName = '_updated_at';
    }

    return this.dispatch(
      fetchRecordList(
        this.cmsRecord,
        this.references,
        filters,
        page,
        perPage,
        sortByName,
        isAscending,
        this.context
      )
    );
  }

  public save(record: Record): Promise<void> {
    return this.dispatch(saveRecord(this.cmsRecord, record, this.context));
  }
}
