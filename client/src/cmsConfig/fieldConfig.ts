import { TimezoneValue } from '../types';
import { humanize } from '../util';
import {
  AssociationRecordConfig,
  CmsRecord,
  ConfigContext,
  RecordTypeContext,
} from './cmsConfig';
import {
  parseOptionalBoolean,
  parseOptionalDate,
  parseOptionalNumber,
  parseOptionalString,
  parseString,
  parseTimezone,
} from './util';

export type ReferenceConfig =
  | ReferenceFieldConfig
  | BackReferenceFieldConfig
  | AssociationReferenceFieldConfig
  | EmbeddedBackReferenceFieldConfig;

export type FieldConfig =
  | StringFieldConfig
  | TextAreaFieldConfig
  | DropdownFieldConfig
  | WYSIWYGFieldConfig
  | DateTimeFieldConfig
  | BooleanFieldConfig
  | IntegerFieldConfig
  | NumberFieldConfig
  | ReferenceFieldConfig
  | BackReferenceFieldConfig
  | AssociationReferenceFieldConfig
  | EmbeddedBackReferenceFieldConfig
  | ImageAssetFieldConfig
  | FileAssetFieldConfig;
export enum FieldConfigTypes {
  String = 'String',
  TextArea = 'TextArea',
  Dropdown = 'Dropdown',
  WYSIWYG = 'WYSIWYG',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  Integer = 'Integer',
  Number = 'Number',
  Reference = 'Reference',
  BackReference = 'BackReference',
  AssociationReference = 'AssociationReference',
  EmbeddedBackReference = 'EmbeddedBackReference',
  ImageAsset = 'ImageAsset',
  FileAsset = 'FileAsset',
}

export enum SortOrder {
  Asc = 'Asc',
  Desc = 'Desc',
}

export enum DeleteAction {
  NullifyReference = 'NullifyReference',
  DeleteRecord = 'DeleteRecord',
}

export interface FieldConfigAttrs {
  name: string;
  label: string;

  // derived attrs depending on which page the field lives in
  compact: boolean;
  defaultValue?: any; // tslint:disable-line: no-any
  editable?: boolean;
}

export interface StringFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.String;
  defaultValue?: string;
}

export interface TextAreaFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.TextArea;
  defaultValue?: string;
}

export interface DropdownFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Dropdown;
  defaultValue?: string;
  nullOption: {
    enabled: boolean;
    label: string;
  };
  customOption: {
    enabled: boolean;
    label: string;
  };
  options: DropdownOption[];
}

export interface WYSIWYGFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.WYSIWYG;
  defaultValue?: string;
  config?: any; // tslint:disable-line: no-any
}

export interface DateTimeFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.DateTime;
  defaultValue?: Date;
  timezone: TimezoneValue;
}

export interface BooleanFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Boolean;
  defaultValue?: boolean;
}

export interface IntegerFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Integer;
  defaultValue?: number;
}

export interface NumberFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Number;
  defaultValue?: number;
}

export interface ReferenceFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Reference;
  targetCmsRecord: CmsRecord;
  displayFieldName: string;
}

export interface BackReferenceFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.BackReference;
  sourceFieldName: string;
  targetCmsRecord: CmsRecord;
  displayFieldName: string;
}

export interface AssociationReferenceFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.AssociationReference;

  // the AssociationRecordConfig that this reference is made on
  associationRecordConfig: AssociationRecordConfig;

  // source ReferenceFieldConfig for this field in
  // associationRecordConfig.referenceConfigPair
  sourceReference: ReferenceFieldConfig;

  // target ReferenceFieldConfig for this field in
  // associationRecordConfig.referenceConfigPair
  targetReference: ReferenceFieldConfig;

  // display field name in the target record.
  // override targetReference.displayFieldName
  displayFieldName: string;
}

export interface EmbeddedBackReferenceFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.EmbeddedBackReference;
  sourceFieldName: string;
  targetCmsRecord: CmsRecord;
  displayFields: FieldConfig[];
  positionFieldName?: string;
  sortOrder: SortOrder;
  reorderEnabled: boolean;
  references: ReferenceConfig[];
  referenceDeleteAction: DeleteAction;
}

export interface ImageAssetFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.ImageAsset;
  nullable: boolean;
}

export interface FileAssetFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.FileAsset;
  nullable: boolean;
  accept: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

