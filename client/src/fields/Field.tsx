import './Field.scss';

import * as React from 'react';
import { Record } from 'skygear';

import { FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { Effect } from '../components/RecordFormPage';

import { AssociationReferenceField } from './AssociationReferenceField';
import { BackReferenceField } from './BackReferenceField';
import { BooleanField } from './BooleanField';
import { DateTimeDisplayField, DateTimePickerField } from './DateTimeField';
import { DropdownField } from './DropdownField';
import { EmbeddedBackReferenceField } from './EmbeddedBackReferenceField';
import { FileAssetField } from './FileAssetField';
import { ImageAssetField } from './ImageAssetField';
import { IntegerDisplayField, IntegerInputField } from './IntegerField';
import { FloatDisplayField, FloatInputField } from './NumberField';
import { ReferenceField } from './ReferenceField';
import { TextDisplayField, TextInputField } from './StringField';
import { TextArea } from './TextArea';
import { WYSIWYGEditor } from './WYSIWYGEditor';

export type FieldProps = ChildProps<FieldConfig>;

// props that child component must possess
export type RequiredFieldProps<C extends FieldConfig> = ChildProps<C>;

// props that pass through from Field to concerte field implementation
export interface ChildProps<C extends FieldConfig> {
  config: C;

  // HTML related attrs
  name?: string;
  className?: string;

  onFieldChange?: FieldChangeHandler;

  // tslint:disable-next-line: no-any
  value: any;
  context: FieldContext;
}

export type FieldChangeHandler = (
  // tslint:disable-next-line: no-any
  value: any,
  beforeEffect?: Effect,
  afterEffect?: Effect
) => void;

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
      case FieldConfigTypes.TextDisplay:
        return <TextDisplayField {...rest} config={config} />;
      case FieldConfigTypes.TextInput:
        return <TextInputField {...rest} config={config} />;
      case FieldConfigTypes.DateTimeDisplay:
        return <DateTimeDisplayField {...rest} config={config} />;
      case FieldConfigTypes.DateTimePicker:
        return <DateTimePickerField {...rest} config={config} />;
      case FieldConfigTypes.Dropdown:
        return <DropdownField {...rest} config={config} />;
      case FieldConfigTypes.TextArea:
        return <TextArea {...rest} config={config} />;
      case FieldConfigTypes.WYSIWYG:
        return <WYSIWYGEditor {...rest} config={config} />;
      case FieldConfigTypes.Boolean:
        return <BooleanField {...rest} config={config} />;
      case FieldConfigTypes.IntegerDisplay:
        return <IntegerDisplayField {...rest} config={config} />;
      case FieldConfigTypes.IntegerInput:
        return <IntegerInputField {...rest} config={config} />;
      case FieldConfigTypes.FloatDisplay:
        return <FloatDisplayField {...rest} config={config} />;
      case FieldConfigTypes.FloatInput:
        return <FloatInputField {...rest} config={config} />;
      case FieldConfigTypes.Reference:
        return <ReferenceField {...rest} config={config} />;
      case FieldConfigTypes.BackReference:
        return <BackReferenceField {...rest} config={config} />;
      case FieldConfigTypes.AssociationReference:
        return <AssociationReferenceField {...rest} config={config} />;
      case FieldConfigTypes.EmbeddedBackReference:
        return <EmbeddedBackReferenceField {...rest} config={config} />;
      case FieldConfigTypes.ImageAsset:
        return <ImageAssetField {...rest} config={config} />;
      case FieldConfigTypes.FileAsset:
        return <FileAssetField {...rest} config={config} />;
    }
  }
}
