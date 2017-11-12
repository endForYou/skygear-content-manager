import * as React from 'react';

import { TextAreaFieldConfig } from '../cmsConfig';
import { BaseStringField } from './BaseStringField';
import { RequiredFieldProps } from './Field';

export type TextAreaProps = RequiredFieldProps<TextAreaFieldConfig>;

export class TextArea extends BaseStringField<
  TextAreaFieldConfig,
  TextAreaProps
> {
  public render() {
    const { config: { editable }, onFieldChange: _, ...rest } = this.props;
    const disabled = editable === undefined ? false : !editable;

    return (
      <textarea
        {...rest}
        value={this.state.value}
        onChange={this.handleChange}
        disabled={disabled}
      />
    );
  }

  private handleChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = event => {
    const value = event.target.value;
    this.handleValueChange(value);
  };
}
