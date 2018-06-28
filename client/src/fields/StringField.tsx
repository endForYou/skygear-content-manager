import classnames from 'classnames';
import * as React from 'react';

import { BaseStringField } from './BaseStringField';
import { RequiredFieldProps } from './Field';

import { TextDisplayFieldConfig, TextInputFieldConfig } from '../cmsConfig';

export type TextDisplayFieldProps = RequiredFieldProps<TextDisplayFieldConfig>;

export const TextDisplayField: React.SFC<TextDisplayFieldProps> = ({
  config: { compact },
  className,
  value,
  ...rest,
}) => {
  return (
    <span
      {...rest}
      className={classnames(className, 'text-display', { full: !compact })}
    >
      {value}
    </span>
  );
};

export type TextInputFieldProps = RequiredFieldProps<TextInputFieldConfig>;

export class TextInputField extends BaseStringField<
  TextInputFieldConfig,
  TextInputFieldProps
> {
  public render() {
    const {
      className,
      config: { editable, label, name },
      onFieldChange: _,
      ...rest,
    } = this.props;

    return (
      <input
        {...rest}
        className={classnames(className, 'text-input')}
        type="text"
        id={name}
        name={name}
        placeholder={label}
        value={this.state.value}
        onChange={this.handleChange}
        disabled={!editable}
      />
    );
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.handleValueChange(value);
  };
}
