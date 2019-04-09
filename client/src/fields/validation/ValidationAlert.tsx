import React from 'react';
import { FieldValidationError } from '../../validation/validation';

interface Props {
  validationError: FieldValidationError | undefined;
}

export class ValidationAlert extends React.PureComponent<Props> {
  render() {
    const { validationError } = this.props;

    if (
      validationError == null ||
      validationError.errorMessage == null ||
      validationError.errorMessage.length === 0
    ) {
      return null;
    }

    return (
      <div className="alert alert-danger record-form-validation-error">
        {validationError.errorMessage}
      </div>
    );
  }
}
