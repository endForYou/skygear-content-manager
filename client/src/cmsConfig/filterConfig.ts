import { humanize } from '.././util';
import { parseOptionalString, parseString } from './util';

export type FilterConfig =
  | StringFilterConfig
  | IntegerFilterConfig
  | BooleanFilterConfig;

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
  name: string;
  label: string;
}

export interface StringFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.String;
}

export interface IntegerFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Integer;
}

export interface BooleanFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Boolean; 
}

// tslint:disable-next-line: no-any
export function parseFilterConfig(a: any): FilterConfig {
  switch (a.type) {
    case 'String':
      return parseStringFilterConfig(a);
    case 'Integer':
      return parseIntegerFilterConfig(a);
    case 'Boolean':
      return parseBooleanFilterConfig(a);
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

function parseIntegerFilterConfig(input: FilterConfigInput): IntegerFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'Integer'),
    type: FilterConfigTypes.Integer,
  };
}

function parseBooleanFilterConfig(input: FilterConfigInput): BooleanFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'Boolean'),
    type: FilterConfigTypes.Boolean,
  };
}


export enum StringFilterQueryType {
  EqualTo = 'EqualTo',
  NotEqualTo = 'NotEqualTo',
  Like = 'Like', 
  NotLike = 'NotLike',
}

export enum IntegerFilterQueryType {
  EqualTo = 'EqualTo',
  NotEqualTo = 'NotEqualTo',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
}

export enum BooleanFilterQueryType {
  True = 'True',
  False = 'False',
}

export type Filter =
  | StringFilter
  | IntegerFilter
  | BooleanFilter;

export enum FilterType {
  StringFilterType = 'StringFilterType',
  IntegerFilterType = 'IntegerFilterType',
  BooleanFilterType = 'BooleanFilterType',
}

export interface FilterAttrs {
  id: string;
  name: string;
  query: FilterQueryType;
  label: string;
}

export interface StringFilter extends FilterAttrs {
  type: FilterType.StringFilterType;
  query: StringFilterQueryType;
  value: string;
}

export interface IntegerFilter extends FilterAttrs {
  type: FilterType.IntegerFilterType;
  query: IntegerFilterQueryType;
  value: number;
}

export interface BooleanFilter extends FilterAttrs {
  type: FilterType.BooleanFilterType;
  query: BooleanFilterQueryType;
}

export type FilterQueryType =
  | StringFilterQueryType
  | IntegerFilterQueryType
  | BooleanFilterQueryType;
