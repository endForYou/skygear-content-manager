import * as React from 'react';

import { Omit } from '../typeutil';

interface NumberInputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    'onChange' | 'type' | 'value'
  > {
  isInteger?: boolean;
  emptyValue?: number;
  value?: number;
  onValueChange: (value: number) => void;
}

interface State {
  value: number;
  stringValue: string;
}

// NumberInput allows different displayed string value and logical numeric value
//
// This makes the input more natrual to human interaction, by handling empty
// string, '-' and tail '.', while restricting the non-numeric input
export class NumberInput extends React.PureComponent<NumberInputProps, State> {
  constructor(props: NumberInputProps) {
    super(props);

    this.state = {
      stringValue:
        props.value == null
          ? ''
          : `${this.parseNumberFunc(props)(props.value)}`,
      value: props.value == null ? 0 : this.parseNumberFunc(props)(props.value),
    };
  }

  public componentWillReceiveProps(nextProps: NumberInputProps) {
    if (
      nextProps.value !== this.state.value ||
      nextProps.isInteger !== this.props.isInteger
    ) {
      this.setState({
        ...this.state,
        stringValue:
          nextProps.value == null
            ? ''
            : `${this.parseNumberFunc(nextProps)(nextProps.value)}`,
        value:
          nextProps.value == null
            ? 0
            : this.parseNumberFunc(nextProps)(nextProps.value),
      });
    }
  }

  public render() {
    const { value: _value, ...rest } = this.props;

    return (
      <input
        {...rest}
        type="text"
        value={this.state.stringValue}
        onChange={this.handleChange}
      />
    );
  }

  public handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onValueChange } = this.props;

    const value = event.target.value.trim();
    if (value === '' || value === '-') {
      this.setState({ ...this.state, stringValue: value, value: 0 }, () => {
        if (onValueChange && this.props.value !== 0) {
          onValueChange(this.emptyValue(this.props));
        }
      });
      return;
    }

    const isValid = this.testRegex(this.props).test(value);
    if (!isValid) {
      return;
    }

    const num = this.parseFromStringFunc(this.props)(value);
    const hasChange = this.state.value !== num;
    this.setState({ ...this.state, stringValue: value, value: num }, () => {
      if (onValueChange && hasChange) {
        onValueChange(num);
      }
    });
  };

  private emptyValue(props: NumberInputProps) {
    return props.emptyValue || 0;
  }

  private isInteger(props: NumberInputProps) {
    return props.isInteger == null ? false : this.props.isInteger;
  }

  private parseNumberFunc(props: NumberInputProps) {
    return this.isInteger(props)
      ? (value: number) => Math.floor(value)
      : (value: number) => value;
  }

  private parseFromStringFunc(props: NumberInputProps) {
    return this.isInteger(props) ? parseInt : parseFloat;
  }

  private testRegex(props: NumberInputProps) {
    return this.isInteger(props) ? /^-?\d+$/ : /^-?\d+(\.)?\d*$/;
  }
}
