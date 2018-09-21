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

import {
  ReferenceDisplayFieldConfig,
  ReferenceDropdownFieldConfig,
} from '../cmsConfig';
import { ReferenceLink } from '../components/ReferenceLink';
import { parseReference } from '../recordUtil';

import { debouncePromise1, objectFrom } from '../util';
import { hasValidationError } from '../validation/validation';
import { RequiredFieldProps } from './Field';
import { NullField } from './NullField';
import { ValidationText } from './validation/ValidationText';

export type ReferenceFieldProps = RequiredFieldProps<
  ReferenceDisplayFieldConfig
>;

export const ReferenceField: React.SFC<ReferenceFieldProps> = props => {
  const { className: className, config: config, value } = props;

  const classNames = classnames(className, 'ref-display', {
    full: !config.compact,
  });
  if (value == null) {
    return <NullField className={classNames} />;
  } else {
    const { targetCmsRecord } = config.reference;
    const recordId = parseReference(value).recordId;
    const transientRecord = props.context.record.$transient[props.config.name];
    const label = transientRecord[config.displayFieldName];

    return (
      <span className={classNames}>
        <ReferenceLink recordName={targetCmsRecord.name} recordId={recordId}>
          {label}
        </ReferenceLink>
      </span>
    );
  }
};

export type ReferenceDropdownFieldProps = RequiredFieldProps<
  ReferenceDropdownFieldConfig
>;

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

class ReferenceDropdownFieldImpl extends React.PureComponent<
  ReferenceDropdownFieldProps,
  State
> {
  constructor(props: ReferenceDropdownFieldProps) {
    super(props);

    const recordsById: RecordsById = propsMergeRecordsById(props, {});

    this.state = {
      recordsById,
      value: propsToRefOption(props, recordsById),
    };
  }

  public componentWillReceiveProps(nextProps: ReferenceDropdownFieldProps) {
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
      validationError,
      ...rest,
    } = this.props;

    const { editable } = config;

    const { value } = this.state;

    return (
      <div className={className}>
        <StringSelectAsync
          {...rest}
          className={classnames('ref-select', {
            'validation-error': hasValidationError(validationError),
          })}
          cache={false}
          loadOptions={this.debouncedLoadOptions}
          onChange={this.onChange}
          value={value || undefined}
          disabled={!editable}
        />
        <div>
          <a
            key="export"
            href={`/records/${config.reference.targetCmsRecord.name}/new`}
            target="_blank"
            role="button"
            className="btn-add btn-create-ref primary-button"
          >
            Create New {config.label}
          </a>
        </div>
        <ValidationText validationError={validationError} />
      </div>
    );
  }

  public loadOptions: LoadOptionsAsyncHandler<string> = input => {
    const {
      displayFieldName,
      reference: { targetCmsRecord },
    } = this.props.config;

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
      const recordType = this.props.config.reference.targetCmsRecord.recordType;
      this.props.onFieldChange(new Reference(`${recordType}/${value.value}`));
    }
  };
}

function propsToRefOption(
  props: ReferenceDropdownFieldProps,
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
  props: ReferenceDropdownFieldProps,
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

export const ReferenceDropdownField: React.ComponentClass<
  ReferenceDropdownFieldProps
> = ReferenceDropdownFieldImpl;
