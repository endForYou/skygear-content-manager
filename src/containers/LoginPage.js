import React, { Component } from 'react';
import './LoginPage.css';

class LoginPage extends Component {
  render() {
    return (
      <div className="container">
        <form className="form-login">
          <h2>Login</h2>
          <label className="sr-only" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            className="form-control form-login-username"
            id="username"
            placeholder="Username"
            required
          />
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            className="form-control form-login-password"
            id="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="btn btn-primary btn-lg btn-block">
            Login
          </button>
        </form>
      </div>
    );
  }
}

export default LoginPage;
