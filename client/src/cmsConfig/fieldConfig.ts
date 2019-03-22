import { isArray } from 'util';
import { TimezoneValue } from '../types';
import { humanize } from '../util';
import {
  AssociationRecordConfig,
  CmsRecord,
  ConfigContext,
  RecordTypeContext,
  recursivelyApplyFn,
} from './cmsConfig';
import { parsePredicateConfig, PredicateValue } from './predicateConfig';
import {
  parseOptionalBoolean,
  parseOptionalDate,
  parseOptionalNumber,
  parseOptionalString,
  parseString,
  parseTimezone,
} from './util';
import { parseValidationConfigs, ValidationConfig } from './validationConfig';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ssZ';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

export type ReferenceFieldConfig =
  | ReferenceDisplayFieldConfig
  | ReferenceDropdownFieldConfig
  | ReferenceListFieldConfig
  | ReferenceSelectFieldConfig
  | EmbeddedReferenceListFieldConfig;

export type EditableFieldConfig =
  | TextInputFieldConfig
  | TextAreaFieldConfig
  | DropdownFieldConfig
  | WYSIWYGFieldConfig
  | DateTimePickerFieldConfig
  | BooleanFieldConfig
  | IntegerInputFieldConfig
  | FloatInputFieldConfig
  | ReferenceDropdownFieldConfig
  | ReferenceSelectFieldConfig
  | EmbeddedReferenceListFieldConfig
  | ImageUploaderFieldConfig
  | FileUploaderFieldConfig;

export type FieldConfig =
  // non editable fields
  | TextDisplayFieldConfig
  | DateTimeDisplayFieldConfig
  | IntegerDisplayFieldConfig
  | FloatDisplayFieldConfig
  | ReferenceDisplayFieldConfig
  | ReferenceListFieldConfig
  | ImageDisplayFieldConfig
  | FileDisplayFieldConfig
  // and editable fields
  | EditableFieldConfig;

export enum FieldConfigTypes {
  TextDisplay = 'text_display',
  TextInput = 'text_input',
  TextArea = 'text_area',
  Dropdown = 'dropdown',
  WYSIWYG = 'wysiwyg',
  DateTimeDisplay = 'date_time_display',
  DateTimePicker = 'date_time_picker',
  Boolean = 'boolean',
  IntegerDisplay = 'integer_display',
  IntegerInput = 'integer_input',
  FloatDisplay = 'float_display',
  FloatInput = 'float_input',
  Reference = 'reference',
  ReferenceDropdown = 'reference_dropdown',
  ReferenceList = 'reference_list',
  ReferenceSelect = 'reference_select',
  EmbeddedReferenceList = 'embedded_reference_list',
  ImageDisplay = 'image_display',
  ImageUploader = 'image_uploader',
  FileDisplay = 'file_display',
  FileUploader = 'file_uploader',
}

export enum SortOrder {
  Asc = 'Asc',
  Desc = 'Desc',
}

export enum DeleteAction {
  NullifyReference = 'nullify_reference',
  DeleteRecord = 'delete_record',
}

export interface FieldConfigAttrs {
  name: string;
  label: string;
  validations?: ValidationConfig[];

  // derived attrs depending on which page the field lives in
  compact: boolean;
}

export interface EditableFieldConfigAttrs extends FieldConfigAttrs {
  defaultValue?: any; // tslint:disable-line: no-any
  editable?: boolean;
}

// tslint:disable-next-line:no-any
export function isFieldEditable(config: {
  type: FieldConfigTypes;
}): config is EditableFieldConfig {
  return (
    config.type === FieldConfigTypes.TextInput ||
    config.type === FieldConfigTypes.TextArea ||
    config.type === FieldConfigTypes.Dropdown ||
    config.type === FieldConfigTypes.WYSIWYG ||
    config.type === FieldConfigTypes.DateTimeDisplay ||
    config.type === FieldConfigTypes.Boolean ||
    config.type === FieldConfigTypes.IntegerInput ||
    config.type === FieldConfigTypes.FloatInput ||
    config.type === FieldConfigTypes.ReferenceDropdown ||
    config.type === FieldConfigTypes.ReferenceSelect ||
    config.type === FieldConfigTypes.EmbeddedReferenceList ||
    config.type === FieldConfigTypes.ImageUploader ||
    config.type === FieldConfigTypes.FileUploader
  );
}

