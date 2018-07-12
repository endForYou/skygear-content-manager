import skygear, { Record, Role } from 'skygear';

interface UserDisableState {
  disabled: boolean;
  expiry?: Date;
  message?: string;
}

// tslint:disable-next-line:no-any
function UserDisableState(data: any): UserDisableState {
  return {
    disabled: data.disabled,
    expiry: data.disabled_expiry ? new Date(data.disabled_expiry) : undefined,
    message: data.disabled_message,
  };
}

export interface SkygearUser {
  id: string;
  record?: Record;
  roles: Role[];
  isRolesUpdating: boolean;
  userDisable: UserDisableState;
}

export function SkygearUser(
  // tslint:disable-next-line:no-any
  data: any
): SkygearUser {
  return {
    id: data.id,
    isRolesUpdating: false,
    record: data.record ? new skygear.UserRecord(data.record) : undefined,
    roles: data.roles.map((name: string) => new Role(name)),
    userDisable: UserDisableState(data),
  };
}
