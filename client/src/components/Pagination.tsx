import './Pagination.scss';

import classnames from 'classnames';
import { Location } from 'history';
import * as React from 'react';

import { PageItem } from './PageItem';

export interface PaginationProps {
  className?: string;
  location: Location;
  currentPage: number;
  maxPage: number;
}

export default class Pagination extends React.PureComponent<PaginationProps> {
  public render() {
    return (
      <div className={classnames(this.props.className, 'pagination-container')}>
        {this.renderPaginationItems()}
      </div>
    );
  }

  protected renderPaginationItems() {
    const { location, currentPage, maxPage } = this.props;

    const middleItems = getPages(currentPage, maxPage).map(page => {
      return (
        <PageItem
          key={page}
          className="pagination-item"
          location={location}
          page={page}
          isActive={currentPage === page}
        >
          {page}
        </PageItem>
      );
    });

    const prevItem = (
      <PageItem
        key="prev"
        className="pagination-item"
        location={location}
        page={currentPage - 1}
        isDisabled={currentPage <= 1}
      >
        Previous
      </PageItem>
    );

    const nextItem = (
      <PageItem
        key="next"
        className="pagination-item"
        location={location}
        page={currentPage + 1}
        isDisabled={currentPage >= maxPage}
      >
        Next
      </PageItem>
    );

    return [prevItem, ...middleItems, nextItem];
  }
}

function getPages(page: number, maxPage: number): number[] {
  const minPage = 1;
  const step = 3;

  const startPage = Math.max(minPage, page - step);
  const endPage = Math.min(maxPage, startPage + 2 * step);

  const pages = [];
  for (let i = startPage; i <= endPage; ++i) {
    pages.push(i);
  }

  if ((pages.length > 0 ? pages[0] : 0) !== minPage) {
    pages.unshift(minPage);
  }

  if (pages[pages.length - 1] !== maxPage) {
    pages.push(maxPage);
  }

  return pages;
}
