import classnames from 'classnames';
import * as React from 'react';

import {
  IntegerDisplayFieldConfig,
  IntegerInputFieldConfig,
} from '../cmsConfig';
import { NumberInput } from '../components/NumberInput';
import { hasValidationError } from '../validation/validation';
import { RequiredFieldProps } from './Field';
import { StringDisplay } from './StringDisplay';
import { ValidationText } from './validation/ValidationText';

type IntegerDisplayFieldProps = RequiredFieldProps<IntegerDisplayFieldConfig>;

export const IntegerDisplayField: React.SFC<IntegerDisplayFieldProps> = ({
  className,
  value,
  validationError: _validationError,
  ...rest
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
}

class IntegerFieldImpl extends React.PureComponent<
  IntegerInputFieldProps,
  State
> {
  constructor(props: IntegerInputFieldProps) {
    super(props);

    this.state = {
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps: IntegerInputFieldProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        ...this.state,
        value: nextProps.value,
      });
    }
  }

  render() {
    const {
      config: { compact, editable },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest
    } = this.props;

    if (editable) {
      return (
        <div className={className}>
          <NumberInput
            {...rest}
            className={classnames('integer-input', {
              'validation-error': hasValidationError(validationError),
            })}
            id={name}
            name={name}
            isInteger={true}
            value={this.state.value}
            onValueChange={this.handleChange}
            placeholder="0"
          />
          <ValidationText validationError={validationError} />
        </div>
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

  handleChange = (value: number) => {
    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };
}

export const IntegerInputField: React.ComponentClass<
  IntegerInputFieldProps
> = IntegerFieldImpl;
