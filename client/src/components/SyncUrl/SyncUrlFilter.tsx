import { Location } from 'history';
import moment from 'moment';
import * as qs from 'query-string';
import * as React from 'react';
import { Dispatch } from 'redux';

import { SearchParamsObserver } from './SearchParamsObserver';
import { SyncToUrl } from './SyncToUrl';

import {
  Filter,
  FilterConfig,
  filterFactory,
  FilterType,
  isFilterListEqual,
} from '../../cmsConfig';
import { RootState } from '../../states';
import { Omit } from '../../typeutil';
import { isObject } from '../../util';

function urlStringToFilter(filterStr: string, filterConfigs: FilterConfig[]) {
  // filterStr is either '[]' or user specify filters in this format:
  // [{ name: '', query: '', value?: '' }]
  let filters: Filter[] = [];
  let rawFilters = [];
  try {
    rawFilters = JSON.parse(filterStr);
    if (!Array.isArray(rawFilters)) {
      throw new Error();
    }
  } catch (e) {
    throw new Error('Cannot parse filter from URL');
  }
  filters = rawFilters
    .filter((filter: object) => filter && isObject(filter) && filter.name)
    // tslint:disable-next-line: no-any
    .map((filter: any) => {
      const { name, query, value } = filter;
      const filterConfig = filterConfigs.find(pFilter => name === pFilter.name);
      if (!filterConfig) {
        throw new Error(`Cannot find filter '${name}' in page config`);
      }
      // Get filter label & type from config and create filter
      const newFilter = filterFactory(filterConfig);
      switch (newFilter.type) {
        case FilterType.ReferenceFilterType:
          return { ...newFilter, query, values: value };
        case FilterType.BooleanFilterType:
          return { ...newFilter, query };
        case FilterType.DateTimeFilterType:
          return { ...newFilter, query, value: moment(value).toDate() };
        case FilterType.NumberFilterType:
          return { ...newFilter, query, value: parseInt(value, 10) };
        default:
          return { ...newFilter, query, value };
      }
    });
  return filters;
}

function filterToUrlString(filters: Filter[]) {
  if (filters.length === 0) {
    return '';
  }

  const filterObj = filters.map(oldFilter => {
    const { name, query } = oldFilter;
    // tslint:disable-next-line: no-any
    const filter: any = { name, query };
    if (oldFilter.type === FilterType.ReferenceFilterType) {
      filter.value = oldFilter.values;
    } else if (oldFilter.type !== FilterType.BooleanFilterType) {
      filter.value = oldFilter.value;
    }
    return filter;
  });

  return JSON.stringify(filterObj);
}

export interface InjectedProps {
  filters: Filter[];
  onChangeFilter: (filters: Filter[]) => void;
}

export interface OwnProps {
  filterConfigs: FilterConfig[];
  location: Location;
  dispatch: Dispatch<RootState>;
}

interface State {
  filters: Filter[];
}

export function syncFilterWithUrl<P extends InjectedProps>(
  WrappedComponent: React.ComponentType<P>
) {
  type Props = Omit<P, keyof InjectedProps> & OwnProps;
  return class extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      const filterStr = this.getFilterStr(props);
      this.state = {
        filters: urlStringToFilter(filterStr, props.filterConfigs),
      };
    }

    public getFilterStr(props: Props) {
      const { filter: filterStr = '[]' } = qs.parse(props.location.search);
      return filterStr;
    }

    // tslint:disable:jsx-wrap-multiline
    public render() {
      const { dispatch, filterConfigs, location } = this.props;

      const { filters } = this.state;

      return [
        <SyncToUrl
          key="sync-to-url"
          value={{ filter: filterToUrlString(filters) }}
          searchKeys={['filter']}
          location={location}
          dispatch={dispatch}
          debounced={300}
        />,
        <SearchParamsObserver
          key="seach-params-observer"
          location={location}
          searchKeys={['filter']}
          onChange={(oldValue, newValue) => {
            const newFilterStr = newValue.filter || '[]';
            const newFilters = urlStringToFilter(newFilterStr, filterConfigs);
            if (!isFilterListEqual(this.state.filters, newFilters)) {
              this.onFilterChange(newFilters);
            }
          }}
        />,
        <WrappedComponent
          key="wrapped-component"
          {...this.props}
          onChangeFilter={this.onFilterChange}
          filters={filters}
        />,
      ];
    }
    // tslint:enable:jsx-wrap-multiline

    private onFilterChange = (filters: Filter[]) => {
      this.setState({ filters });
    };
  } as React.ComponentType<Props>;
}
