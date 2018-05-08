import moment from 'moment-timezone';

export type TimezoneValue = string;

export const utcOffsetOfTimezone = (timezone: TimezoneValue): number => {
  const tz = timezone !== 'Local' ? timezone : moment.tz.guess();
  const zone = moment.tz.zone(tz);
  return -zone.utcOffset(new Date().getTime());
};
