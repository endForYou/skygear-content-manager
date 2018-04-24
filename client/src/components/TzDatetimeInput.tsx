import * as React from 'react';
import * as Datetime from 'react-datetime';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';

import { TimezoneValue, utcOffsetOfTimezone } from '../types';
import { Omit } from '../typeutil';

interface Props extends Omit<Datetime.DatetimepickerProps, 'utcOffset'> {
  timezone: TimezoneValue;
}

export const TzDatetimeInput: React.SFC<Props> = ({ timezone, ...rest }) => {
  const utcOffset = utcOffsetOfTimezone(timezone);

  return <Datetime {...rest} utcOffset={-utcOffset} />;
};
