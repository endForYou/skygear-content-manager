import classnames from 'classnames';
import * as React from 'react';
import Select, { Option } from 'react-select';

import { RequiredFieldProps } from './Field';

import { DropdownFieldConfig } from '../cmsConfig';
import { hasValidationError } from '../validation/validation';
import { ValidationText } from './validation/ValidationText';

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

    this.state = {
      ...this.deriveValueStates(props.config, props.value),
      expanded: false,
    };
  }

  // Does not handle componentWillReceiveProps for value changes while the field
  // is rendered for the same record field
  //
  // props does not have enough information to distinguish matched value or
  // custom value with matched value
  componentWillReceiveProps(nextProps: DropdownFieldProps) {
    const isFieldReused =
      this.props.config.name !== nextProps.config.name ||
      nextProps.context.record.recordType !==
        this.props.context.record.recordType ||
      nextProps.context.record.id !== this.props.context.record.id;

    // assume non editable dropdown field does not have internal state
    if (
      !nextProps.config.editable ||
      (isFieldReused && nextProps.value !== this.props.value)
    ) {
      this.setState({
        ...this.deriveValueStates(nextProps.config, nextProps.value),
      });
    }
  }

  deriveValueStates(config: DropdownFieldConfig, value: ValueType) {
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

  handleSelectChange = (option: Option | null) => {
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
  };

  handleCustomValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({
      value,
    });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };

  get selectOptions() {
    const {
      config: { options, nullOption, customOption },
    } = this.props;

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

  render() {
    const {
      config: { compact, editable, name, nullOption, options },
      className,
      onFieldChange: _,
      validationError,
      ...rest
    } = this.props;

    const { selectValue, value } = this.state;

    if (editable) {
      return (
        <div className={className}>
          <div className={classnames('dropdown')}>
            <Select
              className={classnames('dropdown-select', {
                'validation-error': hasValidationError(validationError),
              })}
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
                className={classnames('dropdown-custom-input', {
                  'validation-error': hasValidationError(validationError),
                })}
                type="text"
                value={value || ''}
                onChange={this.handleCustomValueChange}
              />
            )}
          </div>
          <ValidationText validationError={validationError} />
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
      return (
        <span {...rest} className={classnames(className, { full: !compact })}>
          {displayValue}
        </span>
      );
    }
  }
}
