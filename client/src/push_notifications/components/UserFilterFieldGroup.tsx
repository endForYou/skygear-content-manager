import * as React from 'react';
import { Dispatch } from 'react-redux';
import Select from 'react-select';

import { FieldConfig } from '../../cmsConfig';
import { RootState } from '../../states';
import { FilterField } from './FilterField';

export interface UserFilterFieldGroupProps {
  filterConfigs: FieldConfig[];
  dispatch: Dispatch<RootState>;
}

interface State {
  type: string;
  specificFilterOptions: SpecificFilterOptions;
}

interface SpecificFilterOptions {
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

// Effectively a Promise Factory
// tslint:disable-next-line: no-any
export type Effect = () => Promise<any>;

interface CampaignTypeOption {
  label: string;
  value: string;
}

enum CampaignTypes {
  AllUsers = 'all_users',
  SpecificUsers = 'specific_users',
}

const campaignTypeOptions: CampaignTypeOption[] = [
  { value: CampaignTypes.AllUsers, label: 'All Users' },
  { value: CampaignTypes.SpecificUsers, label: 'Specific Users' },
];

// Handle change propagated from Field. A undefined value would yield no changes
// on State.recordChange[name].
// tslint:disable-next-line: no-any
type FilterChangeHandler = (name: string, value: any, effect?: Effect) => void;

class UserFilterFieldGroupImpl extends React.PureComponent<
  UserFilterFieldGroupProps,
  State
> {
  constructor(props: UserFilterFieldGroupProps) {
    super(props);

    this.state = {
      type: CampaignTypes.AllUsers,
      specificFilterOptions: {},
    };
  }

  public render() {
    const { filterConfigs } = this.props;

    const formGroups = filterConfigs.map((fieldConfig, index) => {
      return (
        <FormGroup
          key={index}
          fieldConfig={fieldConfig}
          specificFilterOptions={this.state.specificFilterOptions}
          onFilterChange={this.handleFilterChange}
        />
      );
    });

    return (
      <div>
        <div className="form-group">
          <label htmlFor="content">Audience</label>
          <Select
            name="selecttype"
            value={this.state.type}
            onChange={this.selectTypeChangeHandler}
            options={campaignTypeOptions}
          />
        </div>
        {formGroups}
      </div>
    );
  }

  // tslint:disable-next-line: no-any
  public selectTypeChangeHandler = (selectedOption: any) => {
    // this.setState({ selectedOption });
    if (selectedOption != null) {
      console.log(`Selected: ${selectedOption.label}`);
      this.setState({
        type: selectedOption
      });
    }
  }

  public handleFilterChange: FilterChangeHandler = (name, value, effect) => {
    console.log(name);
    if (value !== undefined) {
      console.log(value);
    }
  };
}

interface FieldProps {
  fieldConfig: FieldConfig;
  onFilterChange: FilterChangeHandler;
  specificFilterOptions: SpecificFilterOptions;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig } = props;
  return (
    <div className="form-group">
      <label htmlFor={fieldConfig.name}>{fieldConfig.label}</label>
      <FormField {...props} />
    </div>
  );
}

function FormField(props: FieldProps): JSX.Element {
  const { fieldConfig, onFilterChange, specificFilterOptions } = props;
  const { name } = fieldConfig;

  const fieldValue =
    specificFilterOptions[name] === undefined ? name : specificFilterOptions[name];
  return (
    <FilterField
      className="form-control"
      config={fieldConfig}
      value={fieldValue}
      onFieldChange={(value, effect) => onFilterChange(name, value, effect)}
    />
  );
}

export const UserFilterFieldGroup: React.ComponentClass<
  UserFilterFieldGroupProps
> = UserFilterFieldGroupImpl;
