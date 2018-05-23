import classnames from 'classnames';
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
      config: { compact, editable, name },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <input
          {...rest}
          className={classnames(className, 'number-input')}
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
        <div
          className={classnames(className, 'number-display', {
            full: !compact,
          })}
        >
          {this.state.value}
        </div>
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
