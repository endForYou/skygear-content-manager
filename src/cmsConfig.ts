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
  [key: string]: any;
}

interface StringFieldConfigInput extends FieldConfigInput {
  name: string;
  label?: string;
}

export function parseCmsConfig({ site, records }: any): CmsConfig {
  return {
    site: parseSiteConfigs(site),
    records: Object.entries(
      records
    ).reduce((obj: object, [name, recordConfig]: [string, any]) => {
      return { ...obj, [name]: parseRecordConfig(name, recordConfig) };
    }, {}),
  };
}

function parseSiteConfigs(siteConfigs: any[]): SiteConfig {
  return siteConfigs.map(parseSiteConfig);
}

function parseSiteConfig(siteConfig: any): SiteItemConfig {
  switch (siteConfig.type) {
    case 'Record':
      return parseSiteRecordConfig(siteConfig);
    default:
      throw new Error(`Received unknown site config type: ${siteConfig.type}`);
  }
}

function parseSiteRecordConfig({
  type,
  name,
  label,
}: any): RecordSiteItemConfig {
  const parsedLabel = label ? label : humanize(name);
  return { type, name, label: parsedLabel };
}

function parseRecordConfig(
  recordName: string,
  { recordType, list: listPageConfig }: any
): RecordConfig {
  const parsedRecordType = recordType ? recordType : recordName;
  return {
    recordName,
    recordType: parsedRecordType,
    list: parseListPageConfig(recordName, listPageConfig),
  };
}

function parseListPageConfig(
  recordName: string,
  { label, perPage = 25, fields: fieldConfigs }: any
): ListPageConfig {
  const parsedLabel = label ? label : humanize(recordName);
  return {
    label: parsedLabel,
    perPage,
    fields: fieldConfigs.map(parseFieldConfig),
  };
}

function parseFieldConfig(a: any): FieldConfig {
  switch (a.type) {
    case 'String':
      return parseStringFieldConfig(a);
    default:
      throw new Error(`Received unknown field config type: ${a.type}`);
  }
}

function parseStringFieldConfig(input: FieldConfigInput): StringFieldConfig {
  function isValidInput(
    input: FieldConfigInput
  ): input is StringFieldConfigInput {
    return input.type === 'String' && typeof (input as any).name === 'string';
  }

  if (isValidInput(input)) {
    return {
      type: 'String',
      name: input.name,
      label: input.label || humanize(name),
    };
  }

  throw new Error(`Invalid input shape of string field: ${input}`);
}