export interface TextDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.TextDisplay;
}

export interface TextInputFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.TextInput;
}

export interface TextAreaFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.TextArea;
  defaultValue?: string;
}

export interface DropdownFieldConfig extends EditableFieldConfigAttrs {
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

export interface WYSIWYGFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.WYSIWYG;
  defaultValue?: string;
  config?: any; // tslint:disable-line: no-any
}

export interface DateTimeDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.DateTimeDisplay;
  timezone?: TimezoneValue;
  dateTimeFormat?: string;
}

export interface DateTimePickerConfig {
  enabled?: boolean;
  format?: string;
}

export interface DateTimePickerFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.DateTimePicker;
  defaultValue?: Date;
  timezone?: TimezoneValue;
  datePicker: DateTimePickerConfig;
  timePicker: DateTimePickerConfig;
}

export interface BooleanFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.Boolean;
  defaultValue?: boolean;
}

export interface IntegerDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.IntegerDisplay;
}

export interface IntegerInputFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.IntegerInput;
  defaultValue?: number;
}

export interface FloatDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.FloatDisplay;
}

export interface FloatInputFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.FloatInput;
  defaultValue?: number;
}

export interface ReferenceDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.Reference;
  reference: DirectReference;
  displayFieldName: string;
}

export interface ReferenceDropdownFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.ReferenceDropdown;
  reference: DirectReference;
  displayFieldName: string;
  addButton: {
    enabled: boolean;
    label: string;
  };
  // TODO: Support defaultValue for ReferenceDropdown
  defaultValue: undefined;
}

export type Reference =
  | DirectReference
  | ReferenceViaBackReference
  | ReferenceViaAssociationRecord;
export enum ReferenceTypes {
  DirectReference = 'DirectReference',
  ViaBackReference = 'ViaBackReference',
  ViaAssociationRecord = 'ViaAssociationRecord',
}

interface ReferenceAttrs {
  predicates: PredicateValue;
}

export interface DirectReference extends ReferenceAttrs {
  type: ReferenceTypes.DirectReference;
  targetCmsRecord: CmsRecord;
}

export interface ReferenceViaBackReference extends ReferenceAttrs {
  type: ReferenceTypes.ViaBackReference;
  sourceFieldName: string;
  targetCmsRecord: CmsRecord;
}

export interface ReferenceViaAssociationRecord extends ReferenceAttrs {
  type: ReferenceTypes.ViaAssociationRecord;

  // the AssociationRecordConfig that this reference is made on
  associationRecordConfig: AssociationRecordConfig;

  // source ReferenceDisplayFieldConfig for this field in
  // associationRecordConfig.referenceConfigPair
  sourceReference: ReferenceDisplayFieldConfig;

  // target ReferenceDisplayFieldConfig for this field in
  // associationRecordConfig.referenceConfigPair
  targetReference: ReferenceDisplayFieldConfig;
}

export interface ReferenceListFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.ReferenceList;
  reference: Reference;
  displayFieldName: string;
}

export interface BackReferenceListFieldConfig extends ReferenceListFieldConfig {
  reference: ReferenceViaBackReference;
}

export interface AssociationReferenceListFieldConfig
  extends ReferenceListFieldConfig {
  reference: ReferenceViaAssociationRecord;
}

export interface ReferenceSelectFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.ReferenceSelect;
  reference: Reference;
  displayFieldName: string;
  // TODO: Support defaultValue for ReferenceSelect
  defaultValue: undefined;
}

export interface BackReferenceSelectFieldConfig
  extends ReferenceSelectFieldConfig {
  reference: ReferenceViaBackReference;
}

