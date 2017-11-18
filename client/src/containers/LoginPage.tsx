import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { login } from '../actions/auth';
import { RootState } from '../states';

import './LoginPage.css';

type LoginFormProps = StateProps & DispatchProps;

interface StateProps {
  errorMessage: string | undefined;
}

interface DispatchProps {
  onSubmit: OnSubmitHandler;
}

interface State {
  username: string;
  password: string;
}

type OnSubmitHandler = ((username: string, password: string) => void);

class LoginForm extends React.PureComponent<LoginFormProps, State> {
  constructor(props: LoginFormProps) {
    super(props);

    this.state = {
      password: '',
      username: '',
    };
  }

  public handleInputChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    switch (name) {
      case 'username':
        this.setState({ [name]: value });
        break;
      case 'password':
        this.setState({ [name]: value });
        break;
      default:
        throw new Error(`unknown input name = ${name}`);
    }
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    const { username, password } = this.state;
    this.props.onSubmit(username, password);
  };

  public render() {
    return (
      <form className="form-login" onSubmit={this.handleSubmit}>
        <h2>Login</h2>
        <label className="sr-only" htmlFor="username">
          Username
        </label>
        <input
          type="text"
          className="form-control form-login-username"
          id="username"
          name="username"
          placeholder="Username"
          required={true}
          autoFocus={true}
          value={this.state.username}
          onChange={this.handleInputChange}
        />
        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          className="form-control form-login-password"
          id="password"
          name="password"
          placeholder="Password"
          required={true}
          value={this.state.password}
          onChange={this.handleInputChange}
        />
        {this.props.errorMessage !== undefined && (
          <div className="alert alert-danger form-login-alert" role="alert">
            {this.props.errorMessage}
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-lg btn-block">
          Login
        </button>
      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}> = (state: RootState) => {
  return {
    errorMessage: state.auth.errorMessage,
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    onSubmit: (username, password) => {
      dispatch(login(username, password));
    },
  };
};

const ConnectedLoginForm = connect(mapStateToProps, mapDispatchToProps)(
  LoginForm
);

const LoginPage: React.SFC = () => {
  return (
    <div className="container">
      <ConnectedLoginForm />
    </div>
  );
};

export default LoginPage;
