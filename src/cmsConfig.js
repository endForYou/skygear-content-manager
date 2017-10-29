import { humanize } from './util';

export function parseCmsConfig({ site, records }) {
  return {
    site: parseSiteConfigs(site),
    records: Object.entries(records).reduce((obj, [name, recordConfig]) => {
      return { ...obj, [name]: parseRecordConfig(name, recordConfig) };
    }, {}),
  };
}

function parseSiteConfigs(siteConfigs) {
  return siteConfigs.map(parseSiteConfig);
}

function parseSiteConfig(siteConfig) {
  switch (siteConfig.type) {
    case 'Record':
      return parseSiteRecordConfig(siteConfig);
    default:
      throw new Error(`Received unknown site config type: ${siteConfig.type}`);
  }
}

function parseSiteRecordConfig({ type, name, label }) {
  const parsedLabel = label ? label : humanize(name);
  return { type, name, label: parsedLabel };
}

function parseRecordConfig(recordName, { recordType, list: listPageConfig }) {
  const parsedRecordType = recordType ? recordType : recordName;
  return {
    recordName,
    recordType: parsedRecordType,
    list: parseListPageConfig(recordName, listPageConfig),
  };
}

function parseListPageConfig(
  recordName,
  { label, perPage = 25, fields: fieldConfigs }
) {
  const parsedLabel = label ? label : humanize(recordName);
  return {
    label: parsedLabel,
    perPage,
    fields: fieldConfigs.map(parseFieldConfig),
  };
}

function parseFieldConfig(fieldConfig) {
  switch (fieldConfig.type) {
    case 'String':
      return parseStringFieldConfig(fieldConfig);
    default:
      throw new Error(
        `Received unknown field config type: ${fieldConfig.type}`
      );
  }
}

function parseStringFieldConfig({ type, name, label }) {
  const parsedLabel = label ? label : humanize(name);
  return { type, name, label: parsedLabel };
}
