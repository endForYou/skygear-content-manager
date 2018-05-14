import './ShowPage.scss';

import classnames from 'classnames';
import * as React from 'react';
import { Record } from 'skygear';

import {
  CmsRecord,
  FieldConfig,
  ShowActionConfig,
  ShowPageConfig,
} from '../cmsConfig';
import { LinkButton } from '../components/LinkButton';
import { SpaceSeperatedList } from '../components/SpaceSeperatedList';
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
          <div className="show-page">
            <Topbar
              title={this.props.config.label}
              actions={this.props.config.actions}
              actionContext={{ record: remoteRecord.value }}
            />
            <RecordView
              config={this.props.config}
              record={remoteRecord.value}
            />
          </div>
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
  return <form className="record-view">{formGroups}</form>;
}

interface FieldProps {
  fieldConfig: FieldConfig;
  record: Record;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig, record } = props;
  return (
    <div className="record-form-group">
      <div className="record-form-label">
        <label htmlFor={fieldConfig.name}>{fieldConfig.label}</label>
      </div>
      <Field
        className="record-form-field"
        config={fieldConfig}
        value={record[fieldConfig.name]}
        context={FieldContext(record)}
      />
    </div>
  );
}

interface TopbarProps {
  className?: string;
  title: string;
  actions: ShowActionConfig[];
  actionContext: object;
}

function Topbar({
  actionContext,
  actions,
  className,
  title,
}: TopbarProps): JSX.Element {
  return (
    <div className={classnames(className, 'topbar')}>
      <div className="title">{title}</div>
      <div className="action-container">
        <SpaceSeperatedList>
          {actions.map((action, index) => (
            <LinkButton
              className="show-action"
              key={index}
              actionConfig={action}
              context={actionContext}
            />
          ))}
        </SpaceSeperatedList>
      </div>
    </div>
  );
}
