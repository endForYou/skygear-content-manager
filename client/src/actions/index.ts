import { AuthActions } from './auth';
import { ImportActions } from './import';
import { PushCampaignActions } from './pushCampaign';
import { RecordActions } from './record';

export type Actions =
  | AuthActions
  | ImportActions
  | PushCampaignActions
  | RecordActions;