export interface AssociationReferenceSelectFieldConfig
  extends ReferenceSelectFieldConfig {
  reference: ReferenceViaAssociationRecord;
}

export interface EmbeddedReferenceListFieldConfig
  extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.EmbeddedReferenceList;
  reference: Reference;
  displayFields: FieldConfig[];
  positionFieldName?: string;
  sortOrder: SortOrder;
  reorderEnabled: boolean;
  references: ReferenceFieldConfig[];
  referenceDeleteAction: DeleteAction;
  deleteButton: {
    enabled: boolean;
  };
}

export interface EmbeddedBackReferenceListFieldConfig
  extends EmbeddedReferenceListFieldConfig {
  reference: ReferenceViaBackReference;
}

export interface EmbeddedAssociationReferenceListFieldConfig
  extends EmbeddedReferenceListFieldConfig {
  reference: ReferenceViaAssociationRecord;
}

export interface ImageDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.ImageDisplay;
  config?: any; // tslint:disable-line: no-any
}

export interface ImageUploaderFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.ImageUploader;
  nullable: boolean;
  config?: any; // tslint:disable-line: no-any
}

export interface FileDisplayFieldConfig extends FieldConfigAttrs {
  type: FieldConfigTypes.FileDisplay;
}

export interface FileUploaderFieldConfig extends EditableFieldConfigAttrs {
  type: FieldConfigTypes.FileUploader;
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

// tslint:disable-next-line:no-any
export function preprocessFieldAlias(editable: boolean, input: any) {
  const map = {
    asset: ['file_display', 'file_uploader'],
    date_time: ['date_time_display', 'date_time_picker'],
    float: ['float_display', 'float_input'],
    image: ['image_display', 'image_uploader'],
    integer: ['integer_display', 'integer_input'],
    number: ['float_display', 'float_input'],
    reference: ['reference', 'reference_dropdown'],
    reference_list: ['reference_list', 'reference_select'],
    string: ['text_display', 'text_input'],
    // TODO:
    // Invert the alias if more than one UI for Boolean
    switch: ['boolean', 'boolean'],
  };

  const match = map[input.type];
  if (match == null) {
    return input;
  }

  const type = match[editable ? 1 : 0];
  return {
    ...input,
    type,
  };
}

// tslint:disable-next-line:no-any
export function recursivelyPreprocessFieldAlias(editable: boolean, input: any) {
  // tslint:disable-next-line:no-any
  return recursivelyApplyFn(input, (i: any) =>
    preprocessFieldAlias(editable, i)
  );
}

export function parseFieldConfig(
  context: ConfigContext,
  // tslint:disable-next-line:no-any
  a: any,
  depth: number = 0
): FieldConfig {
  switch (a.type) {
    case 'reference':
      return parseReferenceFieldConfig(context, a, depth);
    case 'reference_dropdown':
      return parseReferenceDropdownFieldConfig(context, a, depth);
    case 'reference_list':
      return parseReferenceListFieldConfig(context, a, depth);
    case 'reference_select':
      return parseReferenceSelectFieldConfig(context, a, depth);
    case 'embedded_reference_list':
      return parseEmbeddedReferenceListFieldConfig(context, a, depth);
    default:
      return parseNonReferenceFieldConfig(context, a, depth);
  }
}

export function parseNonReferenceFieldConfig(
  context: RecordTypeContext,
  // tslint:disable-next-line: no-any
  a: any,
  depth: number = 0
): FieldConfig {
  // built-in fields
  switch (a.name) {
    case '_id':
    case 'id':
      return parseIdFieldConfig(a);
    case '_owner_id':
    case 'ownerID':
      return parseOwnerIdFieldConfig(a);
    case '_access':
    case 'access':
      return parseAccessFieldConfig(a);
    case '_created_at':
    case 'createdAt':
      return parseCreatedAtFieldConfig(a, context);
    case '_updated_at':
    case 'updatedAt':
      return parseUpdatedAtFieldConfig(a, context);
    case '_created_by':
    case 'createdBy':
      return parseCreatedByFieldConfig(a, context);
    case '_updated_by':
    case 'updatedBy':
      return parseUpdatedByFieldConfig(a, context);
  }

  switch (a.type) {
    case 'text_display':
      return parseTextDisplayFieldConfig(a, depth);
    case 'text_input':
      return parseTextInputFieldConfig(a, depth);
    case 'text_area':
      return parseTextAreaFieldConfig(a, depth);
    case 'dropdown':
      return parseDropdownFieldConfig(a, depth);
    case 'wysiwyg':
      return parseWYSIWYGFieldConfig(a, depth);
    case 'date_time_display':
      return parseDateTimeDisplayFieldConfig(a, context, depth);
    case 'date_time_picker':
      return parseDateTimePickerFieldConfig(a, context, depth);
    case 'boolean':
      return parseBooleanFieldConfig(a, depth);
    case 'integer_display':
      return parseIntegerDisplayFieldConfig(a, depth);
    case 'integer_input':
      return parseIntegerInputFieldConfig(a, depth);
    case 'float_display':
      return parseFloatDisplayFieldConfig(a, depth);
    case 'float_input':
      return parseFloatInputFieldConfig(a, depth);
    case 'image_display':
      return parseImageDisplayFieldConfig(a, depth);
    case 'image_uploader':
      return parseImageUploaderFieldConfig(a, depth);
    case 'file_display':
      return parseFileDisplayFieldConfig(a, depth);
    case 'file_uploader':
      return parseFileUploaderFieldConfig(a, depth);

    // backward compatible
    case '_id':
      delete a.type;
      return parseIdFieldConfig(a);
    case '_created_at':
      delete a.type;
      return parseCreatedAtFieldConfig(a, context);
    case '_updated_at':
      delete a.type;
      return parseUpdatedAtFieldConfig(a, context);

    default:
      throw new Error(`Received unknown field config type: ${a.type}`);
  }
}

function parseTextDisplayFieldConfig(
  input: FieldConfigInput,
  depth: number
): TextDisplayFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.TextDisplay, depth),
    type: FieldConfigTypes.TextDisplay,
  };
}

