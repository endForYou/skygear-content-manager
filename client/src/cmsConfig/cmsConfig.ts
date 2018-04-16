import { humanize, isObject, objectFrom } from './../util';
import { mapDefaultActionToAction } from './defaultActions';
import {
  FieldConfig,
  FieldConfigTypes,
  filterReferences,
  parseFieldConfig,
  parseReferenceFieldConfig,
  ReferenceConfig,
  ReferenceFieldConfig,
} from './fieldConfig';
import { FilterConfig, parseFilterConfig } from './filterConfig';
import {
  parsePushNotificationConfig,
  PushNotificationsConfig,
} from './pushNotificationsConfig';
import {
  parseUserManagementConfig,
  UserManagementConfig,
} from './userManagementConfig';
import { parseOptionalString, parseString } from './util';

export interface CmsConfig {
  site: SiteConfig;
  records: RecordConfigMap;
  associationRecordByName: AssociationRecordByName;
  pushNotifications: PushNotificationsConfig;
  userManagement: UserManagementConfig;
}

export type SiteConfig = SiteItemConfig[];
export type SiteItemConfig =
  | RecordSiteItemConfig
  | UserManagementSiteItemConfig
  | PushNotificationsSiteItemConfig;
export enum SiteItemConfigTypes {
  Record = 'Record',
  UserManagement = 'UserManagement',
  PushNotifications = 'PushNotifications',
}

export interface SiteItemConfigAttrs {
  label: string;
}

export interface RecordSiteItemConfig extends SiteItemConfigAttrs {
  type: SiteItemConfigTypes.Record;

  name: string;
}

export interface UserManagementSiteItemConfig extends SiteItemConfigAttrs {
  type: SiteItemConfigTypes.UserManagement;
}

export interface PushNotificationsSiteItemConfig extends SiteItemConfigAttrs {
  type: SiteItemConfigTypes.PushNotifications;
}

export interface RecordConfigMap {
  [key: string]: RecordConfig | undefined;
}

export interface CmsRecord {
  // name of this CMS Record
  name: string;
  // the remote record type of this CMS record
  // one record type might have multiple CMS record defined in the config
  recordType: string;
}

export function CmsRecord(name: string, recordType: string): CmsRecord {
  return { name, recordType };
}

export interface RecordConfig {
  cmsRecord: CmsRecord;
  list?: ListPageConfig;
  show?: ShowPageConfig;
  edit?: RecordFormPageConfig;
  new?: RecordFormPageConfig;
}

export interface ListPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  perPage: number;
  fields: FieldConfig[];
  filters: FilterConfig[];
  references: ReferenceConfig[];
  actions: ListActionConfig[];
  itemActions: ListItemActionConfig[];
}

export interface ShowPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  fields: FieldConfig[];
  references: ReferenceConfig[];
  actions: ShowActionConfig[];
}

export interface RecordFormPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  fields: FieldConfig[];
  references: ReferenceConfig[];
  actions: RecordFormActionConfig[];
}

enum RecordFormPageConfigType {
  New = 'New',
  Edit = 'Edit',
}

export interface AssociationRecordByName {
  [key: string]: AssociationRecordConfig | undefined;
}

export interface AssociationRecordConfig {
  cmsRecord: CmsRecord;
  referenceConfigPair: [ReferenceFieldConfig, ReferenceFieldConfig];
}

interface CmsRecordByName {
  [key: string]: CmsRecord | undefined;
}

export interface RecordTypeContext {
  cmsRecordByName: CmsRecordByName;
}

export interface ConfigContext extends RecordTypeContext {
  associationRecordByName: AssociationRecordByName;
}

export type ListActionConfig =
  | ExportActionConfig
  | ImportActionConfig
  | LinkActionConfig;
export type ListItemActionConfig = LinkActionConfig;
export type ShowActionConfig = LinkActionConfig;
export type RecordFormActionConfig = LinkActionConfig;
export enum ActionConfigTypes {
  Export = 'Export',
  Import = 'Import',
  Link = 'Link',

  // Default actions
  AddButton = 'AddButton',
  ShowButton = 'ShowButton',
  EditButton = 'EditButton',
}
export interface ActionConfigAttrs {
  label: string;
}
export interface ExportActionConfig extends ActionConfigAttrs {
  type: ActionConfigTypes.Export;
  name: string;
}
export interface ImportActionConfig extends ActionConfigAttrs {
  type: ActionConfigTypes.Import;
  name: string;
}
export interface LinkActionConfig extends ActionConfigAttrs {
  type: ActionConfigTypes.Link;
  href: string;
  target: string;
}

