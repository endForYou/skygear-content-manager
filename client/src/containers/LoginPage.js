import * as PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { login } from '../actions/auth';

import './LoginPage.css';

class _LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
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
    this.props.onSubmit(username, password);
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

_LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    errorMessage: state.auth.errorMessage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: (username, password) => {
      dispatch(login(username, password));
    },
  };
};

const LoginForm = connect(mapStateToProps, mapDispatchToProps)(_LoginForm);

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
