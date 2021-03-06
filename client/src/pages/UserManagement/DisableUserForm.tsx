import classnames from 'classnames';
import * as moment from 'moment';
import * as React from 'react';
import ReactToggle, { ReactToggleElement } from 'react-toggle';

import { disableUser, enableUser } from '../../actions/user';
import { Form } from '../../components/Form';
import { TzDatetimeInput } from '../../components/TzDatetimeInput';
import { isOutlawError } from '../../recordUtil';
import { SkygearUser } from '../../types';

interface DisableUserFormProps {
  className?: string;
  user: SkygearUser;
}

interface DisableUserFormState {
  userDisabled: boolean;
  userDisabledExpiry?: Date;
  userDisabledMessage: string;
  successMessage: string;
  errorMessage: string;
  isSubmitting: boolean;
}

export class DisableUserForm extends React.PureComponent<
  DisableUserFormProps,
  DisableUserFormState
> {
  constructor(props: DisableUserFormProps) {
    super(props);

    const { user } = props;

    this.state = {
      errorMessage: '',
      isSubmitting: false,
      successMessage: '',
      userDisabled: user.userDisable.disabled || false,
      userDisabledExpiry: user.userDisable.expiry || undefined,
      userDisabledMessage: user.userDisable.message || '',
    };
  }

  render() {
    const { className } = this.props;

    const {
      errorMessage,
      successMessage,
      userDisabled,
      userDisabledExpiry,
      userDisabledMessage,
      isSubmitting,
    } = this.state;

    return (
      <Form
        className={classnames('disable-user', className)}
        title="Disable User"
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitDisabled={!this.canSubmit() || isSubmitting}
        onSubmit={this.onFormSubmit}
      >
        <div className="user-page-form-group">
          <div className="user-page-form-label">
            <label htmlFor="password">Disabled</label>
          </div>
          <div className="user-page-form-field toggle">
            <div className="toggle-container">
              <ReactToggle
                checked={userDisabled}
                onChange={this.handleDisabledChange}
              />
            </div>
          </div>
        </div>

        {userDisabled && (
          <div className="user-page-form-group">
            <div className="user-page-form-label">
              <label htmlFor="confirmPassword">Expiry</label>
            </div>
            <TzDatetimeInput
              className="user-page-form-field"
              value={userDisabledExpiry}
              onChange={this.handleExpiryChange}
              inputProps={{ className: 'datetime-input' }}
            />
          </div>
        )}
        {userDisabled && (
          <div className="user-page-form-group">
            <div className="user-page-form-label">
              <label htmlFor="confirmPassword">Message</label>
            </div>
            <textarea
              value={userDisabledMessage}
              onChange={this.handleMessageChange}
              className="user-page-form-field textarea"
              rows={5}
            />
          </div>
        )}
      </Form>
    );
  }

  private canSubmit = () => {
    return true;
  };

  private handleDisabledChange: React.ReactEventHandler<
    ReactToggleElement
  > = event => {
    const checked = event.currentTarget.checked;
    this.setState({ ...this.state, userDisabled: checked });
  };

  private handleExpiryChange: (
    // tslint:disable-next-line: no-any
    event: string | moment.Moment | React.ChangeEvent<any>
  ) => void = event => {
    let value;
    if (event === '') {
      value = undefined;
    } else if (moment.isMoment(event)) {
      value = event.toDate();
    } else {
      return;
    }

    this.setState({ ...this.state, userDisabledExpiry: value });
  };

  private handleMessageChange: React.ReactEventHandler<
    HTMLTextAreaElement
  > = event => {
    const message = event.currentTarget.value;
    this.setState({ ...this.state, userDisabledMessage: message });
  };

  private onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { user } = this.props;
    const {
      userDisabled,
      userDisabledExpiry,
      userDisabledMessage,
    } = this.state;

    return Promise.resolve()
      .then(() => {
        return userDisabled
          ? disableUser(user.id, userDisabledMessage, userDisabledExpiry)
          : enableUser(user.id);
      })
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
  };
}
