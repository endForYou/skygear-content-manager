import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Async as SelectAsync,
  LoadOptionsAsyncHandler,
  OnChangeHandler,
  Option,
} from 'react-select';
// tslint:disable-next-line: no-submodule-imports
import 'react-select/dist/react-select.css';
import skygear, { Query, Record, Reference } from 'skygear';

import { ReferenceFieldConfig } from '../cmsConfig';
import { parseReference } from '../recordUtil';

import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';

export type ReferenceFieldProps = RequiredFieldProps<ReferenceFieldConfig>;

interface State {
  value: RefOption | null;
}

interface RefOption {
  label: string;
  value: string;
}

type StringSelectAsyncCtor<T> = new () => SelectAsync<T>;
const StringSelectAsync = SelectAsync as StringSelectAsyncCtor<string>;

export class ReferenceField extends React.PureComponent<
  ReferenceFieldProps,
  State
> {
  constructor(props: ReferenceFieldProps) {
    super(props);

    this.state = {
      value: propsToRefOption(this.props),
    };
  }

  public componentWillReceiveProps(nextProps: ReferenceFieldProps) {
    this.setState({ value: propsToRefOption(nextProps) });
  }

  public render() {
    const {
      className: className,
      context,
      config: config,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const { editable } = config;

    const { value } = this.state;

    if (editable) {
      return (
        <StringSelectAsync
          {...rest}
          loadOptions={this.loadOptions}
          onChange={this.onChange}
          searchable={false}
          value={value || undefined}
        />
      );
    } else {
      if (value === null) {
        return <NullField />;
      } else {
        const { targetRecordName } = config;

        return (
          <span className={className}>
            <Link
              to={`/record/${targetRecordName}/${value.value}`}
              title={`${targetRecordName}/${value.value}`}
            >
              {value.label}
            </Link>
          </span>
        );
      }
    }
  }

  public loadOptions: LoadOptionsAsyncHandler<string> = input => {
    const { displayFieldName, targetRecordType } = this.props.config;

    const RecordCls = Record.extend(targetRecordType);
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
    if (value === null) {
      this.setState({ value: null });
      if (this.props.onFieldChange) {
        this.props.onFieldChange(null);
      }

      return;
    }

    if (Array.isArray(value)) {
      throw new Error('received multiple values from select');
    }

    if (value.label === undefined) {
      throw new Error('want option.label to be string, got undefined');
    }
    if (value.value === undefined) {
      throw new Error('want option.value to be string, got undefined');
    }

    this.setState({
      value: {
        label: value.label,
        value: value.value,
      },
    });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(
        new Reference(`${this.props.config.targetRecordType}/${value.value}`)
      );
    }
  };
}

function propsToRefOption(props: ReferenceFieldProps): RefOption | null {
  const { config, context, value } = props;

  if (value == null) {
    return null;
  }

  return {
    label: context.record.$transient[config.name][config.displayFieldName],
    value: parseReference(value).recordId,
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
