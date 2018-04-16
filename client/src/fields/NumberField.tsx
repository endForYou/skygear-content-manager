import * as React from 'react';

import { NumberFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

export type NumberFieldProps = RequiredFieldProps<NumberFieldConfig>;

interface State {
  value: number;
  stringValue: string;
}

class NumberFieldImpl extends React.PureComponent<NumberFieldProps, State> {
  constructor(props: NumberFieldProps) {
    super(props);

    this.state = {
      stringValue: props.value == null ? '' : `${props.value}`,
      value: props.value,
    };
  }

  public componentWillReceiveProps(nextProps: NumberFieldProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        ...this.state,
        stringValue: nextProps.value == null ? '' : `${nextProps.value}`,
        value: nextProps.value,
      });
    }
  }

  public render() {
    const {
      config: { editable },
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <input
          {...rest}
          type="text"
          value={this.state.stringValue}
          onChange={this.handleChange}
        />
      );
    } else {
      return <span {...rest}>{this.state.stringValue}</span>;
    }
  }

  public handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.trim();
    if (value === '' || value === '-') {
      value = '0';
    }

    const isValid = /^-?\d+(\.)?\d*$/.test(value);
    if (!isValid) {
      return;
    }

    const num = parseFloat(value);
    this.setState({ ...this.state, stringValue: value, value: num }, () => {
      if (this.props.onFieldChange) {
        this.props.onFieldChange(num);
      }
    });
  };
}

export const NumberField: React.ComponentClass<
  NumberFieldProps
> = NumberFieldImpl;
