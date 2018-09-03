import './EmbeddedReferenceField.scss';

import classnames from 'classnames';
import * as React from 'react';
import skygear, { Record, Reference } from 'skygear';

import {
  DeleteAction,
  EmbeddedBackReferenceListFieldConfig,
  FieldConfig,
  SortOrder,
} from '../cmsConfig';
import { Arrow, ArrowDirection } from '../components/Arrow';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  Effect,
  EffectAll,
  RecordChange,
  RecordChangeHandler,
} from '../components/RecordFormPage';
import { objectValues, swap } from '../util';

import { deleteRecordsProperly, saveRecordsProperly } from '../recordUtil';
import {
  FieldValidationError,
  hasValidationError,
} from '../validation/validation';
import {
  Field,
  FieldChangeHandler,
  FieldContext,
  RequiredFieldProps,
} from './Field';
import { ValidationAlert } from './validation/ValidationAlert';

export type EmbeddedBackReferenceListFieldProps = RequiredFieldProps<
  EmbeddedBackReferenceListFieldConfig
>;

interface State {
  embeddedRecordUpdate: RecordChange[];
  embeddedRecordDelete: Record[];
  embeddedRecords: Record[];
}

export class EmbeddedBackReferenceListField extends React.PureComponent<
  EmbeddedBackReferenceListFieldProps,
  State
