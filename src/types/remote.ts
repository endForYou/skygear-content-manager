export type Remote<T> = RemoteLoading | RemoteSuccess<T> | RemoteFailure;

export enum RemoteType {
  Loading = 'REMOTE_LOADING',
  Success = 'REMOTE_SUCCESS',
  Failure = 'REMOTE_FAILURE',
}

export interface RemoteLoading {
  type: RemoteType.Loading;
}
export const RemoteLoading: RemoteLoading = {
  type: RemoteType.Loading,
};

export interface RemoteSuccess<T> {
  type: RemoteType.Success;
  value: T;
}
export function RemoteSuccess<T>(value: T): RemoteSuccess<T> {
  return {
    type: RemoteType.Success,
    value,
  };
}

export interface RemoteFailure {
  type: RemoteType.Failure;
  error: Error;
}
export function RemoteFailure(error: Error): RemoteFailure {
  return {
    error,
    type: RemoteType.Failure,
  };
}
