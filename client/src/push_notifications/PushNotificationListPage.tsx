import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// import { Record } from 'skygear';

import Pagination from '../components/Pagination';
import { PushCampaignActionDispatcher } from '../actions/push_campaign';
import { RootState } from '../states';
// import { Remote } from '../types';
// import { Field, FieldContext } from '../fields';
// import { FieldConfig } from '../cmsConfig';



// interface TableHeaderProps {
//   fieldConfigs: FieldConfig[];
// }

// const TableHeader: React.SFC<TableHeaderProps> = ({ fieldConfigs }) => {
//   const columns = fieldConfigs.map((fieldConfig, index) => {
//     return <th key={index}>{fieldConfig.label}</th>;
//   });
//   return (
//     <thead className="thead-light">
//       <tr>
//         {columns}
//         <th />
//       </tr>
//     </thead>
//   );
// };

// interface TableRowProps {
//   fieldConfigs: FieldConfig[];
//   record: Record;
// }

// const TableRow: React.SFC<TableRowProps> = ({ fieldConfigs, record }) => {
//   const columns = fieldConfigs.map((fieldConfig, index) => {
//     return (
//       <td key={index}>
//         <Field
//           config={fieldConfig}
//           value={record[fieldConfig.name]}
//           context={FieldContext(record)}
//         />
//       </td>
//     );
//   });
//   return (
//     <tr>
//       {columns}
//     </tr>
//   );
// };

// interface TableBodyProps {
//   fieldConfigs: FieldConfig[];
//   records: Record[];
// }

// const TableBody: React.SFC<TableBodyProps> = ({ fieldConfigs, records }) => {
//   const rows = records.map((record, index) => {
//     return <TableRow key={index} fieldConfigs={fieldConfigs} record={record} />;
//   });
//   return <tbody>{rows}</tbody>;
// };

// interface ListTableProps {
//   fieldConfigs: FieldConfig[];
//   records: Record[];
// }

// const ListTable: React.SFC<ListTableProps> = ({ fieldConfigs, records }) => {
//   return (
//     <table key="table" className="table table-sm table-hover table-responsive">
//       <TableHeader fieldConfigs={fieldConfigs} />
//       <TableBody fieldConfigs={fieldConfigs} records={records} />
//     </table>
//   );
// };

export type PushNotificationListPageProps = StateProps & DispatchProps;

export interface StateProps {
  page: number;
  maxPage: number;
  isLoading: boolean;
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
    this.notificationActionDispatcher.fetchList(page, 25);
  }

  public render() {
    const {
      page,
      maxPage,
      isLoading,
    } = this.props;

    return (
      <div>
        <h1 className="display-4">Push Notifications</h1>
        <div className="table-responsive">
          {(() => {
            if (isLoading) {
              return <div>Loading...</div>;
            } else {
              return <div>No campaigns found.</div>;
            }
          })()}
          {maxPage > 0 ? (
            <Pagination
              key="pagination"
              recordName="Push Campaign"
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
    this.notificationActionDispatcher.fetchList(page, 25);
  };
}

function PushNotificationListPageFactory() {
  function mapStateToProps(state: RootState): StateProps {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location ? location.search : '');
    const page = parseInt(pageStr, 10);
    const maxPage: number = 1;

    return {
      page,
      maxPage,
      isLoading: false
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  return connect(mapStateToProps, mapDispatchToProps)(PushNotificationListPageImpl);
}

export const PushNotificationListPage: React.ComponentClass<PushNotificationListPageProps> = PushNotificationListPageImpl;

export { PushNotificationListPageFactory };
