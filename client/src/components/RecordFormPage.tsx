import './RecordFormPage.scss';

import classnames from 'classnames';
import * as React from 'react';
import { Dispatch } from 'react-redux';
import { push } from 'react-router-redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { FieldConfig, RecordFormPageConfig } from '../cmsConfig';
import { Field, FieldContext } from '../fields';
import { errorMessageFromError, isRecordsOperationError } from '../recordUtil';
import { RootState } from '../states';
import { Remote, RemoteType } from '../types';
import { entriesOf, objectValues } from '../util';
import { Form } from './Form';

// TODO: Reduce reused components between edit and new page
// in order to support future requirements such as custom input validation during
// record submission.
// e.g. Reduce reused part into RecordForm only instead of RecordFormPage.
export interface RecordFormPageProps {
  className?: string;
  config: RecordFormPageConfig;
  dispatch: Dispatch<RootState>;
  record: Record;
  savingRecord?: Remote<Record>;
  recordDispatcher: RecordActionDispatcher;
}

// Effectively a Promise Factory
// tslint:disable-next-line: no-any
export type Effect = () => Promise<any>;

interface State {
  recordChange: RecordChange;

  // Side effects produced by fields. They will get executed after record is
  // saved successfully.
  beforeEffectChange: RecordEffect;
  afterEffectChange: RecordEffect;

  effectError?: Error;
}

export interface RecordChange {
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

interface RecordEffect {
  [key: string]: Effect | undefined;
}

// Handle change propagated from Field. A undefined value would yield no changes
// on State.recordChange[name].
export type RecordChangeHandler = (
  name: string,
  // tslint:disable-next-line: no-any
  value: any,
  beforeEffect?: Effect,
  afterEffect?: Effect
) => void;

class RecordFormPageImpl extends React.PureComponent<
  RecordFormPageProps,
  State
> {
  constructor(props: RecordFormPageProps) {
    super(props);

    this.state = {
      afterEffectChange: {},
      beforeEffectChange: {},
      recordChange: {},
    };
  }

  public renderErrorMessage() {
    const { savingRecord } = this.props;
    const { effectError } = this.state;

    if (effectError != null && isRecordsOperationError(effectError)) {
      return (
        <div className="alert alert-danger" role="alert">
          {`${effectError}`}
          {effectError.errors.map((err, index) => (
            <div key={index}>- ${err.message}</div>
          ))}
        </div>
      );
    }

    const errorDescription =
      effectError != null
        ? `${effectError}`
        : savingRecord && savingRecord.type === RemoteType.Failure
          ? errorMessageFromError(savingRecord.error)
          : undefined;

    if (errorDescription == null) {
      return null;
    }

    return (
      <div className="alert alert-danger" role="alert">
        Failed to save record: {errorDescription}
      </div>
    );
  }

  public render() {
    const { className, config, record, savingRecord } = this.props;

    const formGroups = config.fields.map((fieldConfig, index) => {
      return (
        <FormGroup
          key={index}
          fieldConfig={fieldConfig}
          record={record}
          recordChange={this.state.recordChange}
          onRecordChange={this.handleRecordChange}
        />
      );
    });

    return (
      <Form
        className={classnames(className, 'record-form-page')}
        submitDisabled={
          savingRecord !== undefined && savingRecord.type === RemoteType.Loading
        }
        onSubmit={this.handleSubmit}
      >
        <div className="record-form-groups">
          {formGroups}
          {this.renderErrorMessage()}
        </div>
      </Form>
    );
  }

  public handleRecordChange: RecordChangeHandler = (
    name,
    value,
    beforeEffect,
    afterEffect
  ) => {
    if (value !== undefined) {
      this.setState(prevState => {
        return {
          recordChange: { ...prevState.recordChange, [name]: value },
        };
      });
    }

    this.setState(prevState => {
      return {
        afterEffectChange: {
          ...prevState.afterEffectChange,
          [name]: afterEffect,
        },
        beforeEffectChange: {
          ...prevState.beforeEffectChange,
          [name]: beforeEffect,
        },
      };
    });
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    this.setState({ effectError: undefined });

    // better clone the record if possible
    const { record, recordDispatcher } = this.props;
    const { recordChange, beforeEffectChange, afterEffectChange } = this.state;

    mergeRecordChange(record, recordChange);

    Promise.resolve()
      .then(() => EffectAll(objectValues(beforeEffectChange))())
      .then(() =>
        // Hotfix:
        // save error is handled by redux, thus keep the effectError null
        recordDispatcher.save(record).catch(() => Promise.reject(null))
      )
      .then(() => EffectAll(objectValues(afterEffectChange))())
      .then(() => {
        const { config: { cmsRecord }, dispatch } = this.props;
        dispatch(push(`/record/${cmsRecord.name}/${record._id}`));
      })
      .catch(effectError => this.setState({ effectError }));
  };
}

interface FieldProps {
  fieldConfig: FieldConfig;
  record: Record;
  recordChange: RecordChange;
  onRecordChange: RecordChangeHandler;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig } = props;
  return (
    <div className="record-form-group">
      <div className="record-form-label">
        <label htmlFor={fieldConfig.name}>{fieldConfig.label}</label>
      </div>
      <FormField {...props} />
    </div>
  );
}

function FormField(props: FieldProps): JSX.Element {
  const { fieldConfig, onRecordChange, record, recordChange } = props;
  const { name } = fieldConfig;

  const fieldValue =
    recordChange[name] === undefined ? record[name] : recordChange[name];
  return (
    <Field
      className="record-form-field"
      config={fieldConfig}
      value={fieldValue}
      context={FieldContext(record)}
      onFieldChange={(value, beforeEffect, afterEffect) =>
        onRecordChange(name, value, beforeEffect, afterEffect)}
    />
  );
}

// interface SubmitProps {
//   savingRecord?: Remote<Record>;
// }

// function SubmitButton(props: SubmitProps): JSX.Element {
//   const { savingRecord } = props;
//   if (savingRecord !== undefined && savingRecord.type === RemoteType.Loading) {
//     return (
//       <PrimaryButton type="submit" className="btn-submit" disabled={true}>
//         Save
//       </PrimaryButton>
//     );
//   } else {
//     return (
//       <PrimaryButton type="submit" className="btn-submit">
//         Save
//       </PrimaryButton>
//     );
//   }
// }

function mergeRecordChange(record: Record, change: RecordChange) {
  entriesOf(change).forEach(([key, value]) => {
    record[key] = value;
  });
}

export function EffectAll(effects: Effect[]): Effect {
  return () => Promise.all(effects.map(ef => ef()));
}

export const RecordFormPage: React.ComponentClass<
  RecordFormPageProps
> = RecordFormPageImpl;
