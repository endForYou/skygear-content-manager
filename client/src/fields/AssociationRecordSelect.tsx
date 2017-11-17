import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
import skygear, { Query, Record } from 'skygear';

import { AssociationReferenceFieldConfig } from '../cmsConfig';
import { debouncePromise1, makeArray } from '../util';

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
  };
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
