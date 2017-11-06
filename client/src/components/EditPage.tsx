import * as React from 'react';
import { Record } from 'skygear';

import { saveRecord } from '../actions/record';
import { EditPageConfig, FieldConfig, FieldConfigType } from '../cmsConfig';
import { StringField } from '../fields';

export interface EditPageProps {
  config: EditPageConfig;
  record: Record;
  saveRecord: typeof saveRecord;
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
    const { config, record } = this.props;

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
      <form onSubmit={this.handleSubmit}>
        <h1 className="display-4">{config.label}</h1>
        {formGroups}
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>
    );
  }

  public handleRecordChange: RecordChangeHandler = (name, value) => {
    this.state.recordChange[name] = value;
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    // better clone the record if possible
    const {
      config: { cmsRecord },
      record,
      saveRecord: saveRecordFunc,
    } = this.props;
    const { recordChange } = this.state;

    mergeRecordChange(record, recordChange);

    saveRecordFunc(cmsRecord, record);
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
    case FieldConfigType.String:
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

function mergeRecordChange(record: Record, change: RecordChange) {
  Object.entries(change).forEach(([key, value]) => {
    record[key] = value;
  });
}