function parseTextInputFieldConfig(
  input: FieldConfigInput,
  depth: number
): TextInputFieldConfig {
  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.TextInput, depth),
    defaultValue: parseOptionalString(input, 'default_value', 'text_input'),
    type: FieldConfigTypes.TextInput,
  };
}

function parseTextAreaFieldConfig(
  input: FieldConfigInput,
  depth: number
): TextAreaFieldConfig {
  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.TextArea, depth),
    defaultValue: parseOptionalString(input, 'default_value', 'text_area'),
    type: FieldConfigTypes.TextArea,
  };
}

function parseDropdownFieldConfig(
  input: FieldConfigInput,
  depth: number
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
    ...parseEditableConfigAttrs(input, FieldConfigTypes.Dropdown, depth),
    customOption,
    defaultValue:
      parseOptionalString(input, 'default_value', 'dropdown') ||
      options[0].value,
    nullOption,
    options,
    type: FieldConfigTypes.Dropdown,
  };
}

function parseWYSIWYGFieldConfig(
  input: FieldConfigInput,
  depth: number
): WYSIWYGFieldConfig {
  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.WYSIWYG, depth),
    config: input.config,
    defaultValue: parseOptionalString(input, 'default_value', 'wysiwyg'),
    type: FieldConfigTypes.WYSIWYG,
  };
}

function parseDateTimeDisplayFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext,
  depth: number
): DateTimeDisplayFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.DateTimeDisplay, depth),
    dateTimeFormat:
      parseOptionalString(input, 'date_time_format', 'date_time_format') ||
      DATETIME_FORMAT,
    timezone: parseTimezone(input, 'timezone'),
    type: FieldConfigTypes.DateTimeDisplay,
  };
}

function parseDateTimePickerFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext,
  depth: number
): DateTimePickerFieldConfig {
  const datePicker: { enabled: boolean; format?: string } = {
    enabled: false,
    format: undefined,
  };
  const timePicker: { enabled: boolean; format?: string } = {
    enabled: false,
    format: undefined,
  };

  if (input.date_picker) {
    datePicker.enabled = !!input.date_picker.enabled;
    datePicker.format =
      parseOptionalString(input.date_picker, 'format', 'date_picker.format') ||
      DATE_FORMAT;
  }

  if (input.time_picker) {
    timePicker.enabled = !!input.timer_picker.enabled;
    timePicker.format =
      parseOptionalString(input.timer_picker, 'format', 'time_picker.format') ||
      TIME_FORMAT;
  }

  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.DateTimePicker, depth),
    datePicker,
    defaultValue: parseOptionalDate(input, 'default_value', 'date_time_picker'),
    timePicker,
    timezone: parseTimezone(input, 'timezone'),
    type: FieldConfigTypes.DateTimePicker,
  };
}

function parseBooleanFieldConfig(
  input: FieldConfigInput,
  depth: number
): BooleanFieldConfig {
  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.Boolean, depth),
    defaultValue: parseOptionalBoolean(input, 'default_value', 'boolean'),
    type: FieldConfigTypes.Boolean,
  };
}

function parseIntegerDisplayFieldConfig(
  input: FieldConfigInput,
  depth: number
): IntegerDisplayFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.IntegerDisplay, depth),
    type: FieldConfigTypes.IntegerDisplay,
  };
}

function parseIntegerInputFieldConfig(
  input: FieldConfigInput,
  depth: number
): IntegerInputFieldConfig {
  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.IntegerInput, depth),
    defaultValue: parseOptionalNumber(input, 'default_value', 'integer_input'),
    type: FieldConfigTypes.IntegerInput,
  };
}

function parseFloatDisplayFieldConfig(
  input: FieldConfigInput,
  depth: number
): FloatDisplayFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.FloatDisplay, depth),
    type: FieldConfigTypes.FloatDisplay,
  };
}

function parseFloatInputFieldConfig(
  input: FieldConfigInput,
  depth: number
): FloatInputFieldConfig {
  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.FloatInput, depth),
    defaultValue: parseOptionalNumber(input, 'default_value', 'float_input'),
    type: FieldConfigTypes.FloatInput,
  };
}

function parseReferenceFieldConfigAttrs(
  context: RecordTypeContext,
  input: FieldConfigInput
): DirectReference {
  const targetRecordName = parseString(input, 'reference_target', 'reference');

  const cmsRecordData = context.cmsRecordByName[targetRecordName];
  if (cmsRecordData === undefined) {
    throw new Error(
      `Couldn't find configuration of reference.reference_target = ${targetRecordName}`
    );
  }

  const targetCmsRecord = cmsRecordData.record;

  return {
    predicates: parsePredicateConfig(input.predicates, context) || [],
    targetCmsRecord,
    type: ReferenceTypes.DirectReference,
  };
}

export function parseReferenceFieldConfig(
  context: RecordTypeContext,
  input: FieldConfigInput,
  depth: number
): ReferenceDisplayFieldConfig {
  const displayFieldName =
    parseOptionalString(input, 'reference_field_name', 'reference') || '_id';

  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.Reference, depth),
    displayFieldName,
    reference: parseReferenceFieldConfigAttrs(context, input),
    type: FieldConfigTypes.Reference,
  };
}

export function parseReferenceDropdownFieldConfig(
  context: RecordTypeContext,
  input: FieldConfigInput,
  depth: number
): ReferenceDropdownFieldConfig {
  const displayFieldName =
    parseOptionalString(input, 'reference_field_name', 'reference') || '_id';

  const attrs = parseEditableConfigAttrs(
    input,
    FieldConfigTypes.ReferenceDropdown,
    depth
  );

  const addButton = {
    enabled: false,
    label: '',
  };
  if (input.add_button != null) {
    const enabled = parseOptionalBoolean(
      input.add_button,
      'enabled',
      'reference.add_button'
    );
    addButton.enabled = enabled == null ? false : enabled;
    addButton.label =
      parseOptionalString(input.add_button, 'label', 'reference.add_button') ||
      `Create New ${attrs.label}`;
  }

  return {
    ...attrs,
    addButton,
    defaultValue: undefined,
    displayFieldName,
    reference: parseReferenceFieldConfigAttrs(context, input),
    type: FieldConfigTypes.ReferenceDropdown,
  };
}

