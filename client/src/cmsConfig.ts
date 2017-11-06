import { humanize } from './util';

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

export type FieldConfig = StringFieldConfig | DateTimeFieldConfig;
export enum FieldConfigTypes {
  String = 'String',
  DateTime = 'DateTime',
}
interface FieldConfigAttrs {
  name: string;
  label: string;

  editable?: boolean;
}

export interface StringFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.String;
}

export interface DateTimeFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.DateTime;
}

interface FieldConfigInput {
  type: string;
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

// tslint:disable-next-line: no-any
export function parseCmsConfig({ site, records }: any): CmsConfig {
  return {
    records: Object.entries(
      records
      // tslint:disable-next-line: no-any
    ).reduce((obj: object, [name, recordConfig]: [string, any]) => {
      return { ...obj, [name]: parseRecordConfig(name, recordConfig) };
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

// tslint:disable-next-line: no-any
function parseRecordConfig(recordName: string, input: any): RecordConfig {
  const { list, show, edit } = input;

  const recordType = parseOptionalString(input.recordType) || recordName;
  const cmsRecord = { name: recordName, recordType };
  return {
    cmsRecord,
    edit: edit == null ? undefined : parseEditPageConfig(cmsRecord, edit),
    list: list == null ? undefined : parseListPageConfig(cmsRecord, list),
    show: show == null ? undefined : parseShowPageConfig(cmsRecord, show),
  };
}

// tslint:disable-next-line: no-any
function parseListPageConfig(cmsRecord: CmsRecord, input: any): ListPageConfig {
  const { label, perPage = 25, fields: fieldConfigs } = input;

  const parsedLabel = label ? label : humanize(cmsRecord.name);
  return {
    cmsRecord,
    fields: fieldConfigs.map(parseFieldConfig),
    label: parsedLabel,
    perPage,
  };
}

// tslint:disable-next-line: no-any
function parseShowPageConfig(cmsRecord: CmsRecord, input: any): ShowPageConfig {
  if (!Array.isArray(input.fields)) {
    throw new Error(`ShowPageConfig.fields must be an Array`);
  }

  const label = parseOptionalString(input.label) || humanize(cmsRecord.name);

  if (typeof input.label !== 'string' && typeof input.label !== 'undefined') {
    throw new Error(`ShowPageConfig.label must be a string`);
  }

  return {
    cmsRecord,
    fields: input.fields.map(parseFieldConfig),
    label,
  };
}

// tslint:disable-next-line: no-any
function parseEditPageConfig(cmsRecord: CmsRecord, input: any): EditPageConfig {
  if (!Array.isArray(input.fields)) {
    throw new Error(`EditPageConfig.fields must be an Array`);
  }

  const label = parseOptionalString(input.label) || humanize(cmsRecord.name);

  if (typeof input.label !== 'string' && typeof input.label !== 'undefined') {
    throw new Error(`EditPageConfig.label must be a string`);
  }

  const fields = input.fields.map(parseFieldConfig) as StringFieldConfig[];
  const editableFields = fields.map(config => ({ editable: true, ...config }));

  return {
    cmsRecord,
    fields: editableFields,
    label,
  };
}

// tslint:disable-next-line: no-any
function parseFieldConfig(a: any): FieldConfig {
  switch (a.type) {
    case 'String':
      return parseStringFieldConfig(a);
    case 'DateTime':
      return parseDateTimeFieldConfig(a);
    default:
      throw new Error(`Received unknown field config type: ${a.type}`);
  }
}

function parseStringFieldConfig(input: FieldConfigInput): StringFieldConfig {
  return { ...parseFieldConfigAttrs(input), type: FieldConfigTypes.String };
}

function parseDateTimeFieldConfig(
  input: FieldConfigInput
): DateTimeFieldConfig {
  return { ...parseFieldConfigAttrs(input), type: FieldConfigTypes.DateTime };
}

// tslint:disable-next-line: no-any
function parseFieldConfigAttrs(input: any): FieldConfigAttrs {
  const name = parseString(input.name);
  const label = parseOptionalString(input.label) || humanize(name);

  return { name, label };
}

// tslint:disable-next-line: no-any
function parseString(a: any, error?: string): string {
  const optionalString = parseOptionalString(a, error);
  if (optionalString === undefined) {
    throw new Error(error || 'expect a string, got undefined');
  }

  return optionalString;
}

// tslint:disable-next-line: no-any
function parseOptionalString(a: any, error?: string): string | undefined {
  if (a == null) {
    return undefined;
  }

  if (typeof a === 'string') {
    return a;
  }

  throw new Error(error || `unknown variable type: ${typeof a === 'string'}`);
}
