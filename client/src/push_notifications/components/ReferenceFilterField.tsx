import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
// tslint:disable-next-line: no-submodule-imports
import 'react-select/dist/react-select.css';
// import skygear, { Query, Record, Reference } from 'skygear';
import skygear, { Query, Record } from 'skygear';

import { ReferenceFieldConfig } from '../../cmsConfig';
import { RequiredFieldProps } from './FilterField';
import { makeArray } from '../../util';

export type ReferenceFieldProps = RequiredFieldProps<ReferenceFieldConfig>;

interface State {
  values: RefOption[];
}

interface RefOption {
  label: string;
  value: string;
}

type StringSelectAsyncCtor<T> = new () => SelectAsync<T>;
const StringSelectAsync = SelectAsync as StringSelectAsyncCtor<string>;

class ReferenceFilterFieldImpl extends React.PureComponent<
  ReferenceFieldProps,
  State
> {
  constructor(props: ReferenceFieldProps) {
    super(props);

    this.state = {
      values: [],
    };
  }

  public render() {
    const {
      className: className,
      config: config,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const { values } = this.state;

    return (
      <StringSelectAsync
        {...rest}
        multi={true}
        loadOptions={this.loadOptions}
        onChange={this.onChange}
        searchable={false}
        value={values}
      />
    );
  }

  public loadOptions: LoadOptionsAsyncHandler<string> = input => {
    const { displayFieldName, targetCmsRecord } = this.props.config;

    const RecordCls = Record.extend(targetCmsRecord.recordType);
    const query = new Query(RecordCls);
    return skygear.publicDB.query(query).then(records => {
      const options = records.map(record => {
        return recordToOption(record, displayFieldName);
      });
      return {
        complete: true,
        options,
      };
    });
  };

  public onChange: OnChangeHandler<string> = value => {
    const values = makeArray(value);
    this.setState({ values });

    if (value === null) {
      if (this.props.onFieldChange) {
        this.props.onFieldChange(null);
      }

      return;
    }

    if (this.props.onFieldChange) {
    //   const recordType = this.props.config.targetCmsRecord.recordType;
    //   this.props.onFieldChange(new Reference(`${recordType}/${value.value}`));
      this.props.onFieldChange(values);
    }
  };
}

function recordToOption(r: Record, fieldName: string): Option<string> {
  return {
    // TODO: validate r[fieldName] and make sure it's a string
    // or convertable to string
    label: r[fieldName],
    value: r._id,
  };
}

export const ReferenceFilterField: React.ComponentClass<
  ReferenceFieldProps
> = ReferenceFilterFieldImpl;
