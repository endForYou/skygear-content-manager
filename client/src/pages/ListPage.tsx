import classNames from 'classnames';
import { Location } from 'history';
import * as qs from 'query-string';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { dismissImport, importRecords } from '../actions/import';
import { queryWithFilters, RecordActionDispatcher } from '../actions/record';
import {
  ActionConfigTypes,
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterQueryType,
  ExportActionConfig,
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
  ListItemActionConfig,
  ListPageConfig,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';
import { ExportButton } from '../components/ExportButton';
import { ExportModal } from '../components/ExportModal';
import { FilterList } from '../components/FilterList';
import { ImportButton } from '../components/ImportButton';
import {
  ImportFailureModal,
  ImportingModal,
  ImportModal,
} from '../components/ImportModal';
import { LinkButton } from '../components/LinkButton';
import Pagination from '../components/Pagination';
import SyncUrl, { InjectedProps } from '../components/SyncUrl';
import { Field, FieldContext } from '../fields';
import { getCmsConfig, ImportState, RootState } from '../states';
import { RemoteType } from '../types';
import { debounce } from '../util';

// tslint:disable: no-any
function joinElements(els: any[]) {
  if (els.length === 0) {
    return els;
  }

  return els.reduce((prev: any, current: any, index: number): any => [
    prev,
    <span key={`${index}-space`}>&nbsp;</span>,
    current,
  ]);
}
// tslint:enable: no-any

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
  itemActions: ListItemActionConfig[];
  record: Record;
}

const TableRow: React.SFC<TableRowProps> = ({
  fieldConfigs,
  itemActions,
  record,
}) => {
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
        {joinElements(
          itemActions.map((action, index) => (
            <LinkButton
              key={index}
              actionConfig={action}
              context={{ record }}
            />
          ))
        )}
      </td>
    </tr>
  );
};

interface TableBodyProps {
  fieldConfigs: FieldConfig[];
  itemActions: ListItemActionConfig[];
  records: Record[];
}

const TableBody: React.SFC<TableBodyProps> = ({
  fieldConfigs,
  itemActions,
  records,
}) => {
  const rows = records.map((record, index) => {
    return (
      <TableRow
        key={index}
        fieldConfigs={fieldConfigs}
        itemActions={itemActions}
        record={record}
      />
    );
  });
  return <tbody>{rows}</tbody>;
};

interface ListTableProps {
  fieldConfigs: FieldConfig[];
  itemActions: ListItemActionConfig[];
  records: Record[];
}

const ListTable: React.SFC<ListTableProps> = ({
  fieldConfigs,
  itemActions,
  records,
}) => {
  return (
    <table key="table" className="table table-sm table-hover table-responsive">
      <TableHeader fieldConfigs={fieldConfigs} />
      <TableBody
        fieldConfigs={fieldConfigs}
        itemActions={itemActions}
        records={records}
      />
    </table>
  );
};

export type ListPageProps = StateProps & DispatchProps & InjectedProps;

export interface StateProps {
  filterConfigs: FilterConfig[];
  import: ImportState;
  isLoading: boolean;
  location: Location | null;
  maxPage: number;
  page: number;
  pageConfig: ListPageConfig;
  recordName: string;
  records: Record[];
}

interface State {
  exporting?: ExportActionConfig;
  showfilterMenu: boolean;
}

export interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class ListPageImpl extends React.PureComponent<ListPageProps, State> {
  public recordActionCreator: RecordActionDispatcher;

  constructor(props: ListPageProps) {
    super(props);

    const { dispatch, pageConfig: { cmsRecord, references } } = this.props;

    this.state = {
      exporting: undefined,
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
    this.reloadList(this.props);
  }

  public componentWillReceiveProps(nextProps: ListPageProps) {
    const { filters, import: { importResult }, page } = this.props;
    // Refresh list after import success
    if (
      (importResult &&
        importResult.type === RemoteType.Loading &&
        nextProps.import.importResult &&
        nextProps.import.importResult.type === RemoteType.Success) ||
      // Handle filters & page change by browser navigation
      (filters !== nextProps.filters || page !== nextProps.page)
    ) {
      this.reloadList(nextProps);
    }
  }

  public toggleFilterMenu() {
    this.setState({ showfilterMenu: !this.state.showfilterMenu });
  }

  public handleQueryTypeChange(
    filter: Filter,
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const filters = this.props.filters.map(f => {
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

    this.props.onChangeFilter(filters);
  }

  public handleFilterValueChange(
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const filters = this.props.filters.map(f => {
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

    this.props.onChangeFilter(filters);
  }

  public handleDateTimeValueChange(filter: Filter, datetime: Date) {
    const filters = this.props.filters.map(f => {
      if (f.id === filter.id) {
        return { ...(f as DateTimeFilter), value: datetime };
      } else {
        return f;
      }
    });
    this.props.onChangeFilter(filters);
  }

  public onFilterItemClicked(filterConfig: FilterConfig) {
    const newFilter = filterFactory(filterConfig);

    const filters =
      filterConfig.type === FilterConfigTypes.General
        ? [newFilter]
        : [
            ...this.props.filters.filter(
              f => f.type !== FilterType.GeneralFilterType
            ),
            newFilter,
          ];

    this.props.onChangeFilter(filters);
    this.toggleFilterMenu();
  }

  public onCloseFilterClicked(filter: Filter) {
    const filters = this.props.filters.filter(f => f.id !== filter.id);
    this.props.onChangeFilter(filters);
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
      case ActionConfigTypes.Export:
        return (
          <ExportButton
            actionConfig={actionConfig}
            onClick={() => this.setState({ exporting: actionConfig })}
          />
        );
      case ActionConfigTypes.Import:
        return (
          <ImportButton
            actionConfig={actionConfig}
            onFileSelected={this.onImportFileSelected}
          />
        );
      case ActionConfigTypes.Link:
        return (
          <LinkButton
            actionConfig={actionConfig}
            context={{
              record_type: recordName,
            }}
          />
        );
      default:
        return null;
    }
  }

  public renderActionButtons() {
    const { recordName, pageConfig: { actions } } = this.props;
    const actionsButtons = actions.map(action =>
      this.renderActionButton(recordName, action)
    );
    return joinElements(actionsButtons);
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

  public renderExportModal() {
    if (!this.state.exporting) {
      return undefined;
    }

    const { filters, recordName: recordType } = this.props;
    const query = queryWithFilters(filters, Record.extend(recordType));

    return (
      <ExportModal
        query={query}
        actionConfig={this.state.exporting}
        onDismiss={() => this.setState({ exporting: undefined })}
      />
    );
  }

  public render() {
    const {
      filters,
      recordName,
      pageConfig,
      page,
      maxPage,
      isLoading,
      records,
    } = this.props;

    const { showfilterMenu } = this.state;
    const pathname = `/records/${recordName}`;

    return (
      <div>
        {this.renderImportModal()}
        {this.renderExportModal()}
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
                    itemActions={pageConfig.itemActions}
                    records={records}
                  />
                );
              }
            }
          })()}
          {maxPage > 0 ? (
            <Pagination
              key="pagination"
              pathname={pathname}
              currentPage={page}
              maxPage={maxPage}
            />
          ) : null}
        </div>
      </div>
    );
  }

  public fetchList(page: number, perPage: number, filters: Filter[]) {
    this.recordActionCreator.fetchList(page, perPage, filters);
  }

  public reloadList(props: ListPageProps) {
    const { filters, page, pageConfig } = props;
    this.fetchList(page, pageConfig.perPage, filters);
  }
}

function ListPageFactory(recordName: string) {
  function mapStateToProps(state: RootState): StateProps {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location ? location.search : '');
    const page = parseInt(pageStr, 10);

    const recordConfig = getCmsConfig(state).records[recordName];
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
      filterConfigs: pageConfig.filters,
      import: state.import,
      isLoading,
      location,
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

  const SyncedListPage = SyncUrl(ListPageImpl);
  return connect(mapStateToProps, mapDispatchToProps)(SyncedListPage);
}

export const ListPage: React.ComponentClass<ListPageProps> = ListPageImpl;

export { ListPageFactory };
