import './ListPage.scss';

import classNames from 'classnames';
import { Location } from 'history';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { dismissImport, ImportAttrs, importRecords } from '../actions/import';
import {
  applyPredicatesToQuery,
  queryWithFilters,
  RecordActionDispatcher,
} from '../actions/record';
import {
  ActionConfigTypes,
  CmsRecord,
  ExportActionConfig,
  FieldConfig,
  FieldConfigTypes,
  Filter,
  FilterConfig,
  ImportActionConfig,
  ListActionConfig,
  ListItemActionConfig,
  ListPageConfig,
} from '../cmsConfig';
import { Predicate } from '../cmsConfig/predicateConfig';
import { ClickOutside } from '../components/ClickOutside';
import { ExportModal } from '../components/ExportModal';
import { FilterMenu } from '../components/FilterMenu';
import { FilterTagList } from '../components/FilterTagList';
import { ImportModal } from '../components/ImportModal/ImportModal';
import {
  ImportFailureModal,
  ImportingModal,
  ImportResultModal,
} from '../components/ImportModal/ImportResultModal';
import { LinkButton } from '../components/LinkButton';
import { PageActionButton } from '../components/PageActionButton';
import Pagination from '../components/Pagination';
import { SortButton } from '../components/SortButton';
import {
  InjectedProps as SyncFilterProps,
  syncFilterWithUrl,
} from '../components/SyncUrl/SyncUrlFilter';
import {
  InjectedProps as SyncPageProps,
  syncPageWithUrl,
} from '../components/SyncUrl/SyncUrlPage';
import {
  InjectedProps as SyncSortProps,
  syncSortWithUrl,
} from '../components/SyncUrl/SyncUrlSort';
import { ToggleButton } from '../components/ToggleButton';
import { Field, FieldContext } from '../fields';
import { getCmsConfig, ImportState, RootState, RouteProps } from '../states';
import { isSortStateEqual, RemoteType, SortOrder, SortState } from '../types';
import { debounce } from '../util';

export type SortButtonClickHandler = (name: string) => void;

export function nextSortState(
  sortState: SortState,
  selectedFieldName: string
): SortState {
  if (sortState.fieldName !== selectedFieldName) {
    return { fieldName: selectedFieldName, order: SortOrder.Ascending };
  }

  // derive next sort order
  let order: SortOrder = SortOrder.Undefined;
  switch (sortState.order) {
    case SortOrder.Undefined:
      order = SortOrder.Ascending;
      break;
    case SortOrder.Ascending:
      order = SortOrder.Descending;
      break;
    case SortOrder.Descending:
      order = SortOrder.Undefined;
      break;
  }

  return {
    fieldName: order === SortOrder.Undefined ? undefined : sortState.fieldName,
    order,
  };
}

interface TableHeaderColumnProps {
  fieldConfig: FieldConfig;
  sortState: SortState;
  onSortButtonClick: SortButtonClickHandler;
}

const TableHeaderColumn: React.SFC<TableHeaderColumnProps> = ({
  fieldConfig,
  sortState,
  onSortButtonClick,
}) => {
  const sortableFieldType = [
    FieldConfigTypes.Boolean,
    FieldConfigTypes.DateTimeDisplay,
    FieldConfigTypes.DateTimePicker,
    FieldConfigTypes.Dropdown,
    FieldConfigTypes.FloatDisplay,
    FieldConfigTypes.FloatInput,
    FieldConfigTypes.IntegerDisplay,
    FieldConfigTypes.IntegerInput,
    FieldConfigTypes.TextArea,
    FieldConfigTypes.TextDisplay,
    FieldConfigTypes.TextInput,
    FieldConfigTypes.WYSIWYG,
  ];

  const sortButton =
    sortableFieldType.indexOf(fieldConfig.type) !== -1 ? (
      <SortButton
        className="d-inline-block mx-1"
        sortOrder={
          fieldConfig.name === sortState.fieldName
            ? sortState.order
            : SortOrder.Undefined
        }
        onClick={() => onSortButtonClick(fieldConfig.name)}
      />
    ) : null;

  return (
    <div className="table-cell">
      {fieldConfig.label}
      {sortButton}
    </div>
  );
};

