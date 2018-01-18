import * as React from 'react';

import { StringFilterConfig } from '../../cmsConfig';
import { debounce } from '../../util';
import { FieldChangeHandler, RequiredFilterFieldProps } from './FilterField';

export interface StringFilterFieldState {
  value: string;
}

export type StringFilterFieldProps = RequiredFilterFieldProps<StringFilterConfig>;

export class StringFilterField extends React.PureComponent<StringFilterFieldProps, StringFilterFieldState> {
  public onFieldChange: FieldChangeHandler | undefined;
  constructor(props: StringFilterFieldProps) {
    super(props);

    if (this.props.onFieldChange) {
      this.onFieldChange = debounce(this.props.onFieldChange, 300).bind(this);
    }

    this.state = {
      value: '',
    };
  }

  public render() {
    const { onFieldChange: _, ...rest } = this.props;

    return (
      <input
        {...rest}
        type="text"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.setState({ ...this.state, value });

    if (this.onFieldChange) {
      this.onFieldChange(value);
    }
  };
}
