import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import qs from 'query-string';

import { RecordActionCreator } from '../actions/record';
import Pagination from '../components/Pagination';

const StringFieldConfigType = PropTypes.shape({
  type: PropTypes.oneOf(['String']).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

const FieldConfigType = PropTypes.oneOfType([StringFieldConfigType]);

const FieldConfigListType = PropTypes.arrayOf(FieldConfigType);

const ListPageConfigType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  fields: FieldConfigListType.isRequired,
});

const TableHeader = ({ fieldConfigs }) => {
  const columns = fieldConfigs.map((fieldConfig, index) => {
    return <th key={index}>{fieldConfig.label}</th>;
  });
  return (
    <thead>
      <tr>{columns}</tr>
    </thead>
  );
};

TableHeader.propTypes = {
  fieldConfigs: FieldConfigListType.isRequired,
};

const TableRow = ({ fieldConfigs, record }) => {
  const columns = fieldConfigs.map((fieldConfig, index) => {
    return <td key={index}>{record[fieldConfig.name]}</td>;
  });
  return <tr>{columns}</tr>;
};

TableRow.propTypes = {
  fieldConfigs: FieldConfigListType.isRequired,
  record: PropTypes.any.isRequired,
};

const TableBody = ({ fieldConfigs, records }) => {
  const rows = records.map((record, index) => {
    return <TableRow key={index} fieldConfigs={fieldConfigs} record={record} />;
  });
  return <tbody>{rows}</tbody>;
};

TableBody.propTypes = {
  fieldConfigs: FieldConfigListType.isRequired,
  records: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const ListTable = ({ fieldConfigs, records }) => {
  return (
    <table key="table" className="table table-striped">
      <TableHeader fieldConfigs={fieldConfigs} />
      <TableBody fieldConfigs={fieldConfigs} records={records} />
    </table>
  );
};

ListTable.propTypes = {
  fieldConfigs: FieldConfigListType.isRequired,
  records: PropTypes.arrayOf(PropTypes.any).isRequired,
};

class ListPage extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    recordName: PropTypes.string.isRequired,
    recordActionCreator: PropTypes.instanceOf(RecordActionCreator),
    pageConfig: ListPageConfigType.isRequired,
    page: PropTypes.number.isRequired,
    maxPage: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    records: PropTypes.arrayOf(PropTypes.any).isRequired,
  };

  componentDidMount() {
    const { dispatch, recordActionCreator, page } = this.props;

    dispatch(recordActionCreator.fetchList(page));
  }

  render() {
    const {
      recordName,
      pageConfig,
      page,
      maxPage,
      isLoading,
      records,
    } = this.props;

    return (
      <div className="pt-3">
        <h1>{pageConfig.label}</h1>
        <div className="table-responsive">
          {(() => {
            if (isLoading) {
              return <div>Loading...</div>;
            } else {
              if (records.length == 0) {
                return <div>No records found.</div>;
              } else {
                return (
                  <ListTable
                    fieldConfigs={pageConfig.fields}
                    page={page}
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

  onPageItemClicked = page => {
    const { dispatch, recordActionCreator } = this.props;

    dispatch(recordActionCreator.fetchList(page));
  };
}

function ListPageFactory(recordName) {
  const mapStateToProps = state => {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location.search);
    const page = parseInt(pageStr, 10);

    const { recordType, list: pageConfig } = state.cmsConfig.records[
      recordName
    ];
    const { isLoading, records, totalCount } = state.recordViewsByName[
      recordName
    ].list;

    const recordActionCreator = new RecordActionCreator(
      recordName,
      recordType,
      pageConfig.perPage
    );

    const maxPage = Math.ceil(totalCount / pageConfig.perPage);

    return {
      recordName,
      recordActionCreator,
      pageConfig,
      page,
      maxPage,
      isLoading,
      records,
    };
  };

  return connect(mapStateToProps)(ListPage);
}

export { ListPage, ListPageFactory };
