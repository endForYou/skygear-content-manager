import * as React from 'react';
import { Dispatch } from 'react-redux';
import { push } from 'react-router-redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { FieldConfig, RecordFormPageConfig } from '../cmsConfig';
import { LinkButton } from '../components/LinkButton';
import { SpaceSeperatedList } from '../components/SpaceSeperatedList';
import { Field, FieldContext } from '../fields';
import { errorMessageFromError } from '../recordUtil';
import { RootState } from '../states';
import { Remote, RemoteType } from '../types';

// TODO: Reduce reused components between edit and new page
// in order to support future requirements such as custom input validation during
// record submission.
// e.g. Reduce reused part into RecordForm only instead of RecordFormPage.
export interface RecordFormPageProps {
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
  effectChange: RecordEffect;
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
  effect?: Effect
) => void;

class RecordFormPageImpl extends React.PureComponent<
  RecordFormPageProps,
  State
> {
  constructor(props: RecordFormPageProps) {
    super(props);

    this.state = {
      effectChange: {},
      recordChange: {},
    };
  }

  public render() {
    const { config, record, savingRecord } = this.props;

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

    const errorMessage =
      savingRecord && savingRecord.type === RemoteType.Failure ? (
        <div className="alert alert-danger" role="alert">
          Failed to save record: {errorMessageFromError(savingRecord.error)}
        </div>
      ) : (
        undefined
      );

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="navbar">
          <h1 className="display-4">{config.label}</h1>
          <div className="float-right">
            <SpaceSeperatedList>
              {config.actions.map((action, index) => (
                <LinkButton
                  key={index}
                  actionConfig={action}
                  context={{ record }}
                />
              ))}
            </SpaceSeperatedList>
          </div>
        </div>
        {formGroups}
        {errorMessage}
        <SubmitButton savingRecord={savingRecord} />
      </form>
    );
  }

  public handleRecordChange: RecordChangeHandler = (name, value, effect) => {
    if (value !== undefined) {
      this.setState(prevState => {
        return {
          recordChange: { ...prevState.recordChange, [name]: value },
        };
      });
    }

    this.setState(prevState => {
      return {
        effectChange: { ...prevState.effectChange, [name]: effect },
      };
    });
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    // better clone the record if possible
    const { record, recordDispatcher } = this.props;
    const { recordChange, effectChange } = this.state;

    mergeRecordChange(record, recordChange);

    recordDispatcher
      .save(record)
      .then(() => {
        const effects = Object.values(effectChange).filter(
          eff => eff !== undefined
        ) as Effect[];
        return Promise.all(effects.map(eff => eff()));
      })
      .then(() => {
        const { config: { cmsRecord }, dispatch } = this.props;
        dispatch(push(`/record/${cmsRecord.name}/${record._id}`));
      });
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
    <div className="form-group">
      <label htmlFor={fieldConfig.name}>{fieldConfig.label}</label>
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
      className="form-control"
      config={fieldConfig}
      value={fieldValue}
      context={FieldContext(record)}
      onFieldChange={(value, effect) => onRecordChange(name, value, effect)}
    />
  );
}

interface SubmitProps {
  savingRecord?: Remote<Record>;
}

function SubmitButton(props: SubmitProps): JSX.Element {
  const { savingRecord } = props;
  if (savingRecord !== undefined && savingRecord.type === RemoteType.Loading) {
    return (
      <button type="submit" className="btn btn-primary" disabled={true}>
        Save
      </button>
    );
  } else {
    return (
      <button type="submit" className="btn btn-primary">
        Save
      </button>
    );
  }
}

function mergeRecordChange(record: Record, change: RecordChange) {
  Object.entries(change).forEach(([key, value]) => {
    record[key] = value;
  });
}

export const RecordFormPage: React.ComponentClass<
  RecordFormPageProps
> = RecordFormPageImpl;
