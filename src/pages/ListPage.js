import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import { RecordActionCreator } from '../actions/record';

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
    <table className="table table-striped">
      <TableHeader fieldConfigs={fieldConfigs} />
      <TableBody fieldConfigs={fieldConfigs} records={records} />
    </table>
  );
};

ListTable.propTypes = {
  fieldConfigs: FieldConfigListType.isRequired,
  records: PropTypes.arrayOf(PropTypes.any).isRequired,
};

class ListPage extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    recordActionCreator: PropTypes.instanceOf(RecordActionCreator),
    pageConfig: ListPageConfigType.isRequired,
    isLoading: PropTypes.bool.isRequired,
    records: PropTypes.arrayOf(PropTypes.any).isRequired,
  };

  componentDidMount() {
    const { dispatch, recordActionCreator } = this.props;

    dispatch(recordActionCreator.fetchList());
  }

  render() {
    const { pageConfig, isLoading, records } = this.props;

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
                    records={records}
                  />
                );
              }
            }
          })()}
        </div>
      </div>
    );
  }
}

function ListPageFactory(recordName) {
  const mapStateToProps = state => {
    const { recordType, list } = state.cmsConfig.records[recordName];
    const { isLoading, records } = state.recordViewsByName[recordName].list;

    const recordActionCreator = new RecordActionCreator(recordName, recordType);

    return { recordActionCreator, pageConfig: list, isLoading, records };
  };
  return connect(mapStateToProps)(ListPage);
}

export { ListPage, ListPageFactory };
