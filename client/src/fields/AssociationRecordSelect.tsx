import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
import skygear, { Query, Record, Reference } from 'skygear';

import { AssociationReferenceFieldConfig } from '../cmsConfig';
import { Effect } from '../components/EditPage';
import { deleteRecordsProperly, parseReference } from '../recordUtil';
import { debouncePromise1, makeArray, objectFrom } from '../util';

import { RequiredFieldProps } from './Field';

export type AssociationRecordSelectProps = RequiredFieldProps<
  AssociationReferenceFieldConfig
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

export class AssociationRecordSelect extends React.PureComponent<
  AssociationRecordSelectProps,
  State
> {
  // return the association records from props
  get assoRecords(): Record[] {
    const { config, context } = this.props;
    return context.record.$transient[`${config.name}Associations`];
  }

  get targets(): Record[] {
    const { config } = this.props;
    return this.assoRecords.map(
      assoRecord => assoRecord.$transient[config.targetReference.name]
    );
  }

  public constructor(props: AssociationRecordSelectProps) {
    super(props);

    this.state = {
      options: this.targets.map(r => targetToOption(r, this.props.config)),
    };
  }

  public render() {
    const {
      className: _classname,
      context,
      config,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    return (
      <StringSelectAsync
        {...rest}
        multi={true}
        value={this.state.options}
        loadOptions={this.debouncedLoadOptionsHandler}
        onChange={this.onChange}
      />
    );
  }

  public loadOptionsHandler: LoadOptionsAsyncHandler<string> = value => {
    const { targetReference } = this.props.config;

    const RecordCls = Record.extend(targetReference.targetCmsRecord.recordType);

    const query = new Query(RecordCls);
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
  public debouncedLoadOptionsHandler: LoadOptionsAsyncHandler<
    string
  > = debouncePromise1(this.loadOptionsHandler, 300);

  public onChange: OnChangeHandler<string> = value => {
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
      this.props.onFieldChange(undefined, eff);
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
  config: AssociationReferenceFieldConfig,
  sourceRecordId: string,
  targetRecordIds: string[]
): Record[] {
  const { associationRecordConfig, sourceReference, targetReference } = config;

  const RecordCls = Record.extend(associationRecordConfig.cmsRecord.recordType);
  const sourceRecordType = sourceReference.targetCmsRecord.recordType;
  const targetRecordType = targetReference.targetCmsRecord.recordType;

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
  config: AssociationReferenceFieldConfig,
  assoRecords: Record[],
  targetRecordIds: string[]
): Record[] {
  const recordByTargetId = objectFrom(
    assoRecords.map(r => {
      const targetRef: Reference = r[config.targetReference.name];
      return [parseReference(targetRef).recordId, r] as [string, Record];
    })
  );

  return targetRecordIds.map(id => recordByTargetId[id]);
}

function targetToOption(
  target: Record,
  ref: AssociationReferenceFieldConfig
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
