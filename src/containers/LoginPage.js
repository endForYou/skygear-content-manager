import React, { Component } from 'react';
import skygear from 'skygear';

import './LoginPage.css';

const errorMessageFromError = error => {
  if (error.error.code === skygear.ErrorCodes.ResourceNotFound) {
    return "User with this username doesn't exists.";
  }

  if (error.error.code === skygear.ErrorCodes.InvalidCredentials) {
    return "The password that you've entered is incorrect.";
  }

  return 'Failed to login: ' + error.error.message;
};

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      errorMessage: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    let { username, password } = this.state;
    skygear.auth.loginWithUsername(username, password).then(
      user => {
        console.log(`Login succeeded: ${user}`);

        this.setState({
          errorMessage: '',
        });
      },
      error => {
        this.setState({
          errorMessage: errorMessageFromError(error),
        });
      }
    );
  }

  render() {
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
          required
          autoFocus // eslint-disable-line jsx-a11y/no-autofocus
          value={this.state.value}
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
          required
          value={this.state.value}
          onChange={this.handleInputChange}
        />
        {this.state.errorMessage !== '' && (
          <div className="alert alert-danger form-login-alert" role="alert">
            {this.state.errorMessage}
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-lg btn-block">
          Login
        </button>
      </form>
    );
  }
}

class LoginPage extends Component {
  render() {
    return (
      <div className="container">
        <LoginForm />
      </div>
    );
  }
}

export default LoginPage;
