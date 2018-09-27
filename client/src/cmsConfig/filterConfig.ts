import uuid from 'uuid';
import { humanize } from '.././util';
import {
  parseOptionalBoolean,
  parseOptionalString,
  parseString,
  parseStringArray,
  parseTimezone,
} from './util';

import { TimezoneValue } from '../types';
import { CmsRecord, ConfigContext, RecordTypeContext } from './cmsConfig';

export type FilterConfig =
  | StringFilterConfig
  | NumberFilterConfig
  | BooleanFilterConfig
  | DateTimeFilterConfig
  | GeneralFilterConfig
  | ReferenceFilterConfig;

export enum FilterConfigTypes {
  String = 'string',
  DateTime = 'date_time',
  Boolean = 'boolean',
  Number = 'number',
  General = 'general',
  Reference = 'reference',
}

export interface FilterConfigAttrs {
  label: string;
  name: string;
  nullable: boolean;
}

interface FilterConfigInput {
  type: string;
  label: string;
  nullable: boolean;
}

export interface StringFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.String;
  name: string;
}

export interface NumberFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Number;
  name: string;
}

export interface BooleanFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Boolean;
  name: string;
}

export interface DateTimeFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.DateTime;
  name: string;
  timezone?: TimezoneValue;
}

export interface GeneralFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.General;
  name: string;
  names: string[];
}

export interface ReferenceFilterConfig extends FilterConfigInput {
  type: FilterConfigTypes.Reference;
  name: string;
  targetCmsRecord: CmsRecord;
  displayFieldName: string;
}

export function parseFilterConfig(
  // tslint:disable-next-line: no-any
  a: any,
  context: ConfigContext
): FilterConfig {
  switch (a.type) {
    case 'string':
      return parseStringFilterConfig(a);
    case 'number':
    case 'float':
      return parseNumberFilterConfig(a);
    case 'boolean':
      return parseBooleanFilterConfig(a);
    case 'date_time':
      return parseDateTimeFilterConfig(a, context);
    case 'general':
      return parseGeneralFilterConfig(a);
    case 'reference':
      return parseReferenceFilterConfig(a, context);
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
  const nullable = parseOptionalBoolean(input, 'nullable', fieldType) || false;

  return { name, label, nullable };
}

function parseStringFilterConfig(input: FilterConfigInput): StringFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'string'),
    type: FilterConfigTypes.String,
  };
}

function parseNumberFilterConfig(input: FilterConfigInput): NumberFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'number'),
    type: FilterConfigTypes.Number,
  };
}

function parseBooleanFilterConfig(
  input: FilterConfigInput
): BooleanFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'boolean'),
    type: FilterConfigTypes.Boolean,
  };
}

function parseDateTimeFilterConfig(
  // tslint:disable-next-line:no-any
  input: any,
  context: RecordTypeContext
): DateTimeFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'date_time'),
    timezone: parseTimezone(input, 'timezone'),
    type: FilterConfigTypes.DateTime,
  };
}

function parseGeneralFilterConfig(
  input: FilterConfigInput
): GeneralFilterConfig {
  const label =
    parseOptionalString(input, 'label', 'general') || humanize(name);
  const names = parseStringArray(input, 'name', 'general');
  const nullable = parseOptionalBoolean(input, 'nullable', 'general') || false;
  return {
    label,
    name: names.join(','),
    names,
    nullable,
    type: FilterConfigTypes.General,
  };
}

function parseReferenceFilterConfig(
  input: FilterConfigInput,
  context: ConfigContext
): ReferenceFilterConfig {
  const targetRecordName = parseString(input, 'reference_target', 'reference');
  const displayFieldName =
    parseOptionalString(input, 'reference_field_name', 'reference') || '_id';
  const cmsRecordData = context.cmsRecordByName[targetRecordName];

  if (cmsRecordData === undefined) {
    throw new Error(
      `Couldn't find configuration of reference.reference_target = ${targetRecordName}`
    );
  }
  const targetCmsRecord = cmsRecordData.record;

  return {
    ...parseFilterConfigAttrs(input, 'reference'),
    displayFieldName,
    targetCmsRecord,
    type: FilterConfigTypes.Reference,
  };
}

export enum BaseFilterQueryType {
  IsNull = 'is_null',
  IsNotNull = 'is_not_null',
}

export enum StringFilterQueryType {
  EqualTo = 'equal_to',
  NotEqualTo = 'not_equal_to',
  Contain = 'contain',
  NotContain = 'not_contain',
}

export enum NumberFilterQueryType {
  EqualTo = 'equal_to',
  NotEqualTo = 'not_equal_to',
  LessThan = 'less_than',
  GreaterThan = 'greater_than',
  LessThanOrEqualTo = 'less_than_or_equal_to',
  GreaterThanOrEqualTo = 'greater_than_or_equal_to',
}

export enum BooleanFilterQueryType {
  True = 'true',
  False = 'false',
}

export enum DateTimeFilterQueryType {
  Before = 'before',
  After = 'after',
}

export enum GeneralFilterQueryType {
  Contains = 'contains',
}

