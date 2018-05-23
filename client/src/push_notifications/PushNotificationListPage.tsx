import './PushNotificationListPage.scss';

import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';

import { PushCampaignActionDispatcher } from '../actions/pushCampaign';
import Pagination from '../components/Pagination';
import { RootState, RouteProps } from '../states';
import { PushCampaign } from '../types';

const pageSize: number = 25;

interface FieldConfig {
  field: string;
  fieldTitle: string;
}

const pushCampaignConfig: FieldConfig[] = [
  { field: 'type', fieldTitle: 'Type' },
  { field: 'number_of_audiences', fieldTitle: 'No. of audiences' },
  { field: 'content', fieldTitle: 'Content' },
  { field: 'send_time', fieldTitle: 'Time' },
];

const TableHeader: React.SFC = () => {
  const columns = pushCampaignConfig.map((fieldName, index) => {
    return (
      <div key={index} className="table-cell">
        {fieldName.fieldTitle}
      </div>
    );
  });
  return (
    <div className="table-header">
      <div className="table-row">{columns}</div>
    </div>
  );
};

interface TableRowProps {
  pushCampaign: PushCampaign;
}

const TableRow: React.SFC<TableRowProps> = ({ pushCampaign }) => {
  const columns = pushCampaignConfig.map((fieldName, index) => {
    return (
      <div key={index} className="table-cell">
        <span>{pushCampaign[fieldName.field]}</span>
      </div>
    );
  });
  return <div className="table-row">{columns}</div>;
};

interface TableBodyProps {
  pushCampaigns: PushCampaign[];
}

const TableBody: React.SFC<TableBodyProps> = ({ pushCampaigns }) => {
  const rows = pushCampaigns.map((pushCampaign, index) => {
    return <TableRow key={index} pushCampaign={pushCampaign} />;
  });
  return <div className="table-body">{rows}</div>;
};

interface ListTableProps {
  pushCampaigns: PushCampaign[];
}

const ListTable: React.SFC<ListTableProps> = ({ pushCampaigns }) => {
  return (
    <div key="table" className="list-table">
      <TableHeader />
      <TableBody pushCampaigns={pushCampaigns} />
    </div>
  );
};

export type PushNotificationListPageProps = StateProps & DispatchProps;

export interface StateProps {
  location: Location;
  page: number;
  maxPage: number;
  isLoading: boolean;
  pushCampaigns: PushCampaign[];
}

export interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class PushNotificationListPageImpl extends React.PureComponent<
  PushNotificationListPageProps
> {
  public notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: PushNotificationListPageProps) {
    super(props);

    const { dispatch } = this.props;

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(
      dispatch
    );
  }

  public componentDidMount() {
    const { page } = this.props;
    this.notificationActionDispatcher.fetchList(page, pageSize);
  }

  public render() {
    const { location, page, maxPage, isLoading, pushCampaigns } = this.props;

    return (
      <div className="push-list">
        <div className="topbar">
          <div className="title">Push Notifications</div>
          <div className="action-container">
            <Link
              className="push-action primary-button"
              to={`/notification/new`}
            >
              New Notification
            </Link>
          </div>
        </div>
        <div className="list-content">
          {(() => {
            if (isLoading) {
              return <div className="list-loading">Loading...</div>;
            } else {
              if (pushCampaigns.length === 0) {
                return <div className="list-empty">No campaigns found.</div>;
              } else {
                return <ListTable pushCampaigns={pushCampaigns} />;
              }
            }
          })()}
        </div>

        {maxPage > 0 ? (
          <Pagination
            key="pagination"
            className="pagination"
            location={location}
            currentPage={page}
            maxPage={maxPage}
          />
        ) : null}
      </div>
    );
  }

  public onPageItemClicked = (page: number) => {
    this.notificationActionDispatcher.fetchList(page, pageSize);
  };
}

function PushNotificationListPageFactory() {
  function mapStateToProps(state: RootState, props: RouteProps): StateProps {
    const { location } = props;
    const { page: pageStr = '1' } = qs.parse(location.search);
    const page = parseInt(pageStr, 10);
    const { isLoading, pushCampaigns, totalCount } = state.pushCampaign.list;

    const maxPage = Math.ceil(totalCount / pageSize);

    return {
      isLoading,
      location,
      maxPage,
      page,
      pushCampaigns,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  return connect(mapStateToProps, mapDispatchToProps)(
    PushNotificationListPageImpl
  );
}

export const PushNotificationListPage: React.ComponentClass<
  PushNotificationListPageProps
> = PushNotificationListPageImpl;

export { PushNotificationListPageFactory };
