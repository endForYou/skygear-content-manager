import './EmbeddedBackReferenceField.css';

import * as React from 'react';
import skygear, { Record } from 'skygear';

import { EmbeddedBackReferenceFieldConfig, FieldConfig } from '../cmsConfig';
import {
  Effect,
  RecordChange,
  RecordChangeHandler,
} from '../components/RecordFormPage';
import { deleteRecordsProperly } from '../recordUtil';

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
  embeddedRecordUpdate: RecordChange[];
  embeddedRecordDelete: Record[];
  embeddedRecords: Record[];
}

export class EmbeddedBackReferenceField extends React.PureComponent<
  EmbeddedBackReferenceFieldProps,
  State
> {
  private embeddedRecordEffects: Array<{ [key: string]: Effect }>;

  constructor(props: EmbeddedBackReferenceFieldProps) {
    super(props);

    const { context, config } = props;
    const $transient = context.record.$transient;
    const embeddedRecords = $transient[config.name] as Record[];

    this.state = {
      embeddedRecordDelete: [],
      embeddedRecordUpdate: embeddedRecords.map(() => ({})),
      embeddedRecords: [...embeddedRecords],
    };

    this.embeddedRecordEffects = [];

    this.handleEmbeddedRecordChange = this.handleEmbeddedRecordChange.bind(
      this
    );
    this.handleEmbeddedRecordRemove = this.handleEmbeddedRecordRemove.bind(
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
      prevState.embeddedRecordUpdate[index][name] = value;
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

  public handleEmbeddedRecordRemove(index: number) {
    this.setState(prevState => {
      prevState.embeddedRecordDelete.push(prevState.embeddedRecords[index]);
      prevState.embeddedRecordUpdate.splice(index, 1);
      prevState.embeddedRecords.splice(index, 1);
      return prevState;
    });

    this.embeddedRecordEffects.splice(index, 1);

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
          onRecordRemove={() => this.handleEmbeddedRecordRemove(index)}
          record={r}
          removable={config.editable || false}
        />
      );
    });

    return <div className="embedded-back-reference-field">{items}</div>;
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

        const RecordCls = Record.extend(config.targetCmsRecord.recordType);

        // apply record update
        const updates = this.state.embeddedRecordUpdate;
        const recordsToSave = updates.map((change, index) => {
          const recordId = this.state.embeddedRecords[index].id;
          return new RecordCls({
            _id: recordId,
            ...updates[index],
          });
        });
        const saveRecord = skygear.publicDB.save(recordsToSave);

        // apply record delete
        const deletes = this.state.embeddedRecordDelete;
        const recordsToDelete = deletes.map(
          record => new RecordCls({ _id: record.id })
        );
        const deleteRecord = deleteRecordsProperly(
          skygear.publicDB,
          recordsToDelete
        );

        return Promise.all([...effects, saveRecord, deleteRecord]);
      });
    }
  }
}

interface EmbeddedRecordViewProps {
  className: string;
  fieldConfigs: FieldConfig[];
  onRecordChange: RecordChangeHandler;
  onRecordRemove: () => void;
  record: Record;
  removable: boolean;
}

function EmbeddedRecordView({
  className,
  fieldConfigs,
  onRecordChange,
  onRecordRemove,
  record,
  removable,
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
  return (
    <form className={className}>
      {removable && (
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={onRecordRemove}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {formGroups}
    </form>
  );
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
