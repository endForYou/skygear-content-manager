import { RouterState } from 'react-router-redux';
import { Record } from 'skygear';

import { CmsConfig } from './cmsConfig';
import { Remote, RemoteLoading } from './types';

export interface RootState {
  auth: AuthState;
  cmsConfig: CmsConfig;
  recordViewsByName: RecordViewsByName;
  router: RouterState;
}

export interface AuthState {
  user?: Record;
}

export interface RecordViewsByName {
  [recordName: string]: RecordViewState;
}

export interface RecordViewState {
  list: ListState;
  show: ShowState;
  edit: EditState;
}

export interface ListState {
  isLoading: boolean;
  page: number;
  records: Record[];
  totalCount: number;
  error?: Error;
}

export interface ShowState {
  remoteRecord: Remote<Record>;
}

export interface EditState {
  remoteRecord: Remote<Record>;
  savingRecord?: Remote<Record>;
}

export const initialListState: ListState = {
  error: undefined,
  isLoading: true,
  page: 1,
  records: [],
  totalCount: 0,
};

export const initialShowState: ShowState = {
  remoteRecord: RemoteLoading,
};

export const initialEditState: EditState = {
  remoteRecord: RemoteLoading,
  savingRecord: undefined,
};

export const initialRecordViewState: RecordViewState = {
  edit: initialEditState,
  list: initialListState,
  show: initialShowState,
};
