import * as yaml from 'js-yaml';
import { ThunkAction } from 'redux-thunk';

import { CmsConfig, parseCmsConfig } from '../cmsConfig';
import { isObject } from '../util';

export type CmsConfigActions = FetchRequest | FetchSuccess | FetchFailure;

export enum CmsConfigActionTypes {
  FetchRequest = 'FETCH_CMS_CONFIG_REQUEST',
  FetchSuccess = 'FETCH_CMS_CONFIG_SUCCESS',
  FetchFailure = 'FETCH_CMS_CONFIG_FAILURE',
}

export interface FetchRequest {
  type: CmsConfigActionTypes.FetchRequest;
  payload: undefined;
  context: undefined;
}

export interface FetchSuccess {
  type: CmsConfigActionTypes.FetchSuccess;
  payload: {
    result: CmsConfig;
  };
  context: undefined;
}

export interface FetchFailure {
  context: undefined;
  payload: {
    error: Error;
  };
  type: CmsConfigActionTypes.FetchFailure;
}

function fetchRequest(): FetchRequest {
  return {
    context: undefined,
    payload: undefined,
    type: CmsConfigActionTypes.FetchRequest,
  };
}

function fetchSuccess(result: CmsConfig): FetchSuccess {
  return {
    context: undefined,
    payload: { result },
    type: CmsConfigActionTypes.FetchSuccess,
  };
}

function fetchFailure(error: Error): FetchFailure {
  return {
    context: undefined,
    payload: { error },
    type: CmsConfigActionTypes.FetchFailure,
  };
}

export function fetchCmsConfig(
  url: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(fetchRequest());

    return fetch(url)
      .then((resp: Response) => {
        return resp.text();
      })
      .then(text => {
        const parsed = yaml.safeLoad(text);
        if (isObject(parsed)) {
          return parseCmsConfig(parsed);
        } else {
          throw new Error(`Couldn't parse config file: ${text}`);
        }
      })
      .then((cmsConfig: CmsConfig) => {
        dispatch(fetchSuccess(cmsConfig));
      })
      .catch((error: Error) => {
        console.error('Failed to parse cms config: ', error);
        dispatch(fetchFailure(error));
      });
  };
}
