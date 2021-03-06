import classnames from 'classnames';
import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
import skygear, { Query, Record, Reference } from 'skygear';

import { AssociationReferenceSelectFieldConfig } from '../cmsConfig';
import { Effect } from '../components/RecordFormPage';
import { deleteRecordsProperly, parseReference } from '../recordUtil';
import { debouncePromise1, makeArray, objectFrom } from '../util';

import { applyPredicatesToQuery } from '../actions/record';
import { hasValidationError } from '../validation/validation';
import { RequiredFieldProps } from './Field';
import { ValidationText } from './validation/ValidationText';

export type AssociationRecordSelectProps = RequiredFieldProps<
  AssociationReferenceSelectFieldConfig
>;

interface State {
  options: TargetOption[];
}

interface TargetOption {
  label: string; // targetRecord's display field
  value: string; // targetRecord id
}

function TargetOption(label: string, value: string): TargetOption {
  return { label, value };
}

type StringSelectAsyncCtor<T> = new () => SelectAsync<T>;
const StringSelectAsync = SelectAsync as StringSelectAsyncCtor<string>;

class AssociationRecordSelectImpl extends React.PureComponent<
  AssociationRecordSelectProps,
  State
> {
  // return the association records from props
  get assoRecords(): Record[] {
    const { config, context } = this.props;
    return context.record.$transient[`${config.name}Associations`] || [];
  }

  get targets(): Record[] {
    const { config } = this.props;
    return this.assoRecords.map(
      assoRecord => assoRecord.$transient[config.reference.targetReference.name]
    );
  }

  constructor(props: AssociationRecordSelectProps) {
    super(props);

    this.state = {
      options: this.targets.map(r => targetToOption(r, this.props.config)),
    };
  }

  render() {
    const {
      className,
      context,
      config,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest
    } = this.props;

    return (
      <div className={className}>
        <StringSelectAsync
          {...rest}
          className={classnames('asso-ref-select', {
            'validation-error': hasValidationError(validationError),
          })}
          multi={true}
          value={this.state.options}
          loadOptions={this.debouncedLoadOptionsHandler}
          onChange={this.onChange}
        />
        <ValidationText validationError={validationError} />
      </div>
    );
  }

  loadOptionsHandler: LoadOptionsAsyncHandler<string> = value => {
    const { predicates, targetReference } = this.props.config.reference;

    const RecordCls = Record.extend(
      targetReference.reference.targetCmsRecord.recordType
    );

    const query = new Query(RecordCls);
    applyPredicatesToQuery(query, predicates);
    if (value !== '') {
      query.caseInsensitiveLike(
        this.props.config.displayFieldName,
        `%${value}%`
      );
    }
    query.addDescending('_created_at');

    return skygear.publicDB.query(query).then(targets => {
      return {
        complete: false,
        options: targets.map(r => targetToOption(r, this.props.config)),
      };
    });
  };

  // tslint:disable-next-line: member-ordering
  debouncedLoadOptionsHandler: LoadOptionsAsyncHandler<
    string
  > = debouncePromise1(this.loadOptionsHandler, 300);

  onChange: OnChangeHandler<string> = value => {
    const options = makeArray(value).map(optionToTargetOption);
    this.setState({ options });

    const { config, context } = this.props;

    const [newTargetIds, deletedTargetIds] = diffOptions(
      this.targets.map(r => targetToOption(r, config)),
      options
    );

    const eff: Effect = () => {
      // tslint:disable-next-line: no-any
      const promises: Array<Promise<any>> = [];

      const newRecords = newAssoRecords(
        config,
        context.record._id,
        newTargetIds
      );
      if (newRecords.length > 0) {
        promises.push(skygear.publicDB.save(newRecords));
      }

      const recordsToDelete = assoRecordsToDelete(
        config,
        this.assoRecords,
        deletedTargetIds
      );
      if (recordsToDelete.length > 0) {
        promises.push(deleteRecordsProperly(skygear.publicDB, recordsToDelete));
      }

      return Promise.all(promises);
    };

    if (this.props.onFieldChange) {
      this.props.onFieldChange(undefined, undefined, eff);
    }
  };
}

function diffOptions(
  oldOptions: TargetOption[],
  newOptions: TargetOption[]
): [string[], string[]] {
  const oldIds = new Set(oldOptions.map(opt => opt.value));
  const newIds = new Set(newOptions.map(opt => opt.value));

  const idsToCreate = Array.from(newIds).filter(id => !oldIds.has(id));
  const idsToDelete = Array.from(oldIds).filter(id => !newIds.has(id));

  return [idsToCreate, idsToDelete];
}

function newAssoRecords(
  config: AssociationReferenceSelectFieldConfig,
  sourceRecordId: string,
  targetRecordIds: string[]
): Record[] {
  const {
    associationRecordConfig,
    sourceReference,
    targetReference,
  } = config.reference;

  const RecordCls = Record.extend(associationRecordConfig.cmsRecord.recordType);
  const sourceRecordType = sourceReference.reference.targetCmsRecord.recordType;
  const targetRecordType = targetReference.reference.targetCmsRecord.recordType;

  return targetRecordIds.map(
    targetRecordId =>
      new RecordCls({
        [sourceReference.name]: new Reference(
          `${sourceRecordType}/${sourceRecordId}`
        ),
        [targetReference.name]: new Reference(
          `${targetRecordType}/${targetRecordId}`
        ),
      })
  );
}

function assoRecordsToDelete(
  config: AssociationReferenceSelectFieldConfig,
  assoRecords: Record[],
  targetRecordIds: string[]
): Record[] {
  const recordByTargetId = objectFrom(
    assoRecords.map(r => {
      const targetRef: Reference = r[config.reference.targetReference.name];
      return [parseReference(targetRef).recordId, r] as [string, Record];
    })
  );

  return targetRecordIds.map(id => recordByTargetId[id]);
}

function targetToOption(
  target: Record,
  ref: AssociationReferenceSelectFieldConfig
): TargetOption {
  return TargetOption(target[ref.displayFieldName], target._id);
}

function optionToTargetOption(opt: Option<string>): TargetOption {
  if (opt.label === undefined) {
    throw new Error(`want Option.label to be string, got undefined`);
  }
  if (opt.value === undefined) {
    throw new Error(`want Option.value to be string, got undefined`);
  }

  return {
    label: opt.label,
    value: opt.value,
  };
}

export const AssociationRecordSelect: React.ComponentClass<
  AssociationRecordSelectProps
> = AssociationRecordSelectImpl;
