import { AuthActions } from './auth';
import { ImportActions } from './import';
import { PushCampaignListActions } from './pushCampaign';
import { RecordActions } from './record';

export type Actions =
  | AuthActions
  | ImportActions
  | PushCampaignListActions
  | RecordActions;

