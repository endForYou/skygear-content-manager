import { Settings } from '../states';
import { parseTimezone } from './util';

// tslint:disable-next-line:no-any
export function parseDefaultSettings(input: any): Partial<Settings> {
  if (input == null) {
    return {};
  }

  return {
    timezone: parseTimezone(input, 'timezone'),
  };
}
