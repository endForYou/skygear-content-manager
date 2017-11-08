import * as React from 'react';

import { BaseStringField } from './BaseStringField';

export class TextArea extends BaseStringField {
  public render() {
    const { editable, onFieldChange: _, ...rest } = this.props;
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
