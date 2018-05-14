import classnames from 'classnames';
import * as moment from 'moment-timezone';
import * as React from 'react';

import { DateTimeFieldConfig } from '../cmsConfig';
import { TzDatetime } from '../components/TzDatetime';
import { TzDatetimeInput } from '../components/TzDatetimeInput';
import { RequiredFieldProps } from './Field';

export type DateTimeFieldProps = RequiredFieldProps<DateTimeFieldConfig>;

interface State {
  value: Date;
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class DateTimeFieldImpl extends React.PureComponent<DateTimeFieldProps, State> {
  constructor(props: DateTimeFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: DateTimeFieldProps) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  public render() {
    const {
      config: { editable, timezone },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      const timeFormat = timezone === 'Local' ? TIME_FORMAT : `${TIME_FORMAT}Z`;
      return (
        <TzDatetimeInput
          {...rest}
          dateFormat={DATE_FORMAT}
          timeFormat={timeFormat}
          value={this.state.value}
          onChange={this.handleChange}
          inputProps={{ className: classnames(className, 'datetime-input') }}
          timezone={timezone}
        />
      );
    } else {
      const datetimeFormat =
        timezone === 'Local' ? DATETIME_FORMAT : `${DATETIME_FORMAT}Z`;
      return (
        <TzDatetime
          {...rest}
          className={className}
          datetimeFormat={datetimeFormat}
          value={this.state.value}
          timezone={timezone}
        />
      );
    }
  }

  public handleChange: (
    // tslint:disable-next-line: no-any
    event: string | moment.Moment | React.ChangeEvent<any>
  ) => void = event => {
    if (!moment.isMoment(event)) {
      return;
    }

    const d = event.toDate();

    this.setState({ ...this.state, value: d });
    if (this.props.onFieldChange) {
      this.props.onFieldChange(d);
    }
  };
}

export const DateTimeField: React.ComponentClass<
  DateTimeFieldProps
> = DateTimeFieldImpl;
