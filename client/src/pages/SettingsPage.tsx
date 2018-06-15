import './SettingsPage.scss';

import moment from 'moment-timezone';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import Select, { Option, OptionValues } from 'react-select';
import { updateTimezone } from '../actions/settings';
import { RootState, Settings } from '../states';

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

type Props = Settings & DispatchProps;

interface TzPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const timezoneOptions = moment.tz.names().map(n => ({
  label: n,
  value: n,
}));

const TzPicker: React.SFC<TzPickerProps> = ({ value, onChange }) => {
  const handleTimezoneChange = (option: Option<OptionValues> | null) => {
    if (option == null) {
      return;
    }

    if (typeof option.value !== 'string') {
      return;
    }

    onChange(option.value);
  };

  return (
    <Select
      className="dropdown-select"
      name={name}
      clearable={false}
      searchable={true}
      placeholder=""
      value={value}
      onChange={handleTimezoneChange}
      options={timezoneOptions}
    />
  );
};

class SettingsPage extends React.PureComponent<Props> {
  public render() {
    return (
      <div className="settings-page">
        <div className="topbar">
          <div className="title">Settings</div>
        </div>

        <div className="form-groups">
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="time-zone">Time zone</label>
            </div>
            <div className="form-field">
              <TzPicker
                value={this.props.timezone}
                onChange={this.handleTimezoneChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private handleTimezoneChange = (value: string) => {
    this.props.dispatch(updateTimezone(value));
  };
}

export const SettingsPageFactory = () => {
  function mapStateToProps(state: RootState): Settings {
    return state.settings;
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  return connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
};
