import * as React from 'react';
import skygear, { Query } from 'skygear';

import { ExportActionConfig } from '../cmsConfig';
import { Modal } from './Modal';
import { RadioButtonList } from './RadioButtonList';

export interface ExportModalProps {
  actionConfig: ExportActionConfig;
  onDismiss: () => void;
  query: Query;
  show?: boolean;
}

interface State {
  exportPredicateOptionIndex: number;
}

export class ExportModal extends React.PureComponent<ExportModalProps, State> {
  // tslint:disable-next-line: no-any
  private exportPredicateOption: any[][];

  constructor(props: ExportModalProps) {
    super(props);

    this.exportPredicateOption = [
      [], // all results
      props.query.predicate,
    ];

    this.state = {
      exportPredicateOptionIndex: 0,
    };

    this.onQueryOptionClick = this.onQueryOptionClick.bind(this);
  }

  renderFilterOptions() {
    const { exportPredicateOptionIndex } = this.state;

    return (
      <RadioButtonList
        options={['All records', 'Filtered records']}
        selectedIndex={exportPredicateOptionIndex}
        onChange={this.onQueryOptionClick}
      />
    );
  }

  render() {
    const { actionConfig, onDismiss, show = true } = this.props;

    const { exportPredicateOptionIndex } = this.state;

    const exportPredicate = this.exportPredicateOption[
      exportPredicateOptionIndex
    ];

    const searchParams = new URLSearchParams();
    searchParams.append('export_name', actionConfig.name);
    if (exportPredicate.length > 0) {
      searchParams.append('predicate', JSON.stringify(exportPredicate));
    }
    const action = `${skygear.endPoint}export?${searchParams}`;

    return (
      <Modal
        show={show}
        title="Export records"
        onDismiss={onDismiss}
        body={() => this.renderFilterOptions()}
        footer={() => [
          <a
            key="export"
            href={action}
            target="_blank"
            role="button"
            className="modal-button-primary primary-button"
            onClick={onDismiss}
          >
            Export
          </a>,
          <a
            key="cancel"
            href="#"
            role="button"
            className="modal-button-secondary"
            onClick={onDismiss}
          >
            Cancel
          </a>,
        ]}
      />
    );
  }

  private onQueryOptionClick = (value: number) => {
    this.setState({ exportPredicateOptionIndex: value });
  };
}
