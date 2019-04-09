import './FileImportPage.scss';

import classnames from 'classnames';
import { Location } from 'history';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

import { FileImportActionDispatcher } from '../../actions/fileImport';
import { Filter, FilterConfig, FilterConfigTypes } from '../../cmsConfig';
import { FilterMenu } from '../../components/FilterMenu';
import { FilterTagList } from '../../components/FilterTagList';
import Pagination from '../../components/Pagination';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SortButton } from '../../components/SortButton';
import {
  InjectedProps as SyncFilterProps,
  syncFilterWithUrl,
} from '../../components/SyncUrl/SyncUrlFilter';
import {
  InjectedProps as SyncPageProps,
  syncPageWithUrl,
} from '../../components/SyncUrl/SyncUrlPage';
import {
  InjectedProps as SyncSortProps,
  syncSortWithUrl,
} from '../../components/SyncUrl/SyncUrlSort';
import { TzDatetime } from '../../components/TzDatetime';
import { RootState, RouteProps } from '../../states';
import { isSortStateEqual, SortOrder, SortState } from '../../types';
import { ImportedFile } from '../../types/importedFile';
import { debounce } from '../../util';

import { nextSortState, SortButtonClickHandler } from '../ListPage';

import { ClickOutside } from '../../components/ClickOutside';
import { ImportFileModal } from './ImportFileModal';

const ImportedFileListPerPageCount = 25;

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

type FileImportPageProps = StateProps &
  SyncFilterProps &
  SyncPageProps &
  SyncSortProps &
  DispatchProps;

