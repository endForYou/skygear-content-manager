import classnames from 'classnames';
import * as React from 'react';
import ReactToggle, { ReactToggleElement } from 'react-toggle';

import { UserVerificationConfig } from '../../cmsConfig/userManagementConfig';
import { Form } from '../../components/Form';
import { SkygearUser } from '../../types';

interface VerificationFormProps {
  className?: string;
  user: SkygearUser;
  config: UserVerificationConfig;
}

interface VerificationFormState {
  userVerified: boolean;
  userVerificationFields: { [key: string]: boolean };
  successMessage: string;
  errorMessage: string;
  isSubmitting: boolean;
}

export class VerificationForm extends React.PureComponent<
  VerificationFormProps,
  VerificationFormState
> {
  constructor(props: VerificationFormProps) {
    super(props);

    this.state = {
      errorMessage: '',
      isSubmitting: false,
      successMessage: '',
      userVerificationFields: {},
      userVerified: false,
    };
  }

  public render() {
    const { className, config } = this.props;

    const {
      errorMessage,
      successMessage,
      userVerificationFields,
      userVerified,
      isSubmitting,
    } = this.state;

    return (
      <Form
        className={classnames('user-verification', className)}
        title="User Verification"
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitDisabled={!this.canSubmit() || isSubmitting}
        onSubmit={this.onFormSubmit}
      >
        <div className="user-page-form-group">
          <div className="user-page-form-label">
            <label htmlFor="password">Verified</label>
          </div>
          <div className="user-page-form-field toggle">
            <div className="toggle-container">
              <ReactToggle
                checked={userVerified}
                onChange={this.handleVerifiedChange}
              />
            </div>
          </div>
        </div>

        {config.fields.map(f => (
          <div key={f.name} className="user-page-form-group">
            <div className="user-page-form-label">
              <label htmlFor="password">{f.label} verified</label>
            </div>
            <div className="user-page-form-field toggle">
              <div className="toggle-container">
                <ReactToggle
                  checked={userVerificationFields[f.name]}
                  onChange={e => this.handleVerifiedFieldChange(e, f)}
                />
              </div>
            </div>
          </div>
        ))}
      </Form>
    );
  }

  private canSubmit = () => {
    return true;
  };

  private handleVerifiedChange: React.ReactEventHandler<
    ReactToggleElement
  > = event => {
    const checked = event.currentTarget.checked;
    this.setState({ ...this.state, userVerified: checked });
  };

  private handleVerifiedFieldChange = (
    event: React.SyntheticEvent<ReactToggleElement>,
    field: UserVerificationFieldConfig
  ) => {
    const checked = event.currentTarget.checked;
    this.setState({
      userVerificationFields: {
        ...this.state.userVerificationFields,
        [field.name]: checked,
      },
    });
  };

  private onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(this.state);
  };
}
