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
const TIME_FORMAT = 'HH:mm:ssZ';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

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
      config: { compact, editable, timezone },
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <TzDatetimeInput
          {...rest}
          className={classnames(className, 'datetime-input-container')}
          dateFormat={DATE_FORMAT}
          timeFormat={TIME_FORMAT}
          value={this.state.value}
          onChange={this.handleChange}
          inputProps={{ className: 'datetime-input' }}
          timezone={timezone}
        />
      );
    } else {
      return (
        <TzDatetime
          {...rest}
          className={classnames(className, 'datetime-display', {
            full: !compact,
          })}
          datetimeFormat={DATETIME_FORMAT}
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
