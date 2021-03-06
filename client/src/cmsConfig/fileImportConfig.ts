import { ConfigContext, SiteItemConfigTypes } from './cmsConfig';

export interface FileImportConfig {
  enabled: boolean;
}

export function parseFileImportConfig(
  context: ConfigContext,
  // tslint:disable-next-line: no-any
  input: any
): FileImportConfig {
  if (input == null) {
    return getConfigFromContext(context);
  }

  return { enabled: true };
}

function getConfigFromContext(context: ConfigContext) {
  return {
    enabled:
      context.siteConfig.find(s => s.type === SiteItemConfigTypes.FileImport) !=
      null,
  };
}
