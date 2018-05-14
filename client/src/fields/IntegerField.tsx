import classnames from 'classnames';
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
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <input
          {...rest}
          className={classnames(className, 'integer-input')}
          type="text"
          id={name}
          name={name}
          value={this.state.stringValue}
          onChange={this.handleChange}
          placeholder="0"
        />
      );
    } else {
      return (
        <span {...rest} className={className}>
          {this.state.value}
        </span>
      );
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
      return;
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
