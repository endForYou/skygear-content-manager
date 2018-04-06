import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';

export interface PageItemProps {
  pathname: string;
  page: number;
  isDisabled?: boolean;
  isActive?: boolean;
}

export type OnPageItemClickedType = (page: number) => void;

export class PageItem extends React.PureComponent<PageItemProps> {
  public render() {
    const {
      children,
      pathname,
      page,
      isDisabled = false,
      isActive = false,
    } = this.props;

    if (isDisabled) {
      return (
        <li className="page-item disabled">
          <span className="page-link">{children}</span>
        </li>
      );
    } else {
      const itemClassName = classNames('page-item', {
        active: isActive,
      });
      return (
        <li className={itemClassName}>
          <Link className="page-link" to={`${pathname}?page=${page}`}>
            {children}
          </Link>
        </li>
      );
    }
  }
}
