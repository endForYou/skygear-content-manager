import * as React from 'react';
import skygear, { Query } from 'skygear';

import { ExportActionConfig } from '../cmsConfig';
import { Modal } from './Modal';

export interface ExportModalProps {
  actionConfig: ExportActionConfig;
  onDismiss: () => void;
  query: Query;
  show?: boolean;
}

interface State {
  exportPredicateOptionIndex: string;
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
      exportPredicateOptionIndex: '0',
    };

    this.onQueryOptionClick = this.onQueryOptionClick.bind(this);
  }

  public onQueryOptionClick(event: React.MouseEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.setState({ exportPredicateOptionIndex: value });
  }

  public renderFilterOptions() {
    const { exportPredicateOptionIndex } = this.state;

    return (
      <div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="exportQuery"
              value="0"
              onClick={this.onQueryOptionClick}
              checked={exportPredicateOptionIndex === '0'}
            />{' '}
            All records
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="exportQuery"
              value="1"
              onClick={this.onQueryOptionClick}
              checked={exportPredicateOptionIndex === '1'}
            />{' '}
            Filtered records
          </label>
        </div>
      </div>
    );
  }

  public render() {
    const { actionConfig, onDismiss, show = true } = this.props;

    const { exportPredicateOptionIndex } = this.state;

    const exportPredicate = this.exportPredicateOption[
      exportPredicateOptionIndex
    ];

    const searchParams = new URLSearchParams();
    searchParams.append('export_name', actionConfig.name);
    searchParams.append('key', skygear.auth.accessToken || '');
    if (exportPredicate.length > 0) {
      searchParams.append('predicate', JSON.stringify(exportPredicate));
    }
    const action = `${skygear.endPoint}export?${searchParams}`;

    return (
      <Modal
        show={show}
        title="Export"
        onDismiss={onDismiss}
        body={() => this.renderFilterOptions()}
        footer={() => [
          <a
            key="export"
            href={action}
            target="_blank"
            role="button"
            className="btn btn-primary"
            onClick={onDismiss}
          >
            Export
          </a>,
          <a
            key="cancel"
            href="#"
            role="button"
            className="btn btn-secondary"
            onClick={onDismiss}
          >
            Cancel
          </a>,
        ]}
      />
    );
  }
}
