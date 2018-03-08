import * as React from 'react';

import { ImportResult } from '../types';
import {
  CloseModalButton,
  createFailureModal,
  createLoadingModal,
  Modal,
} from './Modal';

export interface ImportModalProps {
  onDismiss: () => void;
  show?: boolean;
  result: ImportResult;
}

export const ImportModal: React.SFC<ImportModalProps> = props => {
  const { onDismiss, show = true, result } = props;
  return (
    <Modal
      show={show}
      title="Import"
      onDismiss={onDismiss}
      body={() => {
        return [
          <p key="success-count">Successful records: {result.successCount}</p>,
          <p key="error-count">Failed records: {result.errorCount}</p>,
        ];
      }}
      footer={() => <CloseModalButton onClick={onDismiss} />}
    />
  );
};

export const ImportingModal = createLoadingModal('Import');
export const ImportFailureModal = createFailureModal('Import');
