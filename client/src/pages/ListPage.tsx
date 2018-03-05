import classNames from 'classnames';
import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { dismissImport, importRecords } from '../actions/import';
import { RecordActionDispatcher } from '../actions/record';
import {
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterQueryType,
  FieldConfig,
  Filter,
  FilterConfig,
  FilterConfigTypes,
  filterFactory,
  FilterType,
  GeneralFilter,
  ImportActionConfig,
  IntegerFilter,
  IntegerFilterQueryType,
  ListActionConfig,
  ListActionConfigTypes,
  ListPageConfig,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';
import { ExportButton } from '../components/ExportButton';
import { FilterList } from '../components/FilterList';
import { ImportButton } from '../components/ImportButton';
import {
  ImportFailureModal,
  ImportingModal,
  ImportModal,
} from '../components/ImportModal';
import Pagination from '../components/Pagination';
import { Field, FieldContext } from '../fields';
import { ImportState, RootState } from '../states';
import { RemoteType } from '../types';
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
  import: ImportState;
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
      'list'
    );

    this.fetchList = debounce(this.fetchList.bind(this), 200);

    this.onImportFileSelected = this.onImportFileSelected.bind(this);
  }

  public componentDidMount() {
    const { page, pageConfig } = this.props;
    const { filters } = this.state;
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public toggleFilterMenu() {
    this.setState({ showfilterMenu: !this.state.showfilterMenu });
  }

  public handleQueryTypeChange(
    filter: Filter,
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const { page, pageConfig } = this.props;

    const filters = this.state.filters.map(f => {
      if (f.id === filter.id) {
        switch (filter.type) {
          case FilterType.StringFilterType:
            return {
              ...f,
              query: StringFilterQueryType[event.target.value],
            };
          case FilterType.IntegerFilterType:
            return {
              ...f,
              query: IntegerFilterQueryType[event.target.value],
            };
          case FilterType.BooleanFilterType:
            return {
              ...f,
              query: BooleanFilterQueryType[event.target.value],
            };
          case FilterType.DateTimeFilterType:
            return {
              ...f,
              query: DateTimeFilterQueryType[event.target.value],
            };
          default:
            throw new Error(
              `handleQueryTypeChange does not support FilterType ${f.type}`
            );
        }
      }
      return f;
    });

    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public handleFilterValueChange(
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { page, pageConfig } = this.props;
    const filters = this.state.filters.map(f => {
      if (f.id === filter.id) {
        switch (filter.type) {
          case FilterType.StringFilterType:
            return { ...(f as StringFilter), value: event.target.value };
          case FilterType.IntegerFilterType:
            return {
              ...(f as IntegerFilter),
              value: Number(event.target.value),
            };
          case FilterType.BooleanFilterType:
          case FilterType.DateTimeFilterType:
            return f;
          case FilterType.GeneralFilterType:
            return { ...(f as GeneralFilter), value: event.target.value };
          default:
            throw new Error(
              `handleFilterValueChange does not support FilterType ${f.type}`
            );
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
        return { ...(f as DateTimeFilter), value: datetime };
      } else {
        return f;
      }
    });
    this.setState({ filters });
    this.fetchList(page, pageConfig.perPage, filters);
  }

  public onFilterItemClicked(filterConfig: FilterConfig) {
    const { page, pageConfig } = this.props;
    const newFilter = filterFactory(filterConfig);

    const filters =
      filterConfig.type === FilterConfigTypes.General
        ? [newFilter]
        : [
            ...this.state.filters.filter(
              f => f.type !== FilterType.GeneralFilterType
            ),
            newFilter,
          ];

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

  public onImportFileSelected(actionConfig: ImportActionConfig, file: File) {
    const { dispatch } = this.props;
    dispatch(importRecords(actionConfig.name, file));
  }

  public renderActionButton(
    recordName: string,
    actionConfig: ListActionConfig
  ) {
    switch (actionConfig.type) {
      case ListActionConfigTypes.Export:
        return <ExportButton actionConfig={actionConfig} />;
      case ListActionConfigTypes.Import:
        return (
          <ImportButton
            actionConfig={actionConfig}
            onFileSelected={this.onImportFileSelected}
          />
        );
      default:
        return null;
    }
  }

  public renderActionButtons() {
    const { recordName, pageConfig: { actions } } = this.props;

    // TODO (Steven-Chan):
    // Add action type `New`
    const newRecordButton = (
      <Link
        className="btn btn-light float-right"
        to={`/records/${recordName}/new`}
      >
        New
      </Link>
    );

    const actionsButtons = [
      ...actions.map(action => this.renderActionButton(recordName, action)),
      newRecordButton,
    ];

    return actionsButtons.reduce((
      prev: JSX.Element | null,
      current: JSX.Element | null,
      index: number
      // tslint:disable-next-line: no-any
    ): any => [prev, <span key={index}>&nbsp;</span>, current]);
  }

  public renderImportModal() {
    const dispatch = this.props.dispatch;
    const importState = this.props.import;
    const { importResult, errorMessage } = importState;

    if (!importResult) {
      return undefined;
    }

    switch (importResult.type) {
      case RemoteType.Failure:
        return (
          <ImportFailureModal
            onDismiss={() => dispatch(dismissImport())}
            errorMessage={errorMessage}
          />
        );
      case RemoteType.Loading:
        return <ImportingModal />;
      case RemoteType.Success:
        return (
          <ImportModal
            onDismiss={() => dispatch(dismissImport())}
            result={importResult.value}
          />
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

    const { showfilterMenu, filters } = this.state;

    return (
      <div>
        {this.renderImportModal()}
        <div className="navbar">
          <h1 className="display-4">{pageConfig.label}</h1>
          <div className="float-right">
            {pageConfig.filters && (
              <div className="dropdown float-right ml-2">
                <button
                  type="button"
                  className="btn btn-primary dropdown-toggle"
                  onClick={() => this.toggleFilterMenu()}
                >
                  Add Filter <span className="caret" />
                </button>

                <div
                  style={{ right: 0, left: 'unset' }}
                  className={classNames(
                    'dropdown-menu-right',
                    'dropdown-menu',
                    showfilterMenu ? 'show' : ''
                  )}
                >
                  {pageConfig.filters.map(filterConfig => (
                    <a
                      key={filterConfig.label}
                      className="dropdown-item"
                      onClick={() => this.onFilterItemClicked(filterConfig)}
                    >
                      {filterConfig.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {this.renderActionButtons()}
          </div>
        </div>

        <div className="float-right">
          <FilterList
            filters={filters}
            handleQueryTypeChange={(filter, evt) =>
              this.handleQueryTypeChange(filter, evt)}
            handleFilterValueChange={(filter, evt) =>
              this.handleFilterValueChange(filter, evt)}
            onCloseFilterClicked={filter => this.onCloseFilterClicked(filter)}
            handleDateTimeValueChange={(filter, datetime) =>
              this.handleDateTimeValueChange(filter, datetime)}
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
      import: state.import,
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
