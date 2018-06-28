import classnames from 'classnames';
import * as React from 'react';

interface Props {
  config: {
    compact: boolean;
  };

  // HTML related attrs
  name?: string;
  className?: string;

  value: string;
}

export const StringDisplay: React.SFC<Props> = ({
  config: { compact },
  className,
  value,
  ...rest,
}) => {
  return (
    <span {...rest} className={classnames(className, { full: !compact })}>
      {value}
    </span>
  );
};
