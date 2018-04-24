import moment from 'moment';
import * as React from 'react';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';

import {
  BaseFilterQueryType,
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterConfig,
  DateTimeFilterQueryType,
  Filter,
  FilterConfig,
  FilterType,
  GeneralFilter,
  IntegerFilter,
  IntegerFilterQueryType,
  ReferenceFilter,
  ReferenceFilterConfig,
  ReferenceFilterQueryType,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';
import { TzDatetimeInput } from '../components/TzDatetimeInput';
import { ReferenceFilterInput } from '../filters/ReferenceFilterInput';

interface FilterListProps {
  filters: Filter[];
  filterConfigs: FilterConfig[];
  handleQueryTypeChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  handleFilterValueChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleReferenceChange: (filter: Filter, value: string[]) => void;
  onCloseFilterClicked: (filter: Filter) => void;
  handleDateTimeValueChange: (filter: Filter, datetime: Date) => void;
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ss';

export class FilterList extends React.PureComponent<FilterListProps> {
  public renderFilter(filter: Filter, index: number) {
    const { filterConfigs, onCloseFilterClicked } = this.props;
    const config = filterConfigs.find(c => c.name === filter.name);
    if (config == null) {
      return null;
    }

    return (
      <div key={index} className="form-inline mb-2">
        <div className="form-group mr-2">
          <label>{filter.label}</label>
        </div>
        <div className="form-group mr-2">{this.renderFilterSelect(filter)}</div>
        <div className="form-group mr-4">
          {this.renderInput(filter, config)}
        </div>
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
      case FilterType.ReferenceFilterType:
        return this.renderReferenceFilterSelect(filter);
      default:
        throw new Error('unsupported FilterType in renderFilterSelect');
    }
  }

  public renderNullFilterSelect(filter: Filter) {
    if (!filter.nullable) {
      return null;
    }
    const { IsNull, IsNotNull } = BaseFilterQueryType;
    return [
      <option key="separator" value="">{` ------ `}</option>,
      <option key="isNull" value={IsNull}>{`Is NULL`}</option>,
      <option key="isNotNull" value={IsNotNull}>{`Is Not NULL`}</option>,
    ];
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
        {this.renderNullFilterSelect(filter)}
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
        {this.renderNullFilterSelect(filter)}
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
        {this.renderNullFilterSelect(filter)}
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
        {this.renderNullFilterSelect(filter)}
      </select>
    );
  }

  public renderReferenceFilterSelect(filter: Filter) {
    const { handleQueryTypeChange } = this.props;

    return (
      <select
        className="form-control"
        value={filter.query}
        onChange={event => handleQueryTypeChange(filter, event)}
      >
        <option value={ReferenceFilterQueryType.Contains}>Contains</option>
        {this.renderNullFilterSelect(filter)}
      </select>
    );
  }

  public renderInput(filter: Filter, config: FilterConfig) {
    switch (filter.query) {
      case BaseFilterQueryType.IsNull:
      case BaseFilterQueryType.IsNotNull:
        return <div />;
      default:
    }
    switch (filter.type) {
      case FilterType.StringFilterType:
        return this.renderStringInput(filter);
      case FilterType.IntegerFilterType:
        return this.renderIntegerInput(filter);
      case FilterType.BooleanFilterType:
        return <div />;
      case FilterType.DateTimeFilterType:
        return this.renderDateTimeInput(filter, config as DateTimeFilterConfig);
      case FilterType.GeneralFilterType:
        return this.renderGeneralInput(filter);
      case FilterType.ReferenceFilterType:
        return this.renderReferenceInput(
          filter,
          config as ReferenceFilterConfig
        );
      default:
        throw new Error('unsupported FilterType in renderInput');
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
  public renderDateTimeInput(
    filter: DateTimeFilter,
    config: DateTimeFilterConfig
  ) {
    const timeFormat =
      config.timezone === 'Local' ? TIME_FORMAT : `${TIME_FORMAT}Z`;
    return (
      <TzDatetimeInput
        dateFormat={DATE_FORMAT}
        timeFormat={timeFormat}
        value={filter.value}
        onChange={event => this.handleDateTimeChange(filter, event)}
        timezone={config.timezone}
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

  public renderReferenceInput(
    filter: ReferenceFilter,
    config: ReferenceFilterConfig
  ) {
    const { handleReferenceChange } = this.props;
    return (
      <ReferenceFilterInput
        className="form-control"
        config={config}
        onFieldChange={value => handleReferenceChange(filter, value)}
        value={filter.values}
      />
    );
  }

  public render() {
    const { filters } = this.props;
    return filters.map((filter, index) => this.renderFilter(filter, index));
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
