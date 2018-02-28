import { RouterState } from 'react-router-redux';
import { Record } from 'skygear';

import { CmsConfig } from './cmsConfig';
import { ImportResult, Remote, RemoteLoading } from './types';
import { objectFrom } from './util';

export interface RootState {
  auth: AuthState;
  cmsConfig: CmsConfig;
  import: ImportState;
  recordViewsByName: RecordViewsByName;
  router: RouterState;
}

export interface AuthState {
  user?: Record;
  errorMessage?: string;
}

export interface RecordViewsByName {
  [recordName: string]: RecordViewState;
}

export interface RecordViewState {
  list: ListState;
  show: ShowState;
  edit: EditState;
  new: NewState;
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

export interface NewState {
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

export const initialNewState: NewState = {
  savingRecord: undefined,
};

export const initialRecordViewState: RecordViewState = {
  edit: initialEditState,
  list: initialListState,
  new: initialNewState,
  show: initialShowState,
};

export interface ImportState {
  importRecord: Remote<ImportResult>;
}

export const initialImportState: ImportState = {
  importRecord: RemoteLoading,
};

export function initialRootState(
  cmsConfig: CmsConfig,
  recordNames: string[],
  user: Record
): RootState {
  return {
    auth: {
      user: user === null ? undefined : user,
    },
    cmsConfig,
    import: initialImportState,
    recordViewsByName: objectFrom(
      recordNames.map(recordName => {
        return [recordName, initialRecordViewState] as [
          string,
          RecordViewState
        ];
      })
    ),
    router: {
      location: null,
    },
  };
}
