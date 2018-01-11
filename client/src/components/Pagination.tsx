import * as React from 'react';

import { OnPageItemClickedType, PageItem } from './PageItem';

export interface PaginationProps {
  pathname: string;
  currentPage: number;
  maxPage: number;
  onItemClicked: OnPageItemClickedType;
}

export default class Pagination extends React.PureComponent<PaginationProps> {
  public render() {
    return (
      <nav>
        <ul className="pagination justify-content-end">
          {this.renderPaginationItems()}
        </ul>
      </nav>
    );
  }

  protected renderPaginationItems() {
    const { pathname, currentPage, maxPage, onItemClicked } = this.props;

    const middleItems = getPages(currentPage, maxPage).map(page => {
      return (
        <PageItem
          key={page}
          pathname={pathname}
          page={page}
          onClick={onItemClicked}
          isActive={currentPage === page}
        >
          {page}
        </PageItem>
      );
    });

    const prevItem = (
      <PageItem
        key="prev"
        pathname={pathname}
        page={currentPage - 1}
        onClick={onItemClicked}
        isDisabled={currentPage <= 1}
      >
        <span>&laquo;</span>
      </PageItem>
    );

    const nextItem = (
      <PageItem
        key="next"
        pathname={pathname}
        page={currentPage + 1}
        onClick={onItemClicked}
        isDisabled={currentPage >= maxPage}
      >
        <span>&raquo;</span>
      </PageItem>
    );

    return [prevItem, ...middleItems, nextItem];
  }
}

function getPages(page: number, maxPage: number): number[] {
  const minPage = 1;
  const step = 5;

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
