import { RouterState } from 'react-router-redux';
import { Record } from 'skygear';

import { CmsConfig } from './cmsConfig';
import { AppConfig } from './config';
import {
  ImportResult,
  NewPushCampaign,
  PushCampaign,
  Remote,
  RemoteLoading,
  RemoteType,
  SkygearUser,
} from './types';

export interface RootState {
  adminRole: string;
  appConfig: AppConfig;
  auth: AuthState;
  cmsConfig: CmsConfigState;
  import: ImportState;
  pushCampaign: PushCampaignState;
  recordViewsByName: RecordViewsByName;
  router: RouterState;
  user: UserState;
}

export interface AuthState {
  user?: Record;
  errorMessage?: string;
}

export type CmsConfigState = Remote<CmsConfig> | null;

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
};

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
  savingPushCampaign?: Remote<NewPushCampaign>;
}
export const initialNewPushCampaignState: NewPushCampaignState = {
  savingPushCampaign: undefined,
};

export const initialPushCampaignListState: PushCampaignListState = {
  error: undefined,
  isLoading: true,
  page: 1,
  pushCampaigns: [],
  totalCount: 0,
};

export const initialPushCampaignState: PushCampaignState = {
  list: initialPushCampaignListState,
  new: initialNewPushCampaignState,
};

export interface UserState {
  users: SkygearUser[];
  isLoading: boolean;
  page: number;
  totalCount: number;
  error?: Error;
}

export const initialUserState: UserState = {
  error: undefined,
  isLoading: true,
  page: 1,
  totalCount: 0,
  users: [],
};

export function initialRootState(
  adminRole: string,
  appConfig: AppConfig,
  user: Record
): RootState {
  return {
    adminRole,
    appConfig,
    auth: {
      user: user === null ? undefined : user,
    },
    cmsConfig: null,
    import: initialImportState,
    pushCampaign: initialPushCampaignState,
    recordViewsByName: {},
    router: { location: null },
    user: initialUserState,
  };
}

export function getCmsConfig(state: RootState): CmsConfig {
  if (
    !state.cmsConfig ||
    state.cmsConfig.type === RemoteType.Loading ||
    state.cmsConfig.type === RemoteType.Failure
  ) {
    throw new Error(`Couldn't find Cms config`);
  }

  return state.cmsConfig.value;
}
