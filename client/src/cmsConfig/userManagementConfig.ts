import { ConfigContext } from './cmsConfig';

export interface UserManagementConfig {
  enabled: boolean;
}

export function parseUserManagementConfig(
  context: ConfigContext,
  // tslint:disable-next-line: no-any
  input: any
): UserManagementConfig {
  if (input == null) {
    return { enabled: false };
  }

  const { enabled } = input;
  return { enabled };
}
