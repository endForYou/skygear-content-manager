import classnames from 'classnames';
import * as React from 'react';

import { TextAreaFieldConfig } from '../cmsConfig';
import { hasValidationError } from '../validation/validation';
import { BaseStringInputField } from './BaseStringInputField';
import { RequiredFieldProps } from './Field';
import { ValidationText } from './validation/ValidationText';

export type TextAreaProps = RequiredFieldProps<TextAreaFieldConfig>;

export class TextArea extends BaseStringInputField<
  TextAreaFieldConfig,
  TextAreaProps
> {
  public render() {
    const {
      config: { editable },
      className,
      onFieldChange: _,
      validationError,
      ...rest,
    } = this.props;

    const disabled = editable === undefined ? true : !editable;

    return (
      <div className={className}>
        <textarea
          {...rest}
          className={classnames({
            'textarea-display': !!disabled,
            'textarea-input': !disabled,
            'validation-error': hasValidationError(validationError),
          })}
          value={this.state.value}
          onChange={this.handleChange}
          disabled={disabled}
        />
        <ValidationText validationError={validationError} />
      </div>
    );
  }

  private handleChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = event => {
    const value = event.target.value;
    this.handleValueChange(value);
  };
}
