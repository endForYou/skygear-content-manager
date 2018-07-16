import classnames from 'classnames';
import * as React from 'react';
import ReactToggle, { ReactToggleElement } from 'react-toggle';
import skygear, { Record } from 'skygear';

import {
  UserVerificationConfig,
  UserVerificationFieldConfig,
} from '../../cmsConfig/userManagementConfig';
import { Form } from '../../components/Form';
import { isOutlawError } from '../../recordUtil';
import { SkygearUser } from '../../types';
import { objectFrom } from '../../util';

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
      ...this.deriveVerificationStateFromUserRecord(
        props.config,
        props.user.record
      ),
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

  private deriveVerificationStateFromUserRecord = (
    config: UserVerificationConfig,
    record?: Record
  ) => {
    if (record == null) {
      return {
        userVerificationFields: {},
        userVerified: false,
      };
    }

    const fields = config.fields.map(
      f => [f.name, !!record[`${f.name}_verified`]] as [string, boolean]
    );
    return {
      userVerificationFields: objectFrom(fields),
      userVerified: record.is_verified,
    };
  };

  private canSubmit = () => {
    return !this.state.isSubmitting;
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

    this.setState({ isSubmitting: true });

    const { config, user } = this.props;
    const { userVerificationFields, userVerified } = this.state;

    const fieldVerificationData = config.fields.reduce(
      (acc, f) => ({
        ...acc,
        [`${f.name}_verified`]: userVerificationFields[f.name],
      }),
      {}
    );

    const userRecord = new skygear.UserRecord({
      _id: `user/${user.id}`,
      is_verified: userVerified,
      ...fieldVerificationData,
    });

    // TODO:
    // Move this part to redux store if other component requires these updates
    skygear.publicDB
      .save(userRecord)
      .then(record => {
        this.setState({
          isSubmitting: false,
          successMessage: 'Success!',
          ...this.deriveVerificationStateFromUserRecord(config, record),
        });
      })
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
