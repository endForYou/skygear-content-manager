import './ImportFileModal.scss';

import * as React from 'react';
import Dropzone, { DropFileEventHandler } from 'react-dropzone';

import { Modal } from '../../components/Modal';

interface Props {
  show: boolean;
  onDismiss: () => void;
}

interface State {
  files: File[];
}

export class ImportFileModal extends React.PureComponent<Props, State> {
  private fileInput: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      files: [],
    };
  }

  public render() {
    const { show } = this.props;

    return (
      <Modal
        show={show}
        title="Import Files"
        onDismiss={this.onDismiss}
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
            onClick={this.onDismiss}
          >
            Cancel
          </a>,
        ]}
      />
    );
  }

  private renderBody = () => {
    const { files } = this.state;

    return (
      <div className="file-import-modal">
        <button type="button" className="" onClick={this.removeAllFiles}>
          Clear all
        </button>
        <input
          ref={ref => (this.fileInput = ref)}
          type="file"
          onChange={this.onFileInputChange}
        />
        <Dropzone
          className="file-dropzone"
          disablePreview={true}
          // TODO: allow customization
          // accept="*"
          multiple={true}
          onDropAccepted={this.onDropAccepted}
        >
          {files.length === 0 && <div className="file-empty">Empty files.</div>}
          <div className="file-list">
            {files.map((f, index) => (
              <div
                key={index}
                className="file-item"
                onClick={evt => evt.stopPropagation()}
              >
                <div className="file-name">{f.name}</div>
                <button
                  type="button"
                  className="file-remove close"
                  aria-label="Close"
                  onClick={evt => {
                    evt.stopPropagation();
                    this.removeFile(f);
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            ))}
          </div>
        </Dropzone>
      </div>
    );
  };

  private onDismiss = () => {
    const { onDismiss } = this.props;
    this.removeAllFiles();
    onDismiss();
  };

  private onDropAccepted: DropFileEventHandler = (accepted: File[]) => {
    this.addFiles(accepted);
  };

  private onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files) {
      const filelist = event.target.files;
      let files: File[] = [];
      for (let index = 0; index < filelist.length; index++) {
        const file = filelist.item(index);
        if (file == null) {
          continue;
        }

        files = [...files, file];
      }
      this.addFiles(files);

      if (this.fileInput) {
        this.fileInput.value = '';
      }
    }
  };

  private addFiles = (files: File[]) => {
    this.setState({
      files: [...this.state.files, ...files],
    });
  };

  private removeFile = (file: File) => {
    const filesToRemove = this.state.files.filter(f => f.name === file.name);
    if (filesToRemove.length === 0) {
      return;
    }

    this.setState({
      files: this.state.files.filter(f => f.name !== file.name),
    });
  };

  private removeAllFiles = () => {
    this.setState({
      files: [],
    });
  };

  private onImportClick = () => {
    console.log('import click');
  };
}
