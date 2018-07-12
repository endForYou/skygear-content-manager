import './Form.scss';

import classnames from 'classnames';
import * as React from 'react';
import { PrimaryButton } from './PrimaryButton';

interface FormProps {
  className?: string;
  title: string;
  successMessage?: string;
  errorMessage?: string;
  submitTitle?: string;
  submitDisabled?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export class Form extends React.PureComponent<FormProps> {
  public render() {
    const {
      className,
      children,
      onSubmit,
      successMessage = '',
      errorMessage = '',
      submitDisabled = false,
      submitTitle = 'Submit',
      title,
    } = this.props;
    return (
      <form
        className={classnames('form-container', className)}
        onSubmit={onSubmit}
      >
        <div className="body">
          {title && <div className="form-title">{title}</div>}
          {children}
        </div>

        <div className="footer">
          {successMessage.length > 0 && (
            <div className="text-success submit-message">{successMessage}</div>
          )}
          {errorMessage.length > 0 && (
            <div className="text-danger submit-message">{errorMessage}</div>
          )}

          <PrimaryButton
            type="submit"
            className="btn-submit"
            disabled={submitDisabled}
          >
            {submitTitle}
          </PrimaryButton>
        </div>
      </form>
    );
  }
}
