import './EmbeddedBackReferenceField.css';

import classnames from 'classnames';
import * as React from 'react';
import skygear, { Record, Reference } from 'skygear';

import {
  DeleteAction,
  EmbeddedBackReferenceFieldConfig,
  FieldConfig,
  SortOrder,
} from '../cmsConfig';
import { Arrow, ArrowDirection } from '../components/Arrow';
import {
  Effect,
  RecordChange,
  RecordChangeHandler,
} from '../components/RecordFormPage';
import { swap } from '../util';

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
    this.handleEmbeddedRecordMove = this.handleEmbeddedRecordMove.bind(this);
  }

  public handleEmbeddedRecordChange(
    index: number,
    name: string,
    // tslint:disable-next-line: no-any
    value: any,
    effect?: Effect
  ) {
    if (value !== undefined) {
      this.setState(prevState => {
        prevState.embeddedRecordUpdate[index][name] = value;
        prevState.embeddedRecords[index][name] = value;
        return prevState;
      });
    }

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

  public handleEmbeddedRecordMove(from: number, to: number) {
    this.setState(prevState => {
      swap(prevState.embeddedRecordUpdate, from, to);
      swap(prevState.embeddedRecords, from, to);
      return prevState;
    });

    swap(this.embeddedRecordEffects, from, to);

    this.applyEmbeddedRecordChange();
  }

  public render() {
    const { config } = this.props;
    const { embeddedRecords } = this.state;

    const items = embeddedRecords.map((r, index) => {
      return (
        <EmbeddedRecordView
          key={r._id}
          className={classnames('embedded-record-view', {
            editable: config.editable,
          })}
          fieldConfigs={config.displayFields}
          // tslint:disable-next-line: no-any
          onRecordChange={(name: string, value: any, effect?: Effect) => {
            this.handleEmbeddedRecordChange(index, name, value, effect);
          }}
          onRecordMoveDown={() =>
            this.handleEmbeddedRecordMove(index, index + 1)}
          onRecordMoveUp={() => this.handleEmbeddedRecordMove(index, index - 1)}
          onRecordRemove={() => this.handleEmbeddedRecordRemove(index)}
          record={r}
          upMovable={
            !!(config.editable && config.positionFieldName != null && index > 0)
          }
          downMovable={
            !!(
              config.editable &&
              config.positionFieldName != null &&
              index < embeddedRecords.length - 1
            )
          }
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
            const data = {
              _id: recordId,
              ...updates[index],
            };

            // Inject position data if positionFieldName given
            if (config.positionFieldName != null) {
              const positionIndex =
                config.sortOrder === SortOrder.Asc
                  ? index
                  : updates.length - index - 1;
              data[config.positionFieldName] = positionIndex;
            }
            return new RecordCls(data);
          });
          const saveRecord = skygear.publicDB.save(recordsToSave);
          promises.push(saveRecord);
        }

        // apply record delete
        const deletes = this.state.embeddedRecordDelete;
        if (deletes.length > 0) {
          if (config.referenceDeleteAction === DeleteAction.NullifyReference) {
            // set reference to null only
            const recordsToDelete = deletes.map(
              record =>
                new RecordCls({
                  _id: record.id,
                  [config.sourceFieldName]: null,
                })
            );
            promises.push(skygear.publicDB.save(recordsToDelete));
          } else {
            // delete the child record
            promises.push(skygear.publicDB.delete(deletes));
          }
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
  onRecordMoveDown: () => void;
  onRecordMoveUp: () => void;
  onRecordRemove: () => void;
  record: Record;
  removable: boolean;
  upMovable: boolean;
  downMovable: boolean;
}

function EmbeddedRecordView({
  className,
  downMovable,
  fieldConfigs,
  onRecordChange,
  onRecordMoveDown,
  onRecordMoveUp,
  onRecordRemove,
  record,
  removable,
  upMovable,
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
          className="embedded-record-button close"
          aria-label="Close"
          onClick={onRecordRemove}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {downMovable && (
        <Arrow
          className="embedded-record-button sort-button float-right"
          direction={ArrowDirection.Down}
          onClick={onRecordMoveDown}
        />
      )}
      {upMovable && (
        <Arrow
          className="embedded-record-button sort-button float-right"
          direction={ArrowDirection.Up}
          onClick={onRecordMoveUp}
        />
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
