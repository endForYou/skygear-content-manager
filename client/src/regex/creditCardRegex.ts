// Copied and converted to ts from https://github.com/kevva/credit-card-regex
// The library cannot pass minify.

const americanExpressRegex = '(?:3[47][0-9]{13})';
const dinersClubRegex = '(?:3(?:0[0-5]|[68][0-9])[0-9]{11})';
const discoverRegex = '(?:6(?:011|5[0-9]{2})(?:[0-9]{12}))';
const jcbRegex = '(?:(?:2131|1800|35\\d{3})\\d{11})';
const maestroRegex = '(?:(?:5[0678]\\d\\d|6304|6390|67\\d\\d)\\d{8,15})';
const mastercardRegex =
  '(?:(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12})';
const visaRegex = '(?:4[0-9]{12})(?:[0-9]{3})?';

export interface Option {
  exact: boolean;
}

const generate = (pattern: string) => (opts: Option) => {
  opts = opts || {};
  return opts.exact
    ? new RegExp(`(?:^${pattern}$)`)
    : new RegExp(`(["'])${pattern}\\1`, 'g');
};

export default generate(
  [
    americanExpressRegex,
    dinersClubRegex,
    discoverRegex,
    jcbRegex,
    maestroRegex,
    mastercardRegex,
    visaRegex,
  ].join('|')
);

export const americanExpress = generate(americanExpressRegex);
export const dinersClub = generate(dinersClubRegex);
export const discover = generate(discoverRegex);
export const jcb = generate(jcbRegex);
export const maestro = generate(maestroRegex);
export const mastercard = generate(mastercardRegex);
export const visa = generate(visaRegex);
