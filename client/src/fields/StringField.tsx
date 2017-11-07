import * as React from 'react';

import { RequiredFieldProps } from './Field';

export type StringFieldProps = RequiredFieldProps;

interface State {
  value: string;
}

export class StringField extends React.PureComponent<StringFieldProps, State> {
  constructor(props: StringFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

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

  public handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.setState({ ...this.state, value });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };
}