function parseReferenceListFieldConfig(
  context: ConfigContext,
  input: FieldConfigInput,
  depth: number
): ReferenceListFieldConfig {
  const displayFieldName = parseString(
    input,
    'reference_field_name',
    'Reference'
  );

  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.ReferenceList, depth),
    displayFieldName,
    reference: parseMultiReferenceFieldConfigAttrs(context, input),
    type: FieldConfigTypes.ReferenceList,
  };
}

function parseReferenceSelectFieldConfig(
  context: ConfigContext,
  input: FieldConfigInput,
  depth: number
): ReferenceSelectFieldConfig {
  const displayFieldName = parseString(
    input,
    'reference_field_name',
    'Reference'
  );

  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.ReferenceSelect, depth),
    defaultValue: undefined,
    displayFieldName,
    reference: parseMultiReferenceFieldConfigAttrs(context, input),
    type: FieldConfigTypes.ReferenceSelect,
  };
}

function parseEmbeddedReferenceListFieldConfig(
  context: ConfigContext,
  input: FieldConfigInput,
  depth: number
): EmbeddedReferenceListFieldConfig {
  if (!isArray(input.reference_fields)) {
    throw new Error('Expect reference_fields to be array of fields');
  }

  const displayFields = input.reference_fields
    // tslint:disable-next-line: no-any
    .map((f: any) => parseFieldConfig(context, f, depth + 1)) as FieldConfig[];

  const positionFieldName = parseOptionalString(
    input,
    'reference_position_field',
    'reference'
  );

  let sortOrder: SortOrder = SortOrder.Asc;
  if (input.reference_position_ascending === false) {
    sortOrder = SortOrder.Desc;
  }

  let referenceDeleteAction: DeleteAction;
  if (
    input.reference_delete_action == null ||
    input.reference_delete_action === DeleteAction.NullifyReference
  ) {
    referenceDeleteAction = DeleteAction.NullifyReference;
  } else if (input.reference_delete_action === DeleteAction.DeleteRecord) {
    referenceDeleteAction = DeleteAction.DeleteRecord;
  } else {
    throw new Error(
      `Unexpected delete_action value: ${input.reference_delete_action}`
    );
  }

  const reorderEnabled = parseOptionalBoolean(
    input,
    'reference_reorder_enabled',
    'reference'
  );

  const deleteButton = {
    enabled: false,
  };
  if (input.delete_button != null) {
    const enabled = parseOptionalBoolean(
      input.delete_button,
      'enabled',
      'reference.delete_button'
    );
    deleteButton.enabled = enabled !== false;
  }

  return {
    ...parseEditableConfigAttrs(
      input,
      FieldConfigTypes.EmbeddedReferenceList,
      depth
    ),
    deleteButton,
    displayFields,
    positionFieldName,
    reference: parseMultiReferenceFieldConfigAttrs(context, input),
    referenceDeleteAction,
    references: filterReferences(displayFields),
    reorderEnabled: reorderEnabled === undefined ? false : reorderEnabled,
    sortOrder,
    type: FieldConfigTypes.EmbeddedReferenceList,
  };
}

function parseMultiReferenceFieldConfigAttrs(
  context: ConfigContext,
  input: FieldConfigInput
): Reference {
  if (input.reference_via_back_reference) {
    return parseBackReferenceFieldConfigAttrs(context, input);
  } else if (input.reference_via_association_record) {
    return parseAssociationReferenceFieldConfigAttrs(context, input);
  } else {
    throw new Error(
      `Either 'reference_via_back_reference' or 'reference_via_association_record' must be set`
    );
  }
}

