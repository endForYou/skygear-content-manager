import { isArray } from 'util';

import { CmsRecord, ConfigContext } from '.';
import { parseString } from './util';

export enum PredicateTypes {
  Like = 'Like',
  NotLike = 'NotLike',
  CaseInsensitiveLike = 'CaseInsensitiveLike',
  CaseInsensitiveNotLike = 'CaseInsensitiveNotLike',
  EqualTo = 'EqualTo',
  NotEqualTo = 'NotEqualTo',
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  LessThan = 'LessThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo',
  Contains = 'Contains',
  NotContains = 'NotContains',
  ContainsValue = 'ContainsValue',
  NotContainsValue = 'NotContainsValue',
}

export enum PredicateValueTypes {
  JSONValue = 'JSONValue',
  DateTime = 'DateTime',
  Reference = 'Reference',
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
      case 'JSONValue':
        return parseJSONValuePredicate(i);
      case 'Reference':
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
    case 'Like':
      type = PredicateTypes.Like;
      break;
    case 'NotLike':
      type = PredicateTypes.NotLike;
      break;
    case 'CaseInsensitiveLike':
      type = PredicateTypes.CaseInsensitiveLike;
      break;
    case 'CaseInsensitiveNotLike':
      type = PredicateTypes.CaseInsensitiveNotLike;
      break;
    case 'EqualTo':
      type = PredicateTypes.EqualTo;
      break;
    case 'NotEqualTo':
      type = PredicateTypes.NotEqualTo;
      break;
    case 'GreaterThan':
      type = PredicateTypes.GreaterThan;
      break;
    case 'GreaterThanOrEqualTo':
      type = PredicateTypes.GreaterThanOrEqualTo;
      break;
    case 'LessThan':
      type = PredicateTypes.LessThan;
      break;
    case 'LessThanOrEqualTo':
      type = PredicateTypes.LessThanOrEqualTo;
      break;
    case 'Contains':
      type = PredicateTypes.Contains;
      break;
    case 'NotContains':
      type = PredicateTypes.NotContains;
      break;
    case 'ContainsValue':
      type = PredicateTypes.ContainsValue;
      break;
    case 'NotContainsValue':
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

  const targetCmsRecord = context.cmsRecordByName[targetRecordName];
  if (targetCmsRecord === undefined) {
    throw new Error(
      `Couldn't find configuration of Predicate.value.reference_target = ${targetRecordName}`
    );
  }

  return {
    ...parsePredicateAttrs(input),
    value: {
      id,
      targetCmsRecord,
    },
    valueType: PredicateValueTypes.Reference,
  };
}
