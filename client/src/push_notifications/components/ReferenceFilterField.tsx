import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
// tslint:disable-next-line: no-submodule-imports
import 'react-select/dist/react-select.css';
import skygear, { Query, Record } from 'skygear';

import { RequiredFilterFieldProps } from './FilterField';
import { ReferenceFilterConfig } from '../../cmsConfig';
import { makeArray } from '../../util';
import { debouncePromise1 } from '../../util';

export type ReferenceFieldProps = RequiredFilterFieldProps<ReferenceFilterConfig>;

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
        loadOptions={this.debouncedLoadOptions}
        onChange={this.onChange}
        value={values}
      />
    );
  }

  public loadOptions: LoadOptionsAsyncHandler<string> = input => {
    const { displayFieldName, targetCmsRecord } = this.props.config;

    const RecordCls = Record.extend(targetCmsRecord.recordType);
    const query = new Query(RecordCls);
    if (input !== '') {
      query.caseInsensitiveLike(
        this.props.config.displayFieldName,
        `%${input}%`
      );
    }
    query.limit = 500;
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

  // tslint:disable-next-line: member-ordering
  public debouncedLoadOptions: LoadOptionsAsyncHandler<
    string
  > = debouncePromise1(this.loadOptions, 300);

  public onChange: OnChangeHandler<string> = value => {
    const values = makeArray(value).map(a => a.value);
    this.setState({ values });

    if (value === null) {
      if (this.props.onFieldChange) {
        this.props.onFieldChange(null);
      }

      return;
    }

    if (this.props.onFieldChange) {
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
