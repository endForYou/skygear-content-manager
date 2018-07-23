import compileExpression from 'filtrex';
import { isArray } from 'util';

import { parseOptionalString, parseString } from './util';

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
  let expression = parseString(input, 'expression', 'validation');
  const message = parseOptionalString(input, 'message', 'validation');

  const when = parseOptionalString(input, 'when', 'validation');
  expression = combineExpressionWithWhen(expression, when);

  // try to compile the expression here
  compileExpression(expression);

  return {
    expression,
    message,
  };
}

function combineExpressionWithWhen(expression: string, when?: string): string {
  if (when == null || when.length === 0) {
    return expression;
  }

  return `not (${when}) or (${expression})`;
}
