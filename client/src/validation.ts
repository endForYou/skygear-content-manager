import compileExpression from 'filtrex';

import { FieldConfig } from './cmsConfig';
import { ValidationConfig } from './cmsConfig/validationConfig';

export function validateField(
  // tslint:disable-next-line:no-any
  value: any,
  field: FieldConfig,
  validation: ValidationConfig
): boolean {
  const fn = compileExpression(validation.expression);
  return !!fn({ value });
}
