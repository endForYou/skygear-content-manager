import { Actions } from '../actions';
import { CmsConfigActionTypes } from '../actions/cmsConfig';
import { CmsConfig } from '../cmsConfig';
import { CmsConfigState } from '../states';
import { RemoteFailure, RemoteLoading, RemoteSuccess } from '../types';

export default function cmsConfigReducer(
  state: CmsConfigState = null,
  action: Actions
) {
  switch (action.type) {
    case CmsConfigActionTypes.FetchRequest:
      return RemoteLoading;
    case CmsConfigActionTypes.FetchSuccess:
      return RemoteSuccess<CmsConfig>(action.payload.result);
    case CmsConfigActionTypes.FetchFailure:
      return RemoteFailure(action.payload.error);
    default:
      return state;
  }
}
