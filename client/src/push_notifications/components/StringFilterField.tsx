import * as React from 'react';

import { StringFilterConfig } from '../../cmsConfig';
import { RequiredFilterFieldProps } from './FilterField';

export interface StringFilterFieldState {
  value: string;
}

export type StringFilterFieldProps = RequiredFilterFieldProps<StringFilterConfig>;

export class StringFilterField extends React.PureComponent<StringFilterFieldProps, StringFilterFieldState> {
  constructor(props: StringFilterFieldProps) {
    super(props);

    this.state = {
      value: '',
    };
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.setState({ ...this.state, value });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };

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
}
