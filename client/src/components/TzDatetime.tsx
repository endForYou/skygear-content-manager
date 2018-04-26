import moment from 'moment-timezone';
import * as React from 'react';

import { TimezoneValue, utcOffsetOfTimezone } from '../types';

interface Props {
  className?: string;
  datetimeFormat: string;
  timezone: TimezoneValue;
  value?: Date;
}

export const TzDatetime: React.SFC<Props> = ({
  datetimeFormat,
  value,
  timezone,
  ...rest,
}) => {
  const utcOffset = utcOffsetOfTimezone(timezone);

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
