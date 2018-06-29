import './Modal.scss';

import * as React from 'react';

import * as loading from '../assets/loading.gif';

export interface ModalProps {
  body?: (() => JSX.Element) | (() => JSX.Element[]) | string;
  footer?: (() => JSX.Element) | (() => JSX.Element[]);
  onDismiss?: () => void; // `undefined` for non-dismissible modal
  show: boolean;
  title: string;
}

const defaultBackDropStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

export const Modal: React.SFC<ModalProps> = props => {
  const { body, footer, onDismiss, show, title } = props;

  const modalStyle: React.CSSProperties = {};
  if (show) {
    modalStyle.display = 'block';
  }

  let bodyElement: JSX.Element | JSX.Element[] | undefined;
  if (typeof body === 'function') {
    bodyElement = body();
  } else if (typeof body === 'string') {
    bodyElement = <p>{body}</p>;
  } else {
    bodyElement = body;
  }

  const footerElement = typeof footer === 'function' ? footer() : footer;

  return (
    <div className="modal" style={modalStyle} tabIndex={-1}>
      <div className="modal-dialog">
        <div
          className="modal-backdrop"
          style={defaultBackDropStyle}
          onClick={onDismiss}
        />
        <div className="modal-content modal-above-backdrop">
          <div className="modal-header">
            <div className="modal-title">{title}</div>
          </div>
          {bodyElement && <div className="modal-body">{bodyElement}</div>}
          {footerElement && <div className="modal-footer">{footerElement}</div>}
        </div>
      </div>
    </div>
  );
};

interface LoadingModalProps {
  show?: boolean;
  title: string;
}

export const LoadingModal = ({ show = true, title }: LoadingModalProps) => {
  return (
    <Modal
      show={show}
      title={title}
      body={() => (
        <div>
          <img
            className="modal-lodaing-img img-fluid"
            src={loading}
            alt="Loading"
          />
          <p className="modal-loading-text">In Progress...</p>
        </div>
      )}
    />
  );
};

export interface FailureModalProps {
  onDismiss?: () => void;
  show?: boolean;
  errorMessage: string;
  title: string;
}

export const FailureModal = ({
  onDismiss,
  show = true,
  errorMessage,
  title,
}: FailureModalProps) => {
  return (
    <Modal
      show={show}
      title={title}
      body={errorMessage}
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
      onDismiss={onDismiss}
    />
  );
};
