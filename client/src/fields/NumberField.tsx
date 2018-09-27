import classnames from 'classnames';
import * as React from 'react';

import { FloatDisplayFieldConfig, FloatInputFieldConfig } from '../cmsConfig';
import { NumberInput } from '../components/NumberInput';
import { hasValidationError } from '../validation/validation';
import { RequiredFieldProps } from './Field';
import { StringDisplay } from './StringDisplay';
import { ValidationText } from './validation/ValidationText';

type FloatDisplayFieldProps = RequiredFieldProps<FloatDisplayFieldConfig>;

export const FloatDisplayField: React.SFC<FloatDisplayFieldProps> = ({
  className,
  value,
  validationError: _validationError,
  ...rest,
}) => {
  return (
    <StringDisplay
      {...rest}
      className={classnames(className, 'number-display')}
      value={`${value == null ? '' : parseFloat(value)}`}
    />
  );
};

type FloatInputFieldProps = RequiredFieldProps<FloatInputFieldConfig>;
interface State {
  value: number;
}

export class FloatInputField extends React.PureComponent<
  FloatInputFieldProps,
  State
> {
  constructor(props: FloatInputFieldProps) {
    super(props);

    this.state = {
      value: props.value,
    };
  }

  public componentWillReceiveProps(nextProps: FloatInputFieldProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        ...this.state,
        value: nextProps.value,
      });
    }
  }

  public render() {
    const {
      config: { editable, name },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest,
    } = this.props;

    return (
      <div className={className}>
        <NumberInput
          {...rest}
          className={classnames('number-input', {
            'validation-error': hasValidationError(validationError),
          })}
          id={name}
          name={name}
          value={this.state.value}
          onValueChange={this.handleChange}
          placeholder="0"
          disabled={!editable}
        />
        <ValidationText validationError={validationError} />
      </div>
    );
  }

  public handleChange = (value: number) => {
    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };
}
