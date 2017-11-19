import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { FieldConfig, ListPageConfig } from '../cmsConfig';
import Pagination from '../components/Pagination';
import { Field, FieldContext } from '../fields';
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
    return (
      <td key={index}>
        <Field
          config={fieldConfig}
          value={record[fieldConfig.name]}
          context={FieldContext(record)}
        />
      </td>
    );
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

export type ListPageProps = StateProps & DispatchProps;

export interface StateProps {
  recordName: string;
  pageConfig: ListPageConfig;
  page: number;
  maxPage: number;
  isLoading: boolean;
  records: Record[];
}

export interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class ListPageImpl extends React.PureComponent<ListPageProps> {
  public recordActionCreator: RecordActionDispatcher;

  constructor(props: ListPageProps) {
    super(props);

    const { dispatch, pageConfig: { cmsRecord, references } } = this.props;

    this.recordActionCreator = new RecordActionDispatcher(
      dispatch,
      cmsRecord,
      references
    );
  }

  public componentDidMount() {
    const { page, pageConfig } = this.props;

    this.recordActionCreator.fetchList(page, pageConfig.perPage);
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
    const { pageConfig } = this.props;

    this.recordActionCreator.fetchList(page, pageConfig.perPage);
  };
}

function ListPageFactory(recordName: string) {
  function mapStateToProps(state: RootState): StateProps {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location ? location.search : '');
    const page = parseInt(pageStr, 10);

    const recordConfig = state.cmsConfig.records[recordName];
    if (recordConfig == null) {
      throw new Error(
        `Couldn't find RecordConfig for record name = ${recordName}`
      );
    }

    const { list: pageConfig } = recordConfig;
    if (pageConfig == null) {
      throw new Error(`Couldn't find PageConfig of list view`);
    }

    const { isLoading, records, totalCount } = state.recordViewsByName[
      recordName
    ].list;

    const maxPage = Math.ceil(totalCount / pageConfig.perPage);

    return {
      isLoading,
      maxPage,
      page,
      pageConfig,
      recordName,
      records,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  return connect(mapStateToProps, mapDispatchToProps)(ListPageImpl);
}

export const ListPage: React.ComponentClass<ListPageProps> = ListPageImpl;

export { ListPageFactory };
