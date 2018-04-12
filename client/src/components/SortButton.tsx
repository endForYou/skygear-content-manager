import './SortButton.css';

import classnames from 'classnames';
import * as React from 'react';

import { SortOrder } from '../types';

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
          active: sortOrder === SortOrder.Ascending,
        })}
      />
      <div className="mid" />
      <div
        className={classnames('down', {
          active: sortOrder === SortOrder.Descending,
        })}
      />
    </div>
  );
};
