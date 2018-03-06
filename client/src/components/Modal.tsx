import './Modal.css';

import * as React from 'react';

// hotfix (Steven-Chan):
// typescript cannot parse gif file, so use png
import * as loading from '../assets/loading.png';

export interface ModalProps {
  body?: (() => JSX.Element) | (() => JSX.Element[]) | string;
  footer?: (() => JSX.Element) | (() => JSX.Element[]);
  onDismiss?: () => void; // `undefined` for non-dismissible modal
  show: boolean;
  title: string;
}

export interface LoadingModalProps {
  show?: boolean;
}

export interface FailureModalProps {
  onDismiss?: () => void;
  show?: boolean;
  errorMessage: string;
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
            <h5 className="modal-title">{title}</h5>
          </div>
          {bodyElement && <div className="modal-body">{bodyElement}</div>}
          {footerElement && <div className="modal-footer">{footerElement}</div>}
        </div>
      </div>
    </div>
  );
};

export function createLoadingModal(title: string) {
  return (props: LoadingModalProps) => {
    const { show = true } = props;
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
}

export function createFailureModal(title: string) {
  return (props: FailureModalProps) => {
    const { onDismiss, show = true, errorMessage } = props;
    return (
      <Modal
        show={show}
        title={title}
        body={errorMessage}
        footer={() => (
          <a
            href="#"
            role="button"
            className="btn btn-primary"
            onClick={onDismiss}
          >
            Close
          </a>
        )}
        onDismiss={onDismiss}
      />
    );
  };
}
