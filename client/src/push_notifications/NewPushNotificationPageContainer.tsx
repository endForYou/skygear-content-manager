import './NewPushNotificationPageContainer.scss';

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PushCampaignActionDispatcher } from '../actions/pushCampaign';
import { FilterConfig } from '../cmsConfig';
import { getCmsConfig, RootState } from '../states';
import { NewPushCampaign, Remote } from '../types';
import { NewPushNotificationPage } from './components/NewPushNotificationPage';

type Props = StateProps & DispatchProps;

interface StateProps {
  content: string;
  savingPushCampaign?: Remote<NewPushCampaign>;
  userFilters: FilterConfig[];
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class NewPushNotificationPageContainerImpl extends React.PureComponent<Props> {
  notificationActionDispatcher: PushCampaignActionDispatcher;

  constructor(props: Props) {
    super(props);

    const { dispatch } = this.props;

    this.notificationActionDispatcher = new PushCampaignActionDispatcher(
      dispatch
    );
  }

  render() {
    const { dispatch, userFilters, savingPushCampaign } = this.props;

    return (
      <div className="new-push-container">
        <div className="topbar">
          <div className="title">New Push Campaign</div>
        </div>
        <NewPushNotificationPage
          className="push-content"
          dispatch={dispatch}
          filterConfigs={userFilters}
          savingPushCampaign={savingPushCampaign}
        />
      </div>
    );
  }
}

function mapStateToProps(state: RootState): StateProps {
  return {
    content: '',
    savingPushCampaign: state.pushCampaign.new.savingPushCampaign,
    userFilters: getCmsConfig(state).pushNotifications.filterUserConfigs,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedNewPushNotificationPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewPushNotificationPageContainerImpl);

export const NewPushNotificationPageContainer: React.ComponentType = ConnectedNewPushNotificationPageContainer;
