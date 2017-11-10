import * as React from 'react';

import { FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { BooleanField } from './BooleanField';
import { DateTimeField } from './DateTimeField';
import { IntegerField } from './IntegerField';
import { ReferenceField } from './ReferenceField';
import { StringField } from './StringField';
import { TextArea } from './TextArea';

// tslint:disable-next-line: no-any
export type FieldChangeHandler = (value: any) => void;

// props that child component must possess
export type RequiredFieldProps = {
  editable?: boolean;
} & ChildProps;

// props that passes from this component to its child field
interface ChildProps {
  // HTML related attrs
  name?: string;
  className?: string;

  onFieldChange?: FieldChangeHandler;

  // tslint:disable-next-line: no-any
  value: any;
}

type FieldProps = ChildProps & {
  config: FieldConfig;
};

export class Field extends React.PureComponent<FieldProps> {
  public render() {
    const { config, ...rest } = this.props;
    const childProps = {
      editable: config.editable,
    };
    switch (config.type) {
      case FieldConfigTypes.String:
        return <StringField {...rest} {...childProps} />;
      case FieldConfigTypes.DateTime:
        return <DateTimeField {...rest} {...childProps} />;
      case FieldConfigTypes.TextArea:
        return <TextArea {...rest} {...childProps} />;
      case FieldConfigTypes.Boolean:
        return <BooleanField {...rest} {...childProps} />;
      case FieldConfigTypes.Integer:
        return <IntegerField {...rest} {...childProps} />;
      case FieldConfigTypes.Reference:
        return (
          <ReferenceField
            {...rest}
            {...childProps}
            remoteRecordName={config.remoteRecordName}
            remoteRecordType={config.remoteRecordType}
          />
        );
    }
  }
}
