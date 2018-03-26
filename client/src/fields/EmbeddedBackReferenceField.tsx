import './EmbeddedBackReferenceField.css';

import * as React from 'react';
import skygear, { Record } from 'skygear';

import { EmbeddedBackReferenceFieldConfig, FieldConfig } from '../cmsConfig';
import {
  Effect,
  RecordChange,
  RecordChangeHandler,
} from '../components/RecordFormPage';

import {
  Field,
  FieldChangeHandler,
  FieldContext,
  RequiredFieldProps,
} from './Field';

export type EmbeddedBackReferenceFieldProps = RequiredFieldProps<
  EmbeddedBackReferenceFieldConfig
>;

interface State {
  embeddedRecordChange: RecordChange[];
  embeddedRecords: Record[];
}

export class EmbeddedBackReferenceField extends React.PureComponent<
  EmbeddedBackReferenceFieldProps,
  State
> {
  private embeddedRecordEffects: Array<{ [key: string]: Effect }>;

  constructor(props: EmbeddedBackReferenceFieldProps) {
    super(props);

    const embeddedRecords = this.embeddedRecords(props);

    this.state = {
      embeddedRecordChange: embeddedRecords.map(() => ({})),
      embeddedRecords: [...embeddedRecords],
    };

    this.embeddedRecordEffects = [];

    this.handleEmbeddedRecordChange = this.handleEmbeddedRecordChange.bind(
      this
    );
  }

  public handleEmbeddedRecordChange(
    index: number,
    name: string,
    // tslint:disable-next-line: no-any
    value: any,
    effect?: Effect
  ) {
    this.setState(prevState => {
      prevState.embeddedRecordChange[index][name] = value;
      prevState.embeddedRecords[index][name] = value;
      return prevState;
    });

    const embeddedRecordEffect = this.embeddedRecordEffects[index] || {};
    if (effect) {
      embeddedRecordEffect[name] = effect;
    }

    this.embeddedRecordEffects[index] = embeddedRecordEffect;

    this.applyEmbeddedRecordChange();
  }

  public render() {
    const { config } = this.props;
    const { embeddedRecords } = this.state;

    const items = embeddedRecords.map((r, index) => {
      return (
        <EmbeddedRecordView
          key={r._id}
          className="embedded-record-view"
          fieldConfigs={config.displayFields}
          // tslint:disable-next-line: no-any
          onRecordChange={(name: string, value: any, effect?: Effect) => {
            this.handleEmbeddedRecordChange(index, name, value, effect);
          }}
          record={r}
        />
      );
    });

    return <div className="embedded-back-reference-field">{items}</div>;
  }

  private embeddedRecords(props: EmbeddedBackReferenceFieldProps): Record[] {
    const { context, config } = props;
    const $transient = context.record.$transient;
    const targetRecords = $transient[config.name] as Record[];
    return targetRecords;
  }

  private applyEmbeddedRecordChange() {
    const { config, onFieldChange } = this.props;

    if (onFieldChange) {
      onFieldChange(undefined, () => {
        // apply effects
        const effects = [].concat.apply(
          [],
          this.embeddedRecordEffects.map(effectsByName => {
            return Object.values(effectsByName)
              .filter(eff => eff !== undefined)
              .map(eff => eff());
          })
        );

        // apply record update
        const changes = this.state.embeddedRecordChange;
        const RecordCls = Record.extend(config.targetCmsRecord.recordType);
        const recordsToSave = this.embeddedRecords(
          this.props
        ).map((record, index) => {
          return new RecordCls({
            _id: record.id,
            ...changes[index],
          });
        });

        const saveRecord = skygear.publicDB.save(recordsToSave);

        return Promise.all([...effects, saveRecord]);
      });
    }
  }
}

interface EmbeddedRecordViewProps {
  className: string;
  fieldConfigs: FieldConfig[];
  onRecordChange: RecordChangeHandler;
  record: Record;
}

function EmbeddedRecordView({
  className,
  fieldConfigs,
  onRecordChange,
  record,
}: EmbeddedRecordViewProps): JSX.Element {
  const formGroups = fieldConfigs.map((fieldConfig, index) => {
    return (
      <FormGroup
        key={index}
        fieldConfig={fieldConfig}
        onFieldChange={(value, effect) =>
          onRecordChange(fieldConfig.name, value, effect)}
        record={record}
      />
    );
  });
  return <form className={className}>{formGroups}</form>;
}

interface FieldProps {
  fieldConfig: FieldConfig;
  onFieldChange: FieldChangeHandler;
  record: Record;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig, onFieldChange, record } = props;
  return (
    <div className="form-group">
      <label htmlFor={fieldConfig.name}>{fieldConfig.label}</label>
      <Field
        className="form-control"
        config={fieldConfig}
        value={record[fieldConfig.name]}
        context={FieldContext(record)}
        onFieldChange={onFieldChange}
      />
    </div>
  );
}
