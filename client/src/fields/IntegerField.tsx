import classnames from 'classnames';
import * as React from 'react';

import {
  IntegerDisplayFieldConfig,
  IntegerInputFieldConfig,
} from '../cmsConfig';
import { RequiredFieldProps } from './Field';
import { StringDisplay } from './StringDisplay';
import { ValidationText } from './validation/ValidationText';

type IntegerDisplayFieldProps = RequiredFieldProps<IntegerDisplayFieldConfig>;

export const IntegerDisplayField: React.SFC<IntegerDisplayFieldProps> = ({
  className,
  value,
  validationError: _validationError,
  ...rest,
}) => {
  return (
    <StringDisplay
      {...rest}
      className={classnames(className, 'number-display')}
      value={`${value == null ? '' : parseInt(value, 10)}`}
    />
  );
};

export type IntegerInputFieldProps = RequiredFieldProps<
  IntegerInputFieldConfig
>;

interface State {
  value: number;
  stringValue: string;
}

class IntegerFieldImpl extends React.PureComponent<
  IntegerInputFieldProps,
  State
> {
  constructor(props: IntegerInputFieldProps) {
    super(props);

    this.state = {
      stringValue: props.value == null ? '' : `${props.value}`,
      value: props.value,
    };
  }

  public componentWillReceiveProps(nextProps: IntegerInputFieldProps) {
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
      config: { compact, editable },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <React.Fragment>
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
          <ValidationText validationError={validationError} />
        </React.Fragment>
      );
    } else {
      return (
        <div
          className={classnames(className, 'integer-display', {
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

export const IntegerInputField: React.ComponentClass<
  IntegerInputFieldProps
> = IntegerFieldImpl;
