export type Remote<T> = RemoteLoading | RemoteSuccess<T> | RemoteFailure;

export interface RemoteLoading {
  type: 'remoteLoading';
}
export const RemoteLoading: RemoteLoading = {
  type: 'remoteLoading',
};

export interface RemoteSuccess<T> {
  type: 'remoteSuccess';
  value: T;
}
export function RemoteSuccess<T>(value: T): RemoteSuccess<T> {
  return {
    type: 'remoteSuccess',
    value,
  };
}

export interface RemoteFailure {
  type: 'remoteFailure';
  error: Error;
}
export function RemoteFailure(error: Error): RemoteFailure {
  return {
    error,
    type: 'remoteFailure',
  };
}
