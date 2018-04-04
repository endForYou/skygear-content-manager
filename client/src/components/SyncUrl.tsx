import * as React from 'react';
import { push } from 'react-router-redux';
import { Dispatch } from 'redux';

import {
  Filter,
  filterFactory,
  FilterType,
  ListPageConfig,
} from '../cmsConfig';
import { StateProps } from '../pages/ListPage';
import { RootState } from '../states';
import { isObject } from '../util';

type Props = StateProps & DispatchProps;

interface State {
  filters: Filter[];
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

function parseFiltersFromUrl(filterStr: string, pageConfig: ListPageConfig) {
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
      const filterConfig = pageConfig.filters.find(
        pFilter => name === pFilter.name
      );
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

function SyncUrl(WrappedComponent: React.ComponentClass<Props>) {
  return class extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        filters: parseFiltersFromUrl(props.filterStr, props.pageConfig),
      };
    }

    public componentWillReceiveProps(nextProps: Props) {
      const { filterStr } = this.props;
      if (filterStr !== nextProps.filterStr) {
        this.setState({
          filters: parseFiltersFromUrl(
            nextProps.filterStr,
            nextProps.pageConfig
          ),
        });
      }
    }

    public onChange = (filters: Filter[]) => {
      const { dispatch, page } = this.props;
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
        filterStr = `&filter=${encodeURIComponent(JSON.stringify(filterObj))}`;
      }
      dispatch(push({ search: `page=${page}${filterStr}` }));
    };

    public render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          onChangeFilter={this.onChange}
        />
      );
    }
  };
}

export default SyncUrl;
