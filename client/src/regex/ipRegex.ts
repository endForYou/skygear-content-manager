// Copied and converted to ts from https://github.com/sindresorhus/ip-regex
// The library cannot pass minify.

export interface Option {
  exact: boolean;
}

const word = '[a-fA-F\\d:]';
const b = `(?:(?<=\\s|^)(?=${word})|(?<=${word})(?=\\s|$))`;

const v4Regex =
  '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';

const v6seg = '[a-fA-F\\d]{1,4}';
// tslint:disable:max-line-length
const v6Regex = `
(
(?:${v6seg}:){7}(?:${v6seg}|:)|                                     // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${v6seg}:){6}(?:${v4Regex}|:${v6seg}|:)|                         // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${v6seg}:){5}(?::${v4Regex}|(:${v6seg}){1,2}|:)|                 // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${v6seg}:){4}(?:(:${v6seg}){0,1}:${v4Regex}|(:${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${v6seg}:){3}(?:(:${v6seg}){0,2}:${v4Regex}|(:${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${v6seg}:){2}(?:(:${v6seg}){0,3}:${v4Regex}|(:${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${v6seg}:){1}(?:(:${v6seg}){0,4}:${v4Regex}|(:${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::((?::${v6seg}){0,5}:${v4Regex}|(?::${v6seg}){1,7}|:))           // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(%[0-9a-zA-Z]{1,})?                                                // %eth0            %1
`
  .replace(/\s*\/\/.*$/gm, '')
  .replace(/\n/g, '')
  .trim();
// tslint:enable:max-line-length

export default (opts?: Option) =>
  opts && opts.exact
    ? new RegExp(`(?:^${v4Regex}$)|(?:^${v6Regex}$)`)
    : new RegExp(`(?:${b}${v4Regex}${b})|(?:${b}${v6Regex}${b})`, 'g');

export function v4(opts?: Option) {
  return opts && opts.exact
    ? new RegExp(`^${v4Regex}$`)
    : new RegExp(`${b}${v4Regex}${b}`, 'g');
}
export function v6(opts?: Option) {
  return opts && opts.exact
    ? new RegExp(`^${v6Regex}$`)
    : new RegExp(`${b}${v6Regex}${b}`, 'g');
}
