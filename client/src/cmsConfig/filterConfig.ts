import { humanize } from '.././util';
import { parseOptionalString, parseString } from './util';

export type FilterConfig =
  | StringFilterConfig;

export enum FilterConfigTypes {
  String = 'String',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  Integer = 'Integer',
}

export interface FilterConfigAttrs {
  name: string;
  label: string;
}

interface FilterConfigInput {
  type: string;
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

export interface StringFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.String;
}

// tslint:disable-next-line: no-any
export function parseFilterConfig(a: any): FilterConfig {
  switch (a.type) {
    case 'String':
      return parseStringFilterConfig(a);
    default:
      throw new Error(`Received unknown filter config type: ${a.type}`);
  }
}

function parseFilterConfigAttrs(
  // tslint:disable-next-line: no-any
  input: any,
  fieldType: string
): FilterConfigAttrs {
  const name = parseString(input, 'name', fieldType);
  const label =
    parseOptionalString(input, 'label', fieldType) || humanize(name);

  return { name, label };
}

function parseStringFilterConfig(input: FilterConfigInput): StringFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'String'),
    type: FilterConfigTypes.String,
  };
}
