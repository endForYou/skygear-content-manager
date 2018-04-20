import * as React from 'react';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
} from 'react-select';
// tslint:disable-next-line: no-submodule-imports
import 'react-select/dist/react-select.css';
import skygear, { Query, Record } from 'skygear';

import { ReferenceFilterConfig } from '../cmsConfig';
import { debouncePromise1, makeArray } from '../util';
import { RequiredFilterInputProps } from './FilterInput';

export type ReferenceFilterInputProps = RequiredFilterInputProps<
  ReferenceFilterConfig
>;

interface State {
  values: RefOption[];
}

interface RefOption {
  label: string;
  value: string;
}

type StringSelectAsyncCtor<T> = new () => SelectAsync<T>;
const StringSelectAsync = SelectAsync as StringSelectAsyncCtor<string>;

class ReferenceFilterInputImpl extends React.PureComponent<
  ReferenceFilterInputProps,
  State
> {
  public render() {
    const {
      className: className,
      config: config,
      onFieldChange: _onFieldChange,
      value,
      ...rest,
    } = this.props;

    return (
      <StringSelectAsync
        {...rest}
        multi={false}
        loadOptions={this.debouncedLoadOptions}
        onChange={this.onChange}
        value={value != null && value.length > 0 ? value[0] : null}
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
      const values = records.map(record => record[displayFieldName]);
      const distinctValues = Array.from(new Set(values));
      const options = distinctValues.map(value => ({
        label: value,
        value,
      }));
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

    if (value == null) {
      if (this.props.onFieldChange) {
        this.props.onFieldChange([]);
      }

      return;
    }

    if (this.props.onFieldChange) {
      this.props.onFieldChange(values);
    }
  };
}

export const ReferenceFilterInput: React.ComponentClass<
  ReferenceFilterInputProps
> = ReferenceFilterInputImpl;
