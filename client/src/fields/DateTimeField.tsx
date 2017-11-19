import * as moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';

import { DateTimeFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

export type DateTimeFieldProps = RequiredFieldProps<DateTimeFieldConfig>;

interface State {
  value: Date;
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss[Z]';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss[Z]';

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
      config: { editable },
      className: className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <Datetime
          {...rest}
          dateFormat={DATE_FORMAT}
          timeFormat={TIME_FORMAT}
          value={this.state.value}
          onChange={this.handleChange}
          inputProps={{ className }}
          utc={true}
        />
      );
    } else {
      return (
        <span className={className} {...rest}>
          {this.state.value
            ? moment.utc(this.state.value).format(DATETIME_FORMAT)
            : undefined}
        </span>
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
