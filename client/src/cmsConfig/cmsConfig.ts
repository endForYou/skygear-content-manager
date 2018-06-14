import { isArray } from 'util';
import { SortOrder, SortState } from '../types';
import { entriesOf, humanize, isObject, objectFrom } from './../util';
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
import { FileImportConfig, parseFileImportConfig } from './fileImportConfig';
import { FilterConfig, parseFilterConfig } from './filterConfig';
import { parsePredicateConfig, PredicateValue } from './predicateConfig';
import {
  parsePushNotificationConfig,
  PushNotificationsConfig,
} from './pushNotificationsConfig';
import {
  parseUserManagementConfig,
  UserManagementConfig,
} from './userManagementConfig';
import {
  parseBoolean,
  parseOptionalBoolean,
  parseOptionalString,
  parseString,
} from './util';

export interface CmsConfig {
  site: SiteConfig;
  records: RecordConfigMap;
  associationRecordByName: AssociationRecordByName;
  pushNotifications: PushNotificationsConfig;
  userManagement: UserManagementConfig;
  fileImport: FileImportConfig;
}

export type SiteConfig = SiteItemConfig[];
export type SiteItemConfig =
  | RecordSiteItemConfig
  | UserManagementSiteItemConfig
  | PushNotificationsSiteItemConfig
  | FileImportSiteItemConfig
  | SpaceSiteItemConfig;
export enum SiteItemConfigTypes {
  Record = 'Record',
  UserManagement = 'UserManagement',
  PushNotifications = 'PushNotifications',
  FileImport = 'FileImport',
  Space = 'Space',
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

export interface FileImportSiteItemConfig extends SiteItemConfigAttrs {
  type: SiteItemConfigTypes.FileImport;
}

export enum SpaceSizeType {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

export interface SpaceSiteItemConfig {
  type: SiteItemConfigTypes.Space;
  size: SpaceSizeType;
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
  predicates: PredicateValue;
  defaultSort: SortState;
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

type RecordPage = 'list' | 'show' | 'edit' | 'new';
const recordPages: RecordPage[] = ['list', 'show', 'edit', 'new'];

interface PreParseCmsRecordConfig {
  record: CmsRecord;
  pages: Set<RecordPage>;
}

interface CmsRecordByName {
  [key: string]: PreParseCmsRecordConfig | undefined;
}

export interface RecordTypeContext {
  cmsRecordByName: CmsRecordByName;
}

export interface ConfigContext extends RecordTypeContext {
  associationRecordByName: AssociationRecordByName;
  siteConfig: SiteConfig;
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
  atomic?: boolean;
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
    records = {},
    association_records: associationRecords,
    file_import: fileImport,
    push_notifications: pushNotifications,
    user_management: userManagement,
  } = input;

  const cmsRecordByName = preparseRecordConfigs(records);
  const associationRecordByName = parseAssociationRecordByName(
    { cmsRecordByName },
    associationRecords
  );
  const siteConfig = parseSiteConfigs(site);

  const context = {
    associationRecordByName,
    cmsRecordByName,
    siteConfig,
  };

