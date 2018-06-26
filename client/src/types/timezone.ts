import moment from 'moment-timezone';

export type TimezoneValue = string;

export const utcOffsetOfTimezone = (timezone: TimezoneValue): number => {
  const zone = moment.tz.zone(timezone);
  return -zone.utcOffset(new Date().getTime());
};
