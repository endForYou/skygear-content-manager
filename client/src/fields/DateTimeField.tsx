import classnames from 'classnames';
import * as moment from 'moment-timezone';
import * as React from 'react';

import {
  DateTimeDisplayFieldConfig,
  DateTimePickerFieldConfig,
} from '../cmsConfig';
import { TzDatetime } from '../components/TzDatetime';
import { TzDatetimeInput } from '../components/TzDatetimeInput';
import { hasValidationError } from '../validation/validation';
import { RequiredFieldProps } from './Field';
import { ValidationText } from './validation/ValidationText';

type DateTimeDisplayFieldProps = RequiredFieldProps<DateTimeDisplayFieldConfig>;

export const DateTimeDisplayField: React.SFC<DateTimeDisplayFieldProps> = ({
  config: { compact, timezone, dateTimeFormat },
  className,
  value,
  onFieldChange: _onFieldChange,
  validationError: _validationError,
  ...rest
}) => {
  return (
    <TzDatetime
      {...rest}
      className={classnames(className, 'datetime-display', {
        full: !compact,
      })}
      datetimeFormat={dateTimeFormat!}
      value={value}
      timezone={timezone}
    />
  );
};

export type DateTimePickerFieldProps = RequiredFieldProps<
  DateTimePickerFieldConfig
>;

interface State {
  value: Date | null;
}

class DateTimePickerFieldImpl extends React.PureComponent<
  DateTimePickerFieldProps,
  State
> {
  constructor(props: DateTimePickerFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps: DateTimePickerFieldProps) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  render() {
    const {
      config: { timezone, datePicker, timePicker, editable },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest
    } = this.props;

    return (
      <div className={className}>
        <TzDatetimeInput
          {...rest}
          className={classnames('datetime-input-container')}
          dateFormat={datePicker.enabled && datePicker.format}
          timeFormat={timePicker.enabled && timePicker.format}
          value={this.state.value || undefined}
          onChange={this.handleChange}
          inputProps={{
            className: classnames('datetime-input', {
              'validation-error': hasValidationError(validationError),
            }),
          }}
          timezone={timezone}
          disabled={editable === false}
        />
        <ValidationText validationError={validationError} />
      </div>
    );
  }

  handleChange: (
    // tslint:disable-next-line: no-any
    event: string | moment.Moment | React.ChangeEvent<any>
  ) => void = event => {
    // treat empty datetime value as null
    if (event === '') {
      this.updateValue(null);
      return;
    }

    if (!moment.isMoment(event)) {
      return;
    }

    const d = event.toDate();
    this.updateValue(d);
  };

  updateValue(value: Date | null) {
    this.setState({ ...this.state, value });
    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  }
}

export const DateTimePickerField: React.ComponentClass<
  DateTimePickerFieldProps
> = DateTimePickerFieldImpl;
