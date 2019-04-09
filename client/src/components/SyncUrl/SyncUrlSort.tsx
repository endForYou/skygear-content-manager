import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { Dispatch } from 'redux';

import { SearchParamsObserver } from './SearchParamsObserver';
import { SyncToUrl } from './SyncToUrl';

import { RootState } from '../../states';
import { SortOrder, SortState } from '../../types';
import { Omit } from '../../typeutil';

interface SortUrlParams {
  sortBy: string;
  order: 'asc' | 'desc';
}

function urlParamsToSortState(
  sortBy: string | undefined,
  order: string | undefined
): SortState {
  if (sortBy == null || sortBy === '') {
    return SortState();
  }

  let sortOrder: SortOrder = SortOrder.Ascending;
  if (order === 'desc') {
    sortOrder = SortOrder.Descending;
  }

  return {
    fieldName: sortBy,
    order: sortOrder,
  };
}

function sortStateToUrlParams(sortState: SortState): SortUrlParams | null {
  if (
    sortState.fieldName === undefined ||
    sortState.order === SortOrder.Undefined
  ) {
    return null;
  }

  return {
    order: sortState.order === SortOrder.Ascending ? 'asc' : 'desc',
    sortBy: sortState.fieldName,
  };
}

export interface InjectedProps {
  sortState: SortState;
  onChangeSort: (sortState: SortState) => void;
}

export interface OwnProps {
  location: Location;
  dispatch: Dispatch<RootState>;
}

interface State {
  sortState: SortState;
}

export function syncSortWithUrl<P extends InjectedProps>(
  WrappedComponent: React.ComponentType<P>
) {
  type Props = Omit<P, keyof InjectedProps> & OwnProps;
  return class extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        sortState: this.getSortState(props),
      };
    }

    getSortState(props: Props) {
      const search = qs.parse(props.location.search || '');
      return urlParamsToSortState(search.sortBy, search.order);
    }

    // tslint:disable:jsx-wrap-multiline
    render() {
      const { dispatch, location } = this.props;

      const { sortState } = this.state;
      const urlParams = sortStateToUrlParams(sortState);
      const searchParams = urlParams == null ? {} : urlParams;

      return [
        <SyncToUrl
          key="sync-to-url"
          value={searchParams}
          searchKeys={['sortBy', 'order']}
          location={location}
          dispatch={dispatch}
        />,
        <SearchParamsObserver
          key="seach-params-observer"
          location={location}
          searchKeys={['sortBy', 'order']}
          onChange={(oldValue, newValue) => {
            this.onSortChange(
              urlParamsToSortState(newValue.sortBy, newValue.order)
            );
          }}
        />,
        <WrappedComponent
          key="wrapped-component"
          {...this.props}
          onChangeSort={this.onSortChange}
          sortState={sortState}
        />,
      ];
    }
    // tslint:enable:jsx-wrap-multiline

    private onSortChange = (sortState: SortState) => {
      this.setState({ sortState });
    };
  } as React.ComponentType<Props>;
}
