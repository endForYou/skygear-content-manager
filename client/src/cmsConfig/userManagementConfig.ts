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
  editable: boolean;
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

  const editableInput = parseOptionalBoolean(input, 'editable', 'verification');
  const editable = editableInput != null ? editableInput : true;

  return {
    editable,
    enabled: true,
    // tslint:disable-next-line:no-any
    fields: input.fields.map((f: any) =>
      parseUserVerificationFieldConfig(f, { editable })
    ),
  };
}

function parseUserVerificationFieldConfig(
  // tslint:disable-next-line:no-any
  input: any,
  context: { editable: boolean }
): UserVerificationFieldConfig {
  const name = parseString(input, 'name', 'verification.fields');
  const label =
    parseOptionalString(input, 'label', 'verification.fields') ||
    humanize(name);
  const editableInput = parseOptionalBoolean(
    input,
    'editable',
    'verification.fields'
  );
  const editable = editableInput != null ? editableInput : context.editable;
  return {
    editable,
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
