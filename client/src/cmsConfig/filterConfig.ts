import { humanize } from '.././util';
import { parseOptionalString, parseString, parseStringArray } from './util';

export type FilterConfig =
  | StringFilterConfig
  | IntegerFilterConfig
  | BooleanFilterConfig
  | DateTimeFilterConfig
  | GeneralFilterConfig;

export enum FilterConfigTypes {
  String = 'String',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  Integer = 'Integer',
  General = 'General',
}

export interface FilterConfigAttrs {
  label: string;
  name: string;
}

interface FilterConfigInput {
  type: string;
  label: string;
}

export interface StringFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.String;
  name: string;
}

export interface IntegerFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Integer;
  name: string;
}

export interface BooleanFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Boolean; 
  name: string;
}

export interface DateTimeFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.DateTime; 
  name: string;
}

export interface GeneralFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.General; 
  names: string[];
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
    case 'General':
      return parseGeneralFilterConfig(a);
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

function parseGeneralFilterConfig(input: FilterConfigInput): GeneralFilterConfig {
  const label = parseOptionalString(input, 'label', 'General') || humanize(name);
  const names = parseStringArray(input, 'name', 'General');
  return {
    label,
    names,
    type: FilterConfigTypes.General,
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

export enum GeneralFilterQueryType {
  Contains = 'Contains',
}

export type Filter =
  | StringFilter
  | IntegerFilter
  | BooleanFilter
  | DateTimeFilter
  | GeneralFilter;

export enum FilterType {
  StringFilterType = 'StringFilterType',
  IntegerFilterType = 'IntegerFilterType',
  BooleanFilterType = 'BooleanFilterType',
  DateTimeFilterType = 'DateTimeFilterType',
  GeneralFilterType = 'GeneralFilterType',
}

export interface FilterAttrs {
  id: string;
  query: FilterQueryType;
  label: string;
}

export interface StringFilter extends FilterAttrs {
  type: FilterType.StringFilterType;
  query: StringFilterQueryType;
  value: string;
  name: string;
}

export interface IntegerFilter extends FilterAttrs {
  type: FilterType.IntegerFilterType;
  query: IntegerFilterQueryType;
  value: number;
  name: string;
}

export interface BooleanFilter extends FilterAttrs {
  type: FilterType.BooleanFilterType;
  query: BooleanFilterQueryType;
  name: string;
}

export interface DateTimeFilter extends FilterAttrs {
  type: FilterType.DateTimeFilterType;
  query: DateTimeFilterQueryType;
  value: Date;
  name: string;
}

export interface GeneralFilter extends FilterAttrs {
  type: FilterType.GeneralFilterType;
  query: GeneralFilterQueryType;
  names: string[];
  value: string;
}

export type FilterQueryType =
  | StringFilterQueryType
  | IntegerFilterQueryType
  | BooleanFilterQueryType
  | DateTimeFilterQueryType
  | GeneralFilterQueryType;
