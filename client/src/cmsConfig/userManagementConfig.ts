import { humanize } from '../util';
import { ConfigContext, SiteItemConfigTypes } from './cmsConfig';
import { parseOptionalBoolean, parseOptionalString, parseString } from './util';

export interface UserManagementConfig {
  enabled: boolean;
  verification: UserVerificationConfig;
}

export interface UserVerificationConfig {
  enabled: boolean;
  editable: boolean;
  fields: UserVerificationFieldConfig[];
}

const defaultUserVerificationConfig = {
  editable: false,
  enabled: false,
  fields: [],
};

export interface UserVerificationFieldConfig {
  name: string;
  label: string;
}

export function parseUserManagementConfig(
  context: ConfigContext,
  // tslint:disable-next-line: no-any
  input: any
): UserManagementConfig {
  if (input == null) {
    return getConfigFromContext(context);
  }

  return {
    enabled: true,
    verification: parseUserVerificationConfig(input.verification),
  };
}

// tslint:disable-next-line:no-any
function parseUserVerificationConfig(input: any): UserVerificationConfig {
  if (input == null) {
    return { ...defaultUserVerificationConfig };
  }

  const editable = parseOptionalBoolean(input, 'editable', 'verification');

  return {
    editable: editable != null ? editable : true,
    enabled: true,
    fields: input.fields.map(parseUserVerificationFieldConfig),
  };
}

function parseUserVerificationFieldConfig(
  // tslint:disable-next-line:no-any
  input: any
): UserVerificationFieldConfig {
  const name = parseString(input, 'name', 'verification.fields');
  const label =
    parseOptionalString(input, 'label', 'verification.fields') ||
    humanize(name);
  return {
    label,
    name,
  };
}

function getConfigFromContext(context: ConfigContext) {
  return {
    enabled:
      context.siteConfig.find(
        s => s.type === SiteItemConfigTypes.UserManagement
      ) != null,

    // default disabled user verification section
    verification: { ...defaultUserVerificationConfig },
  };
}