// tslint:disable-next-line: no-any
export function parseCmsConfig(input: any): CmsConfig {
  const {
    site,
    records,
    association_records: associationRecords,
    push_notifications: pushNotifications,
    user_management: userManagement,
  } = input;

  const cmsRecordByName = preparseRecordConfigs(records);
  const associationRecordByName = parseAssociationRecordByName(
    { cmsRecordByName },
    associationRecords
  );

  const context = {
    associationRecordByName,
    cmsRecordByName,
  };

  return {
    associationRecordByName,
    pushNotifications: parsePushNotificationConfig(context, pushNotifications),
    records: Object.entries(
      records
      // tslint:disable-next-line: no-any
    ).reduce((obj: object, [name, recordConfig]: [string, any]) => {
      return { ...obj, [name]: parseRecordConfig(context, name, recordConfig) };
    }, {}),
    site: parseSiteConfigs(site),
    userManagement: parseUserManagementConfig(context, userManagement),
  };
}

// tslint:disable-next-line: no-any
function parseSiteConfigs(siteConfigs: any[]): SiteConfig {
  return siteConfigs.map(parseSiteConfig);
}

// tslint:disable-next-line: no-any
function parseSiteConfig(siteConfig: any): SiteItemConfig {
  switch (siteConfig.type) {
    case SiteItemConfigTypes.Record:
      return parseSiteRecordConfig(siteConfig);
    case SiteItemConfigTypes.UserManagement:
      return parseSiteUserManagementConfig(siteConfig);
    case SiteItemConfigTypes.PushNotifications:
      return parseSitePushNotificationsConfig(siteConfig);
    default:
      throw new Error(`Received unknown site config type: ${siteConfig.type}`);
  }
}

// tslint:disable-next-line: no-any
function parseSiteRecordConfig(input: any): RecordSiteItemConfig {
  const { type, name, label } = input;

  const parsedLabel = label ? label : humanize(name);
  return { type, name, label: parsedLabel };
}

function parseSiteUserManagementConfig(
  // tslint:disable-next-line: no-any
  input: any
): UserManagementSiteItemConfig {
  const { type } = input;
  const label =
    parseOptionalString(input, 'label', 'UserManagement') || 'User Management';
  return { type, label };
}

function parseSitePushNotificationsConfig(
  // tslint:disable-next-line: no-any
  input: any
): PushNotificationsSiteItemConfig {
  const { type } = input;
  const label =
    parseOptionalString(input, 'label', 'PushNotifications') ||
    'Push Notifications';
  return { type, label };
}

// tslint:disable-next-line: no-any
function preparseRecordConfigs(records: any): CmsRecordByName {
  const cmsRecordByName = objectFrom(
    Object.entries(records).map(([recordName, value]) => {
      const recordType =
        parseOptionalString(value, 'record_type', recordName) || recordName;
      const cmsRecord = CmsRecord(recordName, recordType);
      return [recordName, cmsRecord] as [string, CmsRecord];
    })
  );
  return cmsRecordByName;
}

function parseRecordConfig(
  context: ConfigContext,
  recordName: string,
  // tslint:disable-next-line: no-any
  input: any
): RecordConfig {
  const { list, show, edit } = input;
  const newConfig = input.new;

  const recordType =
    parseOptionalString(input, 'record_type', recordName) || recordName;
  const cmsRecord = CmsRecord(recordName, recordType);

  return {
    cmsRecord,
    edit:
      edit == null
        ? undefined
        : parseRecordFormPageConfig(
            context,
            cmsRecord,
            RecordFormPageConfigType.New,
            edit
          ),
    list:
      list == null ? undefined : parseListPageConfig(context, cmsRecord, list),
    new:
      newConfig == null
        ? undefined
        : parseRecordFormPageConfig(
            context,
            cmsRecord,
            RecordFormPageConfigType.New,
            newConfig
          ),
    show:
      show == null ? undefined : parseShowPageConfig(context, cmsRecord, show),
  };
}

