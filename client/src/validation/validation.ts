import compileExpression from 'filtrex';

import { FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { ValidationConfig } from '../cmsConfig/validationConfig';
import { functions } from './functions';

// tslint:disable-next-line:no-any
function transformFieldValue(value: any, fieldType: FieldConfigTypes) {
  if (value == null) {
    return value;
  }

  if (
    fieldType === FieldConfigTypes.FileDisplay ||
    fieldType === FieldConfigTypes.FileUploader ||
    fieldType === FieldConfigTypes.ImageDisplay ||
    fieldType === FieldConfigTypes.ImageUploader
  ) {
    return {
      content_type: value.contentType,
    };
  }

  return value;
}

export function validateField(
  // tslint:disable-next-line:no-any
  value: any,
  field: FieldConfig,
  validation: ValidationConfig
): boolean {
  const fn = compileExpression(validation.expression, functions);
  return !!fn({ value: transformFieldValue(value, field.type) });
}
