import classNames from 'classnames';
import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Record } from 'skygear';
import uuid from 'uuid';

import { RecordActionDispatcher } from '../actions/record';
import { 
  BooleanFilterQueryType, 
  DateTimeFilter, 
  DateTimeFilterQueryType, 
  FieldConfig, 
  Filter, 
  FilterConfig, 
  FilterConfigTypes, 
  FilterType,
  GeneralFilter, 
  GeneralFilterQueryType,
  IntegerFilter, 
  IntegerFilterQueryType, 
  ListPageConfig, 
  StringFilter, 
  StringFilterQueryType } from '../cmsConfig';
import { FilterList } from '../components/FilterList';
import Pagination from '../components/Pagination';
import { Field, FieldContext } from '../fields';
import { RootState } from '../states';
import { debounce } from '../util';

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
    this.handleQueryTypeChange = this.handleQueryTypeChange.bind(this);
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
    this.handleDateTimeValueChange = this.handleDateTimeValueChange.bind(this); 
    this.onCloseFilterClicked = this.onCloseFilterClicked.bind(this);
    this.fetchList = debounce(this.fetchList.bind(this), 200);
  }

  public componentDidMount() {
    const { page, pageConfig } = this.props;
    const { filters } = this.state;
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public toggleFilterMenu() {
    this.setState({showfilterMenu: !this.state.showfilterMenu});
  }

  public handleQueryTypeChange(filter: Filter, event: React.ChangeEvent<HTMLSelectElement>) {
    const { page, pageConfig } = this.props;

    const filters = this.state.filters.map(f => {
      if (f.id === filter.id) {
        switch (filter.type) {
          case FilterType.StringFilterType:
            return {...f,
              query: StringFilterQueryType[event.target.value],
            };
          case FilterType.IntegerFilterType:
            return {...f,
              query: IntegerFilterQueryType[event.target.value],
            };
          case FilterType.BooleanFilterType:
            return {...f,
              query: BooleanFilterQueryType[event.target.value],
            };
          case FilterType.DateTimeFilterType:
            return {...f,
              query: DateTimeFilterQueryType[event.target.value],
            };
        }
      }
      return f;
    });

    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public handleFilterValueChange(filter: Filter, event: React.ChangeEvent<HTMLInputElement>) {
    const { page, pageConfig } = this.props;
    const filters = this.state.filters.map(f => {
      if (f.id === filter.id) {
        switch (filter.type) {
          case FilterType.StringFilterType:
            return  {...(f as StringFilter), value: event.target.value};
          case FilterType.IntegerFilterType:
            return  {...(f as IntegerFilter), value: Number(event.target.value)};
          case FilterType.BooleanFilterType:
          case FilterType.DateTimeFilterType:
            return f;
          case FilterType.GeneralFilterType:
            return  {...(f as GeneralFilter), value: event.target.value};
          }
      }
      return f;
    });

    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public handleDateTimeValueChange(filter: Filter, datetime: Date) {
    const { page, pageConfig } = this.props;
    const filters = this.state.filters.map(f => {
      if (f.id === filter.id) {
        return  {...(f as DateTimeFilter), value: datetime};
      } else {
        return f;
      }
    });
    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public onFilterItemClicked(filterConfig: FilterConfig) {
    const { page, pageConfig } = this.props;
    let filters = this.state.filters; 

    if (filterConfig.type === FilterConfigTypes.General) {
      filters = [{
        id: uuid(),
        label: filterConfig.label,
        names: filterConfig.names, 
        query: GeneralFilterQueryType.Contains,
        type: FilterType.GeneralFilterType,
        value: '',
      }];
    } else {
      filters = filters.filter(f => f.type !== FilterType.GeneralFilterType);
      switch (filterConfig.type) {
        case FilterConfigTypes.String:
          filters = [...filters, {
            id: uuid(),
            label: filterConfig.label,
            name: filterConfig.name, 
            query: StringFilterQueryType.EqualTo,
            type: FilterType.StringFilterType,
            value: '',
          }];
          break;
        case FilterConfigTypes.Integer:
          filters = [...filters, {
            id: uuid(),
            label: filterConfig.label,
            name: filterConfig.name, 
            query: IntegerFilterQueryType.EqualTo,
            type: FilterType.IntegerFilterType,
            value: 0,
          }];
          break;
        case FilterConfigTypes.Boolean:
          filters = [...filters, {
            id: uuid(),
            label: filterConfig.label,
            name: filterConfig.name, 
            query: BooleanFilterQueryType.True,
            type: FilterType.BooleanFilterType,
          }];
          break;
        case FilterConfigTypes.DateTime:
          filters = [...filters, {
            id: uuid(),
            label: filterConfig.label,
            name: filterConfig.name, 
            query: DateTimeFilterQueryType.Before,
            type: FilterType.DateTimeFilterType,
            value: new Date(),
          }];
          break;
      }
    }

    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
    this.toggleFilterMenu();
  }

  public onCloseFilterClicked(filter: Filter) {
    const { page, pageConfig } = this.props;
    const filters = this.state.filters.filter(f => f.id !== filter.id);
    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
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
                    key={filterConfig.label} 
                    className="dropdown-item" 
                    onClick={() => this.onFilterItemClicked(filterConfig)}
                  >
                    {filterConfig.label}
                  </a>
                )}
              </div>
            </div>
          }
          <Link
            className="btn btn-light float-right"
            to={`/records/${recordName}/new`}
          >
            New
          </Link>
        </div>
      
        <div className="float-right">
          <FilterList
            filters={filters}
            handleQueryTypeChange={this.handleQueryTypeChange}
            handleFilterValueChange={this.handleFilterValueChange}
            onCloseFilterClicked={this.onCloseFilterClicked}
            handleDateTimeValueChange={this.handleDateTimeValueChange}
          />
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
    const { filters } = this.state;
    this.fetchList(page, pageConfig.perPage, filters);
  };

  public fetchList(page: number, perPage: number, filters: Filter[]) {
    this.recordActionCreator.fetchList(page, perPage, filters);
  }

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