interface StateProps {
  filterConfigs: FilterConfig[];
  isLoading: boolean;
  location: Location;
  maxPage: number;
  files: ImportedFile[];
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

interface State {
  showImportModal: boolean;
  showfilterMenu: boolean;
}

interface TableHeaderProps {
  sortState: SortState;
  onSortButtonClick: SortButtonClickHandler;
}

const importedFileListfields = [
  {
    label: 'File Name',
    name: 'name',
  },
  {
    label: 'Uploaded At',
    name: 'uploadedAt',
  },
  {
    label: 'Size',
    name: 'size',
  },
];

const TableHeader: React.SFC<TableHeaderProps> = ({
  sortState,
  onSortButtonClick,
}) => {
  const columns = importedFileListfields.map((field, index) => {
    const sortOrder =
      field.name === sortState.fieldName
        ? sortState.order
        : SortOrder.Undefined;
    return (
      <div key={index} className="table-cell">
        {field.label}
        <SortButton
          className="d-inline-block mx-1"
          sortOrder={sortOrder}
          onClick={() => onSortButtonClick(field.name)}
        />
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
  file: ImportedFile;
}

const TableRow: React.SFC<TableRowProps> = ({ file }) => {
  return (
    <div className="table-row">
      <div className="table-cell">
        <div>{file.name}</div>
      </div>
      <div className="table-cell">
        <TzDatetime value={file.uploadedAt} datetimeFormat={DATETIME_FORMAT} />
      </div>
      <div className="table-cell">
        <div>{file.size}</div>
      </div>
    </div>
  );
};

interface TableBodyProps {
  files: ImportedFile[];
}

const TableBody: React.SFC<TableBodyProps> = ({ files }) => {
  const rows = files.map((file, index) => <TableRow key={index} file={file} />);
  return <div className="table-body">{rows}</div>;
};

interface ListTableProps {
  sortState: SortState;
  onSortButtonClick: SortButtonClickHandler;
  files: ImportedFile[];
}

const ListTable: React.SFC<ListTableProps> = ({
  onSortButtonClick,
  files,
  sortState,
}) => {
  return (
    <div key="table" className="list-table">
      <TableHeader
        sortState={sortState}
        onSortButtonClick={onSortButtonClick}
      />
      <TableBody files={files} />
    </div>
  );
};

class FileImportPage extends React.Component<FileImportPageProps, State> {
  private actionCreator: FileImportActionDispatcher;

  constructor(props: FileImportPageProps) {
    super(props);

    const { dispatch } = this.props;

    this.state = {
      showImportModal: false,
      showfilterMenu: false,
    };

    this.actionCreator = new FileImportActionDispatcher(dispatch);

    this.fetchList = debounce(this.fetchList.bind(this), 200);
  }

  componentDidMount() {
    this.reloadList(this.props);
  }

  componentWillReceiveProps(nextProps: FileImportPageProps) {
    const { filters, page, sortState } = this.props;
    // Handle filters & page change by browser navigation
    if (
      filters !== nextProps.filters ||
      page !== nextProps.page ||
      !isSortStateEqual(sortState, nextProps.sortState)
    ) {
      this.reloadList(nextProps);
    }
  }

  onFilterChange = (filters: Filter[]) => {
    this.props.onChangePage();
    this.props.onChangeFilter(filters);
  };

  toggleFilterMenu() {
    this.setState({ showfilterMenu: !this.state.showfilterMenu });
  }

  render() {
    const {
      files,
      filterConfigs,
      filters,
      isLoading,
      location,
      maxPage,
      page,
      sortState,
    } = this.props;
    const { showfilterMenu, showImportModal } = this.state;

    return (
      <div className="file-import">
        <ImportFileModal
          actionDispatcher={this.actionCreator}
          show={showImportModal}
          onDismiss={this.onImportModalDismiss}
        />
        <div className="topbar">
          <div className="title">File Import</div>
          <div className="action-container">
            <div
              className="list-action primary-button"
              onClick={() => this.setState({ showImportModal: true })}
            >
              Import Files
            </div>
            <ClickOutside
              className={classnames('d-inline-block', {
                dropdown: !showfilterMenu,
                dropup: showfilterMenu,
              })}
              onClickOutside={() => this.setState({ showfilterMenu: false })}
            >
              <PrimaryButton
                type="button"
                className="list-action dropdown-toggle"
                onClick={() => this.toggleFilterMenu()}
              >
                Add Filter <span className="caret" />
              </PrimaryButton>

              <div
                className={classnames(
                  'list-filter-menu-wrapper',
                  showfilterMenu ? 'show' : ''
                )}
              >
                <div className="list-filter-menu">
                  <FilterMenu
                    filterConfigs={filterConfigs}
                    filters={filters}
                    onChangeFilter={this.onFilterChange}
                  />
                </div>
              </div>
            </ClickOutside>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="list-filter-tag-list-container">
            <div className="list-filter-tag-list-label">Filter</div>
            <FilterTagList
              className="list-filter-tag-list"
              filters={filters}
              filterConfigs={filterConfigs}
              onChangeFilter={this.onFilterChange}
            />
          </div>
        )}

        <div className="list-content">
          {(() => {
            if (isLoading) {
              return <div className="list-loading">Loading...</div>;
            } else {
              if (files.length === 0) {
                return <div className="list-empty">No records found.</div>;
              } else {
                return (
                  <ListTable
                    files={files}
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

  private onSortButtonClick = (name: string) => {
    const sortState = nextSortState(this.props.sortState, name);
    this.props.onChangeSort(sortState);
  };

  private fetchList = (
    page: number,
    perPage: number,
    filters: Filter[],
    sortState: SortState
  ) => {
    this.actionCreator.fetchList(
      page,
      perPage,
      filters,
      sortState.fieldName,
      sortState.order === SortOrder.Ascending
    );
  };

  private reloadList = (props: FileImportPageProps) => {
    const { filters, page, sortState } = props;
    this.fetchList(page, ImportedFileListPerPageCount, filters, sortState);
  };

  private onImportModalDismiss = (didImportSuccess: boolean) => {
    this.setState({ showImportModal: false });
    if (didImportSuccess) {
      this.reloadList(this.props);
    }
  };
}

function FileImportPageFactory() {
  function mapStateToProps(state: RootState, props: RouteProps): StateProps {
    const { location } = props;
    const { isLoading, files, totalCount } = state.fileImport.list;

    const maxPage = Math.ceil(totalCount / ImportedFileListPerPageCount);
    const filterConfigs: FilterConfig[] = [
      {
        label: 'File Name',
        name: 'name',
        nullable: false,
        type: FilterConfigTypes.String,
      },
      {
        label: 'Uploaded At',
        name: 'uploadedAt',
        nullable: false,
        // TODO: get timezone from config
        timezone: state.settings.timezone,
        type: FilterConfigTypes.DateTime,
      },
      {
        label: 'Size',
        name: 'size',
        nullable: false,
        type: FilterConfigTypes.Number,
      },
    ];

    return {
      files,
      filterConfigs,
      isLoading,
      location,
      maxPage,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  const syncedPage = syncSortWithUrl(
    syncFilterWithUrl(syncPageWithUrl(FileImportPage))
  );
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(syncedPage);
}

export { FileImportPageFactory };
