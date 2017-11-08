import * as React from 'react';
import * as NumericInput from 'react-numeric-input';
// tslint:disable-next-line: no-submodule-imports
import 'react-toggle/style.css';

import { RequiredFieldProps } from './Field';

export type IntegerFieldProps = RequiredFieldProps;

interface State {
  value: number;
}

export class IntegerField extends React.PureComponent<
  IntegerFieldProps,
  State
> {
  constructor(props: IntegerFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: IntegerFieldProps) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  public render() {
    const {
      editable,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <NumericInput
          {...rest}
          step={1}
          value={this.state.value}
          onChange={this.handleChange}
        />
      );
    } else {
      return <span {...rest}>{this.state.value}</span>;
    }
  }

  public handleChange = (num: number | null, str: string): void => {
    if (num === null) {
      return;
    }

    this.setState({ ...this.state, value: num });
    if (this.props.onFieldChange) {
      this.props.onFieldChange(num);
    }
  };
}