export enum ReferenceFilterQueryType {
  Contains = 'contains',
}

export type Filter =
  | StringFilter
  | NumberFilter
  | BooleanFilter
  | DateTimeFilter
  | GeneralFilter
  | ReferenceFilter;

export enum FilterType {
  StringFilterType = 'StringFilterType',
  IntegerFilterType = 'IntegerFilterType',
  NumberFilterType = 'NumberFilterType',
  BooleanFilterType = 'BooleanFilterType',
  DateTimeFilterType = 'DateTimeFilterType',
  GeneralFilterType = 'GeneralFilterType',
  ReferenceFilterType = 'ReferenceFilterType',
}

export interface FilterAttrs {
  id: string;
  query: FilterQueryType;
  label: string;
  name: string;
  nullable: boolean;
}

export interface StringFilter extends FilterAttrs {
  type: FilterType.StringFilterType;
  query: BaseFilterQueryType | StringFilterQueryType;
  value: string;
}

export interface NumberFilter extends FilterAttrs {
  type: FilterType.NumberFilterType;
  query: BaseFilterQueryType | NumberFilterQueryType;
  value: number;
}

export interface BooleanFilter extends FilterAttrs {
  type: FilterType.BooleanFilterType;
  query: BaseFilterQueryType | BooleanFilterQueryType;
}

export interface DateTimeFilter extends FilterAttrs {
  type: FilterType.DateTimeFilterType;
  query: BaseFilterQueryType | DateTimeFilterQueryType;
  value: Date;
}

export interface GeneralFilter extends FilterAttrs {
  type: FilterType.GeneralFilterType;
  query: BaseFilterQueryType | GeneralFilterQueryType;
  names: string[];
  value: string;
}

export interface ReferenceFilter extends FilterAttrs {
  type: FilterType.ReferenceFilterType;
  query: BaseFilterQueryType | ReferenceFilterQueryType;
  values: string[];
  displayFieldName: string;
}

export type FilterQueryType =
  | BaseFilterQueryType
  | StringFilterQueryType
  | NumberFilterQueryType
  | BooleanFilterQueryType
  | DateTimeFilterQueryType
  | GeneralFilterQueryType
  | ReferenceFilterQueryType;

export function filterFactory(filterConfig: FilterConfig): Filter {
  switch (filterConfig.type) {
    case FilterConfigTypes.String:
      return {
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        nullable: filterConfig.nullable,
        query: StringFilterQueryType.EqualTo,
        type: FilterType.StringFilterType,
        value: '',
      };
    case FilterConfigTypes.Number:
      return {
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        nullable: filterConfig.nullable,
        query: NumberFilterQueryType.EqualTo,
        type: FilterType.NumberFilterType,
        value: 0,
      };
    case FilterConfigTypes.Boolean:
      return {
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        nullable: filterConfig.nullable,
        query: BooleanFilterQueryType.True,
        type: FilterType.BooleanFilterType,
      };
    case FilterConfigTypes.DateTime:
      return {
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        nullable: filterConfig.nullable,
        query: DateTimeFilterQueryType.Before,
        type: FilterType.DateTimeFilterType,
        value: new Date(),
      };
    case FilterConfigTypes.General:
      return {
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        names: filterConfig.names,
        nullable: filterConfig.nullable,
        query: GeneralFilterQueryType.Contains,
        type: FilterType.GeneralFilterType,
        value: '',
      };
    case FilterConfigTypes.Reference:
      return {
        displayFieldName: filterConfig.displayFieldName,
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        nullable: filterConfig.nullable,
        query: ReferenceFilterQueryType.Contains,
        type: FilterType.ReferenceFilterType,
        values: [],
      };
    default:
      throw new Error(`unsupported FilterConfigTypes in filterFactory`);
  }
}

export function isFilterEqual(f1: Filter, f2: Filter): boolean {
  // skip checking id
  const { id: id1, ...f1Value } = f1;
  const { id: id2, ...f2Value } = f2;

  const keys1 = Object.keys(f1Value);
  const keys2 = Object.keys(f2Value);

  if (keys1.length !== keys2.length) {
    return false;
  }

  const sortedKeys1 = keys1.sort();
  const sortedKeys2 = keys2.sort();

  for (let j = 0; j < sortedKeys1.length; j++) {
    const k1 = sortedKeys1[j];
    const k2 = sortedKeys2[j];

    if (k1 !== k2 || typeof f1Value[k1] !== typeof f2Value[k1]) {
      return false;
    }

    if (typeof f1Value[k1] === 'object') {
      // no deep equal for object
      if (JSON.stringify(f1Value[k1]) !== JSON.stringify(f2Value[k1])) {
        return false;
      }
    } else if (f1Value[k1] !== f2Value[k1]) {
      return false;
    }
  }

  return true;
}

export function isFilterListEqual(f1: Filter[], f2: Filter[]): boolean {
  if (f1.length !== f2.length) {
    return false;
  }

  for (let i = 0; i < f1.length; i++) {
    if (!isFilterEqual(f1[i], f2[i])) {
      return false;
    }
  }

  return true;
}