interface FieldConfigInput {
  type: string;
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

// tslint:disable-next-line: no-any
export function parseFieldConfig(context: ConfigContext, a: any): FieldConfig {
  switch (a.type) {
    case 'Reference':
      if (a.reference_via_association_record) {
        return parseAssociationReferenceFieldConfig(context, a);
      } else if (a.reference_via_back_reference) {
        return parseBackReferenceFieldConfig(context, a);
      } else {
        return parseReferenceFieldConfig(context, a);
      }
    case 'EmbeddedReference':
      if (a.reference_via_back_reference) {
        return parseEmbeddedBackReferenceFieldConfig(context, a);
      } else {
        throw new Error(
          'Only back reference is supported for type EmbeddedReference now'
        );
      }
    default:
      return parseNonReferenceFieldConfig(context, a);
  }
}

export function parseNonReferenceFieldConfig(
  context: RecordTypeContext,
  // tslint:disable-next-line: no-any
  a: any
): FieldConfig {
  switch (a.type) {
    case 'String':
      return parseStringFieldConfig(a);
    case 'TextArea':
      return parseTextAreaFieldConfig(a);
    case 'Dropdown':
      return parseDropdownFieldConfig(a);
    case 'WYSIWYG':
      return parseWYSIWYGFieldConfig(a);
    case 'DateTime':
      return parseDateTimeFieldConfig(a, context);
    case 'Boolean':
      return parseBooleanFieldConfig(a);
    case 'Integer':
      return parseIntegerFieldConfig(a);
    case 'Number':
      return parseNumberFieldConfig(a);
    case 'ImageAsset':
      return parseImageAssetFieldConfig(a);
    case 'FileAsset':
      return parseFileAssetFieldConfig(a);

    // built-in fields
    case '_id':
      return parseIdFieldConfig(a);
    case '_created_at':
      return parseCreatedAtFieldConfig(a, context);
    case '_updated_at':
      return parseUpdatedAtFieldConfig(a, context);
    default:
      throw new Error(`Received unknown field config type: ${a.type}`);
  }
}

function parseStringFieldConfig(input: FieldConfigInput): StringFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'String'),
    defaultValue: parseOptionalString(input, 'default_value', 'String'),
    type: FieldConfigTypes.String,
  };
}

function parseTextAreaFieldConfig(
  input: FieldConfigInput
): TextAreaFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'TextArea'),
    defaultValue: parseOptionalString(input, 'default_value', 'TextArea'),
    type: FieldConfigTypes.TextArea,
  };
}

function parseDropdownFieldConfig(
  input: FieldConfigInput
): DropdownFieldConfig {
  // tslint:disable-next-line: no-any
  const options: DropdownOption[] = input.options.map((optIn: any) => {
    let { label } = optIn;
    const { value } = optIn;

    if (typeof value !== 'string' || value === '') {
      throw new Error('Dropdown option value must be non-empty string');
    }

    if (label === undefined || label === null || label === '') {
      label = value;
    } else if (typeof label !== 'string') {
      throw new Error('Dropdown option label must be string');
    }

    return {
      label,
      value,
    };
  });

  const nullOption = input.null || { enabled: true };
  nullOption.label = nullOption.label || 'NULL';

  const customOption = input.custom || { enabled: true };
  customOption.label = customOption.label || 'Others';

  return {
    ...parseFieldConfigAttrs(input, 'Dropdown'),
    customOption,
    defaultValue:
      parseOptionalString(input, 'default_value', 'Dropdown') ||
      options[0].value,
    nullOption,
    options,
    type: FieldConfigTypes.Dropdown,
  };
}

function parseWYSIWYGFieldConfig(input: FieldConfigInput): WYSIWYGFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'WYSIWYG'),
    config: input.config,
    defaultValue: parseOptionalString(input, 'default_value', 'WYSIWYG'),
    type: FieldConfigTypes.WYSIWYG,
  };
}

function parseDateTimeFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): DateTimeFieldConfig {
  const timezone =
    input.timezone == null
      ? context.timezone
      : parseTimezone(input, 'timezone');

  return {
    ...parseFieldConfigAttrs(input, 'DateTime'),
    defaultValue: parseOptionalDate(input, 'default_value', 'DateTime'),
    timezone,
    type: FieldConfigTypes.DateTime,
  };
}

