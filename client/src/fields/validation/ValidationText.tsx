import './ValidationText.scss';

import React from 'react';
import { FieldValidationError } from '../../validation/validation';

interface Props {
  validationError: FieldValidationError | undefined;
}

export class ValidationText extends React.PureComponent<Props> {
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
      <div className="text-danger record-form-validation-error">
        {validationError.errorMessage}
      </div>
    );
  }
}
