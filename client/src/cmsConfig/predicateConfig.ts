import { isArray } from 'util';
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

export type PredicateValue = Predicate[];

export interface Predicate {
  type: PredicateTypes;
  name: string;

  // tslint:disable-next-line: no-any
  value: any;
}

// tslint:disable-next-line: no-any
export function parsePredicateConfig(input: any): PredicateValue | undefined {
  if (input == null) {
    return undefined;
  }

  return parsePredicateValue(input);
}

// tslint:disable-next-line: no-any
function parsePredicateValue(input: any): PredicateValue {
  if (!isArray(input)) {
    throw new Error('Expected array of predicate');
  }

  return input.map(parsePredicate);
}

// tslint:disable-next-line: no-any
function parsePredicate(input: any): Predicate {
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
    value: input.value,
  };
}
