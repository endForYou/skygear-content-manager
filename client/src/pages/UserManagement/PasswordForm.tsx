import './PasswordForm.scss';

import * as React from 'react';

import { changePassword } from '../../actions/user';
import { Form } from '../../components/Form';
import { isOutlawError } from '../../recordUtil';

interface PasswordFormProps {
  userId: string;
}

interface PasswordFormState {
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  successMessage: string;
  errorMessage: string;
}

export class PasswordForm extends React.PureComponent<
  PasswordFormProps,
  PasswordFormState
> {
  constructor(props: PasswordFormProps) {
    super(props);

    this.state = {
      confirmPassword: '',
      errorMessage: '',
      isSubmitting: false,
      password: '',
      successMessage: '',
    };

    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onConfirmPasswordChange = this.onConfirmPasswordChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  public render() {
    const { userId } = this.props;

    const {
      confirmPassword,
      errorMessage,
      isSubmitting,
      password,
      successMessage,
    } = this.state;

    return (
      <Form
        className="password-form"
        title="Change Password"
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitDisabled={!this.canSubmitPassword() || isSubmitting}
        onSubmit={this.onFormSubmit}
      >
        <div className="password-form-group">
          <div className="password-form-label">
            <label>User ID</label>
          </div>
          <div className="password-form-field static">{userId}</div>
        </div>

        <div className="password-form-group">
          <div className="password-form-label">
            <label htmlFor="password">Password</label>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            className="password-form-field"
            placeholder="Password"
            value={password}
            onChange={this.onPasswordChange}
          />
        </div>

        <div className="password-form-group">
          <div className="password-form-label">
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="password-form-field"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={this.onConfirmPasswordChange}
          />
        </div>
      </Form>
    );
  }

  private canSubmitPassword() {
    const { confirmPassword, password } = this.state;
    return password !== '' && confirmPassword === password;
  }

  private onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      password: event.target.value,
    });
  }

  private onConfirmPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      confirmPassword: event.target.value,
    });
  }

  private onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    this.setState({ errorMessage: '', isSubmitting: true, successMessage: '' });

    const { userId } = this.props;
    const { password } = this.state;
    changePassword(userId, password)
      .then(() =>
        this.setState({ isSubmitting: false, successMessage: 'Success!' })
      )
      .catch(error => {
        const message = isOutlawError(error)
          ? `${error.error.message}`
          : `${error}`;
        this.setState({
          errorMessage: `Failed: ${message}`,
          isSubmitting: false,
        });
      });
  }
}
