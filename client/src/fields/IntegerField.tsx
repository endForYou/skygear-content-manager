import * as React from 'react';

import { IntegerFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

export type IntegerFieldProps = RequiredFieldProps<IntegerFieldConfig>;

interface State {
  value: number;
  stringValue: string;
}

class IntegerFieldImpl extends React.PureComponent<IntegerFieldProps, State> {
  constructor(props: IntegerFieldProps) {
    super(props);

    this.state = {
      stringValue: props.value == null ? '' : `${props.value}`,
      value: props.value,
    };
  }

  public componentWillReceiveProps(nextProps: IntegerFieldProps) {
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
      return <span {...rest}>{this.state.value}</span>;
    }
  }

  public handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    if (value === '' || value === '-') {
      this.setState({ ...this.state, stringValue: value, value: 0 }, () => {
        if (this.props.onFieldChange) {
          this.props.onFieldChange(0);
        }
      });
    }

    const isValid = /^-?\d+$/.test(value);
    if (!isValid) {
      return;
    }

    const num = parseInt(value, 10);
    this.setState({ ...this.state, stringValue: value, value: num }, () => {
      if (this.props.onFieldChange) {
        this.props.onFieldChange(num);
      }
    });
  };
}

export const IntegerField: React.ComponentClass<
  IntegerFieldProps
> = IntegerFieldImpl;
