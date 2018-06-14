import './ImportModal.scss';

import * as React from 'react';
import ReactToggle from 'react-toggle';

import { ImportAttrs } from '../../actions/import';
import { ImportActionConfig } from '../../cmsConfig';

import { Modal } from '../Modal';
import { SingleFileInput } from '../SingleFileInput';

export interface ImportModalProps {
  importConfig: ImportActionConfig;
  onDismiss: () => void;
  onImport: (importConfig: ImportActionConfig, attrs: ImportAttrs) => void;
  show?: boolean;
}

type State = Partial<ImportAttrs>;

export class ImportModal extends React.PureComponent<ImportModalProps, State> {
  constructor(props: ImportModalProps) {
    super(props);

    this.state = this.initialState(props);
  }

  public render() {
    const { importConfig, onDismiss, show = true } = this.props;

    return (
      <Modal
        show={show}
        title={importConfig.label}
        onDismiss={onDismiss}
        body={this.renderBody}
        footer={() => [
          <button
            key="import"
            className="modal-button-primary primary-button"
            disabled={this.state.file == null}
            onClick={() =>
              this.props.onImport(this.props.importConfig, this.importAttrs())}
          >
            Import
          </button>,
          <button
            key="reset"
            className="modal-button-secondary"
            onClick={() => this.setState(this.initialState(this.props))}
          >
            Reset
          </button>,
          <button
            key="cancel"
            className="modal-button-secondary"
            onClick={this.props.onDismiss}
          >
            Cancel
          </button>,
        ]}
      />
    );
  }

  private initialState = (props: ImportModalProps) => ({
    atomic: props.importConfig.atomic || false,
    file: undefined,
  });

  private renderBody = () => {
    return (
      <div>
        <SingleFileInput
          title="Select file"
          accept=".csv"
          file={this.state.file}
          onFileSelected={file => this.setState({ file })}
        />
        {this.props.importConfig.atomic == null && (
          <div className="setting">
            <div className="setting-title">Allow partial failure?</div>
            <ReactToggle
              checked={!this.state.atomic}
              onChange={() => this.setState({ atomic: !this.state.atomic })}
            />
          </div>
        )}
      </div>
    );
  };

  private importAttrs = () => {
    if (this.state.file == null || this.state.atomic == null) {
      throw new Error(`Unexpected state ${this.state}`);
    }

    return this.state as ImportAttrs;
  };
}
