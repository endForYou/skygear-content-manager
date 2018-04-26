import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
import skygear, { Query, Record, Reference } from 'skygear';

import { BackReferenceFieldConfig } from '../cmsConfig';
import { Effect } from '../components/RecordFormPage';
import { debouncePromise1, makeArray } from '../util';

import { RequiredFieldProps } from './Field';

export type BackReferenceSelectProps = RequiredFieldProps<
  BackReferenceFieldConfig
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

class BackReferenceSelectImpl extends React.PureComponent<
  BackReferenceSelectProps,
  State
> {
  get targets(): Record[] {
    const { config, context } = this.props;
    return context.record.$transient[`${config.name}`] || [];
  }

  public constructor(props: BackReferenceSelectProps) {
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
    const { targetCmsRecord } = this.props.config;

    const RecordCls = Record.extend(targetCmsRecord.recordType);

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
      const { targetCmsRecord: { recordType } } = config;
      const RecordCls = Record.extend(recordType);

      const newTargets = newTargetIds.map(
        id =>
          new RecordCls({
            _id: `${recordType}/${id}`,
            [config.sourceFieldName]: new Reference(context.record),
          })
      );

      const deletedTargets = deletedTargetIds.map(
        id =>
          new RecordCls({
            _id: `${recordType}/${id}`,
            [config.sourceFieldName]: null,
          })
      );

      const recordsToSave = [...newTargets, ...deletedTargets];
      if (recordsToSave.length === 0) {
        return Promise.resolve();
      }

      return skygear.publicDB.save(recordsToSave);
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

function targetToOption(
  target: Record,
  ref: BackReferenceFieldConfig
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

export const BackReferenceSelect: React.ComponentClass<
  BackReferenceSelectProps
> = BackReferenceSelectImpl;
