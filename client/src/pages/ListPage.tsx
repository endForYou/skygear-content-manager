import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionCreator } from '../actions/record';
import { FieldConfig, ListPageConfig } from '../cmsConfig';
import Pagination from '../components/Pagination';
import { RootState } from '../states';

interface TableHeaderProps {
  fieldConfigs: FieldConfig[];
}

const TableHeader: React.SFC<TableHeaderProps> = ({ fieldConfigs }) => {
  const columns = fieldConfigs.map((fieldConfig, index) => {
    return <th key={index}>{fieldConfig.label}</th>;
  });
  return (
    <thead className="thead-light">
      <tr>
        {columns}
        <th />
      </tr>
    </thead>
  );
};

interface TableRowProps {
  fieldConfigs: FieldConfig[];
  record: Record;
}

const TableRow: React.SFC<TableRowProps> = ({ fieldConfigs, record }) => {
  const columns = fieldConfigs.map((fieldConfig, index) => {
    return <td key={index}>{record[fieldConfig.name]}</td>;
  });
  return (
    <tr>
      {columns}
      <td>
        <Link className="btn btn-light" to={`/record/${record.id}`}>
          Show
        </Link>
        &nbsp;
        <Link className="btn btn-light" to={`/record/${record.id}/edit`}>
          Edit
        </Link>
      </td>
    </tr>
  );
};

interface TableBodyProps {
  fieldConfigs: FieldConfig[];
  records: Record[];
}

const TableBody: React.SFC<TableBodyProps> = ({ fieldConfigs, records }) => {
  const rows = records.map((record, index) => {
    return <TableRow key={index} fieldConfigs={fieldConfigs} record={record} />;
  });
  return <tbody>{rows}</tbody>;
};

interface ListTableProps {
  fieldConfigs: FieldConfig[];
  records: Record[];
}

const ListTable: React.SFC<ListTableProps> = ({ fieldConfigs, records }) => {
  return (
    <table key="table" className="table table-sm table-hover table-responsive">
      <TableHeader fieldConfigs={fieldConfigs} />
      <TableBody fieldConfigs={fieldConfigs} records={records} />
    </table>
  );
};

export type ListPageProps = StateProps & OwnProps;

interface StateProps {
  recordName: string;
  recordActionCreator: RecordActionCreator;
  pageConfig: ListPageConfig;
  page: number;
  maxPage: number;
  isLoading: boolean;
  records: Record[];
}

interface OwnProps {
  dispatch: Dispatch<RootState>;
}

class ListPage extends React.PureComponent<ListPageProps> {
  public componentDidMount() {
    const { dispatch, recordActionCreator, page, pageConfig } = this.props;

    dispatch(recordActionCreator.fetchList(page, pageConfig.perPage));
  }

  public render() {
    const {
      recordName,
      pageConfig,
      page,
      maxPage,
      isLoading,
      records,
    } = this.props;

    return (
      <div>
        <h1 className="display-4">{pageConfig.label}</h1>
        <div className="table-responsive">
          {(() => {
            if (isLoading) {
              return <div>Loading...</div>;
            } else {
              if (records.length === 0) {
                return <div>No records found.</div>;
              } else {
                return (
                  <ListTable
                    fieldConfigs={pageConfig.fields}
                    records={records}
                  />
                );
              }
            }
          })()}
          {maxPage > 0 ? (
            <Pagination
              key="pagination"
              recordName={recordName}
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
    const { dispatch, pageConfig, recordActionCreator } = this.props;

    dispatch(recordActionCreator.fetchList(page, pageConfig.perPage));
  };
}

function ListPageFactory(recordName: string) {
  function mapStateToProps(state: RootState, ownProps: OwnProps): StateProps {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location ? location.search : '');
    const page = parseInt(pageStr, 10);

    const recordConfig = state.cmsConfig.records[recordName];
    if (recordConfig == null) {
      throw new Error(
        `Couldn't find RecordConfig for record name = ${recordName}`
      );
    }

    const { cmsRecord, list: pageConfig } = recordConfig;
    if (pageConfig == null) {
      throw new Error(`Couldn't find PageConfig of list view`);
    }

    const { isLoading, records, totalCount } = state.recordViewsByName[
      recordName
    ].list;

    const recordActionCreator = new RecordActionCreator(cmsRecord);

    const maxPage = Math.ceil(totalCount / pageConfig.perPage);

    return {
      isLoading,
      maxPage,
      page,
      pageConfig,
      recordActionCreator,
      recordName,
      records,
    };
  }

  return connect(mapStateToProps)(ListPage);
}

export { ListPage, ListPageFactory };
