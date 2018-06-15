import * as React from 'react';
import * as Datetime from 'react-datetime';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';

import { RootState, Settings } from '../states';
import { TimezoneValue, utcOffsetOfTimezone } from '../types';
import { Omit } from '../typeutil';

interface Props extends Omit<Datetime.DatetimepickerProps, 'utcOffset'> {
  settings: Settings;
  timezone?: TimezoneValue;
}

export const TzDatetimeInputImpl: React.SFC<Props> = ({
  settings,
  timezone,
  ...rest,
}) => {
  const utcOffset = utcOffsetOfTimezone(timezone || settings.timezone);

  return <Datetime {...rest} utcOffset={utcOffset} />;
};

export const TzDatetimeInput = connect((state: RootState) => ({
  settings: state.settings,
}))(TzDatetimeInputImpl);
