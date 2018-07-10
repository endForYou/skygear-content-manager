import './Field.scss';

import * as React from 'react';
import { Record } from 'skygear';

import {
  AssociationReferenceListFieldConfig,
  AssociationReferenceSelectFieldConfig,
  BackReferenceListFieldConfig,
  BackReferenceSelectFieldConfig,
  EmbeddedAssociationReferenceListFieldConfig,
  EmbeddedBackReferenceListFieldConfig,
  FieldConfig,
  FieldConfigTypes,
  ReferenceTypes,
} from '../cmsConfig';
import { Effect } from '../components/RecordFormPage';

import { AssociationRecordSelect } from './AssociationRecordSelect';
import { AssociationReferenceListField } from './AssociationReferenceField';
import { BackReferenceListField } from './BackReferenceField';
import { BackReferenceSelect } from './BackReferenceSelect';
import { BooleanField } from './BooleanField';
import { DateTimeDisplayField, DateTimePickerField } from './DateTimeField';
import { DropdownField } from './DropdownField';
import { EmbeddedAssociationReferenceField } from './EmbeddedAssociationReferenceField';
import { EmbeddedBackReferenceListField } from './EmbeddedBackReferenceField';
import { FileDisplayField, FileUploaderField } from './FileField';
import { ImageDisplayField, ImageUploaderField } from './ImageField';
import { IntegerDisplayField, IntegerInputField } from './IntegerField';
import { FloatDisplayField, FloatInputField } from './NumberField';
import { ReferenceDropdownField, ReferenceField } from './ReferenceField';
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
      case FieldConfigTypes.ImageDisplay:
        return <ImageDisplayField {...rest} config={config} />;
      case FieldConfigTypes.ImageUploader:
        return <ImageUploaderField {...rest} config={config} />;
      case FieldConfigTypes.FileDisplay:
        return <FileDisplayField {...rest} config={config} />;
      case FieldConfigTypes.FileUploader:
        return <FileUploaderField {...rest} config={config} />;
      default:
        return <RefField {...this.props} />;
    }
  }
}

const RefField: React.SFC<FieldProps> = props => {
  const { config, ...rest } = props;
  switch (config.type) {
    case FieldConfigTypes.Reference:
      return <ReferenceField {...rest} config={config} />;
    case FieldConfigTypes.ReferenceDropdown:
      return <ReferenceDropdownField {...rest} config={config} />;
    case FieldConfigTypes.ReferenceList:
      switch (config.reference.type) {
        case ReferenceTypes.ViaBackReference:
          return (
            <BackReferenceListField
              {...rest}
              config={config as BackReferenceListFieldConfig}
            />
          );
        case ReferenceTypes.ViaAssociationRecord:
          return (
            <AssociationReferenceListField
              {...rest}
              config={config as AssociationReferenceListFieldConfig}
            />
          );
        default:
          throw new Error(`Unexpected config: ${config}`);
      }
    case FieldConfigTypes.ReferenceSelect:
      switch (config.reference.type) {
        case ReferenceTypes.ViaBackReference:
          return (
            <BackReferenceSelect
              {...rest}
              config={config as BackReferenceSelectFieldConfig}
            />
          );
        case ReferenceTypes.ViaAssociationRecord:
          return (
            <AssociationRecordSelect
              {...rest}
              config={config as AssociationReferenceSelectFieldConfig}
            />
          );
        default:
          throw new Error(`Unexpected config: ${config}`);
      }
    case FieldConfigTypes.EmbeddedReferenceList:
      switch (config.reference.type) {
        case ReferenceTypes.ViaBackReference:
          return (
            <EmbeddedBackReferenceListField
              {...rest}
              config={config as EmbeddedBackReferenceListFieldConfig}
            />
          );
        case ReferenceTypes.ViaAssociationRecord:
          return (
            <EmbeddedAssociationReferenceField
              {...rest}
              config={config as EmbeddedAssociationReferenceListFieldConfig}
            />
          );
        default:
          throw new Error(`Unexpected config: ${config}`);
      }
    default:
      throw new Error(`Unexpected field type: ${config.type}`);
  }
};
