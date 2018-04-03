import './SortButton.css';

import classnames from 'classnames';
import * as React from 'react';

export enum SortOrder {
  Undefined = 'undefined',
  Ascending = 'ascending',
  Descending = 'descending',
}

interface SortButtonProps extends React.AnchorHTMLAttributes<HTMLDivElement> {
  sortOrder: SortOrder;
}

export const SortButton: React.SFC<SortButtonProps> = ({
  sortOrder,
  className,
  ...props,
}) => {
  return (
    <div className={classnames(className, 'sort-button')} {...props}>
      <div
        className={classnames('up', {
          'up-active': sortOrder === SortOrder.Descending,
        })}
      />
      <div className="mid" />
      <div
        className={classnames('down', {
          'down-active': sortOrder === SortOrder.Ascending,
        })}
      />
    </div>
  );
};
