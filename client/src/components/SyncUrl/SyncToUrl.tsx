import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { push } from 'react-router-redux';
import { Dispatch } from 'redux';

import { RootState } from '../../states';
import { shallowCompare } from '../../util';

interface SearchParams {
  [key: string]: string;
}
interface SyncToUrlProps {
  searchKeys: string[];
  value: SearchParams;
  location: Location;
  dispatch: Dispatch<RootState>;
}

interface SyncToUrlState {
  value: SearchParams;
}

export class SyncToUrl extends React.PureComponent<
  SyncToUrlProps,
  SyncToUrlState
> {
  constructor(props: SyncToUrlProps) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  public componentWillReceiveProps(nextProps: SyncToUrlProps) {
    if (!shallowCompare(this.state.value, nextProps.value)) {
      this.setState({ value: nextProps.value }, () => {
        const search = this.mergeLocationSearch(
          nextProps.location,
          nextProps.searchKeys,
          nextProps.value
        );
        this.props.dispatch(push({ search: qs.stringify(search) }));
      });
    }
  }

  public render() {
    return null;
  }

  private mergeLocationSearch(
    location: Location,
    keys: string[],
    searchToMerge: SearchParams
  ) {
    const search = qs.parse(location ? location.search : '');
    return keys.reduce((acc: SearchParams, key: string) => {
      if (!(key in searchToMerge) || searchToMerge[key] === '') {
        delete acc[key];
      } else {
        acc[key] = searchToMerge[key];
      }
      return acc;
    }, search);
  }
}
