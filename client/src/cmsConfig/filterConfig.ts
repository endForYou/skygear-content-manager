import { humanize } from '.././util';
import { parseOptionalString, parseString } from './util';

export type FilterConfig =
  | StringFilterConfig
  | IntegerFilterConfig
  | BooleanFilterConfig
  | DateTimeFilterConfig;

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

export interface DateTimeFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.DateTime; 
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
    case 'DateTime':
      return parseDateTimeFilterConfig(a);
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

function parseDateTimeFilterConfig(input: FilterConfigInput): DateTimeFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'DateTime'),
    type: FilterConfigTypes.DateTime,
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

export enum DateTimeFilterQueryType {
  Before = 'Before',
  After = 'After',
}

export type Filter =
  | StringFilter
  | IntegerFilter
  | BooleanFilter
  | DateTimeFilter;

export enum FilterType {
  StringFilterType = 'StringFilterType',
  IntegerFilterType = 'IntegerFilterType',
  BooleanFilterType = 'BooleanFilterType',
  DateTimeFilterType = 'DateTimeFilterType',
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

export interface DateTimeFilter extends FilterAttrs {
  type: FilterType.DateTimeFilterType;
  query: DateTimeFilterQueryType;
  value: Date;
}
export type FilterQueryType =
  | StringFilterQueryType
  | IntegerFilterQueryType
  | BooleanFilterQueryType
  | DateTimeFilterQueryType;
