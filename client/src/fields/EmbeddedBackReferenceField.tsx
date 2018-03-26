import './EmbeddedBackReferenceField.css';

import * as React from 'react';
import { Record } from 'skygear';

import { EmbeddedBackReferenceFieldConfig, FieldConfig } from '../cmsConfig';

import { Field, FieldContext, RequiredFieldProps } from './Field';

export type EmbeddedBackReferenceFieldProps = RequiredFieldProps<
  EmbeddedBackReferenceFieldConfig
>;

export class EmbeddedBackReferenceField extends React.PureComponent<
  EmbeddedBackReferenceFieldProps
> {
  public render() {
    const { context, config } = this.props;

    const $transient = context.record.$transient;

    if (config.editable) {
      // TODO (Steven-Chan):
      // back reference editable component
      return null;
    }

    const targetFieldName = config.name;
    const targetRecords = $transient[targetFieldName] as Record[];

    const items = targetRecords.map(r => {
      return (
        <EmbeddedRecordView
          key={r._id}
          className="embedded-record-view"
          fieldConfigs={config.displayFields}
          record={r}
        />
      );
    });

    return <div className="embedded-back-reference-field">{items}</div>;
  }
}

interface EmbeddedRecordViewProps {
  className: string;
  fieldConfigs: FieldConfig[];
  record: Record;
}

function EmbeddedRecordView({
  className,
  fieldConfigs,
  record,
}: EmbeddedRecordViewProps): JSX.Element {
  const formGroups = fieldConfigs.map((fieldConfig, index) => {
    return <FormGroup key={index} fieldConfig={fieldConfig} record={record} />;
  });
  return <form className={className}>{formGroups}</form>;
}

interface FieldProps {
  fieldConfig: FieldConfig;
  record: Record;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig, record } = props;
  return (
    <div className="form-group">
      <label htmlFor={fieldConfig.name}>{fieldConfig.label}</label>
      <Field
        className="form-control"
        config={fieldConfig}
        value={record[fieldConfig.name]}
        context={FieldContext(record)}
      />
    </div>
  );
}
