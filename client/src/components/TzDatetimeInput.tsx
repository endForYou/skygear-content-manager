import * as React from 'react';
import * as Datetime from 'react-datetime';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';

import { getCombinedSettings } from '../settings';
import { RootState, Settings } from '../states';
import { TimezoneValue, utcOffsetOfTimezone } from '../types';
import { Omit } from '../typeutil';
import { mapDispatchNoOp } from './TzDatetime';

interface Props extends Omit<Datetime.DatetimepickerProps, 'utcOffset'> {
  settings: Settings;
  timezone?: TimezoneValue;
  disabled?: boolean;
}

export const TzDatetimeInputImpl: React.SFC<Props> = ({
  settings,
  timezone,
  disabled,
  ...rest
}) => {
  const utcOffset = utcOffsetOfTimezone(timezone || settings.timezone);

  return <Datetime {...rest} utcOffset={utcOffset} inputProps={{disabled}} />;
};

export const TzDatetimeInput = connect(
  (state: RootState) => ({
    settings: getCombinedSettings(state),
  }),
  mapDispatchNoOp
)(TzDatetimeInputImpl);
