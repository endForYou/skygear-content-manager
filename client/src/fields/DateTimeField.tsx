import * as moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';

import { RequiredFieldProps } from './Field';

export type DateTimeFieldProps = RequiredFieldProps;

interface State {
  value: Date;
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss[Z]';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss[Z]';

export class DateTimeField extends React.PureComponent<
  DateTimeFieldProps,
  State
> {
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
      editable,
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

  public handleChange: (event: moment.Moment | string) => void = event => {
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
