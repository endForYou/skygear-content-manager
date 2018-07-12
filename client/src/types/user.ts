import skygear, { Record, Role } from 'skygear';

export interface SkygearUser {
  id: string;
  record?: Record;
  roles: Role[];
  isRolesUpdating: boolean;
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
  };
}
