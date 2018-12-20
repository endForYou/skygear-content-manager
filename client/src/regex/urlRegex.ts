// Copied and converted to ts from https://github.com/kevva/url-regex
// The library cannot pass minify.

import tlds from 'tlds';

import { v4 } from './ipRegex';

export interface Option {
  exact: boolean;
  strict: boolean;
}

export default (opts: Option) => {
  opts = {
    strict: true,
    ...opts,
  };

  const protocol = `(?:(?:[a-z]+:)?//)${opts.strict ? '' : '?'}`;
  const auth = '(?:\\S+(?::\\S*)?@)?';
  const ip = v4().source;
  const host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
  const domain =
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
  const tld = `(?:\\.${
    opts.strict
      ? '(?:[a-z\\u00a1-\\uffff]{2,})'
      : `(?:${tlds
          // tslint:disable-next-line:no-any
          .sort((a: any, b: any) => b.length - a.length)
          .join('|')})`
  })\\.?`;
  const port = '(?::\\d{2,5})?';
  const path = '(?:[/?#][^\\s"]*)?';
  const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`;

  return opts.exact
    ? new RegExp(`(?:^${regex}$)`, 'i')
    : new RegExp(regex, 'ig');
};
