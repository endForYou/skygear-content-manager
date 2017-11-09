import { humanize, objectFrom } from './util';

export interface CmsConfig {
  site: SiteConfig;
  records: RecordConfigMap;
}

export type SiteConfig = SiteItemConfig[];

export type SiteItemConfig = RecordSiteItemConfig;

export interface RecordSiteItemConfig {
  type: RecordSiteItemConfigType;

  name: string;
  label: string;
}

export enum RecordSiteItemConfigType {
  Record = 'Record',
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

export interface RecordConfig {
  cmsRecord: CmsRecord;
  list?: ListPageConfig;
  show?: ShowPageConfig;
  edit?: EditPageConfig;
}

export interface ListPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  perPage: number;
  fields: FieldConfig[];
}

export interface ShowPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  fields: FieldConfig[];
}

export interface EditPageConfig {
  cmsRecord: CmsRecord;
  label: string;
  fields: FieldConfig[];
}

export type FieldConfig =
  | StringFieldConfig
  | TextAreaFieldConfig
  | DateTimeFieldConfig
  | BooleanFieldConfig
  | IntegerFieldConfig
  | ReferenceFieldConfig;
export enum FieldConfigTypes {
  String = 'String',
  TextArea = 'TextArea',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  Integer = 'Integer',
  Reference = 'Reference',
}
interface FieldConfigAttrs {
  name: string;
  label: string;

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
  cmsRecord: CmsRecord;
}

interface FieldConfigInput {
  type: string;
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

// tslint:disable-next-line: no-any
export function parseCmsConfig({ site, records }: any): CmsConfig {
  const context = preparseRecordConfigs(records);

  return {
    records: Object.entries(
      records
      // tslint:disable-next-line: no-any
    ).reduce((obj: object, [name, recordConfig]: [string, any]) => {
      return { ...obj, [name]: parseRecordConfig(context, name, recordConfig) };
    }, {}),
    site: parseSiteConfigs(site),
  };
}

// tslint:disable-next-line: no-any
function parseSiteConfigs(siteConfigs: any[]): SiteConfig {
  return siteConfigs.map(parseSiteConfig);
}

// tslint:disable-next-line: no-any
function parseSiteConfig(siteConfig: any): SiteItemConfig {
  switch (siteConfig.type) {
    case 'Record':
      return parseSiteRecordConfig(siteConfig);
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

interface ConfigContext {
  cmsRecordByName: { [key: string]: CmsRecord | undefined };
}

// tslint:disable-next-line: no-any
function preparseRecordConfigs(records: any): ConfigContext {
  const cmsRecords: CmsRecord[] = Object.entries(
    records
  ).map(([recordName, value]) => {
    const recordType =
      parseOptionalString(value, 'recordType', recordName) || recordName;
    return { name: recordName, recordType };
  });
  const cmsRecordByName = objectFrom(
    cmsRecords.map(cmsRecord => {
      return [cmsRecord.name, cmsRecord] as [string, CmsRecord];
    })
  );

  return { cmsRecordByName };
}

function parseRecordConfig(
  context: ConfigContext,
  recordName: string,
  // tslint:disable-next-line: no-any
  input: any
): RecordConfig {
  const { list, show, edit } = input;

  const recordType =
    parseOptionalString(input, 'recordType', recordName) || recordName;
  const cmsRecord = { name: recordName, recordType };
  return {
    cmsRecord,
    edit:
      edit == null ? undefined : parseEditPageConfig(context, cmsRecord, edit),
    list:
      list == null ? undefined : parseListPageConfig(context, cmsRecord, list),
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

  return {
    cmsRecord,
    fields,
    label,
    perPage,
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
  };
}

function parseEditPageConfig(
  context: ConfigContext,
  cmsRecord: CmsRecord,
  // tslint:disable-next-line: no-any
  input: any
): EditPageConfig {
  if (!Array.isArray(input.fields)) {
    throw new Error(`EditPageConfig.fields must be an Array`);
  }

  const label =
    parseOptionalString(input, 'label', 'Edit') || humanize(cmsRecord.name);

  if (typeof input.label !== 'string' && typeof input.label !== 'undefined') {
    throw new Error(`EditPageConfig.label must be a string`);
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
  };
}

// tslint:disable-next-line: no-any
function parseFieldConfig(context: ConfigContext, a: any): FieldConfig {
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
      return parseReferenceFieldConfig(context, a);

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
  context: ConfigContext,
  input: FieldConfigInput
): ReferenceFieldConfig {
  const referenceName = parseString(input, 'referencing', 'Reference');
  const referenceCmsRecord = context.cmsRecordByName[referenceName];

  if (referenceCmsRecord === undefined) {
    throw new Error(
      `Couldn't find configuration of Reference.referencing = ${referenceName}`
    );
  }

  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    cmsRecord: referenceCmsRecord,
    type: FieldConfigTypes.Reference,
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

  return { name, label };
}

function parseIdFieldConfig(input: FieldConfigInput): StringFieldConfig {
  return {
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
    editable: false,
    label: 'Updated at',
    name: 'updatedAt',
    type: FieldConfigTypes.DateTime,
  };
}

// tslint:disable-next-line: no-any
function parseString(a: any, fieldName: string, context: string): string {
  const optionalString = parseOptionalString(a, fieldName, context);
  if (optionalString === undefined) {
    throw new Error(`${context}.${fieldName} want a string, got undefined`);
  }

  return optionalString;
}

function parseOptionalString(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): string | undefined {
  const value = a[fieldName];

  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`${context}.${fieldName} want a string, got ${typeof a}`);
}