interface TableHeaderProps {
  fieldConfigs: FieldConfig[];
  sortState: SortState;
  onSortButtonClick: SortButtonClickHandler;
}

const TableHeader: React.SFC<TableHeaderProps> = ({
  fieldConfigs,
  sortState,
  onSortButtonClick,
}) => {
  return (
    <div className="table-header">
      <div className="table-row">
        {fieldConfigs.map((fieldConfig, index) => (
          <TableHeaderColumn
            key={index}
            fieldConfig={fieldConfig}
            sortState={sortState}
            onSortButtonClick={onSortButtonClick}
          />
        ))}
        <div className="table-cell" />
      </div>
    </div>
  );
};

interface TableRowProps {
  cmsRecord: CmsRecord;
  fieldConfigs: FieldConfig[];
  itemActions: ListItemActionConfig[];
  record: Record;
}

const TableRow: React.SFC<TableRowProps> = ({
  cmsRecord,
  fieldConfigs,
  itemActions,
  record,
}) => {
  const columns = fieldConfigs.map((fieldConfig, index) => {
    return (
      <div key={index} className="table-cell">
        <Field
          config={fieldConfig}
          value={record[fieldConfig.name]}
          context={FieldContext(record)}
        />
      </div>
    );
  });

  return (
    <div className="table-row">
      {columns}
      <div className="table-cell">
        {itemActions.map((action, index) => (
          <LinkButton
            key={index}
            className="item-action"
            actionConfig={action}
            context={{ record, cmsRecord }}
          />
        ))}
      </div>
    </div>
  );
};

interface TableBodyProps {
  cmsRecord: CmsRecord;
  fieldConfigs: FieldConfig[];
  itemActions: ListItemActionConfig[];
  records: Record[];
}

const TableBody: React.SFC<TableBodyProps> = ({
  cmsRecord,
  fieldConfigs,
  itemActions,
  records,
}) => {
  const rows = records.map((record, index) => {
    return (
      <TableRow
        key={index}
        cmsRecord={cmsRecord}
        fieldConfigs={fieldConfigs}
        itemActions={itemActions}
        record={record}
      />
    );
  });
  return <div className="table-body">{rows}</div>;
};

interface ListTableProps {
  cmsRecord: CmsRecord;
  fieldConfigs: FieldConfig[];
  itemActions: ListItemActionConfig[];
  sortState: SortState;
  onSortButtonClick: SortButtonClickHandler;
  records: Record[];
}

const ListTable: React.SFC<ListTableProps> = ({
  cmsRecord,
  fieldConfigs,
  itemActions,
  onSortButtonClick,
  records,
  sortState,
}) => {
  return (
    <div key="table" className="list-table">
      <TableHeader
        fieldConfigs={fieldConfigs}
        sortState={sortState}
        onSortButtonClick={onSortButtonClick}
      />
      <TableBody
        cmsRecord={cmsRecord}
        fieldConfigs={fieldConfigs}
        itemActions={itemActions}
        records={records}
      />
    </div>
  );
};

export type ListPageProps = StateProps &
  DispatchProps &
  SyncFilterProps &
  SyncPageProps &
  SyncSortProps;

export interface StateProps {
  filterConfigs: FilterConfig[];
  import: ImportState;
  isLoading: boolean;
  location: Location;
  maxPage: number;
  pageConfig: ListPageConfig;
  recordName: string;
  records: Record[];
}

interface State {
  importing?: ImportActionConfig;
  exporting?: ExportActionConfig;
  showfilterMenu: boolean;
}

export interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class ListPageImpl extends React.PureComponent<ListPageProps, State> {
  recordActionCreator: RecordActionDispatcher;

  constructor(props: ListPageProps) {
    super(props);

    const {
      dispatch,
      pageConfig: { cmsRecord, references },
    } = this.props;

    this.state = {
      exporting: undefined,
      importing: undefined,
      showfilterMenu: false,
    };

    this.recordActionCreator = new RecordActionDispatcher(
      dispatch,
      cmsRecord,
      references,
      'list'
    );

    this.fetchList = debounce(this.fetchList, 200);
  }

  componentDidMount() {
    this.reloadList(this.props);
  }

  componentWillReceiveProps(nextProps: ListPageProps) {
    const {
      filters,
      import: { importResult },
      page,
      sortState,
    } = this.props;
    // Refresh list after import success
    if (
      (importResult &&
        importResult.type === RemoteType.Loading &&
        nextProps.import.importResult &&
        nextProps.import.importResult.type === RemoteType.Success) ||
      // Handle filters & page change by browser navigation
      (filters !== nextProps.filters ||
        page !== nextProps.page ||
        !isSortStateEqual(sortState, nextProps.sortState))
    ) {
      this.reloadList(nextProps);
    }
  }

  toggleFilterMenu() {
    this.setState({ showfilterMenu: !this.state.showfilterMenu });
  }

  onImportFile = (actionConfig: ImportActionConfig, attrs: ImportAttrs) => {
    const { dispatch } = this.props;
    dispatch(importRecords(actionConfig.name, attrs));
  };

  onFilterChange = (filters: Filter[]) => {
    this.props.onChangePage();
    this.props.onChangeFilter(filters);
  };

  onSortButtonClick = (name: string) => {
    const sortState = nextSortState(this.props.sortState, name);
    this.props.onChangeSort(sortState);
  };

  renderActionButton(
    cmsRecord: CmsRecord,
    actionConfig: ListActionConfig,
    index: number
  ) {
    switch (actionConfig.type) {
      case ActionConfigTypes.Export:
        return (
          <PageActionButton
            key={index}
            className="list-action primary-button"
            actionConfig={actionConfig}
            onClick={() => this.setState({ exporting: actionConfig })}
          />
        );
      case ActionConfigTypes.Import:
        return (
          <PageActionButton
            key={index}
            className="list-action primary-button"
            actionConfig={actionConfig}
            onClick={() => this.setState({ importing: actionConfig })}
          />
        );
      case ActionConfigTypes.Link:
        return (
          <LinkButton
            key={index}
            className="list-action primary-button"
            actionConfig={actionConfig}
            context={{
              cmsRecord,
            }}
          />
        );
      default:
        return null;
    }
  }

  renderActionButtons() {
    const {
      pageConfig: { actions, cmsRecord },
    } = this.props;
    const actionsButtons = actions.map((action, index) =>
      this.renderActionButton(cmsRecord, action, index)
    );
    return actionsButtons;
  }

  /**
   * Import modal is managed by two state
   *
   * 1. Whole import process -> this.state.importing: ImportActionConfig
   * 2. After importing starts -> this.props.import: ImportState
   */
  renderImportModal() {
    if (!this.state.importing) {
      return undefined;
    }

    const importState = this.props.import;
    const { importProgress, importResult, errorMessage } = importState;

    if (!importResult) {
      return (
        <ImportModal
          importConfig={this.state.importing}
          onDismiss={this.dismissImportModal}
          onImport={this.onImportFile}
        />
      );
    }

    switch (importResult.type) {
      case RemoteType.Failure:
        return (
          <ImportFailureModal
            importConfig={this.state.importing}
            onDismiss={this.dismissImportModal}
            errorMessage={errorMessage}
          />
        );
      case RemoteType.Loading:
        return (
          <ImportingModal
            importConfig={this.state.importing}
            importProgress={importProgress}
          />
        );
      case RemoteType.Success:
        return (
          <ImportResultModal
            importConfig={this.state.importing}
            onDismiss={this.dismissImportModal}
            result={importResult.value}
          />
        );
    }
  }

  renderExportModal() {
    if (!this.state.exporting) {
      return undefined;
    }

    const { filters, pageConfig, recordName: recordType } = this.props;
    const query = queryWithFilters(filters, Record.extend(recordType));
    applyPredicatesToQuery(query, pageConfig.predicates);

    return (
      <ExportModal
        query={query}
        actionConfig={this.state.exporting}
        onDismiss={() => this.setState({ exporting: undefined })}
      />
    );
  }

  render() {
    const {
      filters,
      location,
      pageConfig,
      page,
      maxPage,
      isLoading,
      records,
      sortState,
    } = this.props;

    const { showfilterMenu } = this.state;

    return (
      <div className="list-page">
        {this.renderImportModal()}
        {this.renderExportModal()}
        <div className="topbar">
          <div className="title">{pageConfig.label}</div>
          <div className="action-container">
            {this.renderActionButtons()}
            {pageConfig.filters && (
              <ClickOutside
                className={classNames('d-inline-block', {
                  dropdown: !showfilterMenu,
                  dropup: showfilterMenu,
                })}
                onClickOutside={() => this.setState({ showfilterMenu: false })}
              >
                <ToggleButton
                  type="button"
                  className="list-action dropdown-toggle"
                  isActive={showfilterMenu}
                  onClick={() => this.toggleFilterMenu()}
                >
                  Add Filter <span className="caret" />
                </ToggleButton>

                <div
                  className={classNames(
                    'list-filter-menu-wrapper',
                    showfilterMenu ? 'show' : ''
                  )}
                >
                  <div className="list-filter-menu">
                    <FilterMenu
                      filterConfigs={pageConfig.filters}
                      filters={filters}
                      onChangeFilter={this.onFilterChange}
                    />
                  </div>
                </div>
              </ClickOutside>
            )}
          </div>
        </div>

        {filters.length > 0 && (
          <div className="list-filter-tag-list-container">
            <div className="list-filter-tag-list-label">Filter</div>
            <FilterTagList
              className="list-filter-tag-list"
              filters={filters}
              filterConfigs={pageConfig.filters}
              onChangeFilter={this.onFilterChange}
            />
          </div>
        )}

        <div className="list-content">
          {(() => {
            if (isLoading) {
              return <div className="list-loading">Loading...</div>;
            } else {
              if (records.length === 0) {
                return <div className="list-empty">No records found.</div>;
              } else {
                return (
                  <ListTable
                    cmsRecord={pageConfig.cmsRecord}
                    fieldConfigs={pageConfig.fields}
                    itemActions={pageConfig.itemActions}
                    records={records}
                    sortState={sortState}
                    onSortButtonClick={this.onSortButtonClick}
                  />
                );
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

  fetchList = (
    page: number,
    perPage: number,
    filters: Filter[],
    predicates: Predicate[],
    sortState: SortState
  ) => {
    this.recordActionCreator.fetchList(
      page,
      perPage,
      filters,
      predicates,
      sortState.fieldName,
      sortState.order === SortOrder.Ascending
    );
  };

  reloadList(props: ListPageProps) {
    const { filters, page, pageConfig, sortState } = props;
    const derivedSortState =
      sortState.fieldName === undefined ? pageConfig.defaultSort : sortState;

    this.fetchList(
      page,
      pageConfig.perPage,
      filters,
      pageConfig.predicates,
      derivedSortState
    );
  }

  private dismissImportModal = () => {
    this.props.dispatch(dismissImport());
    this.setState({ importing: undefined });
  };
}

function ListPageFactory(recordName: string) {
  function mapStateToProps(state: RootState, props: RouteProps): StateProps {
    const { location } = props;

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
      pageConfig,
      recordName,
      records,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  const SyncedListPage = syncSortWithUrl(
    syncFilterWithUrl(syncPageWithUrl(ListPageImpl))
  );
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(SyncedListPage);
}

export const ListPage: React.ComponentClass<ListPageProps> = ListPageImpl;

export { ListPageFactory };