function parseBooleanFieldConfig(input: FieldConfigInput): BooleanFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'Boolean'),
    defaultValue: parseOptionalBoolean(input, 'default_value', 'Boolean'),
    type: FieldConfigTypes.Boolean,
  };
}

function parseIntegerFieldConfig(input: FieldConfigInput): IntegerFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'Integer'),
    defaultValue: parseOptionalNumber(input, 'default_value', 'Integer'),
    type: FieldConfigTypes.Integer,
  };
}

function parseNumberFieldConfig(input: FieldConfigInput): NumberFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, 'Number'),
    defaultValue: parseOptionalNumber(input, 'default_value', 'Number'),
    type: FieldConfigTypes.Number,
  };
}

export function parseReferenceFieldConfig(
  context: RecordTypeContext,
  input: FieldConfigInput
): ReferenceFieldConfig {
  const targetRecordName = parseString(input, 'reference_target', 'Reference');
  const displayFieldName =
    parseOptionalString(input, 'reference_field_name', 'Reference') || '_id';

  const targetCmsRecord = context.cmsRecordByName[targetRecordName];
  if (targetCmsRecord === undefined) {
    throw new Error(
      `Couldn't find configuration of Reference.reference_target = ${targetRecordName}`
    );
  }

  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    displayFieldName,
    targetCmsRecord,
    type: FieldConfigTypes.Reference,
  };
}

function parseBackReferenceFieldConfig(
  context: RecordTypeContext,
  input: FieldConfigInput
): BackReferenceFieldConfig {
  const displayFieldName = parseString(
    input,
    'reference_field_name',
    'Reference'
  );

  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    ...parseBackReferenceFieldConfigAttrs(context, input),
    displayFieldName,
    type: FieldConfigTypes.BackReference,
  };
}

function parseEmbeddedBackReferenceFieldConfig(
  context: ConfigContext,
  input: FieldConfigInput
): EmbeddedBackReferenceFieldConfig {
  // tslint:disable-next-line: no-any
  const displayFields = input.reference_fields.map((f: any) =>
    parseFieldConfig(context, f)
  ) as FieldConfig[];

  const positionFieldName = parseOptionalString(
    input,
    'reference_position_field',
    'Reference'
  );

  let sortOrder: SortOrder = SortOrder.Asc;
  if (input.reference_position_ascending === false) {
    sortOrder = SortOrder.Desc;
  }

  let referenceDeleteAction: DeleteAction;
  if (
    input.reference_delete_action == null ||
    input.reference_delete_action === 'nullify-reference'
  ) {
    referenceDeleteAction = DeleteAction.NullifyReference;
  } else if (input.reference_delete_action === 'delete-record') {
    referenceDeleteAction = DeleteAction.DeleteRecord;
  } else {
    throw new Error(
      `Unexpected delete_action value: ${input.reference_delete_action}`
    );
  }

  const reorderEnabled = parseOptionalBoolean(
    input,
    'reference_reorder_enabled',
    'Reference'
  );

  return {
    ...parseFieldConfigAttrs(input, 'EmbeddedReference'),
    ...parseBackReferenceFieldConfigAttrs(context, input),
    displayFields,
    positionFieldName,
    referenceDeleteAction,
    references: filterReferences(displayFields),
    reorderEnabled: reorderEnabled === undefined ? false : reorderEnabled,
    sortOrder,
    type: FieldConfigTypes.EmbeddedBackReference,
  };
}

function parseBackReferenceFieldConfigAttrs(
  context: RecordTypeContext,
  input: FieldConfigInput
): { sourceFieldName: string; targetCmsRecord: CmsRecord } {
  const targetRecordName = parseString(
    input,
    'reference_via_back_reference',
    'Reference'
  );
  const targetCmsRecord = context.cmsRecordByName[targetRecordName];
  if (targetCmsRecord === undefined) {
    throw new Error(
      `Couldn't find configuration of Reference.reference_from_field = ${targetRecordName}`
    );
  }

  const sourceFieldName = parseString(
    input,
    'reference_from_field',
    'Reference'
  );

  return {
    sourceFieldName,
    targetCmsRecord,
  };
}

