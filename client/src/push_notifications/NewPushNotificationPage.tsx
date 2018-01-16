import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { FieldConfig } from '../cmsConfig';
import { UserFilterFieldGroup } from './components/UserFilterFieldGroup';
import { PushCampaignActionDispatcher } from '../actions/pushCampaign';
import { RootState } from '../states';
import { Remote, NewPushCampaign } from '../types';

type Props = StateProps & DispatchProps;

interface StateProps {
  content: string;
  savingPushCampaign?: Remote<NewPushCampaign>;
  userFilters: FieldConfig[];
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
    const { dispatch, userFilters, savingPushCampaign } = this.props;

    return (
      <div>
        <h1 className="display-4">New Push Campaign</h1>
        <div>
          <UserFilterFieldGroup
            dispatch={dispatch}
            filterConfigs={userFilters}
            savingPushCampaign={savingPushCampaign}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(
  state: RootState
): StateProps {
  return {
    content: '',
    savingPushCampaign: undefined,
    userFilters: state.cmsConfig.pushNotifications.filterUserConfigs,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedNewPushNotificationPage = connect(mapStateToProps, mapDispatchToProps)(
  NewPushNotificationPageImpl
);

export const NewPushNotificationPage: React.ComponentType = ConnectedNewPushNotificationPage;
