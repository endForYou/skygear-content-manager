import classnames from 'classnames';
import * as React from 'react';

interface Props {
  config: {
    compact: boolean;
  };

  // HTML related attrs
  name?: string;
  className?: string;

  // tslint:disable-next-line:no-any
  value: any;
}

export const StringDisplay: React.SFC<Props> = ({
  config: { compact },
  className,
  value,
  ...rest,
}) => {
  return (
    <span {...rest} className={classnames(className, { full: !compact })}>
      {typeof value === 'string' ? value : JSON.stringify(value)}
    </span>
  );
};
