import { RouterState } from 'react-router-redux';
import { Record } from 'skygear';

import { CmsConfig } from './cmsConfig';
import { ImportResult, Remote, RemoteLoading, PushCampaign } from './types';
import { objectFrom } from './util';

export interface RootState {
  auth: AuthState;
  cmsConfig: CmsConfig;
  import: ImportState;
  pushCampaign: PushCampaignState;
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
  errorMessage: string;
  importResult?: Remote<ImportResult>;
}

export const initialImportState: ImportState = {
  errorMessage: '',
  importResult: undefined,
}

export interface PushCampaignState {
  list: PushCampaignListState;
  new: NewPushCampaignState;
}

export interface PushCampaignListState {
  isLoading: boolean;
  page: number;
  totalCount: number;
  pushCampaigns: PushCampaign[];
  error?: Error;
}

export interface NewPushCampaignState {
  savingPushCampaign?: Remote<PushCampaign>;
  userList: Record[];
  userListTotalCount: number;
  error?: Error;
}

export const initialNewPushCampaignState: NewPushCampaignState = {
  savingPushCampaign: undefined,
  userList: [],
  userListTotalCount: 0,
  error: undefined,
}

export const initialPushCampaignListState: PushCampaignListState = {
  isLoading: true,
  page: 1,
  totalCount: 0,
  pushCampaigns: [],
  error: undefined
};

export const initialPushCampaignState: PushCampaignState = {
  list: initialPushCampaignListState,
  new: initialNewPushCampaignState,
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
    pushCampaign: initialPushCampaignState,
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
