import * as React from 'react';
import { Link } from 'react-router-dom';
import { Reference } from 'skygear';

import { ReferenceFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

export type ReferenceFieldProps = RequiredFieldProps<ReferenceFieldConfig>;

interface State {
  value: ParsedReference;
}

export class ReferenceField extends React.PureComponent<
  ReferenceFieldProps,
  State
> {
  constructor(props: ReferenceFieldProps) {
    super(props);

    this.state = {
      value: parseReference(this.props.value),
    };
  }

  public componentWillReceiveProps(nextProps: ReferenceFieldProps) {
    this.setState({ value: parseReference(nextProps.value) });
  }

  public render() {
    const {
      context,
      config: config,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const { editable, remoteRecordName, displayFieldName } = config;

    const { value: ref } = this.state;

    if (editable) {
      return (
        <span {...rest}>
          {ref.recordType}/{ref.recordId}
        </span>
      );
    } else {
      return (
        <Link
          to={`/record/${remoteRecordName}/${ref.recordId}`}
          title={`${remoteRecordName}/${ref.recordId}`}
        >
          {context.record.$transient[config.name][displayFieldName]}
        </Link>
      );
    }
  }
}

interface ParsedReference {
  recordType: string;
  recordId: string;
}

function parseReference(ref: Reference): ParsedReference {
  const [recordType] = ref.id.split('/', 1);
  const recordId = ref.id.substring(recordType.length + 1);

  return { recordType, recordId };
}
