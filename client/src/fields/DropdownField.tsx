import * as React from 'react';
import Select, {
  Option,
  OptionValues,
} from 'react-select';

import { RequiredFieldProps } from './Field';

import { DropdownFieldConfig } from '../cmsConfig';

export type DropdownFieldProps = RequiredFieldProps<DropdownFieldConfig>;

enum MAGIC_NUMBER {
  NULL = 1,
  CUSTOM = 2,
};
type SelectValueType = string | MAGIC_NUMBER;
type ValueType = string | null | undefined;
interface DropdownFieldState {
  selectValue: SelectValueType;
  value: ValueType;
  expanded: boolean;
}

export class DropdownField extends React.PureComponent<DropdownFieldProps, DropdownFieldState> {
  constructor(props: DropdownFieldProps) {
    super(props);

    this.state = {
      ...this.deriveValueStates(props),
      expanded: false,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  // Does not handle componentWillReceiveProps
  //
  // props does not have enough information to distinguish matched value or
  // custom value with matched value

  public deriveValueStates(props: DropdownFieldProps) {
    const {
      config: {
        customOption,
        options,
      },
      value,
    } = props;

    const matched = options
      .filter(opt => opt.value === value).length > 0;
    let selectValue: SelectValueType;

    if (typeof value !== 'string') {
      selectValue = MAGIC_NUMBER.NULL;
    } else if (!matched && customOption.enabled) {
      selectValue = MAGIC_NUMBER.CUSTOM;
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
      throw new Error('Unexpected null selected');
    }

    const optionValue = option.value;

    let newSelectValue: SelectValueType;
    let newValue: ValueType;

    if (optionValue === MAGIC_NUMBER.NULL) {
      newSelectValue = MAGIC_NUMBER.NULL;
      newValue = null;
    } else if (optionValue === MAGIC_NUMBER.CUSTOM) {
      newSelectValue = MAGIC_NUMBER.CUSTOM;
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

  get selectOptions() {
    const {
      config: {
        options,
        nullOption,
        customOption,
      },
    } = this.props;

    const selectValue = this.state.selectValue;
    const value = this.state.value;
    const matched = options
      .filter(opt => opt.value === selectValue).length > 0;

    let combinedOptions: any[] = options;
    if (nullOption.enabled) {
      combinedOptions = [
        { label: nullOption.label, value: MAGIC_NUMBER.NULL },
        ...combinedOptions,
      ];
    } else if (selectValue === MAGIC_NUMBER.NULL) {
      combinedOptions = [
        { label: nullOption.label, value: MAGIC_NUMBER.NULL, disabled: true },
        ...combinedOptions,
      ];
    }

    if (customOption.enabled) {
      combinedOptions = [
        ...combinedOptions,
        { label: customOption.label, value: MAGIC_NUMBER.CUSTOM },
      ];
    } else if (!matched && selectValue !== MAGIC_NUMBER.NULL) {
      combinedOptions = [
        { label: value, value: value, disabled: true },
        ...combinedOptions,
      ];
    }

    return combinedOptions;
  }

  public render() {
    const {
      config: {
        editable,
        name,
      },
      onFieldChange: _,
      ...rest,
    } = this.props;

    if (editable) {
      return (
        <Select
          name={name}
          clearable={false}
          searchable={false}
          placeholder=''
          value={this.state.selectValue}
          onChange={this.handleSelectChange}
          options={this.selectOptions}
        />

        // TODO (Steven-Chan):
        // render custom value text input
      );
    } else {
      return <span {...rest}>{this.state.value}</span>
    }
  }
}
