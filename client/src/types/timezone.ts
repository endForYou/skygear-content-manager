import moment, { MomentZone } from 'moment-timezone';

export type TimezoneValue = 'Local' | MomentZone;

export const utcOffsetOfTimezone = (timezone: TimezoneValue): number => {
  const zone =
    timezone !== 'Local' ? timezone : moment.tz.zone(moment.tz.guess());
  return -zone.utcOffset(new Date().getTime());
};