function parseAssociationReferenceFieldConfig(
  context: ConfigContext,
  input: FieldConfigInput
): AssociationReferenceFieldConfig {
  const targetRecordName = parseString(input, 'reference_target', 'Reference');
  const displayFieldName = parseString(
    input,
    'reference_field_name',
    'Reference'
  );

  const associationRecordName = parseString(
    input,
    'reference_via_association_record',
    'Reference'
  );
  const associationRecordConfig =
    context.associationRecordByName[associationRecordName];
  if (associationRecordConfig === undefined) {
    throw new Error(
      `Couldn't find AssociationRecord with name = ${associationRecordName}`
    );
  }

  // look for the target reference
  const [sourceReference, targetReference] = deriveReferencesByTargetName(
    associationRecordConfig.referenceConfigPair,
    targetRecordName,
    associationRecordConfig.cmsRecord.name
  );

  return {
    ...parseFieldConfigAttrs(input, 'Reference'),
    associationRecordConfig,
    displayFieldName,
    sourceReference,
    targetReference,
    type: FieldConfigTypes.AssociationReference,
  };
}

// return a pair of ReferenceFieldConfig in the order of [SourceRef, TargetRef]
function deriveReferencesByTargetName(
  refPair: [ReferenceFieldConfig, ReferenceFieldConfig],
  targetRecordName: string,
  associationRecordName: string
): [ReferenceFieldConfig, ReferenceFieldConfig] {
  if (refPair[0].targetCmsRecord.name === targetRecordName) {
    return [refPair[1], refPair[0]];
  } else if (refPair[1].targetCmsRecord.name === targetRecordName) {
    return refPair;
  } else {
    throw new Error(
      `Couldn't find Reference.target = ${targetRecordName} in AssociationRecord.name = ${associationRecordName}`
    );
  }
}

function parseImageAssetFieldConfig(
  input: FieldConfigInput
): ImageAssetFieldConfig {
  const nullable = parseOptionalBoolean(input, 'nullable', 'ImageAsset');

  return {
    ...parseFieldConfigAttrs(input, 'ImageAsset'),
    nullable: nullable == null ? true : nullable,
    type: FieldConfigTypes.ImageAsset,
  };
}

function parseFileAssetFieldConfig(
  input: FieldConfigInput
): FileAssetFieldConfig {
  const nullable = parseOptionalBoolean(input, 'nullable', 'FileAsset');

  return {
    ...parseFieldConfigAttrs(input, 'FileAsset'),
    accept: parseOptionalString(input, 'accept', 'FileAsset') || '',
    nullable: nullable == null ? true : nullable,
    type: FieldConfigTypes.FileAsset,
  };
}

function parseFieldConfigAttrs(
  // tslint:disable-next-line: no-any
  input: any,
  fieldType: string
): FieldConfigAttrs {
  const name = parseString(input, 'name', fieldType);
  const label =
    parseOptionalString(input, 'label', fieldType) || humanize(name);

  const optionalAttrs: { editable?: boolean } = {};

  const maybeEditable = parseOptionalBoolean(input, 'editable', fieldType);
  if (maybeEditable !== undefined) {
    optionalAttrs.editable = maybeEditable;
  }

  return { compact: false, name, label, ...optionalAttrs };
}

function parseIdFieldConfig(input: FieldConfigInput): StringFieldConfig {
  return {
    compact: false,
    editable: false,
    label: 'ID',
    name: '_id',
    type: FieldConfigTypes.String,
  };
}

function parseCreatedAtFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): DateTimeFieldConfig {
  const timezone =
    input.timezone == null
      ? context.timezone
      : parseTimezone(input, 'timezone');

  return {
    compact: false,
    editable: false,
    label: 'Created at',
    name: 'createdAt',
    timezone,
    type: FieldConfigTypes.DateTime,
  };
}

function parseUpdatedAtFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): DateTimeFieldConfig {
  const timezone =
    input.timezone == null
      ? context.timezone
      : parseTimezone(input, 'timezone');

  return {
    compact: false,
    editable: false,
    label: 'Updated at',
    name: 'updatedAt',
    timezone,
    type: FieldConfigTypes.DateTime,
  };
}

export function filterReferences(
  fieldConfigs: FieldConfig[]
): ReferenceConfig[] {
  return fieldConfigs.reduce(
    (refs, config) => {
      switch (config.type) {
        case FieldConfigTypes.Reference:
          return [...refs, config];
        case FieldConfigTypes.BackReference:
          return [...refs, config];
        case FieldConfigTypes.AssociationReference:
          return [...refs, config];
        case FieldConfigTypes.EmbeddedBackReference:
          return [...refs, config];
        default:
          return refs;
      }
    },
    [] as ReferenceConfig[]
  );
}
