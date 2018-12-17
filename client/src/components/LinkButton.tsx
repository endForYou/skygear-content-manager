import * as React from 'react';
import { Link } from 'react-router-dom';

import { LinkActionConfig } from '../cmsConfig';
import { get } from '../util';

export interface LinkButtonProps {
  actionConfig: LinkActionConfig;
  // tslint:disable-next-line: no-any
  context: any;
  className?: string;
}

// tslint:disable-next-line: no-any
function applyContext(href: string, context: any): string {
  const matches = href.match(/{.*?}/g) || [];
  return (
    matches
      .map((t: string) => t.substring(1, t.length - 1))
      // tslint:disable-next-line: no-any
      .map((t: string): [string, any] => [t, get(context, t.split('.'))])
      // tslint:disable-next-line: no-any
      .reduce((acc: string, [key, value]: [string, any]) => {
        const type = typeof value;
        return type !== 'string' && type !== 'boolean' && type !== 'number'
          ? acc.replace(new RegExp(`{${key}}`), '')
          : acc.replace(new RegExp(`{${key}}`), value);
      }, href)
  );
}

export const LinkButton: React.SFC<LinkButtonProps> = props => {
  const {
    actionConfig: { href, label, target },
    context,
    className,
  } = props;
  const formattedHref = applyContext(href, context);

  // string starts with {scheme}:// or // are external link
  // where {scheme} does not contain '?' or '#'
  const isAbsolute = RegExp('^([^?#]*?:)?//').test(formattedHref);
  if (isAbsolute) {
    return (
      <a
        href={formattedHref}
        target={target === '' ? undefined : target}
        role="button"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      to={formattedHref}
      target={target === '' ? undefined : target}
      role="button"
      className={className}
    >
      {label}
    </Link>
  );
};