function parseListPageConfig(
  context: ConfigContext,
  cmsRecord: CmsRecord,
  // tslint:disable-next-line: no-any
  input: any
): ListPageConfig {
  const { perPage = 25 } = input;

  const label =
    parseOptionalString(input, 'label', 'List') || humanize(cmsRecord.name);

  // tslint:disable-next-line: no-any
  const fields = input.fields.map((f: any) =>
    parseFieldConfig(context, f)
  ) as FieldConfig[];
  const compactFields = fields.map(config => ({ ...config, compact: true }));

  const filters =
    input.filters &&
    // tslint:disable-next-line: no-any
    (input.filters as any[]).map(f => parseFilterConfig(f, context));

  const actions = parseListActions(input.actions);
  const itemActions = parseListItemActions(input.item_actions);

  return {
    actions,
    cmsRecord,
    fields: compactFields,
    filters,
    itemActions,
    label,
    perPage,
    references: filterReferences(compactFields),
  };
}

// tslint:disable-next-line: no-any
function parseListActions(input: any): ListActionConfig[] {
  const itemActionTypes = [
    ActionConfigTypes.Export,
    ActionConfigTypes.Import,
    ActionConfigTypes.Link,
    ActionConfigTypes.AddButton,
  ];

  const defaultActions = [
    {
      type: ActionConfigTypes.AddButton,
    },
  ];

  if (input == null) {
    input = defaultActions;
  }

  return (
    input
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        if (itemActionTypes.indexOf(item.type) === -1) {
          throw new Error(`Unexpected list action types: ${item.type}`);
        }

        return item;
      })
      .map(mapDefaultActionToAction)
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        switch (item.type) {
          case ActionConfigTypes.Export:
            return parseExportAction(item);
          case ActionConfigTypes.Import:
            return parseImportAction(item);
          case ActionConfigTypes.Link:
            return parseLinkAction(item);
          default:
            throw new Error(`Unexpected list action types: ${item.type}`);
        }
      })
  );
}

// tslint:disable-next-line: no-any
function parseListItemActions(input: any): ListItemActionConfig[] {
  const itemActionTypes = [
    ActionConfigTypes.Link,
    ActionConfigTypes.ShowButton,
    ActionConfigTypes.EditButton,
  ];

  const defaultActions = [
    {
      type: ActionConfigTypes.ShowButton,
    },
    {
      type: ActionConfigTypes.EditButton,
    },
  ];

  if (input == null) {
    input = defaultActions;
  }

  return (
    input
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        if (itemActionTypes.indexOf(item.type) === -1) {
          throw new Error(`Unexpected list item action types: ${item.type}`);
        }

        return item;
      })
      .map(mapDefaultActionToAction)
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        switch (item.type) {
          case ActionConfigTypes.Link:
            return parseLinkAction(item);
          default:
            throw new Error(`Unexpected list item action types: ${item.type}`);
        }
      })
  );
}

// tslint:disable-next-line: no-any
function parseImportAction(input: any): ImportActionConfig {
  const name = parseString(input, 'name', 'Import');
  return {
    label: parseOptionalString(input, 'label', 'Import') || name,
    name,
    type: input.type,
  };
}

// tslint:disable-next-line: no-any
function parseExportAction(input: any): ExportActionConfig {
  const name = parseString(input, 'name', 'Export');
  return {
    label: parseOptionalString(input, 'label', 'Export') || name,
    name,
    type: input.type,
  };
}

// tslint:disable-next-line: no-any
function parseLinkAction(input: any): LinkActionConfig {
  return {
    href: parseOptionalString(input, 'href', 'list:item_actions') || '#',
    label: parseString(input, 'label', 'list:item_actions'),
    target: parseOptionalString(input, 'target', 'list:item_actions') || '',
    type: input.type,
  };
}

function parseShowPageConfig(
  context: ConfigContext,
  cmsRecord: CmsRecord,
  // tslint:disable-next-line: no-any
  input: any
): ShowPageConfig {
  if (!Array.isArray(input.fields)) {
    throw new Error(`ShowPageConfig.fields must be an Array`);
  }

  const label =
    parseOptionalString(input, 'label', 'label') || humanize(cmsRecord.name);

  if (typeof input.label !== 'string' && typeof input.label !== 'undefined') {
    throw new Error(`ShowPageConfig.label must be a string`);
  }

  // tslint:disable-next-line: no-any
  const fields = input.fields.map((f: any) =>
    parseFieldConfig(context, f)
  ) as FieldConfig[];

  return {
    actions: parseShowActions(input.actions),
    cmsRecord,
    fields,
    label,
    references: filterReferences(fields),
  };
}

