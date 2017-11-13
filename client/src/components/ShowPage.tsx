import * as React from 'react';
import { Record } from 'skygear';

import { CmsRecord, FieldConfig, ShowPageConfig } from '../cmsConfig';
import { Field, FieldContext } from '../fields';
import { Remote, RemoteType } from '../types';

export interface ShowPageProps {
  cmsRecord: CmsRecord;
  recordId: string;
  config: ShowPageConfig;
  remoteRecord: Remote<Record>;
}

export class ShowPage extends React.PureComponent<ShowPageProps> {
  public render() {
    const { remoteRecord } = this.props;
    switch (remoteRecord.type) {
      case RemoteType.Loading:
        return <div>Loading record...</div>;
      case RemoteType.Success:
        return (
          <RecordView config={this.props.config} record={remoteRecord.value} />
        );
      case RemoteType.Failure:
        return (
          <div>Couldn&apos;t fetch record: {remoteRecord.error.message}</div>
        );
      default:
        throw new Error(
          `Unknown remote record type = ${this.props.remoteRecord.type}`
        );
    }
  }
}

interface RecordViewProps {
  config: ShowPageConfig;
  record: Record;
}

function RecordView({ config, record }: RecordViewProps): JSX.Element {
  const formGroups = config.fields.map((fieldConfig, index) => {
    return <FormGroup key={index} fieldConfig={fieldConfig} record={record} />;
  });
  return (
    <form>
      <h1 className="display-4">{config.label}</h1>
      {formGroups}
    </form>
  );
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
