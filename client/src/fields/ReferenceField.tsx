import classnames from 'classnames';
import * as React from 'react';
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
import { ReferenceLink } from '../components/ReferenceLink';
import { parseReference } from '../recordUtil';

import { debouncePromise1, objectFrom } from '../util';
import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';

export type ReferenceFieldProps = RequiredFieldProps<ReferenceFieldConfig>;

interface RecordsById {
  [recordId: string]: Record;
}

interface State {
  value: RefOption | null;
  recordsById: RecordsById;
}

interface RefOption {
  label: string;
  value: string;
}

type StringSelectAsyncCtor<T> = new () => SelectAsync<T>;
const StringSelectAsync = SelectAsync as StringSelectAsyncCtor<string>;

class ReferenceFieldImpl extends React.PureComponent<
  ReferenceFieldProps,
  State
> {
  constructor(props: ReferenceFieldProps) {
    super(props);

    const recordsById: RecordsById = propsMergeRecordsById(props, {});

    this.state = {
      recordsById,
      value: propsToRefOption(props, recordsById),
    };
  }

  public componentWillReceiveProps(nextProps: ReferenceFieldProps) {
    const recordsById: RecordsById = propsMergeRecordsById(
      nextProps,
      this.state.recordsById
    );
    this.setState({
      recordsById,
      value: propsToRefOption(nextProps, recordsById),
    });
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
          className={classnames(className, 'ref-select')}
          loadOptions={this.debouncedLoadOptions}
          onChange={this.onChange}
          value={value || undefined}
        />
      );
    } else {
      const classNames = classnames(className, 'ref-display', {
        full: !config.compact,
      });
      if (value === null) {
        return <NullField className={classNames} />;
      } else {
        const { targetCmsRecord } = config;

        return (
          <span className={classNames}>
            <ReferenceLink
              recordName={targetCmsRecord.name}
              recordId={value.value}
            >
              {value.label}
            </ReferenceLink>
          </span>
        );
      }
    }
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
      this.setState({
        recordsById: {
          ...this.state.recordsById,
          ...recordsToRecordsById(records),
        },
      });
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
      const recordType = this.props.config.targetCmsRecord.recordType;
      this.props.onFieldChange(new Reference(`${recordType}/${value.value}`));
    }
  };
}

function propsToRefOption(
  props: ReferenceFieldProps,
  recordsById: RecordsById
): RefOption | null {
  const { config, value } = props;
  if (value == null) {
    return null;
  }

  const recordId: string = parseReference(value).recordId;
  const recordOption: Record | undefined = recordsById[recordId];

  if (recordOption == null) {
    return null;
  }

  return {
    label: recordOption[config.displayFieldName],
    value: recordId,
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

function recordsToRecordsById(records: Record[]): RecordsById {
  return objectFrom(
    records.map(record => {
      return [record._id, record] as [string, Record];
    })
  );
}

function propsMergeRecordsById(
  props: ReferenceFieldProps,
  recordsById: RecordsById
): RecordsById {
  const selectedRecord =
    props.context.record.$transient[props.config.name] || null;
  const newRecordsById: RecordsById = { ...recordsById };
  if (selectedRecord !== null) {
    newRecordsById[selectedRecord._id] = selectedRecord;
  }
  return newRecordsById;
}

export const ReferenceField: React.ComponentClass<
  ReferenceFieldProps
> = ReferenceFieldImpl;