function parseBackReferenceFieldConfigAttrs(
  context: RecordTypeContext,
  input: FieldConfigInput
): ReferenceViaBackReference {
  const targetRecordName = parseString(
    input,
    'reference_via_back_reference',
    'reference'
  );
  const cmsRecordData = context.cmsRecordByName[targetRecordName];
  if (cmsRecordData === undefined) {
    throw new Error(
      `Couldn't find configuration of reference.reference_from_field = ${targetRecordName}`
    );
  }

  const targetCmsRecord = cmsRecordData.record;

  const sourceFieldName = parseString(
    input,
    'reference_from_field',
    'reference'
  );

  return {
    predicates: parsePredicateConfig(input.predicates, context) || [],
    sourceFieldName,
    targetCmsRecord,
    type: ReferenceTypes.ViaBackReference,
  };
}

function parseAssociationReferenceFieldConfigAttrs(
  context: ConfigContext,
  input: FieldConfigInput
): ReferenceViaAssociationRecord {
  const targetRecordName = parseString(input, 'reference_target', 'reference');

  const associationRecordName = parseString(
    input,
    'reference_via_association_record',
    'reference'
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
    associationRecordConfig,
    predicates: parsePredicateConfig(input.predicates, context) || [],
    sourceReference,
    targetReference,
    type: ReferenceTypes.ViaAssociationRecord,
  };
}

// return a pair of ReferenceDisplayFieldConfig in the order of [SourceRef, TargetRef]
function deriveReferencesByTargetName(
  refPair: [ReferenceDisplayFieldConfig, ReferenceDisplayFieldConfig],
  targetRecordName: string,
  associationRecordName: string
): [ReferenceDisplayFieldConfig, ReferenceDisplayFieldConfig] {
  if (refPair[0].reference.targetCmsRecord.name === targetRecordName) {
    return [refPair[1], refPair[0]];
  } else if (refPair[1].reference.targetCmsRecord.name === targetRecordName) {
    return refPair;
  } else {
    throw new Error(
      `Couldn't find reference.target = ${targetRecordName} in AssociationRecord.name = ${associationRecordName}`
    );
  }
}

function parseImageDisplayFieldConfig(
  input: FieldConfigInput,
  depth: number
): ImageDisplayFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.ImageDisplay, depth),
    config: input.config,
    type: FieldConfigTypes.ImageDisplay,
  };
}

function parseImageUploaderFieldConfig(
  input: FieldConfigInput,
  depth: number
): ImageUploaderFieldConfig {
  const nullable = parseOptionalBoolean(input, 'nullable', 'image_uploader');

  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.ImageUploader, depth),
    config: input.config,
    nullable: nullable == null ? true : nullable,
    type: FieldConfigTypes.ImageUploader,
  };
}

function parseFileDisplayFieldConfig(
  input: FieldConfigInput,
  depth: number
): FileDisplayFieldConfig {
  return {
    ...parseFieldConfigAttrs(input, FieldConfigTypes.FileDisplay, depth),
    type: FieldConfigTypes.FileDisplay,
  };
}

function parseFileUploaderFieldConfig(
  input: FieldConfigInput,
  depth: number
): FileUploaderFieldConfig {
  const nullable = parseOptionalBoolean(input, 'nullable', 'file_uploader');

  return {
    ...parseEditableConfigAttrs(input, FieldConfigTypes.FileUploader, depth),
    accept: parseOptionalString(input, 'accept', 'file_uploader') || '',
    nullable: nullable == null ? true : nullable,
    type: FieldConfigTypes.FileUploader,
  };
}

function parseFieldConfigAttrs(
  // tslint:disable-next-line: no-any
  input: any,
  fieldType: FieldConfigTypes,
  depth: number
): FieldConfigAttrs {
  const name = parseString(input, 'name', fieldType);
  const label =
    parseOptionalString(input, 'label', fieldType) || humanize(name);
  let validations;

  // TODO:
  // Display config error if setting validation in embedded reference fields
  // or child fields
  if (
    (depth !== 0 || fieldType === FieldConfigTypes.EmbeddedReferenceList) &&
    input.validations != null
  ) {
    throw new Error('Validation is not supported by reference fields');
  }

  validations = parseValidationConfigs(input.validations);

  return { compact: false, name, label, validations };
}

