import moment from 'moment-timezone';
import * as React from 'react';
import { connect } from 'react-redux';

import { getCombinedSettings } from '../settings';
import { RootState, Settings } from '../states';
import { TimezoneValue, utcOffsetOfTimezone } from '../types';

interface Props {
  className?: string;
  datetimeFormat: string;
  settings: Settings;
  timezone?: TimezoneValue;
  value?: Date;
}

const TzDatetimeImpl: React.SFC<Props> = ({
  datetimeFormat,
  value,
  settings,
  timezone,
  ...rest
}) => {
  const utcOffset = utcOffsetOfTimezone(timezone || settings.timezone);

  return (
    <span {...rest}>
      {value
        ? moment(value)
            .utcOffset(utcOffset)
            .format(datetimeFormat)
        : undefined}
    </span>
  );
};

export const mapDispatchNoOp = () => ({});

export const TzDatetime = connect(
  (state: RootState) => ({
    settings: getCombinedSettings(state),
  }),
  mapDispatchNoOp
)(TzDatetimeImpl);
