import { RouteComponentProps } from 'react-router';
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
import { ImportedFile } from './types/importedFile';

export interface RootState {
  adminRole: string;
  appConfig: AppConfig;
  auth: AuthState;
  cmsConfig: CmsConfigState;
  import: ImportState;
  pushCampaign: PushCampaignState;
  fileImport: FileImportState;
  recordViewsByName: RecordViewsByName;
  router: RouterState;
  user: UserState;
}

export type RouteProps = RouteComponentProps<any>; // tslint:disable-line: no-any

interface ListStateAttrs {
  isLoading: boolean;
  page: number;
  totalCount: number;
  error?: Error;
}

const initialListStateAttrs: ListStateAttrs = {
  error: undefined,
  isLoading: true,
  page: 1,
  totalCount: 0,
};

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

export interface ListState extends ListStateAttrs {
  records: Record[];
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
  ...initialListStateAttrs,
  records: [],
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

export interface PushCampaignListState extends ListStateAttrs {
  pushCampaigns: PushCampaign[];
}

export interface NewPushCampaignState {
  savingPushCampaign?: Remote<NewPushCampaign>;
}
export const initialNewPushCampaignState: NewPushCampaignState = {
  savingPushCampaign: undefined,
};

export const initialPushCampaignListState: PushCampaignListState = {
  ...initialListStateAttrs,
  pushCampaigns: [],
};

export const initialPushCampaignState: PushCampaignState = {
  list: initialPushCampaignListState,
  new: initialNewPushCampaignState,
};

export interface UserState extends ListStateAttrs {
  users: SkygearUser[];
}

export const initialUserState: UserState = {
  ...initialListStateAttrs,
  users: [],
};

export interface FileImportState {
  list: ImportedFileListState;
  import: ImportFileState;
}

export interface ImportedFileListState extends ListStateAttrs {
  files: ImportedFile[];
}

export interface ImportFileState {
  fileNames: string[];
  filesByName: { [key: string]: File | undefined };
  importing: boolean;
  importError?: Error;
  uploadingFileNames: string[];
}

export const initialImportedFileListState: ImportedFileListState = {
  ...initialListStateAttrs,
  files: [],
};

export const initialImportFileState: ImportFileState = {
  fileNames: [],
  filesByName: {},
  importing: false,
  uploadingFileNames: [],
};

export const initialFileImportState: FileImportState = {
  import: initialImportFileState,
  list: initialImportedFileListState,
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
    fileImport: initialFileImportState,
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
