import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { push } from 'react-router-redux';
import { Dispatch } from 'redux';

import { Filter, FilterConfig, filterFactory, FilterType } from '../cmsConfig';
import { RootState } from '../states';
import { isObject } from '../util';

type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export interface InjectedProps {
  filters: Filter[];
  onChangeFilter: (filters: Filter[]) => void;
}

export interface OwnProps {
  filterConfigs: FilterConfig[];
  location: Location | null;
  dispatch: Dispatch<RootState>;
}

interface State {
  filters: Filter[];
  filterStr: string;
}

function parseFiltersFromUrl(filterStr: string, filterConfigs: FilterConfig[]) {
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
      if (newFilter.type === FilterType.ReferenceFilterType) {
        return { ...newFilter, query, values: value };
      } else if (newFilter.type === FilterType.BooleanFilterType) {
        return { ...newFilter, query };
      }
      return { ...newFilter, query, value };
    });
  return filters;
}

function SyncUrl<P extends InjectedProps>(
  WrappedComponent: React.ComponentType<P>
) {
  type Props = Omit<P, keyof InjectedProps> & OwnProps;
  return class extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      const filterStr = this.getFilterStr(props);
      this.state = {
        filterStr,
        filters: parseFiltersFromUrl(filterStr, props.filterConfigs),
      };
    }

    public componentWillReceiveProps(nextProps: Props) {
      const filterStr = this.getFilterStr(nextProps);
      if (this.state.filterStr !== filterStr) {
        this.setState({
          filterStr,
          filters: parseFiltersFromUrl(filterStr, nextProps.filterConfigs),
        });
      }
    }

    public getFilterStr(props: Props) {
      const { filter: filterStr = '[]' } = qs.parse(
        props.location ? props.location.search : ''
      );
      return filterStr;
    }

    public onChange = (filters: Filter[]) => {
      const { dispatch, location } = this.props;
      const search = qs.parse(location ? location.search : '');
      let filterStr = '';
      if (filters.length) {
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
        filterStr = JSON.stringify(filterObj);
      }
      if (filterStr.length) {
        search.filter = filterStr;
      } else {
        delete search.filter;
      }
      dispatch(push({ search: qs.stringify(search) }));
    };

    public render() {
      return (
        <WrappedComponent
          {...this.props}
          onChangeFilter={this.onChange}
          filters={this.state.filters}
        />
      );
    }
  } as React.ComponentType<Props>;
}

export default SyncUrl;
