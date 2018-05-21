import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';

import { login } from '../actions/auth';
import * as logo from '../assets/logo.png';
import { RootState } from '../states';

import { PrimaryButton } from '../components/PrimaryButton';
import './LoginPage.scss';

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
      <form className="form-container" onSubmit={this.handleSubmit}>
        <div className="form-title">Login</div>
        <div className="form-item">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            className="form-text-input"
            id="username"
            name="username"
            placeholder="Username"
            required={true}
            autoFocus={true}
            value={this.state.username}
            onChange={this.handleInputChange}
          />
        </div>
        <div className="form-item">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            className="form-text-input"
            id="password"
            name="password"
            placeholder="Password"
            required={true}
            value={this.state.password}
            onChange={this.handleInputChange}
          />
        </div>
        {this.props.errorMessage !== undefined && (
          <div className="alert alert-danger form-login-alert" role="alert">
            {this.props.errorMessage}
          </div>
        )}
        <PrimaryButton type="submit" className="form-submit">
          Login
        </PrimaryButton>
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

const Topbar: React.SFC = () => {
  return (
    <div className="topbar sidebar-color">
      <Link className="topbar-logo-link" to="/">
        <img className="topbar-logo" src={logo} alt="Skygear CMS" />
      </Link>
    </div>
  );
};

const LoginPage: React.SFC = () => {
  return (
    <div className="login">
      <Topbar />
      <ConnectedLoginForm />
    </div>
  );
};

export default LoginPage;