> {
  private embeddedRecordBeforeEffects: Array<{ [key: string]: Effect }>;
  private embeddedRecordAfterEffects: Array<{ [key: string]: Effect }>;

  constructor(props: EmbeddedBackReferenceListFieldProps) {
    super(props);

    const { context, config } = props;
    const $transient = context.record.$transient;
    const embeddedRecords = ($transient[config.name] as Record[]) || [];

    this.state = {
      embeddedRecordDelete: [],
      embeddedRecordUpdate: embeddedRecords.map(() => ({})),
      embeddedRecords: [...embeddedRecords],
    };

    this.embeddedRecordBeforeEffects = embeddedRecords.map(() => ({}));
    this.embeddedRecordAfterEffects = embeddedRecords.map(() => ({}));

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
    beforeEffect?: Effect,
    afterEffect?: Effect
  ) {
    if (value !== undefined) {
      this.setState(prevState => {
        prevState.embeddedRecordUpdate[index][name] = value;
        prevState.embeddedRecords[index][name] = value;
        return prevState;
      });
    }

    if (beforeEffect) {
      this.embeddedRecordBeforeEffects[index][name] = beforeEffect;
    }

    if (afterEffect) {
      this.embeddedRecordAfterEffects[index][name] = afterEffect;
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

    this.embeddedRecordBeforeEffects.splice(index, 1);
    this.embeddedRecordAfterEffects.splice(index, 1);

    this.applyEmbeddedRecordChange();
  }

  public handleEmbeddedRecordCreate() {
    const { config, context } = this.props;
    const RecordCls = Record.extend(
      config.reference.targetCmsRecord.recordType
    );
    this.setState(prevState => {
      prevState.embeddedRecordUpdate.push({
        [config.reference.sourceFieldName]: new Reference(context.record),
      });
      prevState.embeddedRecords.push(new RecordCls());
      return prevState;
    });

    this.embeddedRecordBeforeEffects.push({});
    this.embeddedRecordAfterEffects.push({});

    this.applyEmbeddedRecordChange();
  }

  public handleEmbeddedRecordMove(from: number, to: number) {
    this.setState(prevState => {
      swap(prevState.embeddedRecordUpdate, from, to);
      swap(prevState.embeddedRecords, from, to);
      return prevState;
    });

    swap(this.embeddedRecordBeforeEffects, from, to);
    swap(this.embeddedRecordAfterEffects, from, to);

    this.applyEmbeddedRecordChange();
  }

  public render() {
    const { config, className, validationError } = this.props;
    const { embeddedRecords } = this.state;
    const items = embeddedRecords.map((r, index) => {
      const fieldValidationErrors =
        validationError != null ? validationError.embeddedErrors[index] : {};
      return (
        <EmbeddedRecordView
          key={r._id}
          className={classnames('embedded-record-view', {
            editable: config.editable,
          })}
          fieldConfigs={config.displayFields}
          onRecordChange={(
            name: string,
            // tslint:disable-next-line: no-any
            value: any,
            beforeEffect?: Effect,
            afterEffect?: Effect
          ) => {
            this.handleEmbeddedRecordChange(
              index,
              name,
              value,
              beforeEffect,
              afterEffect
            );
          }}
          onRecordMoveDown={() =>
            this.handleEmbeddedRecordMove(index, index + 1)}
          onRecordMoveUp={() => this.handleEmbeddedRecordMove(index, index - 1)}
          onRecordRemove={() => this.handleEmbeddedRecordRemove(index)}
          record={r}
          upMovable={
            !!(
              config.editable &&
              config.reorderEnabled &&
              config.positionFieldName != null &&
              index > 0
            )
          }
          downMovable={
            !!(
              config.editable &&
              config.reorderEnabled &&
              config.positionFieldName != null &&
              index < embeddedRecords.length - 1
            )
          }
          removable={config.editable || false}
          fieldValidationErrors={fieldValidationErrors}
        />
      );
    });

    return (
      <div className={classnames(className, 'embedded-back-reference')}>
        <ValidationAlert validationError={validationError} />
        <div className="embedded-back-reference-field">{items}</div>
        {config.editable && (
          <div>
            <PrimaryButton
              type="button"
              className="btn-add"
              onClick={this.handleEmbeddedRecordCreate}
            >
              Add New {config.label}
            </PrimaryButton>
          </div>
        )}
      </div>
    );
  }

  private applyEmbeddedRecordChange() {
    const { config, onFieldChange } = this.props;

    if (onFieldChange) {
      onFieldChange(undefined, undefined, () => {
        const {
          embeddedRecordDelete,
          embeddedRecords,
          embeddedRecordUpdate,
        } = this.state;

        const mainEffect = EffectAll([
          recordUpdateEffect(config, embeddedRecordUpdate, embeddedRecords),
          recordDeleteEffect(config, embeddedRecordDelete),
        ]);

        return Promise.resolve()
          .then(() =>
            this.embeddedRecordBeforeEffects.map(effectsByName =>
              EffectAll(objectValues(effectsByName))()
            )
          )
          .then(() => mainEffect())
          .then(() =>
            this.embeddedRecordAfterEffects.map(effectsByName =>
              EffectAll(objectValues(effectsByName))()
            )
          );
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
  fieldValidationErrors: { [key: string]: FieldValidationError } | undefined;
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
  fieldValidationErrors,
}: EmbeddedRecordViewProps): JSX.Element {
  const formGroups = fieldConfigs.map((fieldConfig, index) => {
    return (
      <FormGroup
        key={index}
        fieldConfig={fieldConfig}
        onFieldChange={(value, beforeEffect, affterEffect) =>
          onRecordChange(fieldConfig.name, value, beforeEffect, affterEffect)}
        record={record}
        validationError={
          fieldValidationErrors && fieldValidationErrors[fieldConfig.name]
        }
      />
    );
  });
  return (
    <div className={className}>
      {formGroups}
      <div className="embedded-record-buttons">
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
            className="embedded-record-button float-right"
            direction={ArrowDirection.Down}
            onClick={onRecordMoveDown}
          />
        )}
        {upMovable && (
          <Arrow
            className="embedded-record-button float-right"
            direction={ArrowDirection.Up}
            onClick={onRecordMoveUp}
          />
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  fieldConfig: FieldConfig;
  onFieldChange: FieldChangeHandler;
  record: Record;
  validationError: FieldValidationError | undefined;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig, onFieldChange, record, validationError } = props;
  return (
    <div className="record-form-group">
      <label
        className={classnames('record-form-label', {
          'validation-error': hasValidationError(validationError),
        })}
        htmlFor={fieldConfig.name}
      >
        {fieldConfig.label}
      </label>
      <Field
        className="record-form-field"
        config={fieldConfig}
        value={record[fieldConfig.name]}
        context={FieldContext(record)}
        onFieldChange={onFieldChange}
        validationError={validationError}
      />
    </div>
  );
}

function recordUpdateEffect(
  config: EmbeddedBackReferenceListFieldConfig,
  updates: RecordChange[],
  embeddedRecords: Record[]
): Effect {
  return () => {
    if (updates.length === 0) {
      return Promise.resolve();
    }

    const RecordCls = Record.extend(
      config.reference.targetCmsRecord.recordType
    );
    const recordsToSave = updates.map((change, index) => {
      const recordId = embeddedRecords[index].id;
      const data = { _id: recordId, ...updates[index] };

      // Inject position data if positionFieldName given
      if (config.reorderEnabled && config.positionFieldName != null) {
        const positionIndex =
          config.sortOrder === SortOrder.Asc
            ? index
            : updates.length - index - 1;
        data[config.positionFieldName] = positionIndex;
      }
      return new RecordCls(data);
    });
    return saveRecordsProperly(skygear.publicDB, recordsToSave);
  };
}

function recordDeleteEffect(
  config: EmbeddedBackReferenceListFieldConfig,
  deletes: Record[]
): Effect {
  return () => {
    if (deletes.length === 0) {
      return Promise.resolve();
    }

    const RecordCls = Record.extend(
      config.reference.targetCmsRecord.recordType
    );
    if (config.referenceDeleteAction === DeleteAction.NullifyReference) {
      // set reference to null only
      const recordsToDelete = deletes.map(
        record =>
          new RecordCls({
            _id: record.id,
            [config.reference.sourceFieldName]: null,
          })
      );
      return saveRecordsProperly(skygear.publicDB, recordsToDelete);
    } else {
      // delete the child record
      return deleteRecordsProperly(skygear.publicDB, deletes);
    }
  };
}