// tslint:disable-next-line: no-any
function parseShowActions(input: any): ShowActionConfig[] {
  const itemActionTypes = [
    ActionConfigTypes.Link,
    ActionConfigTypes.EditButton,
  ];

  const defaultActions = [
    {
      type: ActionConfigTypes.EditButton,
    },
  ];

  if (input == null) {
    input = defaultActions;
  }

  return (
    input
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        if (itemActionTypes.indexOf(item.type) === -1) {
          throw new Error(`Unexpected show action types: ${item.type}`);
        }

        return item;
      })
      .map(mapDefaultActionToAction)
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        switch (item.type) {
          case ActionConfigTypes.Link:
            return parseLinkAction(item);
          default:
            throw new Error(`Unexpected show action types: ${item.type}`);
        }
      })
  );
}

function makeEditableField(config: FieldConfig): FieldConfig {
  return {
    editable: true,
    ...config,
  };
}

function parseRecordFormPageConfig(
  context: ConfigContext,
  cmsRecord: CmsRecord,
  configType: RecordFormPageConfigType,
  // tslint:disable-next-line: no-any
  input: any
): RecordFormPageConfig {
  if (!Array.isArray(input.fields)) {
    throw new Error(`RecordFormPageConfig.fields must be an Array`);
  }

  const label =
    parseOptionalString(input, 'label', configType) || humanize(cmsRecord.name);

  if (typeof input.label !== 'string' && typeof input.label !== 'undefined') {
    throw new Error(`RecordFormPageConfig.label must be a string`);
  }

  // tslint:disable-next-line: no-any
  const fields = input.fields.map((f: any) =>
    parseFieldConfig(context, f)
  ) as FieldConfig[];
  const recursivelyMakeEditableField = (config: FieldConfig): FieldConfig => {
    if (config.type === FieldConfigTypes.EmbeddedBackReference) {
      config = {
        ...config,
        displayFields: config.displayFields.map(recursivelyMakeEditableField),
      };
    }
    return makeEditableField(config);
  };
  const editableFields = fields.map(recursivelyMakeEditableField);

  return {
    actions: parseRecordFormActions(input.actions),
    cmsRecord,
    fields: editableFields,
    label,
    references: filterReferences(fields),
  };
}

// tslint:disable-next-line: no-any
function parseRecordFormActions(input: any): RecordFormActionConfig[] {
  const itemActionTypes = [ActionConfigTypes.Link];

  const defaultActions = [] as RecordFormActionConfig[];

  if (input == null) {
    input = defaultActions;
  }

  return (
    input
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        if (itemActionTypes.indexOf(item.type) === -1) {
          throw new Error(`Unexpected form action types: ${item.type}`);
        }

        return item;
      })
      .map(mapDefaultActionToAction)
      // tslint:disable-next-line: no-any
      .map((item: any) => {
        switch (item.type) {
          case ActionConfigTypes.Link:
            return parseLinkAction(item);
          default:
            throw new Error(`Unexpected form action types: ${item.type}`);
        }
      })
  );
}

function parseAssociationRecordByName(
  context: RecordTypeContext,
  // tslint:disable-next-line: no-any
  input: any
): AssociationRecordByName {
  if (input === undefined) {
    return {};
  }

  if (!isObject(input)) {
    throw new Error(
      `want association_records to be object, got ${typeof input}`
    );
  }

  const recordNameConfigPairs = Object.entries(
    input
  ).map(([recordName, recordConfig]) => {
    if (!isObject(recordConfig)) {
      throw new Error(
        `want association_record to be object, got ${typeof recordConfig}`
      );
    }

    return [
      recordName,
      parseAssociationRecord(context, recordName, recordConfig),
    ] as [string, AssociationRecordConfig];
  });

  return objectFrom(recordNameConfigPairs);
}

function parseAssociationRecord(
  context: RecordTypeContext,
  recordName: string,
  // tslint:disable-next-line: no-any
  input: any
): AssociationRecordConfig {
  const recordType =
    parseOptionalString(input, 'record_type', 'association_record') ||
    recordName;

  const fields = input.fields;
  if (!Array.isArray(fields)) {
    throw new Error(
      `want association_record.fields to be Array, got ${typeof fields}`
    );
  }

  if (fields.length !== 2) {
    throw new Error(
      `want association_record.fields has length 2, got ${fields.length}`
    );
  }

  const ref0 = parseReferenceFieldConfig(context, fields[0]);
  const ref1 = parseReferenceFieldConfig(context, fields[1]);
  const referenceConfigPair: [ReferenceFieldConfig, ReferenceFieldConfig] = [
    ref0,
    ref1,
  ];

  return {
    cmsRecord: CmsRecord(recordName, recordType),
    referenceConfigPair,
  };
}
