import { humanize, isObject, objectFrom } from './../util';
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
  | UserManagementSiteItemConfig;
export enum SiteItemConfigTypes {
  Record = 'Record',
  UserManagement = 'UserManagement',
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
}

export interface ShowPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  fields: FieldConfig[];
  references: ReferenceConfig[];
}

export interface RecordFormPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  fields: FieldConfig[];
  references: ReferenceConfig[];
}

enum RecordFormPageConfigType {
  New = 'New',
  Edit = 'Edit',
}

export type ReferenceConfig =
  | ReferenceFieldConfig
  | AssociationReferenceFieldConfig;

export type FieldConfig =
  | StringFieldConfig
  | TextAreaFieldConfig
  | DateTimeFieldConfig
  | BooleanFieldConfig
  | IntegerFieldConfig
  | ReferenceFieldConfig
  | AssociationReferenceFieldConfig
  | ImageAssetFieldConfig;
export enum FieldConfigTypes {
  String = 'String',
  TextArea = 'TextArea',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  Integer = 'Integer',
  Reference = 'Reference',
  AssociationReference = 'AssociationReference',
  ImageAsset = 'ImageAsset',
}

export interface FieldConfigAttrs {
  name: string;
  label: string;

  // derived attrs depending on which page the field lives in
  compact: boolean;
  editable?: boolean;
}

export interface StringFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.String;
}

export interface TextAreaFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.TextArea;
}

export interface DateTimeFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.DateTime;
}

export interface BooleanFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Boolean;
}

export interface IntegerFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Integer;
}

export interface ReferenceFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Reference;
  targetCmsRecord: CmsRecord;
  displayFieldName: string;
}

export interface AssociationReferenceFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.AssociationReference;

  // the AssociationRecordConfig that this reference is made on
  associationRecordConfig: AssociationRecordConfig;

  // source ReferenceFieldConfig for this field in
  // associationRecordConfig.referenceConfigPair
  sourceReference: ReferenceFieldConfig;

  // target ReferenceFieldConfig for this field in
  // associationRecordConfig.referenceConfigPair
  targetReference: ReferenceFieldConfig;

  // display field name in the target record.
  // override targetReference.displayFieldName
  displayFieldName: string;
}

export interface ImageAssetFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.ImageAsset;
}

interface FieldConfigInput {
  type: string;
  // tslint:disable-next-line: no-any
  [key: string]: any;
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

interface RecordTypeContext {
  cmsRecordByName: CmsRecordByName;
}

export interface ConfigContext {
  cmsRecordByName: CmsRecordByName;
  associationRecordByName: AssociationRecordByName;
}

export type ListActionConfig = ExportActionConfig | ImportActionConfig;
export enum ListActionConfigTypes {
  Export = 'Export',
  Import = 'Import',

  // TODO (Steven-Chan):
  // Add list action type `New`
}
export interface ExportActionConfig {
  type: ListActionConfigTypes.Export;
  name: string;
  label: string | undefined;

  // ignore field config
  // client side only need name for calling export API
}
export interface ImportActionConfig {
  type: ListActionConfigTypes.Import;
  name: string;
  label: string | undefined;

  // ignore field config and other config
  // client side only need name for calling export API
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

// tslint:disable-next-line: no-any
function preparseRecordConfigs(records: any): CmsRecordByName {
  const cmsRecordByName = objectFrom(
    Object.entries(records).map(([recordName, value]) => {
      const recordType =
        parseOptionalString(value, 'recordType', recordName) || recordName;
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
    parseOptionalString(input, 'recordType', recordName) || recordName;
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

  const { actions = [] } = input;

  return {
    actions,
    cmsRecord,
    fields: compactFields,
    filters,
    label,
    perPage,
    references: filterReferences(compactFields),
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
    cmsRecord,
    fields,
    label,
    references: filterReferences(fields),
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
  const editableFields = fields.map(config => ({ editable: true, ...config }));

  return {
    cmsRecord,
    fields: editableFields,
    label,
    references: filterReferences(fields),
  };
}

// tslint:disable-next-line: no-any
export function parseFieldConfig(context: ConfigContext, a: any): FieldConfig {
  switch (a.type) {
    case 'String':
      return parseStringFieldConfig(a);
    case 'TextArea':
      return parseTextAreaFieldConfig(a);
    case 'DateTime':
      return parseDateTimeFieldConfig(a);
    case 'Boolean':
      return parseBooleanFieldConfig(a);
    case 'Integer':
      return parseIntegerFieldConfig(a);
    case 'Reference':
      if (a.via_association_record) {
        return parseAssociationReferenceFieldConfig(context, a);
      } else {
        return parseReferenceFieldConfig(context, a);
      }
    case 'ImageAsset':
      return parseImageAssetFieldConfig(a);

    // built-in fields
    case '_id':
      return parseIdFieldConfig(a);
    case '_created_at':
      return parseCreatedAtFieldConfig(a);
    case '_updated_at':
      return parseUpdatedAtFieldConfig(a);
    default:
      throw new Error(`Received unknown field config type: ${a.type}`);
  }
}

function parseStringFieldConfig(input: FieldConfigInput): StringFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'String'),
    type: FieldConfigTypes.String,
  };
}

function parseTextAreaFieldConfig(
  input: FieldConfigInput
): TextAreaFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'TextArea'),
    type: FieldConfigTypes.TextArea,
  };
}

