import * as React from 'react';
import { OutlawError, Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { EditPageConfig, FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { StringField } from '../fields';
import { Remote, RemoteType } from '../types';

export interface EditPageProps {
  config: EditPageConfig;
  record: Record;
  savingRecord?: Remote<Record>;
  recordDispatcher: RecordActionDispatcher;
}

interface State {
  recordChange: RecordChange;
}

interface RecordChange {
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

// tslint:disable-next-line: no-any
type RecordChangeHandler = (name: string, value: any) => void;

export class EditPage extends React.PureComponent<EditPageProps, State> {
  constructor(props: EditPageProps) {
    super(props);

    this.state = {
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
          {errorMessageFromError(savingRecord.error)}
        </div>
      ) : (
        undefined
      );

    return (
      <form onSubmit={this.handleSubmit}>
        <h1 className="display-4">{config.label}</h1>
        {formGroups}
        {errorMessage}
        <SubmitButton savingRecord={savingRecord} />
      </form>
    );
  }

  public handleRecordChange: RecordChangeHandler = (name, value) => {
    this.state.recordChange[name] = value;
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    // better clone the record if possible
    const { record, recordDispatcher } = this.props;
    const { recordChange } = this.state;

    mergeRecordChange(record, recordChange);

    recordDispatcher.save(record);
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
      <Field {...props} />
    </div>
  );
}

function Field(props: FieldProps): JSX.Element {
  const { fieldConfig, onRecordChange, record, recordChange } = props;
  const { name } = fieldConfig;

  switch (fieldConfig.type) {
    case FieldConfigTypes.String:
      const fieldValue =
        recordChange[name] === undefined ? record[name] : recordChange[name];
      return (
        <StringField
          className="form-control"
          name={name}
          editable={fieldConfig.editable}
          value={fieldValue}
          onFieldChange={value => onRecordChange(name, value)}
        />
      );
    default:
      throw new Error(`unknown field type = ${fieldConfig.type}`);
  }
}

export function errorMessageFromError(e: Error) {
  // tslint:disable-next-line: no-any
  const anyError = e as any;
  if (!anyError.error) {
    return `Failed to save record: ${anyError}`;
  }

  const error = anyError as OutlawError;
  return `Failed to save record: ${error.error.message}`;
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
