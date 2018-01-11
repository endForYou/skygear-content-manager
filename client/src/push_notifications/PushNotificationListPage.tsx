import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';

import Pagination from '../components/Pagination';
import { PushCampaignActionDispatcher } from '../actions/pushCampaign';
import { RootState } from '../states';
import { PushCampaign } from '../types';
// import { Field, FieldContext } from '../fields';
// import { FieldConfig } from '../cmsConfig';

const pageSize: number = 25;

interface FieldConfig {
  field: string;
  fieldTitle: string;
}

const pushCampaignConfig: FieldConfig[] = [
  {field: 'type', fieldTitle: 'Type'},
  {field: 'number_of_audiences', fieldTitle: 'No. of audiences'},
  {field: 'content', fieldTitle: 'Content'},
  {field: 'send_time', fieldTitle: 'Time'},
];

const TableHeader: React.SFC = () => {
  const columns = pushCampaignConfig.map((fieldName, index) => {
    return <th key={index}>{fieldName.fieldTitle}</th>;
  });
  return (
    <thead className="thead-light">
      <tr>
        {columns}
      </tr>
    </thead>
  );
};

interface TableRowProps {
  pushCampaign: PushCampaign;
}

const TableRow: React.SFC<TableRowProps> = ({ pushCampaign }) => {
  const columns = pushCampaignConfig.map((fieldName, index) => {
    return <td key={index}><span>{pushCampaign[fieldName.field]}</span></td>;
  });
  return (
    <tr>
      {columns}
      <td>
        <Link className="btn btn-light" to={`/notification`}>
          Show
        </Link>
        &nbsp;
        <Link className="btn btn-light" to={`/notification`}>
          Edit
        </Link>
      </td>
    </tr>
  );
};

interface TableBodyProps {
  pushCampaigns: PushCampaign[];
}

const TableBody: React.SFC<TableBodyProps> = ({ pushCampaigns }) => {
  const rows = pushCampaigns.map((pushCampaign, index) => {
    return <TableRow key={index} pushCampaign={pushCampaign} />;
  });
  return <tbody>{rows}</tbody>;
};

interface ListTableProps {
  pushCampaigns: PushCampaign[];
}

const ListTable: React.SFC<ListTableProps> = ({ pushCampaigns }) => {
    return (
    <table key="table" className="table table-sm table-hover table-responsive">
      <TableHeader/>
      <TableBody pushCampaigns={pushCampaigns} />
    </table>
  );
};

export type PushNotificationListPageProps = StateProps & DispatchProps;

export interface StateProps {
  page: number;
  maxPage: number;
  isLoading: boolean;
  pushCampaigns: PushCampaign[];
}

export interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class PushNotificationListPageImpl extends React.PureComponent<PushNotificationListPageProps> {
  public notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: PushNotificationListPageProps) {
    super(props);

    const { dispatch } = this.props;

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(dispatch);
  }

  public componentDidMount() {
    const { page } = this.props;
    this.notificationActionDispatcher.fetchList(page, pageSize);
  }

  public render() {
    const {
      page,
      maxPage,
      isLoading,
      pushCampaigns
    } = this.props;

    return (
      <div>
        <div>
          <h1 className="display-4 d-inline-block">Push Notifications</h1>
          <Link
            className="btn btn-light float-right"
            to={`/notification/new`}
          >
            New Notification
          </Link>
        </div>
        <div className="table-responsive">
          {(() => {
            if (isLoading) {
              return <div>Loading...</div>;
            } else {
              if (pushCampaigns.length === 0) {
                return <div>No campaigns found.</div>;
              } else {
                return (
                  <ListTable
                    pushCampaigns={pushCampaigns}
                  />
                );
              }
            }
          })()}
          {maxPage > 0 ? (
            <Pagination
              key="pagination"
              pathname="/notification"
              currentPage={page}
              maxPage={maxPage}
              onItemClicked={this.onPageItemClicked}
            />
          ) : null}
        </div>
      </div>
    );
  }

  public onPageItemClicked = (page: number) => {
    this.notificationActionDispatcher.fetchList(page, pageSize);
  };
}

function PushNotificationListPageFactory() {
  function mapStateToProps(state: RootState): StateProps {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location ? location.search : '');
    const page = parseInt(pageStr, 10);
    const { isLoading, pushCampaigns, totalCount } = state.pushCampaign.list;

    const maxPage = Math.ceil(totalCount / pageSize);

    return {
      page,
      maxPage,
      isLoading,
      pushCampaigns
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  return connect(mapStateToProps, mapDispatchToProps)(PushNotificationListPageImpl);
}

export const PushNotificationListPage: React.ComponentClass<PushNotificationListPageProps> = PushNotificationListPageImpl;

export { PushNotificationListPageFactory };
