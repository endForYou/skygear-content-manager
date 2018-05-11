import './Pagination.scss';

import classNames from 'classnames';
import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { Link } from 'react-router-dom';

export interface PageItemProps {
  className?: string;
  location: Location;
  page: number;
  isDisabled?: boolean;
  isActive?: boolean;
}

export type OnPageItemClickedType = (page: number) => void;

export class PageItem extends React.PureComponent<PageItemProps> {
  public render() {
    const {
      children,
      className,
      location,
      page,
      isDisabled = false,
      isActive = false,
    } = this.props;
    const { pathname } = location;

    if (isDisabled) {
      return (
        <li className={classNames(className, 'page-item-container disabled')}>
          <span className="link disabled">{children}</span>
        </li>
      );
    } else {
      const itemClassName = classNames(className, 'page-item-container', {
        active: isActive,
      });
      const search = qs.parse(location.search);
      search.page = page;
      return (
        <li className={itemClassName}>
          <Link className="link" to={`${pathname}?${qs.stringify(search)}`}>
            {children}
          </Link>
        </li>
      );
    }
  }
}
