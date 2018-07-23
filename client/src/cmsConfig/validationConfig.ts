import compileExpression from 'filtrex';
import { isArray } from 'util';

import { parseBoolean, parseOptionalString, parseString } from './util';

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
  let config: ValidationConfig;
  let bypassNull = true;
  if (input.required != null) {
    config = requiredValidation(input);
    bypassNull = false;
  } else if (input.regex != null) {
    config = regexValidation(input);
  } else if (input.pattern != null) {
    config = patternValidation(input);
  } else {
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
      ? `(typeof(value) in ("string", "array") and length(value) > 0) or ` +
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

function combineExpressionWithWhen(expression: string, when?: string): string {
  if (when == null || when.length === 0) {
    return expression;
  }

  return `not (${when}) or (${expression})`;
}
