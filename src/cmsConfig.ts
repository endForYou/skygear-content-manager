import { humanize } from './util';

export interface CmsConfig {
  site: SiteConfig;
  records: RecordConfigMap;
}

export type SiteConfig = SiteItemConfig[];

export type SiteItemConfig = RecordSiteItemConfig;

export interface RecordSiteItemConfig {
  type: string;

  name: string;
  label: string;
}

export interface RecordConfigMap {
  [key: string]: RecordConfig;
}

export interface RecordConfig {
  recordName: string;
  recordType: string;
  list: ListPageConfig;
}

export interface ListPageConfig {
  label: string;
  perPage: number;
  fields: FieldConfig[];
}

export type FieldConfig = StringFieldConfig;

export interface StringFieldConfig {
  type: 'String';
  name: string;
  label: string;
}

interface FieldConfigInput {
  type: string;
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

interface StringFieldConfigInput extends FieldConfigInput {
  name: string;
  label?: string;
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
  const { recordType, list: listPageConfig } = input;

  const parsedRecordType = recordType ? recordType : recordName;
  return {
    list: parseListPageConfig(recordName, listPageConfig),
    recordName,
    recordType: parsedRecordType,
  };
}

// tslint:disable-next-line: no-any
function parseListPageConfig(recordName: string, input: any): ListPageConfig {
  const { label, perPage = 25, fields: fieldConfigs } = input;

  const parsedLabel = label ? label : humanize(recordName);
  return {
    fields: fieldConfigs.map(parseFieldConfig),
    label: parsedLabel,
    perPage,
  };
}

// tslint:disable-next-line: no-any
function parseFieldConfig(a: any): FieldConfig {
  switch (a.type) {
    case 'String':
      return parseStringFieldConfig(a);
    default:
      throw new Error(`Received unknown field config type: ${a.type}`);
  }
}

function parseStringFieldConfig(input: FieldConfigInput): StringFieldConfig {
  function isValidInput(i: FieldConfigInput): i is StringFieldConfigInput {
    // tslint:disable-next-line: no-any
    return i.type === 'String' && typeof (i as any).name === 'string';
  }

  if (isValidInput(input)) {
    return {
      label: input.label || humanize(name),
      name: input.name,
      type: 'String',
    };
  }

  throw new Error(`Invalid input shape of string field: ${input}`);
}
