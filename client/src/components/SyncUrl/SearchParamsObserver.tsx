import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';

import { shallowCompare } from '../../util';

interface SearchParams {
  [key: string]: string;
}
interface SearchParamsObserverProps {
  location: Location;
  searchKeys: string[];
  onChange: (oldValue: SearchParams, newValue: SearchParams) => void;
}

export class SearchParamsObserver extends React.PureComponent<
  SearchParamsObserverProps
> {
  public componentWillReceiveProps(nextProps: SearchParamsObserverProps) {
    if (
      this.props.location.search !== nextProps.location.search ||
      !shallowCompare(this.props.searchKeys, nextProps.searchKeys)
    ) {
      const value = this.getValueFromLocation(
        this.props.searchKeys,
        this.props.location
      );
      const nextValue = this.getValueFromLocation(
        nextProps.searchKeys,
        nextProps.location
      );

      if (!shallowCompare(value, nextValue)) {
        this.props.onChange(value, nextValue);
      }
    }
  }

  public render() {
    return null;
  }

  private getValueFromLocation(keys: string[], location: Location) {
    const search = qs.parse(location ? location.search : '');
    return keys.reduce((acc: SearchParams, key: string) => {
      return { ...acc, [key]: search[key] };
    }, {});
  }
}
