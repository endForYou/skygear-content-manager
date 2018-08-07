import classnames from 'classnames';
import * as React from 'react';

import { BaseStringInputField } from './BaseStringInputField';
import { RequiredFieldProps } from './Field';

import { TextDisplayFieldConfig, TextInputFieldConfig } from '../cmsConfig';
import { StringDisplay } from './StringDisplay';

export type TextDisplayFieldProps = RequiredFieldProps<TextDisplayFieldConfig>;

export const TextDisplayField: React.SFC<TextDisplayFieldProps> = ({
  className,
  onFieldChange: _onFieldChange,
  ...rest,
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
