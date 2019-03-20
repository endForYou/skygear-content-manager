import './EmbeddedReferenceField.scss';

import classnames from 'classnames';
import * as React from 'react';
import skygear, { Record, Reference } from 'skygear';

import {
  EmbeddedAssociationReferenceListFieldConfig,
  FieldConfig,
  SortOrder,
} from '../cmsConfig';
import { Arrow, ArrowDirection } from '../components/Arrow';
import {
  Effect,
  EffectAll,
  RecordChange,
  RecordChangeHandler,
} from '../components/RecordFormPage';
import { objectValues, swap } from '../util';

import { PrimaryButton } from '../components/PrimaryButton';
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

export type EmbeddedAssociationReferenceFieldProps = RequiredFieldProps<
  EmbeddedAssociationReferenceListFieldConfig
>;

interface State {
  embeddedRecordUpdate: RecordChange[];
  embeddedRecordDelete: Record[];
  embeddedRecords: Record[];
  assoRecords: Record[];
}

export class EmbeddedAssociationReferenceField extends React.PureComponent<
  EmbeddedAssociationReferenceFieldProps,
  State
> {
  private embeddedRecordBeforeEffects: Array<{ [key: string]: Effect }>;
  private embeddedRecordAfterEffects: Array<{ [key: string]: Effect }>;

  constructor(props: EmbeddedAssociationReferenceFieldProps) {
    super(props);

    const { context, config } = props;
    const $transient = context.record.$transient;
    const embeddedRecords = ($transient[config.name] as Record[]) || [];
    const assoRecords =
      ($transient[`${config.name}Associations`] as Record[]) || [];

    this.state = {
      assoRecords,
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
      this.setState(pState => {
        pState.embeddedRecordUpdate[index][name] = value;
        pState.embeddedRecords[index][name] = value;
        return pState;
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
    this.setState(pState => {
      pState.embeddedRecordDelete.push(pState.assoRecords[index]);
      pState.embeddedRecordUpdate.splice(index, 1);
      pState.embeddedRecords.splice(index, 1);
      pState.assoRecords.splice(index, 1);
      return pState;
    });

    this.embeddedRecordBeforeEffects.splice(index, 1);
    this.embeddedRecordAfterEffects.splice(index, 1);

    this.applyEmbeddedRecordChange();
  }

  public handleEmbeddedRecordCreate() {
    const {
      config: { reference },
      context,
    } = this.props;
    const AssocRecordCls = Record.extend(
      reference.associationRecordConfig.cmsRecord.recordType
    );
    const sourceRecordType =
      reference.sourceReference.reference.targetCmsRecord.recordType;
    const targetRecordType =
      reference.targetReference.reference.targetCmsRecord.recordType;
    const RecordCls = Record.extend(
      reference.targetReference.reference.targetCmsRecord.recordType
    );
    this.setState(pState => {
      const newRecord = new RecordCls();
      const assoRecord = new AssocRecordCls({
        [reference.sourceReference.name]: new Reference(
          `${sourceRecordType}/${context.record._id}`
        ),
        [reference.targetReference.name]: new Reference(
          `${targetRecordType}/${newRecord._id}`
        ),
      });
      pState.assoRecords.push(assoRecord);
      pState.embeddedRecordUpdate.push({});
      pState.embeddedRecords.push(newRecord);
      return pState;
    });

    this.embeddedRecordBeforeEffects.push({});
    this.embeddedRecordAfterEffects.push({});

    this.applyEmbeddedRecordChange();
  }

  public handleEmbeddedRecordMove(from: number, to: number) {
    this.setState(pState => {
      swap(pState.assoRecords, from, to);
      swap(pState.embeddedRecordUpdate, from, to);
      swap(pState.embeddedRecords, from, to);
      return pState;
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
          // tslint:disable-next-line: no-any
          onRecordChange={(name: string, value: any, effect?: Effect) => {
            this.handleEmbeddedRecordChange(index, name, value, effect);
          }}
          onRecordMoveDown={() =>
            this.handleEmbeddedRecordMove(index, index + 1)
          }
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
          removable={config.editable && config.enableDeleteButton || false}
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
          embeddedRecordUpdate,
          embeddedRecords,
          assoRecords,
        } = this.state;

        const updateEffect = recordUpdateEffect(
          config,
          embeddedRecordUpdate,
          embeddedRecords
        );
        const assoRecordEffect = EffectAll([
          assoRecordSaveEffect(config, embeddedRecordUpdate, assoRecords),
          recordDeleteEffect(config, embeddedRecordDelete),
        ]);

        return Promise.resolve()
          .then(() =>
            this.embeddedRecordBeforeEffects.map(effectsByName =>
              EffectAll(objectValues(effectsByName))()
            )
          )
          .then(() => updateEffect())
          .then(() => assoRecordEffect())
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
        onFieldChange={(value, effect) =>
          onRecordChange(fieldConfig.name, value, effect)
        }
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
  config: EmbeddedAssociationReferenceListFieldConfig,
  updates: RecordChange[],
  embeddedRecords: Record[]
): Effect {
  return () => {
    if (updates.length === 0) {
      return Promise.resolve();
    }

    const RecordCls = Record.extend(
      config.reference.targetReference.reference.targetCmsRecord.recordType
    );

    const recordsToSave = updates.map((change, index) => {
      const recordId = embeddedRecords[index].id;
      return new RecordCls({
        _id: recordId,
        ...updates[index],
      });
    });
    return saveRecordsProperly(skygear.publicDB, recordsToSave);
  };
}

function assoRecordSaveEffect(
  config: EmbeddedAssociationReferenceListFieldConfig,
  updates: RecordChange[],
  assoRecords: Record[]
): Effect {
  return () => {
    if (assoRecords.length === 0) {
      return Promise.resolve();
    }

    if (config.positionFieldName != null) {
      // Reassign config.positionFieldName to bypass typescript bug
      const fieldName = config.positionFieldName;
      assoRecords.forEach((record, index) => {
        // Inject position data if positionFieldName given
        const positionIndex =
          config.sortOrder === SortOrder.Asc
            ? index
            : updates.length - index - 1;
        record[fieldName] = positionIndex;
      });
    }
    return saveRecordsProperly(skygear.publicDB, assoRecords);
  };
}

function recordDeleteEffect(
  config: EmbeddedAssociationReferenceListFieldConfig,
  deletes: Record[]
): Effect {
  return () => {
    if (deletes.length === 0) {
      return Promise.resolve();
    }

    return deleteRecordsProperly(skygear.publicDB, deletes);
  };
}
