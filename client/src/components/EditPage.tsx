import * as React from 'react';
import { Record } from 'skygear';

import { EditPageConfig, FieldConfig, FieldConfigType } from '../cmsConfig';
import { StringField } from '../fields';

export interface EditPageProps {
  config: EditPageConfig;
  record: Record;
}

export class EditPage extends React.PureComponent<EditPageProps> {
  public render() {
    const { config, record } = this.props;

    const formGroups = config.fields.map((fieldConfig, index) => {
      return (
        <FormGroup key={index} fieldConfig={fieldConfig} record={record} />
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

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    alert('Form submitted');

    event.preventDefault();
  };
}

interface FieldProps {
  fieldConfig: FieldConfig;
  record: Record;
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
  const { fieldConfig, record } = props;
  switch (fieldConfig.type) {
    case FieldConfigType.String:
      return (
        <StringField
          className="form-control"
          name={fieldConfig.name}
          editable={fieldConfig.editable}
          value={record[fieldConfig.name]}
        />
      );
    default:
      throw new Error(`unknown field type = ${fieldConfig.type}`);
  }
}
