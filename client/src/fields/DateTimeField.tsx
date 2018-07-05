import classnames from 'classnames';
import * as moment from 'moment-timezone';
import * as React from 'react';

import {
  DateTimeDisplayFieldConfig,
  DateTimePickerFieldConfig,
} from '../cmsConfig';
import { TzDatetime } from '../components/TzDatetime';
import { TzDatetimeInput } from '../components/TzDatetimeInput';
import { RequiredFieldProps } from './Field';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ssZ';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

type DateTimeDisplayFieldProps = RequiredFieldProps<DateTimeDisplayFieldConfig>;

export const DateTimeDisplayField: React.SFC<DateTimeDisplayFieldProps> = ({
  config: { compact, timezone },
  className,
  value,
  ...rest,
}) => {
  return (
    <TzDatetime
      {...rest}
      className={classnames(className, 'datetime-display', {
        full: !compact,
      })}
      datetimeFormat={DATETIME_FORMAT}
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

  public componentWillReceiveProps(nextProps: DateTimePickerFieldProps) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  public render() {
    const {
      config: { timezone },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    return (
      <TzDatetimeInput
        {...rest}
        className={classnames(className, 'datetime-input-container')}
        dateFormat={DATE_FORMAT}
        timeFormat={TIME_FORMAT}
        value={this.state.value || undefined}
        onChange={this.handleChange}
        inputProps={{ className: 'datetime-input' }}
        timezone={timezone}
        // TODO: handle editable
        // disabled={!editable}
      />
    );
  }

  public handleChange: (
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

  public updateValue(value: Date | null) {
    this.setState({ ...this.state, value });
    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  }
}

export const DateTimePickerField: React.ComponentClass<
  DateTimePickerFieldProps
> = DateTimePickerFieldImpl;
