import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// import { Effect } from '../components/RecordFormPage';

import * as moment from 'moment';
import * as Datetime from 'react-datetime';
import { RootState } from '../states';
import { PushCampaign, Remote } from '../types';

type Props = StateProps & DispatchProps;

interface StateProps {
  savingPushCampaign?: Remote<PushCampaign>;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

// Handle change propagated from Field. A undefined value would yield no changes
// on State.recordChange[name].
// tslint:disable-next-line: no-any
// type FieldChangeHandler = (value: any, effect?: Effect) => void;

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss[Z]';
// const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss[Z]';

class NewPushNotificationPageImpl extends React.PureComponent<Props> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    const className = 'form-control'

    return (
      <div>
        <h1 className="display-4">New Push Campaign</h1>
        <div>
          <div className="form-group">
            <label htmlFor="content">Audience</label>
          </div>
          <div className="form-group">
            <label htmlFor="content">Mesage</label>
            <textarea
              value={undefined}
              onChange={this.handleChange}
              className={className}
              rows={5}
            />
          </div>
          <div className="form-group">
            <label htmlFor="delivery-time">Delivery Time</label>
            <Datetime
              dateFormat={DATE_FORMAT}
              timeFormat={TIME_FORMAT}
              value={undefined}
              onChange={this.handleChange}
              inputProps={{ className }}
              utc={true}
            />
          </div>
        </div>
      </div>
    );
  }

  public handleChange: (
    // tslint:disable-next-line: no-any
    event: string | moment.Moment | React.ChangeEvent<any>
  ) => void = event => {
    if (!moment.isMoment(event)) {
      return;
    }

    // const d = event.toDate();

    // this.setState({ ...this.state, value: d });
    // if (this.props.onFieldChange) {
    //   this.props.onFieldChange(d);
    // }
  };
}

function mapStateToProps(
  state: RootState
): StateProps {
  return {
    savingPushCampaign: undefined,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedNewPushNotificationPage = connect(mapStateToProps, mapDispatchToProps)(
  NewPushNotificationPageImpl
);

export const NewPushNotificationPage: React.ComponentType = ConnectedNewPushNotificationPage;
