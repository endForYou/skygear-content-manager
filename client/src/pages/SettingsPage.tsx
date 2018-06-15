import './SettingsPage.scss';

import moment from 'moment-timezone';
import * as React from 'react';
import Select, { Option, OptionValues } from 'react-select';

// tslint:disable-next-line:no-empty-interface
interface Props {}

interface State {
  timezone: string;
}

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

export class SettingsPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      timezone: moment.tz.guess(),
    };
  }

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
                value={this.state.timezone}
                onChange={this.handleTimezoneChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private handleTimezoneChange = (value: string) => {
    this.setState({
      timezone: value,
    });
  };
}
