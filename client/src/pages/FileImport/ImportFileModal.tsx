import './ImportFileModal.scss';

import * as React from 'react';
import Dropzone, { DropFileEventHandler } from 'react-dropzone';
import { connect } from 'react-redux';

import { FileImportActionDispatcher } from '../../actions/fileImport';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { PrimaryButton } from '../../components/PrimaryButton';
import { errorMessageFromError } from '../../recordUtil';
import { ImportFileState, RootState } from '../../states';

interface ImportFileModalProps {
  show: boolean;
  onDismiss: (didImportSuccess: boolean) => void;
  actionDispatcher: FileImportActionDispatcher;
}

type StateProps = ImportFileState;

type Props = ImportFileModalProps & StateProps;

interface FileItemProps {
  file: File;
  isUploading: boolean;
  canRemove: boolean;
  onRemoveClick: (file: File) => void;
}

const FileItem: React.SFC<FileItemProps> = ({
  canRemove,
  file,
  isUploading,
  onRemoveClick,
}) => {
  return (
    <div className="file-item" onClick={evt => evt.stopPropagation()}>
      <div className="file-name">{file.name}</div>
      {isUploading && <LoadingSpinner />}
      {canRemove && (
        <button
          type="button"
          className="file-remove close"
          aria-label="Close"
          onClick={evt => {
            evt.stopPropagation();
            onRemoveClick(file);
          }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

class ImportFileModalImpl extends React.PureComponent<Props> {
  private fileInput: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      fileNames: [],
      filesByName: {},
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    const didImportSuccess =
      !nextProps.importing &&
      this.props.importing &&
      nextProps.importError == null;
    if (didImportSuccess) {
      this.props.onDismiss(true);
    }
  }

  public render() {
    const { fileNames, show, importing } = this.props;

    return (
      <Modal
        show={show}
        title="Import Files"
        onDismiss={this.onDismiss}
        body={this.renderBody}
        footer={() => [
          <PrimaryButton
            key="import"
            role="button"
            className="modal-button-primary"
            disabled={importing || fileNames.length === 0}
            onClick={this.onImportClick}
          >
            Import
          </PrimaryButton>,
          <button
            key="cancel"
            role="button"
            className="modal-button-secondary"
            disabled={importing}
            onClick={this.onDismiss}
          >
            Cancel
          </button>,
        ]}
      />
    );
  }

  private renderBody = () => {
    const { fileNames, importing, uploadingFileNames } = this.props;

    return (
      <div className="file-import-modal">
        <button
          type="button"
          className=""
          disabled={importing}
          onClick={this.removeAllFiles}
        >
          Clear all
        </button>
        <input
          ref={ref => (this.fileInput = ref)}
          type="file"
          disabled={importing}
          onChange={this.onFileInputChange}
        />
        <Dropzone
          className="file-dropzone"
          disabled={importing}
          disablePreview={true}
          // TODO: allow customization
          // accept="*"
          multiple={true}
          onDropAccepted={this.onDropAccepted}
        >
          {fileNames.length === 0 && (
            <div className="file-empty">Empty files.</div>
          )}
          <div className="file-list">
            {this.files.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                isUploading={!!uploadingFileNames.find(n => n === file.name)}
                canRemove={!importing}
                onRemoveClick={this.removeFile}
              />
            ))}
          </div>
        </Dropzone>
        {this.renderErrorMessage()}
      </div>
    );
  };

  private renderErrorMessage = () => {
    const { importError } = this.props;

    if (importError == null) {
      return null;
    }

    const errorDescription = errorMessageFromError(importError);
    return (
      <div className="alert alert-danger" role="alert">
        Failed to import: {errorDescription}
      </div>
    );
  };

  private get files() {
    return this.props.fileNames
      .map(f => this.props.filesByName[f])
      .filter(f => f != null) as File[];
  }

  private onDismiss = () => {
    const { importing, onDismiss } = this.props;
    if (importing) {
      return;
    }

    this.removeAllFiles();
    onDismiss(false);
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
    this.props.actionDispatcher.addFiles(files);
  };

  private removeFile = (file: File) => {
    this.props.actionDispatcher.removeFile(file);
  };

  private removeAllFiles = () => {
    this.props.actionDispatcher.removeAllFile();
  };

  private onImportClick = () => {
    const { fileNames, filesByName } = this.props;
    const files = fileNames
      .map(n => filesByName[n])
      .filter(f => f != null) as File[];
    this.props.actionDispatcher.importFiles(files);
  };
}

const mapStateToProps = (state: RootState): StateProps => {
  return state.fileImport.import;
};

export const ImportFileModal = connect(mapStateToProps)(ImportFileModalImpl);
