import { isArray } from 'util';

import { CmsRecord, ConfigContext } from '.';
import { parseString } from './util';

export enum PredicateTypes {
  Like = 'like',
  NotLike = 'not_like',
  CaseInsensitiveLike = 'case_insensitive_like',
  CaseInsensitiveNotLike = 'case_insensitive_not_like',
  EqualTo = 'equal_to',
  NotEqualTo = 'not_equal_to',
  GreaterThan = 'greater_than',
  GreaterThanOrEqualTo = 'greater_than_or_equal_to',
  LessThan = 'less_than',
  LessThanOrEqualTo = 'less_than_or_equal_to',
  Contains = 'contains',
  NotContains = 'not_contains',
  ContainsValue = 'contains_value',
  NotContainsValue = 'not_contains_value',
}

export enum PredicateValueTypes {
  JSONValue = 'json_value',
  DateTime = 'date_time',
  Reference = 'reference',
}

export type PredicateValue = Predicate[];

export type Predicate = JSONValuePredicate | ReferencePredicate;
interface PredicateAttrs {
  type: PredicateTypes;
  name: string;
}
interface JSONValuePredicate extends PredicateAttrs {
  valueType: PredicateValueTypes.JSONValue;
  // tslint:disable-next-line: no-any
  value: any;
}

interface ReferencePredicate extends PredicateAttrs {
  valueType: PredicateValueTypes.Reference;
  value: {
    targetCmsRecord: CmsRecord;
    id: string;
  };
}

export function parsePredicateConfig(
  // tslint:disable-next-line: no-any
  input: any,
  context: ConfigContext
): PredicateValue | undefined {
  if (input == null) {
    return undefined;
  }

  return parsePredicateValue(input, context);
}

function parsePredicateValue(
  // tslint:disable-next-line: no-any
  input: any,
  context: ConfigContext
): PredicateValue {
  if (!isArray(input)) {
    throw new Error('Expected array of predicate');
  }

  // tslint:disable-next-line: no-any
  return input.map((i: any) => {
    if (i.valueType == null) {
      return parseJSONValuePredicate(i);
    }

    switch (i.valueType) {
      case 'json_value':
        return parseJSONValuePredicate(i);
      case 'reference':
        return parseReferencePredicate(i, context);
      default:
        throw new Error(`Unexpected predicate value type: ${i.valueType}`);
    }
  });
}

// tslint:disable-next-line: no-any
function parsePredicateAttrs(input: any): PredicateAttrs {
  let type: PredicateTypes;
  switch (input.predicate) {
    case 'like':
      type = PredicateTypes.Like;
      break;
    case 'not_like':
      type = PredicateTypes.NotLike;
      break;
    case 'case_insensitive_like':
      type = PredicateTypes.CaseInsensitiveLike;
      break;
    case 'case_insensitive_not_like':
      type = PredicateTypes.CaseInsensitiveNotLike;
      break;
    case 'equal_to':
      type = PredicateTypes.EqualTo;
      break;
    case 'not_equal_to':
      type = PredicateTypes.NotEqualTo;
      break;
    case 'greater_than':
      type = PredicateTypes.GreaterThan;
      break;
    case 'greater_than_or_equal_to':
      type = PredicateTypes.GreaterThanOrEqualTo;
      break;
    case 'less_than':
      type = PredicateTypes.LessThan;
      break;
    case 'less_than_or_equal_to':
      type = PredicateTypes.LessThanOrEqualTo;
      break;
    case 'contains':
      type = PredicateTypes.Contains;
      break;
    case 'not_contains':
      type = PredicateTypes.NotContains;
      break;
    case 'contains_value':
      type = PredicateTypes.ContainsValue;
      break;
    case 'not_contains_value':
      type = PredicateTypes.NotContainsValue;
      break;
    default:
      throw new Error(`Unexpected predicate type: ${input.predicate}`);
  }

  return {
    name: parseString(input, 'name', 'Predicate'),
    type,
  };
}

// tslint:disable-next-line: no-any
function parseJSONValuePredicate(input: any): JSONValuePredicate {
  return {
    ...parsePredicateAttrs(input),
    value: input.value,
    valueType: PredicateValueTypes.JSONValue,
  };
}

function parseReferencePredicate(
  // tslint:disable-next-line: no-any
  input: any,
  context: ConfigContext
): ReferencePredicate {
  const targetRecordName = parseString(
    input.value,
    'reference_target',
    'Predicate'
  );
  const id = parseString(input.value, 'reference_id', 'Predicate');

  const cmsRecordData = context.cmsRecordByName[targetRecordName];
  if (cmsRecordData === undefined) {
    throw new Error(
      `Couldn't find configuration of Predicate.value.reference_target = ${targetRecordName}`
    );
  }

  const targetCmsRecord = cmsRecordData.record;

  return {
    ...parsePredicateAttrs(input),
    value: {
      id,
      targetCmsRecord,
    },
    valueType: PredicateValueTypes.Reference,
  };
}
