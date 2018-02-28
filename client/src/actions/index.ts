import { AuthActions } from './auth';
import { ImportActions } from './import';
import { RecordActions } from './record';

export type Actions = AuthActions | ImportActions | RecordActions;
