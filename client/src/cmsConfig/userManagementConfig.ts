import { ConfigContext, SiteItemConfigTypes } from './cmsConfig';

export interface UserManagementConfig {
  enabled: boolean;
}

export function parseUserManagementConfig(
  context: ConfigContext,
  // tslint:disable-next-line: no-any
  input: any
): UserManagementConfig {
  if (input == null) {
    return getConfigFromContext(context);
  }

  return { enabled: true };
}

function getConfigFromContext(context: ConfigContext) {
  return {
    enabled:
      context.siteConfig.find(
        s => s.type === SiteItemConfigTypes.UserManagement
      ) != null,
  };
}
