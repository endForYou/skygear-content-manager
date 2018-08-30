import moment from 'moment';
import {
  isArray,
  isDate,
  isFunction,
  isNull,
  isNumber,
  isString,
  isUndefined,
} from 'util';

import creditCardRegex from '../regex/creditCardRegex';
import urlRegex from '../regex/urlRegex';
import { objectFrom } from '../util';

// tslint:disable:no-any object-literal-sort-keys
enum ValueTypes {
  string = 'string',
  number = 'number',
  object = 'object',
  array = 'array',
  datetime = 'datetime',
  null = 'null',
  undefined = 'undefined',
}

const NoArgs = 'NoArgs';

function _typeof(value: any): ValueTypes {
  const tests: Array<[(value: any) => boolean, ValueTypes]> = [
    [isString, ValueTypes.string],
    [isNumber, ValueTypes.number],
    [isDate, ValueTypes.datetime],
    [isArray, ValueTypes.array],
    [isNull, ValueTypes.null],
    [isUndefined, ValueTypes.undefined],
  ];

  return tests.reduce(
    (acc, test) => (test[0](value) ? test[1] : acc),
    ValueTypes.object
  );
}

const predefinedFunctions = {
  length: {
    [ValueTypes.string]: (value: string) => value.length,
    [ValueTypes.array]: (value: any[]) => value.length,
  },
  upper: {
    [ValueTypes.string]: (value: string) => value.toUpperCase(),
  },
  lower: {
    [ValueTypes.string]: (value: string) => value.toLowerCase(),
  },
  substring: {
    [`${ValueTypes.string},${ValueTypes.number},${ValueTypes.number}`]: (
      value: string,
      from: number,
      to: number
    ) => value.substring(from, to),
  },
  regex: {
    [`${ValueTypes.string},${ValueTypes.string}`]: (
      value: string,
      regex: string
    ) => value.match(new RegExp(regex)) != null,
  },
  match_pattern: {
    [`${ValueTypes.string},${ValueTypes.string}`]: (
      value: string,
      pattern: string
    ) => {
      switch (pattern) {
        case 'credit_card':
          return creditCardRegex({ exact: true }).test(value);
        case 'email':
          return new RegExp('@').test(value);
        case 'url':
          return urlRegex({ strict: false, exact: true }).test(value);
        default:
          throw new Error(`Unknown pattern ${pattern}`);
      }
    },
  },
  now: {
    [NoArgs]: () => new Date(),
  },
  datetime: {
    [ValueTypes.string]: (value: string) => new Date(value),
  },
  timestamp: {
    [ValueTypes.datetime]: (value: Date) => value.getTime(),
    [ValueTypes.string]: (value: string) => new Date(value).getTime(),
  },
  get_year: {
    [ValueTypes.datetime]: (value: Date) => moment(value).year(),
  },
  get_month: {
    [ValueTypes.datetime]: (value: Date) => moment(value).month(),
  },
  get_week_of_year: {
    [ValueTypes.datetime]: (value: Date) => moment(value).isoWeek(),
  },
  get_day_of_month: {
    [ValueTypes.datetime]: (value: Date) => moment(value).date(),
  },
  get_day_of_year: {
    [ValueTypes.datetime]: (value: Date) => moment(value).dayOfYear(),
  },
  get_day_of_week: {
    [ValueTypes.datetime]: (value: Date) => moment(value).day(),
  },
  get_hour: {
    [ValueTypes.datetime]: (value: Date) => moment(value).hour(),
  },
  get_minute: {
    [ValueTypes.datetime]: (value: Date) => moment(value).minute(),
  },
  get_second: {
    [ValueTypes.datetime]: (value: Date) => moment(value).second(),
  },
  get: {
    [`${ValueTypes.object},${ValueTypes.string}`]: (
      value: object,
      key: string
    ) => value[key],
    [`${ValueTypes.array},${ValueTypes.number}`]: (value: any[], key: number) =>
      value[key],
  },
  has_key: {
    [`${ValueTypes.object},${ValueTypes.string}`]: (
      value: object,
      key: string
    ) => value[key] !== undefined,
    [`${ValueTypes.array},${ValueTypes.number}`]: (value: any[], key: number) =>
      value[key] !== undefined,
  },
  typeof: _typeof,
};

export const functions = (() => {
  const generateFunc = (funcName: string) => (...values: any[]) => {
    if (isFunction(predefinedFunctions[funcName])) {
      return predefinedFunctions[funcName](...values);
    }

    const paramTypes =
      values.length === 0 ? NoArgs : values.map(_typeof).join(',');
    const func = predefinedFunctions[funcName][paramTypes];
    if (func == null) {
      throw new Error(
        `${funcName} received unexpected parameter types: ${paramTypes}`
      );
    }

    return func(...values);
  };

  return objectFrom(
    Object.keys(predefinedFunctions).map(
      n => [n, generateFunc(n)] as [string, (...value: any[]) => any]
    )
  );
})();
// tslint:enable:no-any
