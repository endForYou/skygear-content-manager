import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';

export default class Pagination extends PureComponent {
  static propTypes = {
    recordName: PropTypes.string.isRequired,
    currentPage: PropTypes.number.isRequired,
    maxPage: PropTypes.number.isRequired,
    onItemClicked: PropTypes.func.isRequired,
  };

  render() {
    return (
      <nav>
        <ul className="pagination justify-content-end">
          {this.renderPaginationItems()}
        </ul>
      </nav>
    );
  }

  renderPaginationItems() {
    const { recordName, currentPage, maxPage, onItemClicked } = this.props;

    const middleItems = getPages(currentPage, maxPage).map(page => {
      return (
        <PageItem
          key={page}
          recordName={recordName}
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
        recordName={recordName}
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
        recordName={recordName}
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

class PageItem extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    recordName: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    isActive: PropTypes.bool,
  };

  render() {
    const {
      children,
      recordName,
      page,
      onClick,
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
          <Link
            className="page-link"
            to={`/record/${recordName}?page=${page}`}
            onClick={() => onClick(page)}
          >
            {children}
          </Link>
        </li>
      );
    }
  }
}

function getPages(page, maxPage) {
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
