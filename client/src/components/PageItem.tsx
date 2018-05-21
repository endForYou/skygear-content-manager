import './Pagination.scss';

import classnames from 'classnames';
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
        <li className={classnames(className, 'page-item-container disabled')}>
          <span className="link disabled">{children}</span>
        </li>
      );
    } else {
      const itemClassName = classnames(className, 'page-item-container', {
        // tslint:disable-next-line:object-literal-key-quotes
        active: isActive,
        'primary-border-color': isActive,
      });
      const search = qs.parse(location.search);
      search.page = page;
      return (
        <li className={itemClassName}>
          <Link
            className={classnames('link', {
              'primary-color': isActive,
            })}
            to={`${pathname}?${qs.stringify(search)}`}
          >
            {children}
          </Link>
        </li>
      );
    }
  }
}
