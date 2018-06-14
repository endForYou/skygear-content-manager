import { ConfigContext } from './cmsConfig';

export interface FileImportConfig {
  enabled: boolean;
}

export function parseFileImportConfig(
  context: ConfigContext,
  // tslint:disable-next-line: no-any
  input: any
): FileImportConfig {
  if (input == null) {
    return { enabled: false };
  }

  const { enabled } = input;
  return { enabled };
}
