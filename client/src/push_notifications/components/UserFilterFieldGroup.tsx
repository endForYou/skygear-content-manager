import * as React from 'react';
import { Dispatch } from 'react-redux';
import Select from 'react-select';
import skygear, { Record, Query, QueryResult } from 'skygear';

import { PushCampaignActionDispatcher } from '../../actions/pushCampaign';
import { FieldConfig, FieldConfigTypes } from '../../cmsConfig';
import { RootState } from '../../states';
import { FilterField } from './FilterField';
import { Remote, RemoteType, NewPushCampaign } from '../../types';

export interface UserFilterFieldGroupProps {
  filterConfigs: FieldConfig[];
  dispatch: Dispatch<RootState>;
  savingPushCampaign?: Remote<NewPushCampaign>;
}

interface State {
  type: string;
  filterOptionsByName: FilterOptionsByName;
  messageContent: string;
  userList: Record[];
  userListTotalCount: number;
}

interface FilterOptionsByName {
  [key: string]: FilterOption;
}

interface FilterOption {
  type: string;
  // tslint:disable-next-line: no-any
  value: any;
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
type FilterChangeHandler = (name: string, type: string, value: any, effect?: Effect) => void;

class UserFilterFieldGroupImpl extends React.PureComponent<
  UserFilterFieldGroupProps,
  State
> {
  public notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: UserFilterFieldGroupProps) {
    super(props);

    const { dispatch } = this.props;

    this.state = {
      type: CampaignTypes.AllUsers,
      filterOptionsByName: {},
      messageContent: '',
      userList: [],
      userListTotalCount: 0,
    };

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(dispatch);
    this.fetchUserList();
  }

  public render() {
    const { filterConfigs, savingPushCampaign } = this.props;
    let filterConditionTitle = null;
    let formGroups = null;

    if (this.state.type == CampaignTypes.SpecificUsers) {
      filterConditionTitle = <h5>Filter Conditions</h5>;
      formGroups = filterConfigs.map((fieldConfig, index) => {
        return (
          <FormGroup
            key={index}
            fieldConfig={fieldConfig}
            filterOptionsByName={this.state.filterOptionsByName}
            onFilterChange={this.handleFilterChange}
          />
        );
      });
    };

    return (
      <div>
        <h3>Audiences</h3>
        <div className="form-group">
          <Select
            name="selecttype"
            searchable={false}
            value={this.state.type}
            onChange={this.selectTypeChangeHandler}
            options={campaignTypeOptions}
          />
        </div>
        {filterConditionTitle}
        {formGroups}
        <p>No of audiences: {this.state.userListTotalCount}</p>
        <h3>Content</h3>
        <div className="form-group">
          <label htmlFor="content">Message</label>
          <textarea
            onChange={this.contentOnChange}
            className="form-control"
            rows={5}
          />
        </div>
        <SubmitButton savingPushCampaign={savingPushCampaign} />
      </div>
    );
  }

  // tslint:disable-next-line: no-any
  public selectTypeChangeHandler = (selectedOption: any) => {
    if (selectedOption != null) {
      if (selectedOption.value == CampaignTypes.AllUsers) {
        this.setState({
          type: selectedOption.value,
          filterOptionsByName: {},
          userList: [],
          userListTotalCount: 0,
        });
      } else {
        this.setState({
          type: selectedOption.value,
          userList: [],
          userListTotalCount: 0,
        });
      }
    }
    this.fetchUserList();
  }

  public handleFilterChange: FilterChangeHandler = (name, type, value, effect) => {
    this.setState(prevState => {
      return {
        filterOptionsByName: { ...prevState.filterOptionsByName, [name]: { value, type }},
      }
    }, this.fetchUserList());
  };

  private contentOnChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = event => {
    const value = event.target.value;
    this.setState({
      messageContent: value,
    })
  };

  private fetchUserList = (filterOptionsByName = this.state.filterOptionsByName) => {
    const query = new Query(Record.extend('user'));

    // TODO: Implement filter by primitive data types such as string or boolean
    for (const key in filterOptionsByName) {
      const filterOption = filterOptionsByName[key];
      switch (filterOption.type) {
        case FieldConfigTypes.Reference:
          query.contains(key, filterOption.value);
          break;
        default:
          throw new Error(
            `Currently does not support Filter with FieldConfigType ${filterOption.type}`
          );
      }
    }

    query.overallCount = true;
    skygear.publicDB
    .query(query)
    .then((queryResult: QueryResult<Record>) => {
      this.setState({
        userList: queryResult.map((record: Record) => record),
        userListTotalCount: queryResult.overallCount,
      })
    });
  }
}

interface FieldProps {
  fieldConfig: FieldConfig;
  onFilterChange: FilterChangeHandler;
  filterOptionsByName: FilterOptionsByName;
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
  const { fieldConfig, onFilterChange, filterOptionsByName } = props;
  const { name, type } = fieldConfig;

  const fieldValue =
    filterOptionsByName[name] === undefined ? name : filterOptionsByName[name];
  return (
    <FilterField
      className="form-control"
      config={fieldConfig}
      value={fieldValue}
      onFieldChange={(value, effect) => onFilterChange(name, type, value, effect)}
    />
  );
}

interface SubmitProps {
  savingPushCampaign?: Remote<NewPushCampaign>;
}

function SubmitButton(props: SubmitProps): JSX.Element {
  const { savingPushCampaign } = props;
  if (savingPushCampaign !== undefined && savingPushCampaign.type === RemoteType.Loading) {
    return (
      <button type="submit" className="btn btn-primary" disabled={true}>
        Save
      </button>
    );
  } else {
    return (
      <button type="submit" className="btn btn-primary">
        Save
      </button>
    );
  }
}

export const UserFilterFieldGroup: React.ComponentClass<
  UserFilterFieldGroupProps
> = UserFilterFieldGroupImpl;
