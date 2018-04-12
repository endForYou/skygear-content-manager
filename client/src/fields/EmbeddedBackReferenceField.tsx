import './EmbeddedBackReferenceField.css';

import * as React from 'react';
import skygear, { Record, Reference } from 'skygear';

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
    const embeddedRecords = ($transient[config.name] as Record[]) || [];

    this.state = {
      embeddedRecordDelete: [],
      embeddedRecordUpdate: embeddedRecords.map(() => ({})),
      embeddedRecords: [...embeddedRecords],
    };

    this.embeddedRecordEffects = embeddedRecords.map(() => ({}));

    this.handleEmbeddedRecordChange = this.handleEmbeddedRecordChange.bind(
      this
    );
    this.handleEmbeddedRecordRemove = this.handleEmbeddedRecordRemove.bind(
      this
    );
    this.handleEmbeddedRecordCreate = this.handleEmbeddedRecordCreate.bind(
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

    if (effect) {
      this.embeddedRecordEffects[index][name] = effect;
    }

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

  public handleEmbeddedRecordCreate() {
    const { config, context } = this.props;
    const RecordCls = Record.extend(config.targetCmsRecord.recordType);
    this.setState(prevState => {
      prevState.embeddedRecordUpdate.push({
        [config.sourceFieldName]: new Reference(context.record),
      });
      prevState.embeddedRecords.push(new RecordCls());
      return prevState;
    });

    this.embeddedRecordEffects.push({});

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

    return (
      <div>
        <div className="embedded-back-reference-field">{items}</div>
        {config.editable && (
          <button
            type="button"
            className="btn btn-link"
            onClick={this.handleEmbeddedRecordCreate}
          >
            + Add New {config.label}
          </button>
        )}
      </div>
    );
  }

  private applyEmbeddedRecordChange() {
    const { config, onFieldChange } = this.props;

    if (onFieldChange) {
      onFieldChange(undefined, () => {
        // tslint:disable-next-line: no-any
        const promises: Array<Promise<any>> = [];

        // apply effects
        const effects = [].concat.apply(
          [],
          this.embeddedRecordEffects.map(effectsByName => {
            return Object.values(effectsByName)
              .filter(eff => eff !== undefined)
              .map(eff => eff());
          })
        );
        promises.push(Promise.all(effects));

        const RecordCls = Record.extend(config.targetCmsRecord.recordType);

        // apply record update
        const updates = this.state.embeddedRecordUpdate;
        if (updates.length > 0) {
          const recordsToSave = updates.map((change, index) => {
            const recordId = this.state.embeddedRecords[index].id;
            return new RecordCls({
              _id: recordId,
              ...updates[index],
            });
          });
          const saveRecord = skygear.publicDB.save(recordsToSave);
          promises.push(saveRecord);
        }

        // apply record delete
        // set reference to null only
        const deletes = this.state.embeddedRecordDelete;
        if (deletes.length > 0) {
          const recordsToDelete = deletes.map(
            record =>
              new RecordCls({ _id: record.id, [config.sourceFieldName]: null })
          );
          const deleteRecord = skygear.publicDB.save(recordsToDelete);
          promises.push(deleteRecord);
        }

        return Promise.all(promises);
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
    <div className={className}>
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
    </div>
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
