import * as React from 'react';

import { Modal } from '../../components/Modal';

interface Props {
  show: boolean;
  onDismiss: () => void;
}

export class ImportFileModal extends React.PureComponent<Props> {
  public render() {
    const { onDismiss, show } = this.props;

    return (
      <Modal
        show={show}
        title="Import Files"
        onDismiss={onDismiss}
        body={this.renderBody}
        footer={() => [
          <a
            key="import"
            href="#"
            role="button"
            className="modal-button-primary primary-button"
            onClick={this.onImportClick}
          >
            Import
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

  // TODO: render file upload
  private renderBody = () => {
    return (
      <div>
        Select files.
      </div>
    );
  }

  private onImportClick = () => {
    console.log('import click');
  }
}
