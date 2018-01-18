import * as React from 'react';
import { Dispatch } from 'react-redux';
import { push } from 'react-router-redux';
import Select from 'react-select';
import skygear, { Record, Query, QueryResult } from 'skygear';

import { PushCampaignActionDispatcher } from '../../actions/pushCampaign';
import { FilterConfig, FilterConfigTypes } from '../../cmsConfig';
import { RootState } from '../../states';
import { FilterField } from './FilterField';
import { Remote, RemoteType, NewPushCampaign } from '../../types';

export interface NewPushNotificationPageProps {
  filterConfigs: FilterConfig[];
  dispatch: Dispatch<RootState>;
  savingPushCampaign?: Remote<NewPushCampaign>;
}

interface State {
  newPushCampaign: NewPushCampaign;
  filterOptionsByName: FilterOptionsByName;
  errorMessage?: string;
}

interface FilterOptionsByName {
  [key: string]: FilterOption;
}

interface FilterOption {
  filterType: string;
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

enum PushCampaignType {
  AllUsers = 'all_users',
  SpecificUsers = 'specific_users',
}

const campaignTypeOptions: CampaignTypeOption[] = [
  { value: PushCampaignType.AllUsers, label: 'All Users' },
  { value: PushCampaignType.SpecificUsers, label: 'Specific Users' },
];

// Handle change propagated from Field. A undefined value would yield no changes
// on State.recordChange[name].
// tslint:disable-next-line: no-any
type FilterChangeHandler = (name: string, type: string, value: any, effect?: Effect) => void;

class NewPushNotificationPageImpl extends React.PureComponent<
  NewPushNotificationPageProps,
  State
> {
  public notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: NewPushNotificationPageProps) {
    super(props);

    const { dispatch } = this.props;

    this.state = {
      newPushCampaign: {
        type: PushCampaignType.AllUsers,
        messageContent: '',
        userIds: [],
        numberOfAudiences: 0,
      },
      filterOptionsByName: {},
      errorMessage: undefined,
    };

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(dispatch);
    this.fetchUserList();
  }

