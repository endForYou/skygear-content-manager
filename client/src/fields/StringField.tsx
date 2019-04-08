import classnames from 'classnames';
import * as React from 'react';

import { BaseStringInputField } from './BaseStringInputField';
import { RequiredFieldProps } from './Field';

import { TextDisplayFieldConfig, TextInputFieldConfig } from '../cmsConfig';
import { hasValidationError } from '../validation/validation';
import { StringDisplay } from './StringDisplay';
import { ValidationText } from './validation/ValidationText';

export type TextDisplayFieldProps = RequiredFieldProps<TextDisplayFieldConfig>;

export const TextDisplayField: React.SFC<TextDisplayFieldProps> = ({
  className,
  onFieldChange: _onFieldChange,
  validationError: _validationError,
  ...rest
}) => {
  return (
    <StringDisplay
      {...rest}
      className={classnames(className, 'text-display')}
    />
  );
};

export type TextInputFieldProps = RequiredFieldProps<TextInputFieldConfig>;

export class TextInputField extends BaseStringInputField<
  TextInputFieldConfig,
  TextInputFieldProps
> {
  render() {
    const {
      className,
      config: { editable, label, name },
      onFieldChange: _,
      validationError,
      ...rest
    } = this.props;

    return (
      <div className={className}>
        <input
          {...rest}
          className={classnames('text-input', {
            'validation-error': hasValidationError(validationError),
          })}
          type="text"
          id={name}
          name={name}
          placeholder={label}
          value={this.state.value}
          onChange={this.handleChange}
          disabled={!editable}
        />
        <ValidationText validationError={validationError} />
      </div>
    );
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.handleValueChange(value);
  };
}