function parseDateTimeFieldConfig(
  input: FieldConfigInput
): DateTimeFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'DateTime'),
    type: FieldConfigTypes.DateTime,
  };
}

function parseBooleanFieldConfig(input: FieldConfigInput): BooleanFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'Boolean'),
    type: FieldConfigTypes.Boolean,
  };
}

function parseIntegerFieldConfig(input: FieldConfigInput): IntegerFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'Integer'),
    type: FieldConfigTypes.Integer,
  };
}

function parseReferenceFieldConfig(
  context: RecordTypeContext,
  input: FieldConfigInput
): ReferenceFieldConfig {
  const targetRecordName = parseString(input, 'target', 'Reference');
  const displayFieldName =
    parseOptionalString(input, 'displayFieldName', 'Reference') || '_id';

  const targetCmsRecord = context.cmsRecordByName[targetRecordName];
  if (targetCmsRecord === undefined) {
    throw new Error(
      `Couldn't find configuration of Reference.target = ${targetRecordName}`
    );
  }

  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    displayFieldName,
    targetCmsRecord,
    type: FieldConfigTypes.Reference,
  };
}

function parseAssociationReferenceFieldConfig(
  context: ConfigContext,
  input: FieldConfigInput
): AssociationReferenceFieldConfig {
  const targetRecordName = parseString(input, 'target', 'Reference');
  const displayFieldName = parseString(input, 'displayFieldName', 'Reference');

  const associationRecordName = parseString(
    input,
    'via_association_record',
    'Reference'
  );
  const associationRecordConfig =
    context.associationRecordByName[associationRecordName];
  if (associationRecordConfig === undefined) {
    throw new Error(
      `Couldn't find AssociationRecord with name = ${associationRecordName}`
    );
  }

  // look for the target reference
  const [sourceReference, targetReference] = deriveReferencesByTargetName(
    associationRecordConfig.referenceConfigPair,
    targetRecordName,
    associationRecordConfig.cmsRecord.name
  );

  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    associationRecordConfig,
    displayFieldName,
    sourceReference,
    targetReference,
    type: FieldConfigTypes.AssociationReference,
  };
}

// return a pair of ReferenceFieldConfig in the order of [SourceRef, TargetRef]
function deriveReferencesByTargetName(
  refPair: [ReferenceFieldConfig, ReferenceFieldConfig],
  targetRecordName: string,
  associationRecordName: string
): [ReferenceFieldConfig, ReferenceFieldConfig] {
  if (refPair[0].targetCmsRecord.name === targetRecordName) {
    return [refPair[1], refPair[0]];
  } else if (refPair[1].targetCmsRecord.name === targetRecordName) {
    return refPair;
  } else {
    throw new Error(
      `Couldn't find Reference.target = ${targetRecordName} in AssociationRecord.name = ${associationRecordName}`
    );
  }
}

function parseImageAssetFieldConfig(
  input: FieldConfigInput
): ImageAssetFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    type: FieldConfigTypes.ImageAsset,
  };
}

function parseFieldConfigAttrs(
  // tslint:disable-next-line: no-any
  input: any,
  fieldType: string
): FieldConfigAttrs {
  const name = parseString(input, 'name', fieldType);
  const label =
    parseOptionalString(input, 'label', fieldType) || humanize(name);

  return { compact: false, name, label };
}

function parseIdFieldConfig(input: FieldConfigInput): StringFieldConfig {
  return {
    compact: false,
    editable: false,
    label: 'ID',
    name: '_id',
    type: FieldConfigTypes.String,
  };
}

function parseCreatedAtFieldConfig(
  input: FieldConfigInput
): DateTimeFieldConfig {
  return {
    compact: false,
    editable: false,
    label: 'Created at',
    name: 'createdAt',
    type: FieldConfigTypes.DateTime,
  };
}

function parseUpdatedAtFieldConfig(
  input: FieldConfigInput
): DateTimeFieldConfig {
  return {
    compact: false,
    editable: false,
    label: 'Updated at',
    name: 'updatedAt',
    type: FieldConfigTypes.DateTime,
  };
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
    parseOptionalString(input, 'recordType', 'association_record') ||
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

function filterReferences(fieldConfigs: FieldConfig[]): ReferenceConfig[] {
  return fieldConfigs.reduce(
    (refs, config) => {
      switch (config.type) {
        case FieldConfigTypes.Reference:
          return [...refs, config];
        case FieldConfigTypes.AssociationReference:
          return [...refs, config];
        default:
          return refs;
      }
    },
    [] as ReferenceConfig[]
  );
}
