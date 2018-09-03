import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { Dispatch } from 'redux';

import { SearchParamsObserver } from './SearchParamsObserver';
import { SyncToUrl } from './SyncToUrl';

import { RootState } from '../../states';
import { Omit } from '../../typeutil';

export interface InjectedProps {
  page: number;
  onChangePage: () => void;
}

export interface OwnProps {
  location: Location;
  dispatch: Dispatch<RootState>;
}

interface State {
  needReset: boolean;
  page: number;
}

export function syncPageWithUrl<P extends InjectedProps>(
  WrappedComponent: React.ComponentType<P>
) {
  type Props = Omit<P, keyof InjectedProps> & OwnProps;
  return class extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        needReset: false,
        page: this.getPage(props),
      };
    }

    public getPage(props: Props) {
      const { page: pageStr = '1' } = qs.parse(location.search);
      return parseInt(pageStr, 10);
    }

    // tslint:disable:jsx-wrap-multiline
    public render() {
      const { dispatch, location } = this.props;

      const { needReset, page } = this.state;

      return [
        <SyncToUrl
          key="sync-to-url"
          value={{ page: `${page}` }}
          searchKeys={['page']}
          location={location}
          dispatch={dispatch}
          debounced={300}
        />,
        <SearchParamsObserver
          key="seach-params-observer"
          location={location}
          searchKeys={['page']}
          onChange={(oldValue, newValue) => {
            const newPage = parseInt(newValue.page, 10);
            if (needReset) {
              this.setState({ needReset: false, page: 1 });
            } else if (page !== newPage) {
              this.setState({ page: newPage });
            }
          }}
        />,
        <WrappedComponent
          key="wrapped-component"
          {...this.props}
          page={page}
          onChangePage={this.onChangePage}
        />,
      ];
    }
    // tslint:enable:jsx-wrap-multiline

    private onChangePage = () => {
      // FIXME: (Steven-Chan)
      // This seems a work around to some underlying problem but I can't
      // identify it yet, my guess is SyncUrlPage and SyncUrlFilter should be
      // using the same set of SyncToUrl and SearchParamsObserver.
      this.setState({ needReset: true });
    };
  } as React.ComponentType<Props>;
}
