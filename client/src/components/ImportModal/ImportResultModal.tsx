import './ImportResultModal.scss';

import * as React from 'react';

import { ImportActionConfig } from '../../cmsConfig';
import { ImportResult } from '../../types';
import { Omit } from '../../typeutil';
import { FailureModal, FailureModalProps, LoadingModal, Modal } from '../Modal';

export interface ImportModalResultProps {
  onDismiss: () => void;
  show?: boolean;
  result: ImportResult;
  importConfig: ImportActionConfig;
}

export const ImportResultModal: React.SFC<ImportModalResultProps> = props => {
  const { importConfig, onDismiss, show = true, result } = props;

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
      title={importConfig.label}
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

export const ImportingModal = ({
  importConfig,
}: {
  importConfig: ImportActionConfig;
}) => {
  return <LoadingModal title={importConfig.label} />;
};

export const ImportFailureModal = ({
  importConfig,
  ...rest
}: { importConfig: ImportActionConfig } & Omit<FailureModalProps, 'title'>) => {
  return <FailureModal title={importConfig.label} {...rest} />;
};
