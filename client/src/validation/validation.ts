import * as compileExpression from 'filtrex';

import { FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { ValidationConfig } from '../cmsConfig/validationConfig';
import { functions } from './functions';

export interface FieldValidationError {
  errorMessage: string | undefined;
  embeddedErrors: Array<{ [key: string]: FieldValidationError }>;
}

export function hasAnyValidationError(fieldErrors: {
  [key: string]: FieldValidationError;
}): boolean {
  for (const key in fieldErrors) {
    if (!fieldErrors.hasOwnProperty(key)) {
      continue;
    }

    if (hasValidationError(fieldErrors[key])) {
      return true;
    }
  }

  return false;
}

export function hasValidationError(error: FieldValidationError | undefined) {
  if (error == null) {
    return false;
  }

  if (error.errorMessage != null) {
    return true;
  }

  for (const embeddedError of error.embeddedErrors) {
    if (hasAnyValidationError(embeddedError)) {
      return true;
    }
  }

  return false;
}

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
  data: any,
  field: FieldConfig,
  defaultMessage: string = 'Invalid data'
): string | undefined {
  const value =
    field.type === FieldConfigTypes.ReferenceList ||
    field.type === FieldConfigTypes.ReferenceSelect ||
    field.type === FieldConfigTypes.EmbeddedReferenceList
      ? data._transient[field.name]
      : data[field.name];

  if (field.validations == null || field.validations.length === 0) {
    return undefined;
  }

  const result = field.validations
    .map(validation => ({
      valid: _validateField(value, field, validation),
      validation,
    }))
    .find(({ valid }) => !valid);

  return result ? result.validation.message || defaultMessage : undefined;
}

function _validateField(
  // tslint:disable-next-line:no-any
  value: any,
  field: FieldConfig,
  validation: ValidationConfig
): boolean {
  const fn = compileExpression(validation.expression, functions);
  return !!fn({ value: transformFieldValue(value, field.type) });
}
