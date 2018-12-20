import './NewPushNotificationPage.scss';

import classnames from 'classnames';
import * as React from 'react';
import { Dispatch } from 'react-redux';
import { push } from 'react-router-redux';
import Select from 'react-select';
import skygear, { Query, QueryResult, Record } from 'skygear';

import { PushCampaignActionDispatcher } from '../../actions/pushCampaign';
import {
  FilterConfig,
  FilterConfigTypes,
  ReferenceFilterConfig,
} from '../../cmsConfig';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FilterInput } from '../../filters/FilterInput';
import { isOutlawError } from '../../recordUtil';
import { RootState } from '../../states';
import { NewPushCampaign, Remote, RemoteType } from '../../types';
import { entriesOf } from '../../util';

export interface NewPushNotificationPageProps {
  className?: string;
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
  value: any
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

  public componentWillReceiveProps(nextProps: NewPushNotificationPageProps) {
    if (
      this.props.savingPushCampaign != null &&
      this.props.savingPushCampaign.type === RemoteType.Loading &&
      nextProps.savingPushCampaign != null
    ) {
      if (nextProps.savingPushCampaign.type === RemoteType.Success) {
        this.props.dispatch(push(`/notification`));
      } else if (nextProps.savingPushCampaign.type === RemoteType.Failure) {
        const error = nextProps.savingPushCampaign.error;
        this.setState({
          errorMessage: isOutlawError(error)
            ? error.error.message
            : error.message,
        });
      }
    }
  }

  public render() {
    const { className, filterConfigs, savingPushCampaign } = this.props;
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
      <div className={classnames(className, 'push-form-page')}>
        <form onSubmit={this.handleSubmit}>
          <div className="push-form-groups">
            <div className="push-form-group">
              <div className="push-form-label">Audiences</div>
              <div className="push-form-field">
                <Select
                  name="selecttype"
                  className="push-form-select"
                  clearable={false}
                  searchable={false}
                  value={type}
                  onChange={this.handleSelectTypeChange}
                  options={campaignTypeOptions}
                />
              </div>
            </div>
            {type === PushCampaignType.SpecificUsers && (
              <div className="push-form-group">
                <div className="push-form-label" />
                <div className="push-form-field push-filters">
                  <div className="push-filters-title">Filter Conditions</div>
                  {formGroups}
                </div>
              </div>
            )}
            <div className="push-form-group">
              <div className="push-form-label">No. of audiences</div>
              <div className="push-form-field">
                <div className="push-form-display">{numberOfAudiences}</div>
              </div>
            </div>
            <div className="push-form-section-title">Message</div>
            <div className="push-form-group">
              <div className="push-form-label">Title</div>
              <div className="push-form-field">
                <input
                  type="text"
                  className="push-form-input"
                  name="title"
                  placeholder="Title"
                  value={title}
                  onChange={this.handleTitleChange}
                />
              </div>
            </div>
            <div className="push-form-group">
              <label className="push-form-label" htmlFor="content">
                Content
              </label>
              <div className="push-form-field">
                <textarea
                  value={content}
                  onChange={this.handlerContentChange}
                  className="push-form-input textarea"
                  required={true}
                  rows={5}
                />
              </div>
            </div>
            {this.state.errorMessage !== undefined && (
              <div
                className="push-filter-error alert alert-danger"
                role="alert"
              >
                {this.state.errorMessage}
              </div>
            )}
          </div>
          <SubmitButton savingPushCampaign={savingPushCampaign} />
        </form>
      </div>
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

    this.notificationActionDispatcher.savePushCampaign(newPushCampaign);
  };

  public handleFilterChange: FilterChangeHandler = (
    name,
    filterType,
    value
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

    // unlimited user to push
    query.limit = 999999;
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
          errorMessage: isOutlawError(error)
            ? error.error.message
            : error.message,
        });
      });
  };

  private queryWithFilters(
    query: Query,
    filterOptionsByName: FilterOptionsByName
  ): Query {
    // TODO: Implement filter by primitive data types such as string or boolean.
    // And support various query type of different data types.
    entriesOf(filterOptionsByName).forEach(([key, filterOption]) => {
      const value = filterOption.value;
      switch (filterOption.filterType) {
        case FilterConfigTypes.Reference:
          const { filterConfigs } = this.props;
          const filterConfig = filterConfigs.find(c => c.name === key);
          if (filterConfig == null) {
            break;
          }
          const refFilterConfig = filterConfig as ReferenceFilterConfig;
          query.like(
            `${key}.${refFilterConfig.displayFieldName}`,
            `%${value}%`
          );
          break;
        case FilterConfigTypes.String:
          query.like(key, '%' + value + '%');
          break;
        default:
          throw new Error(
            `Currently does not support Filter with FieldConfigType ${
              filterOption.filterType
            }`
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
  return (
    <div className="push-filter-group">
      <div className="push-filter-label">{filterFieldConfig.label}</div>
      <FormField {...props} />
    </div>
  );
}

function FormField(props: FieldProps): JSX.Element {
  const { filterFieldConfig, onFilterChange, filterOptionsByName } = props;
  const { name, type: filterType } = filterFieldConfig;

  const fieldValue =
    filterOptionsByName[name] === undefined
      ? name
      : filterOptionsByName[name].value;
  return (
    <FilterInput
      className="push-filter-input"
      config={filterFieldConfig}
      value={fieldValue}
      onFieldChange={value => onFilterChange(name, filterType, value)}
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
      <PrimaryButton type="submit" className="btn-submit" disabled={true}>
        Save
      </PrimaryButton>
    );
  } else {
    return (
      <PrimaryButton type="submit" className="btn-submit">
        Save
      </PrimaryButton>
    );
  }
}

export const NewPushNotificationPage: React.ComponentClass<
  NewPushNotificationPageProps
> = NewPushNotificationPageImpl;
