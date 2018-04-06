import './DropdownField.css';

import * as React from 'react';
import Select, { Option, OptionValues } from 'react-select';

import { RequiredFieldProps } from './Field';

import { DropdownFieldConfig } from '../cmsConfig';

export type DropdownFieldProps = RequiredFieldProps<DropdownFieldConfig>;

enum SelectValue {
  Null = 1,
  Custom = 2,
}
type SelectValueType = string | SelectValue;
type ValueType = string | null | undefined;
interface DropdownFieldState {
  selectValue: SelectValueType;
  value: ValueType;
  expanded: boolean;
}

export class DropdownField extends React.PureComponent<
  DropdownFieldProps,
  DropdownFieldState
> {
  constructor(props: DropdownFieldProps) {
    super(props);

    const isNewRecord = this.isNewRecord(props);
    const value = isNewRecord ? props.config.default : props.value;
    this.state = {
      ...this.deriveValueStates(props.config, value),
      expanded: false,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCustomValueChange = this.handleCustomValueChange.bind(this);

    if (isNewRecord && props.onFieldChange) {
      props.onFieldChange(props.config.default);
    }
  }

  // Does not handle componentWillReceiveProps
  //
  // props does not have enough information to distinguish matched value or
  // custom value with matched value

  public deriveValueStates(config: DropdownFieldConfig, value: ValueType) {
    const { customOption, options } = config;

    const matched = options.filter(opt => opt.value === value).length > 0;
    let selectValue: SelectValueType;

    if (typeof value !== 'string') {
      selectValue = SelectValue.Null;
    } else if (!matched && customOption.enabled) {
      selectValue = SelectValue.Custom;
    } else {
      selectValue = value;
    }

    return {
      selectValue,
      value,
    };
  }

  public handleSelectChange(option: Option<OptionValues> | null) {
    if (option == null) {
      // throw new Error('Unexpected null selected');
      return;
    }

    const optionValue = option.value;

    let newSelectValue: SelectValueType;
    let newValue: ValueType;

    if (optionValue === SelectValue.Null) {
      newSelectValue = SelectValue.Null;
      newValue = null;
    } else if (optionValue === SelectValue.Custom) {
      newSelectValue = SelectValue.Custom;
      newValue = '';
    } else if (typeof optionValue === 'string') {
      newSelectValue = optionValue;
      newValue = optionValue;
    } else {
      throw new Error(`Unexpected option value: ${optionValue}`);
    }

    this.setState({
      selectValue: newSelectValue,
      value: newValue,
    });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(newValue);
    }
  }

  public handleCustomValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    this.setState({
      value,
    });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  }

  get selectOptions() {
    const { config: { options, nullOption, customOption } } = this.props;

    const selectValue = this.state.selectValue;
    const value = this.state.value;
    const matched = options.filter(opt => opt.value === value).length > 0;

    let combinedOptions: Option[] = options;
    if (nullOption.enabled) {
      combinedOptions = [
        { label: nullOption.label, value: SelectValue.Null },
        ...combinedOptions,
      ];
    } else if (selectValue === SelectValue.Null || value == null) {
      combinedOptions = [
        { label: nullOption.label, value: SelectValue.Null, disabled: true },
        ...combinedOptions,
      ];
    }

    if (customOption.enabled) {
      combinedOptions = [
        ...combinedOptions,
        { label: customOption.label, value: SelectValue.Custom },
      ];
    } else if (!matched && selectValue !== SelectValue.Null && value != null) {
      combinedOptions = [
        { label: value, value, disabled: true },
        ...combinedOptions,
      ];
    }

    return combinedOptions;
  }

  public isNewRecord(props: DropdownFieldProps) {
    return props.context.record.createdAt == null;
  }

  public render() {
    const {
      config: { editable, name, nullOption, options },
      onFieldChange: _,
      ...rest,
    } = this.props;

    const { selectValue, value } = this.state;

    if (editable) {
      return (
        <div>
          <Select
            name={name}
            clearable={false}
            searchable={true}
            placeholder=""
            value={this.state.selectValue}
            onChange={this.handleSelectChange}
            options={this.selectOptions}
          />
          {selectValue === SelectValue.Custom && (
            <input
              {...rest}
              className="form-control dropdown-custom-input"
              type="text"
              value={value || ''}
              onChange={this.handleCustomValueChange}
            />
          )}
        </div>
      );
    } else {
      let displayValue: string;
      const matches = options.filter(opt => opt.value === value);
      if (matches.length > 0) {
        displayValue = matches[0].label;
      } else if (value == null) {
        displayValue = nullOption.label;
      } else {
        displayValue = value;
      }
      return <span {...rest}>{displayValue}</span>;
    }
  }
}