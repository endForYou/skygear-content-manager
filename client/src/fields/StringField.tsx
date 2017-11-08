import * as React from 'react';

import { BaseStringField } from './BaseStringField';

export class StringField extends BaseStringField {
  public render() {
    const { editable, onFieldChange: _, ...rest } = this.props;

    if (editable) {
      return (
        <input
          {...rest}
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
      );
    } else {
      return <span {...rest}>{this.state.value}</span>;
    }
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.handleValueChange(value);
  };
}
