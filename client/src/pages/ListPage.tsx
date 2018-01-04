import classNames from 'classnames';
import uuid from 'uuid';
import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { FieldConfig, Filter, FilterConfig, FilterConfigTypes, FilterType,
  ListPageConfig, StringFilterQueryType } from '../cmsConfig';
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

interface State {
  showfilterMenu: boolean;
  filters: Filter[];
}

export interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class ListPageImpl extends React.PureComponent<ListPageProps, State> {
  public recordActionCreator: RecordActionDispatcher;

  constructor(props: ListPageProps) {
    super(props);

    const { dispatch, pageConfig: { cmsRecord, references } } = this.props;
    const filters: Filter[] = [];

    this.state = {
      filters,
      showfilterMenu: false,
    };

    this.recordActionCreator = new RecordActionDispatcher(
      dispatch,
      cmsRecord,
      references,
    );

    this.toggleFilterMenu = this.toggleFilterMenu.bind(this); 
    this.onFilterItemClicked = this.onFilterItemClicked.bind(this);
    this.handleQueryTypeChange = this.handleQueryTypeChange.bind(this);
    this.onCloseFilterClicked = this.onCloseFilterClicked.bind(this);
  }

  public componentDidMount() {
    const { page, pageConfig } = this.props;

    this.recordActionCreator.fetchList(page, pageConfig.perPage);
  }

  public toggleFilterMenu() {
    this.setState({showfilterMenu: !this.state.showfilterMenu});
  }

  public handleQueryTypeChange(filter: Filter, event: React.ChangeEvent<HTMLSelectElement>) {
    switch (filter.type) {
      case FilterType.StringFilterType:
        this.setState({filters: this.state.filters.map(f => {
          if (f.id === filter.id) {
            return {...f,
              query: StringFilterQueryType[event.target.value],
            };
          }
          return f;
        })});
    }
  }

  public handleFilterValueChange(filter: Filter, event: React.ChangeEvent<HTMLInputElement>) {
    switch (filter.type) {
      case FilterType.StringFilterType:
        this.setState({filters: this.state.filters.map(f => {
          if (f.id === filter.id) {
            return {...f,
              value: event.target.value,
            };
          }
          return f;
        })});
    }
  }

  public onFilterItemClicked(filterConfig: FilterConfig) {
    switch (filterConfig.type) {
      case FilterConfigTypes.String:
        this.setState({filters: [...this.state.filters, {
          id: uuid(),
          name: filterConfig.name, 
          query: StringFilterQueryType.EqualTo,
          type: FilterType.StringFilterType,
          value: '',
        }]});
    }
    this.toggleFilterMenu();
  }

  public onCloseFilterClicked(filter: Filter) {
    this.setState(
      {filters: this.state.filters.filter(f => f.id !== filter.id)});
  }

  public renderFilter(filter: Filter) {
    switch (filter.type) {
      case FilterType.StringFilterType:
        return (
          <div key={filter.id} className="form-inline form-group">
            <button onClick={() => this.onCloseFilterClicked(filter)} type="button" className="close">
              <span>&times;</span>
            </button>
            <select 
              className="form-control"
              value={filter.query}
              onChange={event => this.handleQueryTypeChange(filter, event)} 
            >
              <option value={StringFilterQueryType.EqualTo}>Equal to</option>
              <option value={StringFilterQueryType.NotEqualTo}>Not equal to</option>
              <option value={StringFilterQueryType.Like}>Like</option>
              <option value={StringFilterQueryType.NotLike}>Not like</option>
            </select>
            <input 
              type="text"
              className="form-control"
              autoFocus={true}
              onChange={event => this.handleFilterValueChange(filter, event)}
              value={filter.value}
            />
          </div>
        );
    }
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

    const {
      showfilterMenu,
      filters,
    } = this.state;

    return (
      <div>
        <div className="navbar">
          <h1 className="display-4 d-inline-block">{pageConfig.label}</h1>
          <Link
            className="btn btn-light float-right"
            to={`/records/${recordName}/new`}
          >
            New
          </Link>
          { pageConfig.filters &&
            <div className="dropdown float-right">
              <button
                type="button"
                className="btn btn-primary dropdown-toggle"
                onClick={this.toggleFilterMenu}
              >
                Add Filter <span className="caret" />
              </button>

              <div
                style={{right: 0, left: 'unset'}} 
                className={classNames('dropdown-menu-right', 'dropdown-menu', showfilterMenu ? 'show' : '')}
              >
                { pageConfig.filters.map(filterConfig => 
                  <a
                    key={filterConfig.name} 
                    className="dropdown-item" 
                    onClick={() => this.onFilterItemClicked(filterConfig)}
                  >
                    {filterConfig.label}
                  </a>
                )}
              </div>
            </div>
          }
        </div>
      
        <div className="float-right">
          { filters.map(filter =>
            this.renderFilter(filter)
          )}
        </div>
          
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
