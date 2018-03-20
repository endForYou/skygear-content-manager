import { Record, Role } from 'skygear';

export interface SkygearUser {
  id: string;
  record: Record;
  roles: Role[];
  isRolesUpdating: boolean;
}
export function SkygearUser(
  record: Record,
  userRoles: { [id: string]: Role[] }
): SkygearUser {
  return {
    id: record._id,
    isRolesUpdating: false,
    record,
    roles: userRoles[record._id] || [],
  };
}
