import * as React from 'react';
import { Record } from 'skygear';

import { FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { BooleanField } from './BooleanField';
import { DateTimeField } from './DateTimeField';
import { ImageAssetField } from './ImageAssetField';
import { IntegerField } from './IntegerField';
import { ReferenceField } from './ReferenceField';
import { StringField } from './StringField';
import { TextArea } from './TextArea';

export type FieldProps = ChildProps<FieldConfig>;

// props that child component must possess
export type RequiredFieldProps<C extends FieldConfig> = ChildProps<C>;

// props that pass through from Field to concerte field implementation
interface ChildProps<C extends FieldConfig> {
  config: C;

  // HTML related attrs
  name?: string;
  className?: string;

  onFieldChange?: FieldChangeHandler;

  // tslint:disable-next-line: no-any
  value: any;
  context: FieldContext;
}

// tslint:disable-next-line: no-any
export type FieldChangeHandler = (value: any) => void;

export interface FieldContext {
  record: Record;
}

export function FieldContext(record: Record): FieldContext {
  return {
    record,
  };
}

export class Field extends React.PureComponent<FieldProps> {
  public render() {
    const { config, ...rest } = this.props;
    switch (config.type) {
      case FieldConfigTypes.String:
        return <StringField {...rest} config={config} />;
      case FieldConfigTypes.DateTime:
        return <DateTimeField {...rest} config={config} />;
      case FieldConfigTypes.TextArea:
        return <TextArea {...rest} config={config} />;
      case FieldConfigTypes.Boolean:
        return <BooleanField {...rest} config={config} />;
      case FieldConfigTypes.Integer:
        return <IntegerField {...rest} config={config} />;
      case FieldConfigTypes.Reference:
        return <ReferenceField {...rest} config={config} />;
      case FieldConfigTypes.AssociationReference:
        return <div>to-many refs</div>;
      case FieldConfigTypes.ImageAsset:
        return <ImageAssetField {...rest} config={config} />;
    }
  }
}