  public render() {
    const { filterConfigs, savingPushCampaign } = this.props;
    const { newPushCampaign: { type, numberOfAudiences }, filterOptionsByName } = this.state;
    let filterConditionTitle = null;
    let formGroups = null;

    if (type == PushCampaignType.SpecificUsers) {
      filterConditionTitle = <h5>Filter Conditions</h5>;
      formGroups = filterConfigs.map((fieldConfig, index) => {
        return (
          <FormGroup
            key={index}
            fieldConfig={fieldConfig}
            filterOptionsByName={filterOptionsByName}
            onFilterChange={this.handleFilterChange}
          />
        );
      });
    };

    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Audiences</h3>
        <div className="form-group">
          <Select
            name="selecttype"
            searchable={false}
            value={type}
            onChange={this.selectTypeChangeHandler}
            options={campaignTypeOptions}
          />
        </div>
        {filterConditionTitle}
        {formGroups}
        <p>No. of audiences: {numberOfAudiences}</p>
        <h3>Content</h3>
        <div className="form-group">
          <label htmlFor="content">Message</label>
          <textarea
            onChange={this.contentOnChange}
            className="form-control"
            rows={5}
          />
        </div>
        {this.state.errorMessage !== undefined && (
          <div className="alert alert-danger form-login-alert" role="alert">
            {this.state.errorMessage}
          </div>
        )}
        <SubmitButton savingPushCampaign={savingPushCampaign} />
      </form>
    );
  }

  // tslint:disable-next-line: no-any
  public selectTypeChangeHandler = (selectedOption: any) => {
    if (selectedOption != null) {
      if (selectedOption.value == PushCampaignType.AllUsers) {
        this.setState(preState => {
          return {
            newPushCampaign: {
              ...preState.newPushCampaign,
              type: selectedOption.value,
              numberOfAudiences: 0,
              userIds: [],
            },
            filterOptionsByName: {},
          }
        });
        this.fetchUserList({}, selectedOption.value);
      } else {
        this.setState(preState => {
          return {
            newPushCampaign: {
              ...preState.newPushCampaign,
              type: selectedOption.value,
              numberOfAudiences: 0,
              userIds: [],
            },
            filterOptionsByName: {},
          }
        });
      }
    }
  }

  public handleFilterChange: FilterChangeHandler = (name, filterType, value, effect) => {
    let newFilterOptionsByName = { ...this.state.filterOptionsByName, [name]: { value, filterType }};
    this.setState({
      filterOptionsByName: newFilterOptionsByName,
    });
    this.fetchUserList(newFilterOptionsByName);
  };

  private contentOnChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = event => {
    const value = event.target.value;
    this.setState(preState => {
      return {
        newPushCampaign: {...preState.newPushCampaign, messageContent: value},
      }
    });
  };

  private fetchUserList = (
    filterOptionsByName = this.state.filterOptionsByName,
    type = this.state.newPushCampaign.type
  ) => {
    let query = new Query(Record.extend('user'));

    if (type == PushCampaignType.SpecificUsers) {
      query = this.queryWithFilters(query, filterOptionsByName);
    }

    query.overallCount = true;
    skygear.publicDB
    .query(query)
    .then((queryResult: QueryResult<Record>) => {
      this.setState(preState => {
        return {
          newPushCampaign: {
            ...preState.newPushCampaign,
            numberOfAudiences: queryResult.overallCount,
            userIds: queryResult.map((record: Record) => record._id),
          },
          errorMessage: undefined,
        }
      });
    }).catch(error => {
      this.setState({
        errorMessage: error.toString(),
      });
    });
  }

  private queryWithFilters(query: Query, filterOptionsByName: FilterOptionsByName): Query {
    // TODO: Implement filter by primitive data types such as string or boolean.
    // And support various query type of different data types.
    for (const key in filterOptionsByName) {
      const filterOption = filterOptionsByName[key];
      const value = filterOption.value
      if (value == null || value == '' || value == []) {
        continue;
      }
      switch (filterOption.filterType) {
        case FilterConfigTypes.Reference:
          query.contains(key, value);
          break;
        case FilterConfigTypes.String:
          query.like(key, '%'+value+'%');
          break;
        default:
          throw new Error(
            `Currently does not support Filter with FieldConfigType ${filterOption.filterType}`
          );
      }
    }
    return query;
  }

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    const { dispatch } = this.props;
    const { newPushCampaign } = this.state;

    if (!newPushCampaign.messageContent) {
      this.setState({
        errorMessage: 'Empty message content.',
      });
      return
    } else if (newPushCampaign.numberOfAudiences == 0) {
      this.setState({
        errorMessage: 'No audiences.',
      });
      return
    } else {
      this.setState({
        errorMessage: undefined,
      });
    }

    this.notificationActionDispatcher.savePushCampaign(newPushCampaign)
      .then(() => {
        dispatch(push(`/notification`));
        }).catch(error => {
          this.setState({
            errorMessage: error.toString(),
          });
        });
  }
}

interface FieldProps {
  fieldConfig: FilterConfig;
  onFilterChange: FilterChangeHandler;
  filterOptionsByName: FilterOptionsByName;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { fieldConfig } = props;
  const name = fieldConfig.name || 'general';
  return (
    <div className="form-group">
      <label htmlFor={name}>{fieldConfig.label}</label>
      <FormField {...props} />
    </div>
  );
}

function FormField(props: FieldProps): JSX.Element {
  const { fieldConfig, onFilterChange, filterOptionsByName } = props;
  const { name, type: filterType } = fieldConfig;

  const fieldValue =
    filterOptionsByName[name] === undefined ? name : filterOptionsByName[name];
  return (
    <FilterField
      className="form-control"
      config={fieldConfig}
      value={fieldValue}
      onFieldChange={(value, effect) => onFilterChange(name, filterType, value, effect)}
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

export const NewPushNotificationPage: React.ComponentClass<
  NewPushNotificationPageProps
> = NewPushNotificationPageImpl;
