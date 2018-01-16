import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { FieldConfig } from '../cmsConfig';
import { UserFilterFieldGroup } from './components/UserFilterFieldGroup';
import { PushCampaignActionDispatcher } from '../actions/pushCampaign';
import { RootState } from '../states';
import { Remote, RemoteType } from '../types';

type Props = StateProps & DispatchProps;

interface NewPushCampaign {
  type: string;
}

interface StateProps {
  content: string;
  savingPushCampaign?: Remote<NewPushCampaign>;
  userFilters: FieldConfig[];
  userList: Record[];
  userListTotalCount: number;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class NewPushNotificationPageImpl extends React.PureComponent<Props> {
  public notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: Props) {
    super(props);

    const { dispatch } = this.props;

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(dispatch);
  }

  public componentDidMount() {
    this.notificationActionDispatcher.fetchUserList();
  }

  public render() {
    const className = 'form-control';
    const { dispatch, userFilters, content, savingPushCampaign, userListTotalCount } = this.props;

    return (
      <div>
        <h1 className="display-4">New Push Campaign</h1>
        <div>
          <UserFilterFieldGroup
            dispatch={dispatch}
            filterConfigs={userFilters}
          />
          <p>No of audiences: {userListTotalCount}</p>
          <div className="form-group">
            <label htmlFor="content">Message</label>
            <textarea
              value={content}
              onChange={this.contentOnChange}
              className={className}
              rows={5}
            />
          </div>
        </div>
        <SubmitButton savingPushCampaign={savingPushCampaign} />
      </div>
    );
  }

  private contentOnChange: React.ChangeEventHandler<
    HTMLTextAreaElement
  > = event => {
    const value = event.target.value;
    console.log(value);
    // this.handleValueChange(value);
  };
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

function mapStateToProps(
  state: RootState
): StateProps {
  console.log('mapStateToProps');
  return {
    content: '',
    savingPushCampaign: undefined,
    userFilters: state.cmsConfig.pushNotifications.filterUserConfigs,
    userList: state.pushCampaign.new.userList,
    userListTotalCount: state.pushCampaign.new.userListTotalCount,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedNewPushNotificationPage = connect(mapStateToProps, mapDispatchToProps)(
  NewPushNotificationPageImpl
);

export const NewPushNotificationPage: React.ComponentType = ConnectedNewPushNotificationPage;
