import './ImportModal.scss';

import * as React from 'react';

import { ImportAttrs } from '../../actions/import';
import { ImportActionConfig } from '../../cmsConfig';

import { Modal } from '../Modal';
import { RadioButtonList } from '../RadioButtonList';
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
      <div className="import-modal-body">
        {this.props.importConfig.atomic == null && (
          <div>
            <div className="setting-title">If there is error in records:</div>
            <RadioButtonList
              className="atomic-options"
              options={[
                'Save correct records only', // 0: non-atomic
                `Don't save any records`, // 1: atomic
              ]}
              selectedIndex={this.state.atomic ? 1 : 0}
              onChange={value => this.setState({ atomic: !!value })}
            />
          </div>
        )}
        <div className="import-file-input-title">Select CSV file</div>
        <SingleFileInput
          className="import-file-input"
          title="Choose file"
          accept=".csv"
          file={this.state.file}
          onFileSelected={file => this.setState({ file })}
        />
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
