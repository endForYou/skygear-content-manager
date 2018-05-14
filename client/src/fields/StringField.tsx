import classnames from 'classnames';
import * as React from 'react';

import { BaseStringField } from './BaseStringField';
import { RequiredFieldProps } from './Field';

import { StringFieldConfig } from '../cmsConfig';

export type StringFieldProps = RequiredFieldProps<StringFieldConfig>;

export class StringField extends BaseStringField<
  StringFieldConfig,
  StringFieldProps
> {
  public render() {
    const {
      className,
      config: { compact, editable, label, name },
      onFieldChange: _,
      ...rest,
    } = this.props;

    if (editable) {
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
        />
      );
    } else {
      return (
        <span
          {...rest}
          className={classnames(className, 'text-display', { full: !compact })}
        >
          {this.state.value}
        </span>
      );
    }
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.handleValueChange(value);
  };
}