function parseEditableConfigAttrs(
  // tslint:disable-next-line: no-any
  input: any,
  fieldType: FieldConfigTypes,
  depth: number
): EditableFieldConfigAttrs {
  const optionalAttrs: { editable?: boolean } = {};

  const maybeEditable = parseOptionalBoolean(input, 'editable', fieldType);
  if (maybeEditable !== undefined) {
    optionalAttrs.editable = maybeEditable;
  }

  return {
    ...parseFieldConfigAttrs(input, fieldType, depth),
    ...optionalAttrs,
  };
}

function parseIdFieldConfig(input: FieldConfigInput): TextDisplayFieldConfig {
  if (input.type) {
    console.log(`Type (${input.type}) is ignored in _id field.`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_id') || 'ID',
    name: '_id',
    type: FieldConfigTypes.TextDisplay,
  };
}

function parseOwnerIdFieldConfig(
  input: FieldConfigInput
): TextDisplayFieldConfig {
  if (input.type) {
    console.log(`Type (${input.type}) is ignored in _owner_id field.`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_owner_id') || 'Owner ID',
    name: 'ownerID',
    type: FieldConfigTypes.TextDisplay,
  };
}

function parseAccessFieldConfig(
  input: FieldConfigInput
): TextDisplayFieldConfig {
  // TODO: display in json
  if (input.type) {
    console.log(`Type (${input.type}) is ignored in _access field.`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_access') || 'Access',
    name: 'access',
    type: FieldConfigTypes.TextDisplay,
  };
}

function parseCreatedAtFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): DateTimeDisplayFieldConfig {
  if (input.type) {
    // TODO: allow other DateTime field type
    console.log(`Type (${input.type}) is ignored in _created_at field.`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_created_at') || 'Created at',
    name: 'createdAt',
    timezone: parseTimezone(input, 'timezone'),
    type: FieldConfigTypes.DateTimeDisplay,
  };
}

function parseUpdatedAtFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): DateTimeDisplayFieldConfig {
  if (input.type) {
    // TODO: allow other DateTime field type
    console.log(`Type (${input.type}) is ignored in _updated_at field.`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_updated_at') || 'Updated at',
    name: 'updatedAt',
    timezone: parseTimezone(input, 'timezone'),
    type: FieldConfigTypes.DateTimeDisplay,
  };
}

function parseCreatedByFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): TextDisplayFieldConfig {
  if (input.type) {
    console.log(`Type (${input.type}) is ignored in _created_by field`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_created_by') || 'Created by',
    name: 'createdBy',
    type: FieldConfigTypes.TextDisplay,
  };
}

function parseUpdatedByFieldConfig(
  input: FieldConfigInput,
  context: RecordTypeContext
): TextDisplayFieldConfig {
  if (input.type) {
    console.log(`Type (${input.type}) is ignored in _updated_by field`);
  }

  return {
    compact: false,
    label: parseOptionalString(input, 'label', '_updated_by') || 'Updated by',
    name: 'updatedBy',
    type: FieldConfigTypes.TextDisplay,
  };
}

export function filterReferences(
  fieldConfigs: FieldConfig[]
): ReferenceFieldConfig[] {
  return fieldConfigs.reduce(
    (refs, config) => {
      switch (config.type) {
        case FieldConfigTypes.Reference:
        case FieldConfigTypes.ReferenceDropdown:
        case FieldConfigTypes.ReferenceList:
        case FieldConfigTypes.ReferenceSelect:
        case FieldConfigTypes.EmbeddedReferenceList:
          return [...refs, config];
        default:
          return refs;
      }
    },
    [] as ReferenceFieldConfig[]
  );
}
