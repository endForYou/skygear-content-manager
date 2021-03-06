import { AuthActions } from './auth';
import { CmsConfigActions } from './cmsConfig';
import { FileImportActions } from './fileImport';
import { ImportActions } from './import';
import { PushCampaignActions } from './pushCampaign';
import { RecordActions } from './record';
import { SettingsActions } from './settings';
import { UserActions } from './user';

export type Actions =
  | AuthActions
  | CmsConfigActions
  | FileImportActions
  | ImportActions
  | PushCampaignActions
  | RecordActions
  | SettingsActions
  | UserActions;
