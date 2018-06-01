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
  | IntegerFilterConfig
  | BooleanFilterConfig
  | DateTimeFilterConfig
  | GeneralFilterConfig
  | ReferenceFilterConfig;

export enum FilterConfigTypes {
  String = 'String',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  Integer = 'Integer',
  General = 'General',
  Reference = 'Reference',
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
  timezone: TimezoneValue;
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
    case 'String':
      return parseStringFilterConfig(a);
    case 'Integer':
      return parseIntegerFilterConfig(a);
    case 'Boolean':
      return parseBooleanFilterConfig(a);
    case 'DateTime':
      return parseDateTimeFilterConfig(a, context);
    case 'General':
      return parseGeneralFilterConfig(a);
    case 'Reference':
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
    ...parseFilterConfigAttrs(input, 'String'),
    type: FilterConfigTypes.String,
  };
}

function parseIntegerFilterConfig(
  input: FilterConfigInput
): IntegerFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'Integer'),
    type: FilterConfigTypes.Integer,
  };
}

function parseBooleanFilterConfig(
  input: FilterConfigInput
): BooleanFilterConfig {
  return {
    ...parseFilterConfigAttrs(input, 'Boolean'),
    type: FilterConfigTypes.Boolean,
  };
}

function parseDateTimeFilterConfig(
  // tslint:disable-next-line:no-any
  input: any,
  context: RecordTypeContext
): DateTimeFilterConfig {
  const timezone =
    input.timezone == null
      ? context.timezone
      : parseTimezone(input, 'timezone');

  return {
    ...parseFilterConfigAttrs(input, 'DateTime'),
    timezone,
    type: FilterConfigTypes.DateTime,
  };
}

function parseGeneralFilterConfig(
  input: FilterConfigInput
): GeneralFilterConfig {
  const label =
    parseOptionalString(input, 'label', 'General') || humanize(name);
  const names = parseStringArray(input, 'name', 'General');
  const nullable = parseOptionalBoolean(input, 'nullable', 'General') || false;
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
  const targetRecordName = parseString(input, 'reference_target', 'Reference');
  const displayFieldName =
    parseOptionalString(input, 'reference_field_name', 'Reference') || '_id';
  const targetCmsRecord = context.cmsRecordByName[targetRecordName];

  if (targetCmsRecord === undefined) {
    throw new Error(
      `Couldn't find configuration of Reference.reference_target = ${targetRecordName}`
    );
  }

  return {
    ...parseFilterConfigAttrs(input, 'Reference'),
    displayFieldName,
    targetCmsRecord,
    type: FilterConfigTypes.Reference,
  };
}

export enum BaseFilterQueryType {
  IsNull = 'IsNull',
  IsNotNull = 'IsNotNull',
}

export enum StringFilterQueryType {
  EqualTo = 'EqualTo',
  NotEqualTo = 'NotEqualTo',
  Contain = 'Contain',
  NotContain = 'NotContain',
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

export enum ReferenceFilterQueryType {
  Contains = 'Contains',
}

export type Filter =
  | StringFilter
  | IntegerFilter
  | BooleanFilter
  | DateTimeFilter
  | GeneralFilter
  | ReferenceFilter;

export enum FilterType {
  StringFilterType = 'StringFilterType',
  IntegerFilterType = 'IntegerFilterType',
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

export interface IntegerFilter extends FilterAttrs {
  type: FilterType.IntegerFilterType;
  query: BaseFilterQueryType | IntegerFilterQueryType;
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
  | IntegerFilterQueryType
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
    case FilterConfigTypes.Integer:
      return {
        id: uuid(),
        label: filterConfig.label,
        name: filterConfig.name,
        nullable: filterConfig.nullable,
        query: IntegerFilterQueryType.EqualTo,
        type: FilterType.IntegerFilterType,
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
