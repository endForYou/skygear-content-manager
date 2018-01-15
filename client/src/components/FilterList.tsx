import moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';

import {
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterQueryType,
  Filter,
  FilterType,
  GeneralFilter,
  IntegerFilter,
  IntegerFilterQueryType,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';

interface FilterListProps {
  filters: Filter[];
  handleQueryTypeChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  handleFilterValueChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onCloseFilterClicked: (filter: Filter) => void;
  handleDateTimeValueChange: (filter: Filter, datetime: Date) => void;
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss[Z]';

export class FilterList extends React.PureComponent<FilterListProps> {
  public renderFilter(filter: Filter) {
    const { onCloseFilterClicked } = this.props;
    return (
      <div key={filter.id} className="form-inline mb-2">
        <div className="form-group mr-2">
          <label>{filter.label}</label>
        </div>
        <div className="form-group mr-2">{this.renderFilterSelect(filter)}</div>
        <div className="form-group mr-4">{this.renderInput(filter)}</div>
        <div className="form-group">
          <button
            onClick={() => onCloseFilterClicked(filter)}
            type="button"
            className="close"
          >
            <span>&times;</span>
          </button>
        </div>
      </div>
    );
  }

  public renderFilterSelect(filter: Filter) {
    switch (filter.type) {
      case FilterType.StringFilterType:
        return this.renderStringFilterSelect(filter);
      case FilterType.IntegerFilterType:
        return this.renderIntegerFilterSelect(filter);
      case FilterType.BooleanFilterType:
        return this.renderBooleanFilterSelect(filter);
      case FilterType.DateTimeFilterType:
        return this.renderDateTimeFilterSelect(filter);
      case FilterType.GeneralFilterType:
        return <div />;
    }
  }

  public renderStringFilterSelect(filter: Filter) {
    const { handleQueryTypeChange } = this.props;
    return (
      <select
        className="form-control"
        value={filter.query}
        onChange={event => handleQueryTypeChange(filter, event)}
      >
        <option value={StringFilterQueryType.EqualTo}>Equal to</option>
        <option value={StringFilterQueryType.NotEqualTo}>Not equal to</option>
        <option value={StringFilterQueryType.Like}>Like</option>
        <option value={StringFilterQueryType.NotLike}>Not like</option>
      </select>
    );
  }

  public renderIntegerFilterSelect(filter: Filter) {
    const { handleQueryTypeChange } = this.props;
    return (
      <select
        className="form-control"
        value={filter.query}
        onChange={event => handleQueryTypeChange(filter, event)}
      >
        <option value={IntegerFilterQueryType.EqualTo}>Equal to</option>
        <option value={IntegerFilterQueryType.NotEqualTo}>Not equal to</option>
        <option value={IntegerFilterQueryType.LessThan}>Less than</option>
        <option value={IntegerFilterQueryType.GreaterThan}>Greater than</option>
        <option value={IntegerFilterQueryType.LessThanOrEqualTo}>
          Less than or equal to
        </option>
        <option value={IntegerFilterQueryType.GreaterThanOrEqualTo}>
          Greater than or equal to
        </option>
      </select>
    );
  }

  public renderBooleanFilterSelect(filter: Filter) {
    const { handleQueryTypeChange } = this.props;

    return (
      <select
        className="form-control"
        value={filter.query}
        onChange={event => handleQueryTypeChange(filter, event)}
      >
        <option value={BooleanFilterQueryType.True}>True</option>
        <option value={BooleanFilterQueryType.False}>False</option>
      </select>
    );
  }

  public renderDateTimeFilterSelect(filter: Filter) {
    const { handleQueryTypeChange } = this.props;

    return (
      <select
        className="form-control"
        value={filter.query}
        onChange={event => handleQueryTypeChange(filter, event)}
      >
        <option value={DateTimeFilterQueryType.Before}>Before</option>
        <option value={DateTimeFilterQueryType.After}>After</option>
      </select>
    );
  }

  public renderInput(filter: Filter) {
    switch (filter.type) {
      case FilterType.StringFilterType:
        return this.renderStringInput(filter);
      case FilterType.IntegerFilterType:
        return this.renderIntegerInput(filter);
      case FilterType.BooleanFilterType:
        return <div />;
      case FilterType.DateTimeFilterType:
        return this.renderDateTimeInput(filter);
      case FilterType.GeneralFilterType:
        return this.renderGeneralInput(filter);
    }
  }

  public renderStringInput(filter: StringFilter) {
    const { handleFilterValueChange } = this.props;

    return (
      <input
        type="text"
        className="form-control"
        autoFocus={true}
        onChange={event => handleFilterValueChange(filter, event)}
        value={filter.value}
      />
    );
  }

  public renderIntegerInput(filter: IntegerFilter) {
    const { handleFilterValueChange } = this.props;

    return (
      <input
        type="number"
        className="form-control"
        autoFocus={true}
        onChange={event => handleFilterValueChange(filter, event)}
        value={filter.value}
      />
    );
  }
  public renderDateTimeInput(filter: DateTimeFilter) {
    return (
      <Datetime
        dateFormat={DATE_FORMAT}
        timeFormat={TIME_FORMAT}
        value={filter.value}
        onChange={event => this.handleDateTimeChange(filter, event)}
        utc={true}
      />
    );
  }

  public renderGeneralInput(filter: GeneralFilter) {
    const { handleFilterValueChange } = this.props;

    return (
      <input
        type="text"
        className="form-control"
        autoFocus={true}
        onChange={event => handleFilterValueChange(filter, event)}
        value={filter.value}
      />
    );
  }

  public render() {
    const { filters } = this.props;
    return filters.map(filter => this.renderFilter(filter));
  }

  public handleDateTimeChange(
    filter: Filter,
    // tslint:disable-next-line: no-any
    event: string | moment.Moment | React.ChangeEvent<any>
  ) {
    if (!moment.isMoment(event)) {
      return;
    }
    this.props.handleDateTimeValueChange(filter, event.toDate());
  }
}
