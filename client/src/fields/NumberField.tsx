import classnames from 'classnames';
import * as React from 'react';

import { FloatDisplayFieldConfig, FloatInputFieldConfig } from '../cmsConfig';
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
  stringValue: string;
}

export class FloatInputField extends React.PureComponent<
  FloatInputFieldProps,
  State
> {
  constructor(props: FloatInputFieldProps) {
    super(props);

    this.state = {
      stringValue: props.value == null ? '' : `${props.value}`,
      value: props.value,
    };
  }

  public componentWillReceiveProps(nextProps: FloatInputFieldProps) {
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
      config: { editable, name },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest,
    } = this.props;

    return (
      <div className={className}>
        <input
          {...rest}
          className={classnames('number-input', {
            'validation-error': hasValidationError(validationError),
          })}
          type="text"
          id={name}
          name={name}
          value={this.state.stringValue}
          onChange={this.handleChange}
          placeholder="0"
          disabled={!editable}
        />
        <ValidationText validationError={validationError} />
      </div>
    );
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
