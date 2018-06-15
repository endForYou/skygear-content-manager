import './ImportModal.scss';

import * as React from 'react';

import { ImportResult } from '../types';
import { createFailureModal, createLoadingModal, Modal } from './Modal';

export interface ImportModalProps {
  onDismiss: () => void;
  show?: boolean;
  result: ImportResult;
}

export const ImportModal: React.SFC<ImportModalProps> = props => {
  const { onDismiss, show = true, result } = props;

  const renderErrorMessage = () => {
    const errors = result.result
      .map((i, index) => ({ ...i, index }))
      .filter(i => i._type === 'error');

    if (errors.length === 0) {
      return <div />;
    }

    return (
      <div className="import-result-error" role="alert">
        {// tslint:disable-next-line:no-any
        errors.map((error: any, index) => (
          <div key={index} className="import-result-error-item">
            line {error.index + 2}: {error.message}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      title="Import"
      onDismiss={onDismiss}
      body={() => {
        return [
          <div key="success-count" className="import-count">
            <div>Successful records:</div>
            <div>{result.successCount}</div>
          </div>,
          <div key="error-count" className="import-count-error">
            <div>Failed records:</div>
            <div>{result.errorCount}</div>
          </div>,
          renderErrorMessage(),
        ];
      }}
      footer={() => (
        <a
          href="#"
          role="button"
          className="modal-button-primary primary-button"
          onClick={onDismiss}
        >
          Close
        </a>
      )}
    />
  );
};

export const ImportingModal = createLoadingModal('Import');
export const ImportFailureModal = createFailureModal('Import');
