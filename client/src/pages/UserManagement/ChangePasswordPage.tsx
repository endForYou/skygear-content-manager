import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { changePassword } from '../../actions/user';
import { isOutlawError } from '../../recordUtil';
import { RootState } from '../../states';

interface ChangePasswordPageContainerProps {
  userId: string;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

type Props = ChangePasswordPageContainerProps & DispatchProps;

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

class PasswordForm extends React.PureComponent<
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
      <form onSubmit={this.onFormSubmit}>
        <div className="form-group">
          <label>User ID</label>
          <p className="form-control-static">{userId}</p>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={this.onPasswordChange}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={this.onConfirmPasswordChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!this.canSubmitPassword() || isSubmitting}
        >
          Submit
        </button>
        {successMessage.length > 0 && (
          <span className="ml-3 text-success">{successMessage}</span>
        )}
        {errorMessage.length > 0 && (
          <span className="ml-3 text-danger">{errorMessage}</span>
        )}
      </form>
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

const ChangePasswordPageImpl: React.SFC<Props> = ({ userId }) => {
  return (
    <div>
      <div className="navbar">
        <h1 className="display-4">Change Password</h1>
      </div>
      <PasswordForm userId={userId} />
    </div>
  );
};

function mapStateToProps(
  state: RootState,
  ownProps: ChangePasswordPageContainerProps
): ChangePasswordPageContainerProps {
  return { ...ownProps };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedEditPageContainer = connect(mapStateToProps, mapDispatchToProps)(
  ChangePasswordPageImpl
);

export const ChangePasswordPageContainer: React.ComponentType<
  ChangePasswordPageContainerProps
> = ConnectedEditPageContainer;
