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
      <div className="alert alert-danger" role="alert">
        {// tslint:disable-next-line:no-any
        errors.map((error: any, index) => (
          <p key={index}>
            line {error.index + 2}: {error.message}
          </p>
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
          <p key="success-count">Successful records: {result.successCount}</p>,
          <p key="error-count">Failed records: {result.errorCount}</p>,
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
