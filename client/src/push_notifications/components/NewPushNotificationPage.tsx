import * as React from 'react';
import { Dispatch } from 'react-redux';
import { push } from 'react-router-redux';
import Select from 'react-select';
import skygear, { Query, QueryResult, Record } from 'skygear';

import { PushCampaignActionDispatcher } from '../../actions/pushCampaign';
import { FilterConfig, FilterConfigTypes } from '../../cmsConfig';
import { RootState } from '../../states';
import { NewPushCampaign, Remote, RemoteType } from '../../types';
import { FilterField } from './FilterField';

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
type FilterChangeHandler = (
  name: string,
  type: string,
  // tslint:disable-next-line: no-any
  value: any,
  effect?: Effect
) => void;

class NewPushNotificationPageImpl extends React.PureComponent<
  NewPushNotificationPageProps,
  State
> {
  public notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: NewPushNotificationPageProps) {
    super(props);

    const { dispatch } = this.props;

    this.state = {
      errorMessage: undefined,
      filterOptionsByName: {},
      newPushCampaign: {
        content: '',
        numberOfAudiences: 0,
        title: '',
        type: PushCampaignType.AllUsers,
        userIds: [],
      },
    };

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(
      dispatch
    );
    this.fetchUserList();
  }

  public render() {
    const { filterConfigs, savingPushCampaign } = this.props;
    const {
      newPushCampaign: { type, numberOfAudiences, title, content },
      filterOptionsByName,
    } = this.state;

    const formGroups = filterConfigs.map((filterConfig, index) => {
      return (
        <FormGroup
          key={index}
          filterFieldConfig={filterConfig}
          filterOptionsByName={filterOptionsByName}
          onFilterChange={this.handleFilterChange}
        />
      );
    });

    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Audiences</h3>
        <div className="form-group">
          <Select
            name="selecttype"
            searchable={false}
            value={type}
            onChange={this.handleSelectTypeChange}
            options={campaignTypeOptions}
          />
        </div>
        {type === PushCampaignType.SpecificUsers && (
          <div style={{ marginLeft: 20 }}>
            <h5>Filter Conditions</h5>
            {formGroups}
          </div>
        )}
        <p>No. of audiences: {numberOfAudiences}</p>
        <h3>Message</h3>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            placeholder="Title"
            value={title}
            onChange={this.handleTitleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            value={content}
            onChange={this.handlerContentChange}
            className="form-control"
            required={true}
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
  public handleSelectTypeChange = (selectedOption: any) => {
    if (selectedOption != null) {
      if (selectedOption.value === PushCampaignType.AllUsers) {
        this.setState(preState => {
          return {
            filterOptionsByName: {},
            newPushCampaign: {
              ...preState.newPushCampaign,
              numberOfAudiences: 0,
              type: selectedOption.value,
              userIds: [],
            },
          };
        });
        this.fetchUserList({}, selectedOption.value);
      } else {
        this.setState(preState => {
          return {
            filterOptionsByName: {},
            newPushCampaign: {
              ...preState.newPushCampaign,
              numberOfAudiences: 0,
              type: selectedOption.value,
              userIds: [],
            },
          };
        });
      }
    }
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    const { dispatch } = this.props;
    const { newPushCampaign } = this.state;

    if (!newPushCampaign.content) {
      this.setState({
        errorMessage: 'Empty message content.',
      });
      return;
    } else {
      this.setState({
        errorMessage: undefined,
      });
    }

    this.notificationActionDispatcher
      .savePushCampaign(newPushCampaign)
      .then(() => {
        dispatch(push(`/notification`));
      })
      .catch(error => {
        this.setState({
          errorMessage: error.toString(),
        });
      });
  };

  public handleFilterChange: FilterChangeHandler = (
    name,
    filterType,
    value,
    effect
  ) => {
    const newFilterOptionsByName = {
      ...this.state.filterOptionsByName,
      [name]: { value, filterType },
    };
    if (value == null || value === '' || value.length === 0) {
      delete newFilterOptionsByName[name];
    }
    this.setState({
      filterOptionsByName: newFilterOptionsByName,
    });
    this.fetchUserList(newFilterOptionsByName);
  };

  public handleTitleChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    const value = event.target.value;
    this.setState(preState => {
      return {
        newPushCampaign: { ...preState.newPushCampaign, title: value },
      };
    });
  };

  private handlerContentChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = event => {
    const value = event.target.value;
    this.setState(preState => {
      return {
        newPushCampaign: { ...preState.newPushCampaign, content: value },
      };
    });
  };

  private fetchUserList = (
    filterOptionsByName = this.state.filterOptionsByName,
    type = this.state.newPushCampaign.type
  ) => {
    let query = new Query(Record.extend('user'));

    if (type === PushCampaignType.SpecificUsers) {
      // Will not fetch user list if specific users without any filters.
      if (Object.keys(filterOptionsByName).length === 0) {
        this.setState(preState => {
          return {
            newPushCampaign: {
              ...preState.newPushCampaign,
              numberOfAudiences: 0,
              userIds: [],
            },
          };
        });
        return;
      }

      query = this.queryWithFilters(query, filterOptionsByName);
    }

    query.overallCount = true;
    skygear.publicDB
      .query(query)
      .then((queryResult: QueryResult<Record>) => {
        this.setState(preState => {
          return {
            errorMessage: undefined,
            newPushCampaign: {
              ...preState.newPushCampaign,
              numberOfAudiences: queryResult.overallCount,
              userIds: queryResult.map((record: Record) => record._id),
            },
          };
        });
      })
      .catch(error => {
        this.setState({
          errorMessage: error.toString(),
        });
      });
  };

  private queryWithFilters(
    query: Query,
    filterOptionsByName: FilterOptionsByName
  ): Query {
    // TODO: Implement filter by primitive data types such as string or boolean.
    // And support various query type of different data types.
    Object.entries(filterOptionsByName).forEach(([key, filterOption]) => {
      const value = filterOption.value;
      switch (filterOption.filterType) {
        case FilterConfigTypes.Reference:
          query.contains(key, value);
          break;
        case FilterConfigTypes.String:
          query.like(key, '%' + value + '%');
          break;
        default:
          throw new Error(
            `Currently does not support Filter with FieldConfigType ${filterOption.filterType}`
          );
      }
    });
    return query;
  }
}

interface FieldProps {
  filterFieldConfig: FilterConfig;
  onFilterChange: FilterChangeHandler;
  filterOptionsByName: FilterOptionsByName;
}

function FormGroup(props: FieldProps): JSX.Element {
  const { filterFieldConfig } = props;
  const name = filterFieldConfig.name || 'general';
  return (
    <div className="form-group">
      <label htmlFor={name}>{filterFieldConfig.label}</label>
      <FormField {...props} />
    </div>
  );
}

function FormField(props: FieldProps): JSX.Element {
  const { filterFieldConfig, onFilterChange, filterOptionsByName } = props;
  const { name, type: filterType } = filterFieldConfig;

  const fieldValue =
    filterOptionsByName[name] === undefined ? name : filterOptionsByName[name];
  return (
    <FilterField
      className="form-control"
      config={filterFieldConfig}
      value={fieldValue}
      onFieldChange={(value, effect) =>
        onFilterChange(name, filterType, value, effect)}
    />
  );
}

interface SubmitProps {
  savingPushCampaign?: Remote<NewPushCampaign>;
}

function SubmitButton(props: SubmitProps): JSX.Element {
  const { savingPushCampaign } = props;
  if (
    savingPushCampaign !== undefined &&
    savingPushCampaign.type === RemoteType.Loading
  ) {
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
