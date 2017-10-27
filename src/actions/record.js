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

function fetchRecordListRequest(recordName, recordType) {
  return recordNamed({
    type: FETCH_RECORD_LIST_REQUEST,
    recordName,
    recordType,
  });
}

function fetchRecordListSuccess(recordName, recordType, records) {
  return recordNamed({
    type: FETCH_RECORD_LIST_SUCCESS,
    recordName,
    recordType,
    records,
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

export function fetchRecordList(recordName, recordType) {
  const RecordCls = skygear.Record.extend(recordType);

  return dispatch => {
    const query = new skygear.Query(RecordCls);

    dispatch(fetchRecordListRequest(recordName, recordType));
    skygear.publicDB.query(query).then(
      records => {
        // returned records is object instead of array when length = 0
        // make sure it is array here for proptypes to work properly
        const recordArray =
          records.length === 0 ? [] : records.map(record => record);
        dispatch(fetchRecordListSuccess(recordName, recordType, recordArray));
      },
      error => {
        dispatch(fetchRecordListFailure(recordName, recordType, error));
      }
    );
  };
}

export class RecordActionCreator {
  constructor(recordName, recordType) {
    this.recordName = recordName;
    this.recordType = recordType;
  }

  fetchList() {
    return fetchRecordList(this.recordName, this.recordType);
  }
}
