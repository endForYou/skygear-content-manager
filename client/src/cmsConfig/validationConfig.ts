import compileExpression from 'filtrex';
import moment from 'moment';
import { isArray, isDate } from 'util';

import {
  parseBoolean,
  parseOptionalBoolean,
  parseOptionalNumber,
  parseOptionalString,
  parseString,
} from './util';

export interface ValidationConfig {
  expression: string;
  message?: string;
}

export function parseValidationConfigs(
  // tslint:disable-next-line:no-any
  input: any
): ValidationConfig[] | undefined {
  if (input == null) {
    return undefined;
  }

  if (!isArray(input)) {
    throw new Error('Validation configs expected to be an array');
  }

  return input.map(parseValidationConfig);
}

// tslint:disable-next-line:no-any
export function parseValidationConfig(input: any): ValidationConfig {
  let config: ValidationConfig | undefined;
  let bypassNull = true;
  if (input.required != null) {
    config = requiredValidation(input);
    bypassNull = false;
  } else if (input.regex != null) {
    config = regexValidation(input);
  } else if (input.pattern != null) {
    config = patternValidation(input);
  }

  const parsingFuncs = [
    lengthOrRangeValidation,
    containValidation,
    comparisonValidation,
  ];

  for (const parsingFunc of parsingFuncs) {
    if (!config) {
      config = parsingFunc(input);
    }
  }

  if (!config) {
    config = {
      expression: parseString(input, 'expression', 'validation'),
      message: parseOptionalString(input, 'message', 'validation'),
    };
  }

  let when = parseOptionalString(input, 'when', 'validation');
  if (when == null && bypassNull) {
    when = 'value != null';
  }
  config.expression = combineExpressionWithWhen(config.expression, when);

  // try to compile the expression here
  compileExpression(config.expression);

  return config;
}

// tslint:disable-next-line:no-any
function requiredValidation(input: any): ValidationConfig {
  const required = parseBoolean(input, 'required', 'validation');
  return {
    expression: required
      ? `(typeof(value) not in ("string", "array") or length(value) > 0) and ` +
        `value != null`
      : `true`,
    message:
      parseOptionalString(input, 'message', 'validation') || 'Required field.',
  };
}

// tslint:disable-next-line:no-any
function regexValidation(input: any): ValidationConfig {
  const regex = parseString(input, 'regex', 'validation');
  return {
    expression: `regex(value, "${regex}")`,
    message: parseOptionalString(input, 'message', 'validation'),
  };
}

// tslint:disable-next-line:no-any
function patternValidation(input: any): ValidationConfig {
  const patterns = ['credit_card', 'email', 'url'];
  const pattern = parseString(input, 'pattern', 'validation');
  if (patterns.indexOf(pattern) === -1) {
    throw new Error(
      `Invalid pattern: ${pattern}, should be one of ${patterns.join(', ')}`
    );
  }

  return {
    expression: `match_pattern(value, "${pattern}")`,
    message:
      parseOptionalString(input, 'message', 'validation') ||
      `Require valid ${pattern.replace('_', ' ')} input.`,
  };
}

// tslint:disable-next-line:no-any
function lengthOrRangeValidation(input: any): ValidationConfig | undefined {
  let min;
  let max;
  let value;
  let isDateValue = false;
  let type;

  if (input.length != null) {
    min = parseOptionalNumber(input.length, 'min', 'validation');
    max = parseOptionalNumber(input.length, 'max', 'validation');
    value = 'length(value)';
    type = 'length';
  }

  if (input.range != null) {
    min = input.range.min;
    max = input.range.max;
    if (isDate(min) || isDate(max)) {
      isDateValue = true;
      value = 'timestamp(value)';
      min = min != null ? min.getTime() : undefined;
      max = max != null ? max.getTime() : undefined;
    } else {
      value = 'value';
    }
    type = 'range';
  }

  if (type == null) {
    return undefined;
  }

  let inclusive = parseOptionalBoolean(input, 'inclusive', 'validation');
  if (inclusive == null) {
    inclusive = true;
  }

  const expressions = [
    min == null ? undefined : `${value} >${inclusive ? '=' : ''} ${min}`,
    max == null ? undefined : `${value} <${inclusive ? '=' : ''} ${max}`,
  ].filter(a => a != null);

  const messages = [
    min == null
      ? undefined
      : `larger than ${inclusive ? 'or equal to ' : ''}` +
        `${isDateValue ? moment(min).toISOString() : min}`,
    max == null
      ? undefined
      : `smaller than ${inclusive ? 'or equal to ' : ''}` +
        `${isDateValue ? moment(max).toISOString() : max}`,
  ].filter(a => a != null);

  if (expressions.length === 0) {
    throw new Error(
      `Validtion with length must contains "min" and / or "max".`
    );
  }

  return {
    expression: expressions.join(' and '),
    message:
      `${type === 'length' ? 'Length' : 'Value'} ` +
      `should be ${messages.join(' and ')}.`,
  };
}

// tslint:disable-next-line:no-any
function containValidation(input: any): ValidationConfig | undefined {
  let target;
  let positive = true;

  if (input.contains != null) {
    target = parseString(input, 'contains', 'validation');
    positive = true;
  }

  if (input.not_contains != null) {
    target = parseString(input, 'not_contains', 'validation');
    positive = false;
  }

  if (target != null) {
    return {
      expression: `${positive ? '' : 'not '}regex(value, "${target}")`,
      message: `Value should ${positive ? '' : 'not '}contains "${target}"`,
    };
  }

  return undefined;
}

// tslint:disable-next-line:no-any
function comparisonValidation(input: any): ValidationConfig | undefined {
  let target;
  let op;

  const keys = [
    ['equal_to', '=='],
    ['greater_than', '>'],
    ['greater_than_or_equal_to', '>='],
    ['less_than', '<'],
    ['less_than_or_equal_to', '<='],
    ['not_equal_to', '!='],
  ];

  for (const [_key, _op] of keys) {
    if (input[_key] != null) {
      target = input[_key];
      op = _op;
    }
  }

  if (target) {
    return {
      expression: isDate(target)
        ? `timestamp(value) ${op} ${target.getTime()}`
        : `value ${op} ${target}`,
    };
  }

  return undefined;
}

function combineExpressionWithWhen(expression: string, when?: string): string {
  if (when == null || when.length === 0) {
    return expression;
  }

  return `not (${when}) or (${expression})`;
}
