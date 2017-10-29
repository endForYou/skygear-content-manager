import skygear from 'skygear';

export const FETCH_RECORD_LIST_REQUEST = 'FETCH_RECORD_LIST_REQUEST';
export const FETCH_RECORD_LIST_SUCCESS = 'FETCH_RECORD_LIST_SUCCESS';
export const FETCH_RECORD_LIST_FAILURE = 'FETCH_RECORD_LIST_FAILURE';

export function recordNamed(action) {
  return { ...action, CMS_RECORD_NAMED: true };
}

export function isRecordNamed(action) {
  return action.CMS_RECORD_NAMED;
}

function fetchRecordListRequest(recordName, recordType, page) {
  return recordNamed({
    type: FETCH_RECORD_LIST_REQUEST,
    recordName,
    recordType,
    page,
  });
}

function fetchRecordListSuccess(
  recordName,
  recordType,
  page,
  perPage,
  queryResult
) {
  return recordNamed({
    type: FETCH_RECORD_LIST_SUCCESS,
    recordName,
    recordType,
    page,
    perPage,
    queryResult,
  });
}

function fetchRecordListFailure(recordName, recordType, error) {
  return recordNamed({
    type: FETCH_RECORD_LIST_FAILURE,
    recordName,
    recordType,
    error,
  });
}

export function fetchRecordList(
  recordName,
  recordType,
  page = 1,
  perPage = 25
) {
  const RecordCls = skygear.Record.extend(recordType);

  return dispatch => {
    const query = new skygear.Query(RecordCls);
    query.overallCount = true;
    query.limit = perPage;
    query.offset = (page - 1) * perPage;

    dispatch(fetchRecordListRequest(recordName, recordType, page));
    skygear.publicDB.query(query).then(
      queryResult => {
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
      error => {
        dispatch(fetchRecordListFailure(recordName, recordType, error));
      }
    );
  };
}

export class RecordActionCreator {
  constructor(recordName, recordType, perPage) {
    this.recordName = recordName;
    this.recordType = recordType;
    this.perPage = perPage;
  }

  fetchList(page = 1) {
    return fetchRecordList(
      this.recordName,
      this.recordType,
      page,
      this.perPage
    );
  }
}