  return {
    associationRecordByName,
    fileImport: parseFileImportConfig(context, fileImport),
    pushNotifications: parsePushNotificationConfig(context, pushNotifications),
    records: entriesOf(
      records
      // tslint:disable-next-line: no-any
    ).reduce((obj: object, [name, recordConfig]: [string, any]) => {
      return { ...obj, [name]: parseRecordConfig(context, name, recordConfig) };
    }, {}),
    site: siteConfig,
    userManagement: parseUserManagementConfig(context, userManagement),
  };
}

// tslint:disable-next-line: no-any
function parseSiteConfigs(siteConfigs: any[]): SiteConfig {
  if (siteConfigs == null) {
    return [];
  }

  if (!isArray(siteConfigs)) {
    throw new Error('Expect site config to be Array');
  }

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
    case SiteItemConfigTypes.FileImport:
      return parseSiteFileImportConfig(siteConfig);
    case SiteItemConfigTypes.Space:
      return parseSiteSpaceConfig(siteConfig);
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

function parseSiteFileImportConfig(
  // tslint:disable-next-line: no-any
  input: any
): FileImportSiteItemConfig {
  const { type } = input;
  const label =
    parseOptionalString(input, 'label', 'FileImport') || 'File Import';
  return { type, label };
}

function parseSiteSpaceConfig(
  // tslint:disable-next-line:no-any
  input: any
): SpaceSiteItemConfig {
  const { type } = input;
  const sizeInput = parseOptionalString(input, 'size', 'Space') || 'Medium';
  let size: SpaceSizeType;
  switch (sizeInput) {
    case SpaceSizeType.Small:
      size = SpaceSizeType.Small;
      break;
    case SpaceSizeType.Medium:
      size = SpaceSizeType.Medium;
      break;
    case SpaceSizeType.Large:
      size = SpaceSizeType.Large;
      break;
    default:
      throw new Error(`Unexpected space size: ${sizeInput}`);
  }

  return { type, size };
}

// tslint:disable-next-line: no-any
function preparseRecordConfigs(records: any): CmsRecordByName {
  const cmsRecordByName = objectFrom(
    // tslint:disable-next-line:no-any
    entriesOf(records).map(([recordName, value]: [string, any]) => {
      const recordType =
        parseOptionalString(value, 'record_type', recordName) || recordName;
      const cmsRecord = CmsRecord(recordName, recordType);
      const pages = recordPages.reduce((acc, page) => {
        if (value[page] != null) {
          acc.add(page);
        }
        return acc;
      }, new Set());
      return [
        recordName,
        {
          pages,
          record: cmsRecord,
        },
      ] as [string, PreParseCmsRecordConfig];
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

  const actions = parseListActions(input.actions, context, cmsRecord);
  const itemActions = parseListItemActions(
    input.item_actions,
    context,
    cmsRecord
  );

  const defaultSort = SortState();
  if (input.default_sort) {
    defaultSort.fieldName = parseString(
      input.default_sort,
      'name',
      'List.DefaultSort'
    );
    defaultSort.order = parseBoolean(
      input.default_sort,
      'ascending',
      'List.DefaultSort'
    )
      ? SortOrder.Ascending
      : SortOrder.Descending;
  }

  return {
    actions,
    cmsRecord,
    defaultSort,
    fields: compactFields,
    filters,
    itemActions,
    label,
    perPage,
    predicates: parsePredicateConfig(input.predicates, context) || [],
    references: filterReferences(compactFields),
  };
}

interface DefaultAction {
  predicate: (data: PreParseCmsRecordConfig) => boolean;
  actionType: ActionConfigTypes;
}

function getDefaultActions(
  defaultActions: DefaultAction[],
  context: ConfigContext,
  cmsRecord: CmsRecord
  // tslint:disable-next-line:no-any
): any {
  const cmsRecordData = context.cmsRecordByName[cmsRecord.name];
  if (cmsRecordData == null) {
    throw new Error(`Cms record ${cmsRecord.name} not found.`);
  }

  return defaultActions
    .filter(action => action.predicate(cmsRecordData))
    .map(action => ({ type: action.actionType }));
}

// tslint:disable-next-line:no-any
function parseActionConfig(input: any) {
  switch (input.type) {
    case ActionConfigTypes.Export:
      return parseExportAction(input);
    case ActionConfigTypes.Import:
      return parseImportAction(input);
    case ActionConfigTypes.Link:
      return parseLinkAction(input);
    default:
      throw new Error(`Unexpected action types: ${input.type}`);
  }
}

function parseListActions(
  // tslint:disable-next-line: no-any
  input: any,
  context: ConfigContext,
  cmsRecord: CmsRecord
): ListActionConfig[] {
  const itemActionTypes = [
    ActionConfigTypes.Export,
    ActionConfigTypes.Import,
    ActionConfigTypes.Link,
    ActionConfigTypes.AddButton,
  ];

  const defaultActions = [
    {
      actionType: ActionConfigTypes.AddButton,
      predicate: (c: PreParseCmsRecordConfig) => c.pages.has('new'),
    },
  ];

  if (input == null) {
    input = getDefaultActions(defaultActions, context, cmsRecord);
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
      .map(parseActionConfig)
  );
}

function parseListItemActions(
  // tslint:disable-next-line: no-any
  input: any,
  context: ConfigContext,
  cmsRecord: CmsRecord
): ListItemActionConfig[] {
  const itemActionTypes = [
    ActionConfigTypes.Link,
    ActionConfigTypes.ShowButton,
    ActionConfigTypes.EditButton,
  ];

  const defaultActions = [
    {
      actionType: ActionConfigTypes.ShowButton,
      predicate: (c: PreParseCmsRecordConfig) => c.pages.has('show'),
    },
    {
      actionType: ActionConfigTypes.EditButton,
      predicate: (c: PreParseCmsRecordConfig) => c.pages.has('edit'),
    },
  ];

  if (input == null) {
    input = getDefaultActions(defaultActions, context, cmsRecord);
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
      .map(parseActionConfig)
  );
}

// tslint:disable-next-line: no-any
function parseImportAction(input: any): ImportActionConfig {
  const name = parseString(input, 'name', 'Import');
  return {
    atomic: parseOptionalBoolean(input, 'atomic', 'Import'),
    label: parseOptionalString(input, 'label', 'Import') || humanize(name),
    name,
    type: input.type,
  };
}

// tslint:disable-next-line: no-any
function parseExportAction(input: any): ExportActionConfig {
  const name = parseString(input, 'name', 'Export');
  return {
    label: parseOptionalString(input, 'label', 'Export') || humanize(name),
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

  const recordNameConfigPairs = entriesOf(
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
