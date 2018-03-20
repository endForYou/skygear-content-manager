import * as React from 'react';
import { LinkActionConfig } from '../cmsConfig';
import { get } from '../util';

export interface LinkButtonProps {
  actionConfig: LinkActionConfig;
  // tslint:disable-next-line: no-any
  context: any;
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
          ? href.replace(new RegExp(`{${key}}`), '')
          : href.replace(new RegExp(`{${key}}`), value);
      }, href)
  );
}

export const LinkButton: React.SFC<LinkButtonProps> = props => {
  const { actionConfig: { href, label, target }, context } = props;

  return (
    <a
      href={applyContext(href, context)}
      target={target === '' ? undefined : target}
      role="button"
      className="btn btn-light"
    >
      {label}
    </a>
  );
};
